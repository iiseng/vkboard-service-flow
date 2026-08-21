(() => {
  const intro = document.querySelector(".intro-screen[data-stage]");
  const stages = [...document.querySelectorAll(".pipeline-stage[data-stage]")];
  const revealItems = [...document.querySelectorAll(".pipeline-stage")];
  const progressBar = document.querySelector("#reading-progress-bar");
  const headerStageNumber = document.querySelector("#header-stage-number");
  const headerStageName = document.querySelector("#header-stage-name");
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

  const stageDetails = [
    {
      step: "Этап 01 · Сбор",
      title: "Сначала сервис формирует поле кандидатов",
      lead:
        "VK search получает тему и период исследования. Сервис сохраняет доступные записи вместе с идентификатором источника, датой, текстом и теми метриками, которые вернул ВКонтакте.",
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
        "Для анализа выбирается каноническое представление материала, а решение о релевантности переносится на его размещения.",
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
        "Каждая характеристика отвечает на свой вопрос и может быть проверена отдельно.",
        "Неуверенность и отсутствие применимости сохраняются как отдельные состояния.",
        "Сильные аналитические тезисы связываются с конкретными материалами.",
      ],
      note:
        "На этом этапе материал получает контекст, но ещё не считается самостоятельным инфоповодом.",
    },
    {
      step: "Этап 04 · Инфоповоды",
      title: "Разные материалы сопоставляются как описания событий",
      lead:
        "Семантическая кластеризация ищет материалы, которые рассказывают об одном событии разными словами. Так появляется инфоповод — не размещение, а самостоятельная единица анализа.",
      input: "Осмысленные материалы",
      output: "Инфоповоды",
      points: [
        "Связь строится по смыслу, а не только по совпадению слов.",
        "Материал может остаться самостоятельным singleton-инфоповодом.",
        "Число размещений не раздувает число самостоятельных событий.",
      ],
      note:
        "Показанные 8 материалов, 17 размещений и 11 источников — демонстрационная структура одного события.",
    },
    {
      step: "Этап 05 · Картина темы",
      title: "Инфоповоды складываются в структуру всей темы",
      lead:
        "Сервис группирует события в смысловые направления и считает метрики на правильном уровне. Так один материал остаётся видимым внутри общей картины.",
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
      step: "Этап 06 · Проверяемый результат",
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

  let activeStage = -2;
  let detailsOrigin = null;
  let progressFrame = 0;

  const setActiveStage = (stage) => {
    const index = Number(stage.dataset.stage);
    if (index === activeStage) return;
    activeStage = index;
    headerStageNumber.textContent = String(index + 1).padStart(2, "0");
    headerStageName.textContent = stage.dataset.stageName || "Путь информации";
  };

  const updateProgress = () => {
    progressFrame = 0;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
    progressBar.style.transform = `scaleX(${Math.max(0, Math.min(1, progress))})`;
  };

  const requestProgressUpdate = () => {
    if (progressFrame) return;
    progressFrame = window.requestAnimationFrame(updateProgress);
  };

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    },
    { rootMargin: "0px 0px -12%", threshold: 0.13 },
  );

  const stageObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => right.intersectionRatio - left.intersectionRatio);
      if (visible[0]) setActiveStage(visible[0].target);
    },
    { rootMargin: "-34% 0px -45%", threshold: [0.01, 0.2, 0.45] },
  );

  revealItems.forEach((stage) => revealObserver.observe(stage));
  if (intro) stageObserver.observe(intro);
  stages.forEach((stage) => stageObserver.observe(stage));

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

  window.addEventListener("scroll", requestProgressUpdate, { passive: true });
  window.addEventListener("resize", requestProgressUpdate, { passive: true });
  updateProgress();

  if (stages[0]) stages[0].classList.add("is-visible");
  if (intro) setActiveStage(intro);
  else if (stages[0]) setActiveStage(stages[0]);
})();
