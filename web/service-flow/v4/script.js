(() => {
  document.documentElement.classList.add("has-js");

  const journey = document.querySelector(".journey");
  const scene = document.querySelector("#tunnel-scene");
  const stagePanels = [...document.querySelectorAll("[data-stage-panel]")];
  const navItems = [...document.querySelectorAll(".depth-nav li")];
  const navButtons = [...document.querySelectorAll("[data-jump]")];
  const pageProgress = document.querySelector("#page-progress-bar");
  const headerNumber = document.querySelector("#live-stage-number");
  const headerName = document.querySelector("#live-stage-name");
  const depthReadout = document.querySelector("#depth-readout");
  const coreIndex = document.querySelector("#core-index");
  const coreStatus = document.querySelector("#core-status");
  const coreLabel = document.querySelector("#core-label");
  const coreTitle = document.querySelector("#core-title");
  const coreMeta = document.querySelector("#core-meta");
  const coreChange = document.querySelector("#core-change");
  const detailsDialog = document.querySelector("#stage-details");
  const detailsTriggers = [...document.querySelectorAll("[data-details]")];
  const detailsClose = document.querySelector(".dialog-close");
  const detailsStep = document.querySelector("#details-step");
  const detailsTitle = document.querySelector("#details-title");
  const detailsLead = document.querySelector("#details-lead");
  const detailsInput = document.querySelector("#details-input");
  const detailsOutput = document.querySelector("#details-output");
  const detailsPoints = document.querySelector("#details-points");
  const detailsNote = document.querySelector("#details-note");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const stageVisuals = [
    {
      name: "Находим сигнал",
      status: "Сигнал обнаружен",
      label: "Объект маршрута",
      title: "Пост найден",
      meta: "74 158 совпадений вокруг",
      change: "Поисковое совпадение",
    },
    {
      name: "Получаем материал",
      status: "Повторы сведены",
      label: "После очистки",
      title: "Один материал",
      meta: "5 размещений · 4 источника",
      change: "Релевантный уникальный материал",
    },
    {
      name: "Добавляем смысл",
      status: "Контекст добавлен",
      label: "Смысловой профиль",
      title: "Доступность покупки",
      meta: "аудитория · объект · контекст",
      change: "Осмысленный материал",
    },
    {
      name: "Собираем событие",
      status: "Связи подтверждены",
      label: "Событийный узел",
      title: "Инфоповод собран",
      meta: "8 материалов · 17 размещений",
      change: "Самостоятельный инфоповод",
    },
    {
      name: "Видим картину",
      status: "Карта построена",
      label: "Место в повестке",
      title: "Наш материал на карте",
      meta: "1 000 материалов · 287 инфоповодов",
      change: "Узел смыслового направления",
    },
    {
      name: "Получаем вывод",
      status: "Цепочка доказана",
      label: "Проверяемый результат",
      title: "Источник сохранён",
      meta: "вывод можно проверить",
      change: "Доказательная база",
    },
  ];

  const stageDetails = [
    {
      step: "Этап 01 · Сбор",
      title: "Сервис сначала формирует поле кандидатов",
      lead:
        "Поиск ВКонтакте получает тему и период исследования. Сервис сохраняет доступные записи вместе с источником, датой, текстом и теми метриками, которые вернула платформа.",
      input: "Тема и период",
      output: "Поисковые совпадения",
      points: [
        "Сбор проходит по датам и сохраняет диагностику полноты, ошибок и остановок.",
        "Полное поле сбора и будущая аналитическая выборка считаются отдельно.",
        "Если просмотры недоступны, они остаются отсутствующими, а не превращаются в ноль.",
      ],
      note:
        "Поисковое совпадение — только кандидат. Связь записи с темой проверяется на следующем этапе.",
    },
    {
      step: "Этап 02 · Очистка и отбор",
      title: "Размещения отделяются от уникальных материалов",
      lead:
        "Текст нормализуется, проходит проверку качества и точную дедупликацию. Затем сервис определяет смысловую связь уникального материала с темой исследования.",
      input: "Поисковые совпадения",
      output: "Релевантные материалы",
      points: [
        "Точные копии получают общий material_id, но каждое размещение и его источник сохраняются.",
        "Для анализа выбирается каноническое представление материала.",
        "Исключённые записи остаются в диагностике с явной причиной.",
      ],
      note:
        "Здесь объединяются только точные повторы. Разные формулировки одного события пока остаются самостоятельными материалами.",
    },
    {
      step: "Этап 03 · Смысловой анализ",
      title: "Материал получает независимые смысловые признаки",
      lead:
        "Релевантный уникальный материал анализируется как часть темы. Сервис отдельно определяет объект, аудиторию, контекст и другие признаки, не смешивая их в одну непрозрачную метку.",
      input: "Релевантный материал",
      output: "Структурированный смысл",
      points: [
        "Каждая характеристика отвечает на свой вопрос и проверяется отдельно.",
        "Неуверенность и отсутствие применимости сохраняются как разные состояния.",
        "Сильные аналитические тезисы связываются с конкретными материалами.",
      ],
      note:
        "Материал уже получил контекст, но ещё не считается самостоятельным инфоповодом.",
    },
    {
      step: "Этап 04 · Инфоповоды",
      title: "Разные материалы сопоставляются как описания событий",
      lead:
        "Семантическая кластеризация ищет материалы, которые рассказывают об одном событии разными словами. Так появляется инфоповод — самостоятельная единица анализа, а не отдельное размещение.",
      input: "Осмысленные материалы",
      output: "Инфоповоды",
      points: [
        "Связь строится по смыслу, а не только по совпадению слов.",
        "Материал может остаться самостоятельным singleton-инфоповодом.",
        "Число размещений не раздувает число самостоятельных событий.",
      ],
      note:
        "Показанные 8 материалов и 17 размещений — демонстрационная структура одного события.",
    },
    {
      step: "Этап 05 · Картина темы",
      title: "Инфоповоды складываются в структуру всей темы",
      lead:
        "Сервис группирует события в смысловые направления и считает метрики на правильном уровне. Один материал остаётся видимым внутри общей картины.",
      input: "Инфоповоды",
      output: "Смысловые направления",
      points: [
        "Масштаб меняется от одного события к общей структуре темы.",
        "Материалы и размещения остаются разными уровнями метрик.",
        "Исходный материал можно проследить внутри своего события и направления.",
      ],
      note:
        "Цепочка 74 158 → 1 000 → 287 относится к демонстрационному исследованию; результат зависит от темы, периода и доступности данных.",
    },
    {
      step: "Этап 06 · Проверяемый результат",
      title: "Общая картина превращается в вывод с доказательствами",
      lead:
        "Итог строится по аналитическому ядру, направлениям и инфоповодам. Вместе с выводом сервис сохраняет материалы, на которых он основан.",
      input: "Карта и доказательства",
      output: "Аналитический отчёт",
      points: [
        "Summary связывает наблюдение, его значение для задачи и возможные действия.",
        "В отчёте сохраняются идентификаторы, ссылки и тексты материалов.",
        "Диагностика и provenance фиксируют ограничения и параметры запуска.",
      ],
      note:
        "Вывод не заменяет источники: его можно развернуть обратно до инфоповода, материала и исходного поста.",
    },
  ];

  let activeStage = -1;
  let detailsOrigin = null;
  let updateFrame = 0;

  const clamp = (value, minimum, maximum) =>
    Math.max(minimum, Math.min(maximum, value));

  const setHeaderIntro = () => {
    headerNumber.textContent = "00";
    headerName.textContent = "Перед погружением";
  };

  const setHeaderFinish = () => {
    headerNumber.textContent = "07";
    headerName.textContent = "Результат маршрута";
  };

  const setStage = (index) => {
    if (index === activeStage) return;
    activeStage = index;
    const visual = stageVisuals[index];
    scene.dataset.activeStage = String(index);
    headerNumber.textContent = String(index + 1).padStart(2, "0");
    headerName.textContent = visual.name;
    depthReadout.textContent = `${String(index + 1).padStart(2, "0")} / 06`;
    coreIndex.textContent = String(index + 1).padStart(2, "0");
    coreStatus.textContent = visual.status;
    coreLabel.textContent = visual.label;
    coreTitle.textContent = visual.title;
    coreMeta.textContent = visual.meta;
    coreChange.textContent = visual.change;

    stagePanels.forEach((panel, panelIndex) => {
      const isActive = panelIndex === index;
      panel.classList.toggle("is-active", isActive);
      panel.setAttribute("aria-hidden", String(!isActive));
      panel.inert = !isActive;
    });

    navItems.forEach((item, itemIndex) => {
      item.classList.toggle("is-active", itemIndex === index);
      item.classList.toggle("is-complete", itemIndex < index);
      const button = item.querySelector("button");
      if (button) button.setAttribute("aria-current", itemIndex === index ? "step" : "false");
    });
  };

  const updateScene = () => {
    updateFrame = 0;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pageRatio = documentHeight > 0 ? window.scrollY / documentHeight : 0;
    pageProgress.style.transform = `scaleX(${clamp(pageRatio, 0, 1)})`;

    if (!journey || !scene) return;
    const journeyTop = journey.getBoundingClientRect().top + window.scrollY;
    const journeyRange = Math.max(1, journey.offsetHeight - window.innerHeight);
    const journeyRatio = clamp((window.scrollY - journeyTop) / journeyRange, 0, 1);
    const stageFloat = journeyRatio * (stageVisuals.length - 1);
    const stageIndex = clamp(Math.round(stageFloat), 0, stageVisuals.length - 1);
    const localProgress = clamp(stageFloat - stageIndex + 0.5, 0, 1);

    scene.style.setProperty("--depth-progress", journeyRatio.toFixed(4));
    scene.style.setProperty("--stage-progress", localProgress.toFixed(4));

    if (window.scrollY < journeyTop - window.innerHeight * 0.08) {
      setHeaderIntro();
      return;
    }

    setStage(stageIndex);
    if (window.scrollY > journeyTop + journey.offsetHeight - window.innerHeight * 0.45) {
      setHeaderFinish();
    }
  };

  const requestSceneUpdate = () => {
    if (updateFrame) return;
    updateFrame = window.requestAnimationFrame(updateScene);
  };

  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (!journey) return;
      const index = Number(button.dataset.jump);
      const journeyTop = journey.getBoundingClientRect().top + window.scrollY;
      const journeyRange = Math.max(1, journey.offsetHeight - window.innerHeight);
      const destination = journeyTop + journeyRange * (index / (stageVisuals.length - 1));
      window.scrollTo({
        top: destination,
        behavior: reducedMotion.matches ? "auto" : "smooth",
      });
    });
  });

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
    detailsStep.textContent = details.step;
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

    if (typeof detailsDialog.showModal === "function") detailsDialog.showModal();
    else detailsDialog.setAttribute("open", "");
  };

  detailsTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => openDetails(trigger));
  });

  detailsClose?.addEventListener("click", closeDetails);
  detailsDialog?.addEventListener("click", (event) => {
    if (event.target === detailsDialog) closeDetails();
  });
  detailsDialog?.addEventListener("close", () => {
    detailsOrigin?.focus({ preventScroll: true });
  });

  window.addEventListener("scroll", requestSceneUpdate, { passive: true });
  window.addEventListener("resize", requestSceneUpdate, { passive: true });
  setStage(0);
  setHeaderIntro();
  updateScene();
})();
