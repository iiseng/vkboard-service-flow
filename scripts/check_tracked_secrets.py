"""Fail when tracked files look like local secret material.

This lightweight guard complements ``.gitignore`` and intentionally avoids
printing suspected values.
"""

from __future__ import annotations

import re
import subprocess
from pathlib import Path

SENSITIVE_ENV_KEYS = {
    "AIDAR_API_KEY",
    "ANTHROPIC_API_KEY",
    "DEEPSEEK_API_KEY",
    "LLM_API_KEY",
    "QWEN_API_KEY",
    "VK_TOKEN",
    "ZAI_API_KEY",
}
_ASSIGNMENT_PATTERN = re.compile(
    rf"^({'|'.join(sorted(SENSITIVE_ENV_KEYS))})=(.*)$",
    flags=re.MULTILINE,
)
_PRIVATE_KEY_MARKER = "-----BEGIN " + "PRIVATE KEY-----"


def _is_forbidden_secret_path(path: Path) -> bool:
    name = path.name.lower()
    if name == ".env.example":
        return False
    return (
        name == ".env"
        or name.startswith(".env.")
        or name.endswith(".env")
        or ".env.backup" in name
        or ".env.bak" in name
    )


def _is_placeholder(value: str) -> bool:
    normalized = value.strip()
    if not normalized or normalized.startswith("#"):
        return True
    placeholders = (
        "${{",
        "<",
        "changeme",
        "example",
        "test",
        "your_",
    )
    return normalized.lower().startswith(placeholders)


def find_secret_issues(paths: list[Path]) -> list[str]:
    """Return issue descriptions without including credential values."""

    issues: list[str] = []
    for path in paths:
        if _is_forbidden_secret_path(path):
            issues.append(f"{path}: forbidden secret-like filename")
            continue
        try:
            content = path.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError):
            continue
        if _PRIVATE_KEY_MARKER in content:
            issues.append(f"{path}: private key marker")
        for match in _ASSIGNMENT_PATTERN.finditer(content):
            key, value = match.groups()
            if not _is_placeholder(value):
                line = content.count("\n", 0, match.start()) + 1
                issues.append(f"{path}:{line}: non-placeholder {key}")
    return issues


def _tracked_paths() -> list[Path]:
    completed = subprocess.run(
        ["git", "ls-files", "-z"],
        check=True,
        capture_output=True,
    )
    return [
        Path(raw_path.decode())
        for raw_path in completed.stdout.split(b"\0")
        if raw_path
    ]


def main() -> int:
    issues = find_secret_issues(_tracked_paths())
    if issues:
        print("Tracked secret guard failed:")
        for issue in issues:
            print(f"- {issue}")
        return 1
    print("Tracked secret guard passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
