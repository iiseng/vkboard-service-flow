(() => {
  document.documentElement.classList.add("has-js");

  const journey = document.querySelector(".journey");
  const scene = document.querySelector("#tunnel-scene");
  const stagePanels = [...document.querySelectorAll("[data-stage-panel]")];
  const chamberGates = [...document.querySelectorAll("[data-chamber]")];
  const tunnelRings = [...document.querySelectorAll(".tunnel-ring")];
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
  const nextStageName = document.querySelector("#next-stage-name");
  const transitionStatus = document.querySelector("#transition-status");
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

  const shortStageNames = ["Поле", "Материал", "Смысл", "Событие", "Картина", "Вывод"];

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

  const smoothstep = (start, end, value) => {
    const progress = clamp((value - start) / (end - start), 0, 1);
    return progress * progress * (3 - 2 * progress);
  };

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
    nextStageName.textContent =
      index < shortStageNames.length - 1
        ? `Впереди: ${shortStageNames[index + 1]}`
        : "Впереди: готовый вывод";

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

  const updatePanels = (travelPosition, stageIndex) => {
    stagePanels.forEach((panel, panelIndex) => {
      const distance = panelIndex - travelPosition;
      const absoluteDistance = Math.abs(distance);
      const opacity = reducedMotion.matches
        ? Number(panelIndex === stageIndex)
        : 1 - smoothstep(0.12, 0.46, absoluteDistance);
      const scale = distance < 0
        ? 1 + Math.min(absoluteDistance, 1) * 0.12
        : 1 - Math.min(absoluteDistance, 1) * 0.08;
      const shift = clamp(distance, -1, 1) * 140;

      panel.style.setProperty("--panel-opacity", opacity.toFixed(4));
      panel.style.setProperty("--panel-scale", scale.toFixed(4));
      panel.style.setProperty("--panel-shift", `${shift.toFixed(2)}px`);
    });
  };

  const updateChambers = (travelPosition) => {
    chamberGates.forEach((gate, gateIndex) => {
      const distance = gateIndex - travelPosition;
      let scale = 0.1;
      let opacity = 0;

      if (distance >= 0 && distance <= 2.3) {
        scale = 1 / (1 + distance * 1.65);
        opacity = clamp(0.62 - distance * 0.23, 0.08, 0.62);
      } else if (distance < 0 && distance > -0.72) {
        const passed = -distance;
        scale = 1 + passed * 3.6;
        opacity = clamp(0.62 - passed * 1.1, 0, 0.62);
      }

      const labelOpacity = distance < -0.08
        ? 0
        : clamp(0.82 - Math.abs(distance) * 0.38, 0, 0.82);
      const turn = (gateIndex % 2 === 0 ? 1 : -1) * (gateIndex * 7 + travelPosition * 5);

      gate.style.setProperty("--gate-scale", scale.toFixed(4));
      gate.style.setProperty("--gate-opacity", opacity.toFixed(4));
      gate.style.setProperty("--gate-label-opacity", labelOpacity.toFixed(4));
      gate.style.setProperty("--gate-turn", `${turn.toFixed(2)}deg`);
    });
  };

  const updateTunnelRings = (journeyRatio) => {
    const ringTravel = journeyRatio * 12;
    tunnelRings.forEach((ring, ringIndex) => {
      const cycle = (ringTravel + ringIndex / tunnelRings.length) % 1;
      const scale = 0.18 + cycle * 3.05;
      const visibility = Math.sin(Math.PI * cycle) * 0.82;
      const alpha = 0.18 + (1 - cycle) * 0.52;
      const turn = journeyRatio * 150 + ringIndex * 17;

      ring.style.setProperty("--ring-scale", scale.toFixed(4));
      ring.style.setProperty("--ring-visibility", visibility.toFixed(4));
      ring.style.setProperty("--ring-alpha", alpha.toFixed(4));
      ring.style.setProperty("--ring-turn", `${turn.toFixed(2)}deg`);
    });
  };

  const updateNavigationProgress = (travelPosition) => {
    navItems.forEach((item, itemIndex) => {
      const fill = clamp(travelPosition - itemIndex, 0, 1);
      item.querySelector("button")?.style.setProperty("--step-fill", fill.toFixed(4));
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
    const rawPosition = journeyRatio * (stageVisuals.length - 1);
    const segmentIndex = Math.min(Math.floor(rawPosition), stageVisuals.length - 2);
    const segmentProgress = journeyRatio >= 1 ? 1 : rawPosition - segmentIndex;
    const transitionProgress = smoothstep(0.12, 0.88, segmentProgress);
    const travelPosition = journeyRatio >= 1
      ? stageVisuals.length - 1
      : segmentIndex + transitionProgress;
    const stageIndex = clamp(Math.round(travelPosition), 0, stageVisuals.length - 1);
    const distanceToStage = Math.abs(travelPosition - stageIndex);
    const transitionEnergy = Math.sin(distanceToStage * Math.PI);
    const coreContentOpacity = 1 - smoothstep(0.23, 0.49, distanceToStage);
    const coreScale = 0.94 + transitionEnergy * 0.16;
    const cameraCycle = Math.sin(journeyRatio * Math.PI * 12) ** 2;

    transitionStatus.textContent =
      `${String(segmentIndex + 1).padStart(2, "0")} → `
      + `${String(segmentIndex + 2).padStart(2, "0")} · ${shortStageNames[segmentIndex + 1]}`;

    scene.style.setProperty("--depth-progress", journeyRatio.toFixed(4));
    scene.style.setProperty("--stage-progress", segmentProgress.toFixed(4));
    scene.style.setProperty("--camera-cycle", cameraCycle.toFixed(4));
    scene.style.setProperty("--transition-energy", transitionEnergy.toFixed(4));
    scene.style.setProperty("--core-scale", coreScale.toFixed(4));
    scene.style.setProperty("--core-content-opacity", coreContentOpacity.toFixed(4));

    updatePanels(travelPosition, stageIndex);
    updateChambers(travelPosition);
    updateTunnelRings(journeyRatio);
    updateNavigationProgress(travelPosition);

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
  reducedMotion.addEventListener?.("change", requestSceneUpdate);
  setStage(0);
  setHeaderIntro();
  updateScene();
})();
