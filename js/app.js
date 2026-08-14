import { loadSession } from "./data.js";
import { renderApp, renderError } from "./render.js";

function start() {
  const container = document.getElementById("app");
  try {
    renderApp(container, loadSession());
  } catch (error) {
    console.error(error);
    renderError(container, error);
  }
}

start();
