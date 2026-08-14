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

export function renderNode(node) {
  const article = createElement("article", `card card--${node.type}`);

  const head = createElement("div", "card__head");
  head.append(createElement("span", `card__status card__status--${node.status}`, node.status));
  article.append(head);

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

export function renderApp(container, session) {
  container.replaceChildren();

  for (const sequence of session.sequences) {
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
