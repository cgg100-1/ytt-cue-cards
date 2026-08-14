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

function renderFocusPicker(session, selectedSequenceId, onFocusChange) {
  const nav = createElement("nav", "focus-picker");
  nav.setAttribute("aria-label", "Choose a flow to focus on");

  const label = createElement("label", "focus-picker__label", "Focus on");
  label.htmlFor = "flow-focus";

  const select = createElement("select", "focus-picker__select");
  select.id = "flow-focus";

  const allOption = createElement("option", null, "All flows");
  allOption.value = "all";
  select.append(allOption);

  for (const sequence of session.sequences) {
    const option = createElement("option", null, sequence.title);
    option.value = sequence.id;
    select.append(option);
  }

  const validSelection = selectedSequenceId === "all" || session.sequences.some(
    (sequence) => sequence.id === selectedSequenceId
  );
  select.value = validSelection ? selectedSequenceId : "all";

  select.addEventListener("change", (event) => {
    onFocusChange(event.target.value);
  });

  nav.append(label, select);
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
  const selectedSequenceId = options.selectedSequenceId ?? "all";
  const onFocusChange = options.onFocusChange ?? (() => {});

  container.replaceChildren();
  container.append(renderFocusPicker(session, selectedSequenceId, onFocusChange));

  const sequences = selectedSequenceId === "all"
    ? session.sequences
    : session.sequences.filter((sequence) => sequence.id === selectedSequenceId);

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
