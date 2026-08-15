import { loadSession } from "./data.js";
import { renderApp, renderError } from "./render.js";

const FOCUS_STORAGE_KEY = "ytt-cue-cards.focus-sequences";
const LEGACY_FOCUS_STORAGE_KEY = "ytt-cue-cards.focus-sequence";

function allSequenceIds(session) {
  return session.sequences.map((sequence) => sequence.id);
}

function getSavedFocus(session) {
  const validIds = new Set(allSequenceIds(session));

  try {
    const saved = localStorage.getItem(FOCUS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return new Set(parsed.filter((id) => validIds.has(id)));
      }
    }

    const legacy = localStorage.getItem(LEGACY_FOCUS_STORAGE_KEY);
    if (legacy === "all") return new Set(validIds);
    if (legacy && validIds.has(legacy)) return new Set([legacy]);
  } catch (error) {
    console.warn("Could not read saved focus flows.", error);
  }

  return new Set(validIds);
}

function saveFocus(sequenceIds) {
  try {
    localStorage.setItem(FOCUS_STORAGE_KEY, JSON.stringify([...sequenceIds]));
    localStorage.removeItem(LEGACY_FOCUS_STORAGE_KEY);
  } catch (error) {
    console.warn("Could not save focus flows.", error);
  }
}

function start() {
  const container = document.getElementById("app");

  try {
    const session = loadSession();
    let selectedSequenceIds = getSavedFocus(session);

    const render = () => {
      renderApp(container, session, {
        selectedSequenceIds,
        onFocusChange: (sequenceIds) => {
          selectedSequenceIds = sequenceIds;
          saveFocus(sequenceIds);
          render();
        }
      });
    };

    render();
  } catch (error) {
    console.error(error);
    renderError(container, error);
  }
}

start();
