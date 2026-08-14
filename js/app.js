import { loadSession } from "./data.js";
import { renderApp, renderError } from "./render.js";

async function start() {
  const container = document.getElementById("app");

  try {
    const session = await loadSession();
    renderApp(container, session);
  } catch (error) {
    console.error(error);
    renderError(container, error);
  }
}

start();
