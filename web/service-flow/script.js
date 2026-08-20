(() => {
  const root = document.body;
  const steps = [...document.querySelectorAll(".step[data-stage]")];
  const markers = [...document.querySelectorAll(".stage-progress li")];
  const counter = document.querySelector("#stage-number");
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
  let currentStage = -1;
  let ticking = false;
  let detailsOrigin = null;

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

  const setStage = (stage) => {
    const nextStage = Math.max(0, Math.min(markers.length - 1, Number(stage)));
    if (nextStage === currentStage) return;

    currentStage = nextStage;
    root.dataset.stage = String(nextStage);
    if (counter) counter.textContent = String(nextStage + 1).padStart(2, "0");

    steps.forEach((step) => {
      step.classList.toggle("is-active", Number(step.dataset.stage) === nextStage);
    });

    markers.forEach((marker, index) => {
      marker.classList.toggle("is-active", index === nextStage);
      marker.classList.toggle("is-complete", index < nextStage);
    });
  };

  const updateFromScroll = () => {
    const focusLine = window.innerHeight * (window.innerWidth <= 860 ? 0.7 : 0.5);
    let closest = steps[0];
    let closestDistance = Number.POSITIVE_INFINITY;

    steps.forEach((step) => {
      const rect = step.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const distance = Math.abs(center - focusLine);
      if (distance < closestDistance) {
        closest = step;
        closestDistance = distance;
      }
    });

    if (closest) setStage(closest.dataset.stage);
    ticking = false;
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateFromScroll);
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

    document.body.classList.add("dialog-open");
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
    document.body.classList.remove("dialog-open");
    detailsOrigin?.focus();
  });

  setStage(0);
  updateFromScroll();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
})();
