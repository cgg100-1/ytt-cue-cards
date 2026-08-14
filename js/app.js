import { loadSession } from "./data.js";
import { renderApp, renderError } from "./render.js";

const FOCUS_STORAGE_KEY = "ytt-cue-cards.focus-sequence";

function getSavedFocus(session) {
  try {
    const saved = localStorage.getItem(FOCUS_STORAGE_KEY);
    if (saved === "all") return "all";
    if (session.sequences.some((sequence) => sequence.id === saved)) return saved;
  } catch (error) {
    console.warn("Could not read saved focus flow.", error);
  }

  return "all";
}

function saveFocus(sequenceId) {
  try {
    localStorage.setItem(FOCUS_STORAGE_KEY, sequenceId);
  } catch (error) {
    console.warn("Could not save focus flow.", error);
  }
}

function start() {
  const container = document.getElementById("app");

  try {
    const session = loadSession();
    let selectedSequenceId = getSavedFocus(session);

    const render = () => {
      renderApp(container, session, {
        selectedSequenceId,
        onFocusChange: (sequenceId) => {
          selectedSequenceId = sequenceId;
          saveFocus(sequenceId);
          render();
          window.scrollTo({ top: 0, behavior: "smooth" });
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
