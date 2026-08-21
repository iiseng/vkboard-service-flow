"""Validate the exact static surface published as the Service Flow site.

The check is intentionally strict: adding a file, external dependency or a new
browser capability requires an explicit review and an allowlist update first.
"""

from __future__ import annotations

import re
from html.parser import HTMLParser
from pathlib import Path

from scripts.check_tracked_secrets import find_secret_issues

REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SITE_ROOT = REPOSITORY_ROOT / "web" / "service-flow"
V2_SITE_ROOT = DEFAULT_SITE_ROOT / "v2"
V3_SITE_ROOT = DEFAULT_SITE_ROOT / "v3"

ALLOWED_FILES = {"index.html", "script.js", "styles.css"}
EXPECTED_ASSETS = {"./script.js", "./styles.css"}
MAX_FILE_BYTES = 512 * 1024
MAX_TOTAL_BYTES = 1024 * 1024

REQUIRED_CSP = {
    "base-uri": {"'none'"},
    "connect-src": {"'none'"},
    "default-src": {"'none'"},
    "font-src": {"'self'"},
    "form-action": {"'none'"},
    "frame-src": {"'none'"},
    "img-src": {"'self'", "data:"},
    "manifest-src": {"'none'"},
    "media-src": {"'none'"},
    "object-src": {"'none'"},
    "script-src": {"'self'"},
    "style-src": {"'self'"},
    "worker-src": {"'none'"},
}

FORBIDDEN_MARKUP_TAGS = {"base", "embed", "form", "iframe", "object"}
FORBIDDEN_URL = re.compile(r"(?i)(?:https?:)?//|javascript:")
FORBIDDEN_JAVASCRIPT = {
    "dynamic code execution": re.compile(r"\b(?:eval|Function)\s*\("),
    "HTML injection sink": re.compile(
        r"\.(?:innerHTML|outerHTML)\s*=|\.insertAdjacentHTML\s*\("
    ),
    "browser network API": re.compile(
        r"\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\b|"
        r"\.sendBeacon\s*\("
    ),
    "browser persistence API": re.compile(
        r"\b(?:localStorage|sessionStorage|indexedDB)\b|"
        r"\bdocument\.cookie\b"
    ),
    "service worker API": re.compile(r"\bnavigator\.serviceWorker\b"),
}


class _SiteHTMLParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.assets: set[str] = set()
        self.content_security_policies: list[str] = []
        self.disallowed_tags: list[str] = []
        self.event_attributes: list[str] = []
        self.inline_scripts = 0

    def handle_starttag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        values = dict(attrs)
        if tag in FORBIDDEN_MARKUP_TAGS:
            self.disallowed_tags.append(tag)
        self.event_attributes.extend(
            name for name, _ in attrs if name.lower().startswith("on")
        )

        if tag == "link" and values.get("rel") == "stylesheet":
            self.assets.add(values.get("href") or "")
        if tag == "script":
            source = values.get("src")
            if source:
                self.assets.add(source)
            else:
                self.inline_scripts += 1
        if (
            tag == "meta"
            and (values.get("http-equiv") or "").lower()
            == "content-security-policy"
        ):
            self.content_security_policies.append(values.get("content") or "")


def _parse_csp(policy: str) -> dict[str, set[str]]:
    directives: dict[str, set[str]] = {}
    for raw_directive in policy.split(";"):
        parts = raw_directive.split()
        if parts:
            directives[parts[0].lower()] = set(parts[1:])
    return directives


def validate_site(
    site_root: Path = DEFAULT_SITE_ROOT,
    *,
    allowed_directories: set[str] | None = None,
) -> list[str]:
    """Return safe-to-print publication issues for ``site_root``."""

    issues: list[str] = []
    if not site_root.is_dir():
        return [f"{site_root}: site directory is missing"]
    if site_root.is_symlink():
        issues.append(f"{site_root}: site directory must not be a symlink")

    allowed_directories = allowed_directories or set()
    entries = sorted(site_root.iterdir())
    symlinks = [path for path in entries if path.is_symlink()]
    issues.extend(f"{path}: symlinks are forbidden" for path in symlinks)

    directories = {
        path.name for path in entries if path.is_dir() and not path.is_symlink()
    }
    for unexpected in sorted(directories - allowed_directories):
        issues.append(f"{site_root / unexpected}: directory is not approved")
    for missing in sorted(allowed_directories - directories):
        issues.append(f"{site_root / missing}: approved directory is missing")

    files = [path for path in entries if path.is_file() and not path.is_symlink()]
    relative_files = {path.relative_to(site_root).as_posix() for path in files}
    for missing in sorted(ALLOWED_FILES - relative_files):
        issues.append(f"{site_root / missing}: required file is missing")
    for unexpected in sorted(relative_files - ALLOWED_FILES):
        issues.append(f"{site_root / unexpected}: file is not approved for publication")

    total_size = 0
    readable_files: list[Path] = []
    contents: dict[str, str] = {}
    for path in files:
        relative = path.relative_to(site_root).as_posix()
        size = path.stat().st_size
        total_size += size
        if size > MAX_FILE_BYTES:
            issues.append(f"{path}: file exceeds {MAX_FILE_BYTES} bytes")
        try:
            contents[relative] = path.read_text(encoding="utf-8")
            readable_files.append(path)
        except UnicodeDecodeError:
            issues.append(f"{path}: published files must be UTF-8 text")
    if total_size > MAX_TOTAL_BYTES:
        issues.append(f"{site_root}: site exceeds {MAX_TOTAL_BYTES} bytes")

    issues.extend(find_secret_issues(readable_files))

    for relative, content in contents.items():
        if FORBIDDEN_URL.search(content):
            issues.append(
                f"{site_root / relative}: external or executable URL is forbidden"
            )

    script = contents.get("script.js", "")
    for description, pattern in FORBIDDEN_JAVASCRIPT.items():
        if pattern.search(script):
            issues.append(f"{site_root / 'script.js'}: {description} is forbidden")

    html = contents.get("index.html")
    if html is None:
        return issues

    parser = _SiteHTMLParser()
    parser.feed(html)
    if parser.assets != EXPECTED_ASSETS:
        issues.append(
            f"{site_root / 'index.html'}: assets must be exactly "
            f"{sorted(EXPECTED_ASSETS)}"
        )
    if parser.disallowed_tags:
        issues.append(
            f"{site_root / 'index.html'}: forbidden tags: "
            f"{', '.join(sorted(set(parser.disallowed_tags)))}"
        )
    if parser.event_attributes:
        issues.append(
            f"{site_root / 'index.html'}: inline event handlers are forbidden"
        )
    if parser.inline_scripts:
        issues.append(f"{site_root / 'index.html'}: inline scripts are forbidden")
    if len(parser.content_security_policies) != 1:
        issues.append(
            f"{site_root / 'index.html'}: exactly one CSP meta policy is required"
        )
    else:
        directives = _parse_csp(parser.content_security_policies[0])
        for name, expected_sources in REQUIRED_CSP.items():
            if directives.get(name) != expected_sources:
                issues.append(
                    f"{site_root / 'index.html'}: CSP directive {name} must be "
                    f"{sorted(expected_sources)}"
                )

    return issues


def main() -> int:
    issues = validate_site(allowed_directories={"v2", "v3"})
    issues.extend(validate_site(V2_SITE_ROOT))
    issues.extend(validate_site(V3_SITE_ROOT))
    if issues:
        print("Service Flow publication guard failed:")
        for issue in issues:
            print(f"- {issue}")
        return 1
    print("Service Flow publication guard passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
