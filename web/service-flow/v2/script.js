(() => {
  const root = document.body;
  const journey = document.querySelector("#journey");
  const stageViewport = document.querySelector(".stage-viewport");
  const stages = [...document.querySelectorAll(".story-stage[data-stage]")];
  const markers = [...document.querySelectorAll(".stage-progress li")];
  const stageButtons = [...document.querySelectorAll("[data-stage-target]")];
  const anchors = [...document.querySelectorAll("[data-traveler-anchor]")];
  const trackedCard = document.querySelector(".tracked-card");
  const counter = document.querySelector("#stage-number");
  const stageCaption = document.querySelector("#stage-caption");
  const nextCaption = document.querySelector("#next-caption");
  const previousButton = document.querySelector(".journey-prev");
  const nextButton = document.querySelector(".journey-next");
  const closing = document.querySelector(".closing");
  const travelerTitle = document.querySelector("#traveler-title");
  const travelerNote = document.querySelector("#traveler-note");
  const travelerStatus = document.querySelector("#traveler-status");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const detailsDialog = document.querySelector("#stage-details");
  const detailsTriggers = [...document.querySelectorAll(".details-trigger")];
  const detailsClose = document.querySelector(".details-close");
  const detailsEyebrow = document.querySelector("#details-eyebrow");
  const detailsTitle = document.querySelector("#details-title");
  const detailsLead = document.querySelector("#details-lead");
  const detailsInput = document.querySelector("#details-input");
  const detailsOutput = document.querySelector("#details-output");
  const detailsPoints = document.querySelector("#details-points");
  const detailsNote = document.querySelector("#details-note");

  const stageMeta = [
    {
      caption: "Находим публикацию",
      next: "Наводим порядок",
      travelerTitle: "Пост найден",
      travelerNote: "сегодня · 09:42",
      travelerStatus: "Сигнал",
    },
    {
      caption: "Получаем материал",
      next: "Добавляем смысл",
      travelerTitle: "Один материал",
      travelerNote: "5 размещений · 4 источника",
      travelerStatus: "Релевантно",
    },
    {
      caption: "Структурируем смысл",
      next: "Собираем событие",
      travelerTitle: "Смысл добавлен",
      travelerNote: "4 признака контекста",
      travelerStatus: "Осмыслено",
    },
    {
      caption: "Собираем инфоповод",
      next: "Смотрим шире",
      travelerTitle: "Часть события",
      travelerNote: "8 материалов рядом",
      travelerStatus: "Инфоповод",
    },
    {
      caption: "Видим всю повестку",
      next: "Получаем вывод",
      travelerTitle: "",
      travelerNote: "",
      travelerStatus: "",
    },
    {
      caption: "Получаем решение",
      next: "Посмотреть финал",
      travelerTitle: "Источник сохранён",
      travelerNote: "вывод можно проверить",
      travelerStatus: "Доказательство",
    },
  ];

  const stageDetails = [
    {
      eyebrow: "Этап 01 · Сбор",
      title: "Сначала сервис формирует поле кандидатов",
      lead:
        "VK search получает тему и период исследования. Сервис сохраняет доступные записи вместе с идентификатором источника, датой, текстом и теми метриками, которые вернул ВКонтакте.",
      input: "Тема и период",
      output: "Поисковые совпадения",
      points: [
        "Сбор проходит по датам и сохраняет диагностику полноты, ошибок и остановок.",
        "Полное поле сбора и будущая аналитическая выборка считаются отдельно.",
        "Если просмотры не доступны, они остаются отсутствующими, а не превращаются в ноль.",
      ],
      note:
        "Поисковое совпадение — только кандидат. Связь записи с темой проверяется на следующем этапе.",
    },
    {
      eyebrow: "Этап 02 · Очистка и отбор",
      title: "Размещения отделяются от уникальных материалов",
      lead:
        "Текст нормализуется, проходит проверку качества и точную дедупликацию. Затем сервис определяет смысловую связь уникального материала с темой исследования.",
      input: "Поисковые совпадения",
      output: "Релевантные материалы",
      points: [
        "Точные копии получают общий material_id, но каждое размещение и его источник сохраняются.",
        "Для анализа выбирается каноническое представление материала, а решение о релевантности переносится на его размещения.",
        "Исключённые записи остаются в диагностике с явной причиной.",
      ],
      note:
        "Здесь объединяются только точные повторы. Разные формулировки одного события пока остаются самостоятельными материалами.",
    },
    {
      eyebrow: "Этап 03 · Смысловая структура",
      title: "Материал получает независимые смысловые признаки",
      lead:
        "Смысловой анализ строится по релевантному уникальному ядру. Сервис определяет основное направление, функцию текста и несколько характеристик контекста.",
      input: "Релевантный материал",
      output: "Структурированное описание",
      points: [
        "Направления формируются под конкретную тему, а не берутся из словаря недвижимости.",
        "Отдельно фиксируются функция материала, аудитория, объект, география и другие уместные признаки.",
        "Неопределённый или неприменимый признак не подменяется успешным значением.",
      ],
      note:
        "Все смысловые показатели считаются на уровне материалов, чтобы повторные размещения не раздували картину.",
    },
    {
      eyebrow: "Этап 04 · Инфоповоды",
      title: "Разные материалы сопоставляются как описания событий",
      lead:
        "Сервис выделяет кандидатов событий и сравнивает материалы, которые действительно можно сопоставить. Объединение происходит консервативно — только при достаточных основаниях.",
      input: "Осмысленные материалы",
      output: "Инфоповоды",
      points: [
        "Разные заголовки и формулировки могут попасть в один инфоповод.",
        "Противоречивые или неразрешённые сравнения не приводят к скрытому объединению.",
        "Одиночный материал тоже сохраняется как самостоятельный инфоповод.",
      ],
      note:
        "Повторное размещение уже учтено внутри материала и не становится новым событием.",
    },
    {
      eyebrow: "Этап 05 · Карта повестки",
      title: "Инфоповоды складываются в структуру всей темы",
      lead:
        "Каждый инфоповод остаётся связан со своими материалами, а более широкие смысловые направления показывают устройство всей исследуемой повестки.",
      input: "Инфоповоды",
      output: "Смысловые направления",
      points: [
        "Масштаб меняется от одного события к общей структуре темы.",
        "Материалы и размещения остаются разными уровнями метрик.",
        "Исходный материал можно проследить внутри своего события и направления.",
      ],
      note:
        "Цепочка 74 158 → 1 000 → 287 относится к одному исследованию; результат зависит от темы, периода и доступности данных.",
    },
    {
      eyebrow: "Этап 06 · Проверяемый результат",
      title: "Общая картина превращается в вывод с доказательствами",
      lead:
        "Итог строится по аналитическому ядру, направлениям и инфоповодам. Вместе с выводом сервис сохраняет материалы, на которых он основан.",
      input: "Карта и доказательства",
      output: "Аналитический отчёт",
      points: [
        "Summary связывает наблюдение, его значение для задачи и возможные действия.",
        "В отчёте сохраняются representative source_id, ссылки и тексты материалов.",
        "Диагностика и provenance фиксируют ограничения, статусы этапов и параметры запуска.",
      ],
      note:
        "Вывод не заменяет источники: его можно развернуть обратно до инфоповода, материала и исходного поста.",
    },
  ];

  let currentStage = -1;
  let detailsOrigin = null;
  let pointerStart = null;

  const clampStage = (stage) =>
    Math.max(0, Math.min(stages.length - 1, Number(stage)));

  const moveTraveler = (stage) => {
    const anchor = anchors[stage];
    if (!anchor || !trackedCard) return;

    anchor.append(trackedCard);
    trackedCard.classList.remove("is-arriving");
    if (!reducedMotion.matches) {
      void trackedCard.offsetWidth;
      trackedCard.classList.add("is-arriving");
    }

    const meta = stageMeta[stage];
    travelerTitle.textContent = meta.travelerTitle;
    travelerNote.textContent = meta.travelerNote;
    travelerStatus.textContent = meta.travelerStatus;
  };

  const setStage = (requestedStage, options = {}) => {
    const nextStage = clampStage(requestedStage);
    if (nextStage === currentStage && !options.force) return;

    root.dataset.direction = nextStage < currentStage ? "prev" : "next";
    currentStage = nextStage;
    root.dataset.stage = String(nextStage);

    stages.forEach((stage, index) => {
      const active = index === nextStage;
      stage.classList.toggle("is-active", active);
      stage.setAttribute("aria-hidden", String(!active));
    });

    markers.forEach((marker, index) => {
      marker.classList.toggle("is-active", index === nextStage);
      marker.classList.toggle("is-complete", index < nextStage);
      const button = marker.querySelector("button");
      if (index === nextStage) button?.setAttribute("aria-current", "step");
      else button?.removeAttribute("aria-current");
    });

    const meta = stageMeta[nextStage];
    counter.textContent = String(nextStage + 1).padStart(2, "0");
    stageCaption.textContent = meta.caption;
    nextCaption.textContent = meta.next;
    previousButton.disabled = nextStage === 0;

    moveTraveler(nextStage);
  };

  const goPrevious = () => {
    if (currentStage > 0) setStage(currentStage - 1);
  };

  const goNext = () => {
    if (currentStage < stages.length - 1) {
      setStage(currentStage + 1);
      return;
    }

    closing?.scrollIntoView({
      behavior: reducedMotion.matches ? "auto" : "smooth",
      block: "start",
    });
  };

  const closeDetails = () => {
    if (!detailsDialog) return;
    if (typeof detailsDialog.close === "function") detailsDialog.close();
    else detailsDialog.removeAttribute("open");
  };

  const openDetails = (trigger) => {
    if (!detailsDialog) return;
    const details = stageDetails[Number(trigger.dataset.details)];
    if (!details) return;

    detailsOrigin = trigger;
    detailsEyebrow.textContent = details.eyebrow;
    detailsTitle.textContent = details.title;
    detailsLead.textContent = details.lead;
    detailsInput.textContent = details.input;
    detailsOutput.textContent = details.output;
    detailsNote.textContent = details.note;
    detailsPoints.replaceChildren(
      ...details.points.map((point) => {
        const item = document.createElement("li");
        item.textContent = point;
        return item;
      }),
    );

    root.classList.add("dialog-open");
    if (typeof detailsDialog.showModal === "function") detailsDialog.showModal();
    else detailsDialog.setAttribute("open", "");
  };

  stageButtons.forEach((button) => {
    button.addEventListener("click", () => setStage(button.dataset.stageTarget));
  });

  previousButton?.addEventListener("click", goPrevious);
  nextButton?.addEventListener("click", goNext);

  stageViewport?.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointerStart = { x: event.clientX, y: event.clientY };
  });

  stageViewport?.addEventListener("pointerup", (event) => {
    if (!pointerStart) return;
    const deltaX = event.clientX - pointerStart.x;
    const deltaY = event.clientY - pointerStart.y;
    pointerStart = null;

    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return;
    if (deltaX < 0) goNext();
    else goPrevious();
  });

  stageViewport?.addEventListener("pointercancel", () => {
    pointerStart = null;
  });

  window.addEventListener("keydown", (event) => {
    if (detailsDialog?.open) return;
    if (event.key === "ArrowLeft") goPrevious();
    if (event.key === "ArrowRight") goNext();
  });

  detailsTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => openDetails(trigger));
  });

  detailsClose?.addEventListener("click", closeDetails);
  detailsDialog?.addEventListener("click", (event) => {
    if (event.target === detailsDialog) closeDetails();
  });
  detailsDialog?.addEventListener("close", () => {
    root.classList.remove("dialog-open");
    detailsOrigin?.focus();
  });

  if ("IntersectionObserver" in window && journey) {
    const journeyObserver = new IntersectionObserver(
      ([entry]) => journey.classList.toggle("controls-in-view", entry.isIntersecting),
      { threshold: 0.05 },
    );
    journeyObserver.observe(journey);
  } else {
    journey?.classList.add("controls-in-view");
  }

  setStage(0, { force: true });
  journey?.classList.add("is-ready");
})();
