function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined && text !== null) element.textContent = text;
  return element;
}

function renderReviewNote(note) {
  if (!note) return null;

  const details = createElement("details", "card__review");
  const summary = createElement("summary", null, "Review note");
  const body = createElement("div", null, note);

  details.append(summary, body);
  return details;
}

function renderNames(node) {
  if (node.type !== "pose") {
    return createElement("div", "card__english", node.label);
  }

  const names = createElement("div", "card__names");
  names.append(createElement("div", "card__english", node.label));

  if (node.pose?.sanskrit) {
    names.append(createElement("div", "card__sanskrit", node.pose.sanskrit));
  }

  return names;
}

function renderFocusPicker(session, selectedSequenceIds, onFocusChange) {
  const nav = createElement("nav", "focus-picker");
  nav.setAttribute("aria-label", "Choose flows to focus on");

  const label = createElement("div", "focus-picker__label", "Focus on");
  const options = createElement("div", "focus-picker__options");

  for (const sequence of session.sequences) {
    const option = createElement("label", "focus-picker__option");
    const checkbox = createElement("input", "focus-picker__checkbox");
    checkbox.type = "checkbox";
    checkbox.value = sequence.id;
    checkbox.checked = selectedSequenceIds.has(sequence.id);

    checkbox.addEventListener("change", () => {
      const nextSelection = new Set(selectedSequenceIds);
      if (checkbox.checked) nextSelection.add(sequence.id);
      else nextSelection.delete(sequence.id);
      onFocusChange(nextSelection);
    });

    option.append(checkbox, createElement("span", null, sequence.title));
    options.append(option);
  }

  nav.append(label, options);
  return nav;
}

export function renderNode(node) {
  const article = createElement("article", `card card--${node.type}`);

  article.append(renderNames(node));
  article.append(createElement("div", "card__cue", node.cue));

  const review = renderReviewNote(node.source?.reviewNote);
  if (review) article.append(review);

  return article;
}

export function renderSequence(sequence) {
  const section = createElement("section", "sequence");
  section.dataset.sequenceId = sequence.id;

  const title = createElement("h2", "sequence__title", sequence.title);
  const cards = createElement("div", "cards");

  for (const node of sequence.nodes) {
    cards.append(renderNode(node));
  }

  section.append(title, cards);
  return section;
}

export function renderApp(container, session, options = {}) {
  const selectedSequenceIds = options.selectedSequenceIds ?? new Set(session.sequences.map((sequence) => sequence.id));
  const onFocusChange = options.onFocusChange ?? (() => {});

  container.replaceChildren();
  container.append(renderFocusPicker(session, selectedSequenceIds, onFocusChange));

  const sequences = session.sequences.filter((sequence) => selectedSequenceIds.has(sequence.id));

  for (const sequence of sequences) {
    container.append(renderSequence(sequence));
  }
}

export function renderError(container, error) {
  container.replaceChildren(
    createElement(
      "div",
      "error",
      `The cue cards could not be loaded. ${error instanceof Error ? error.message : String(error)}`
    )
  );
}
