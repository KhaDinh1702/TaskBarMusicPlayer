import { render } from "preact";
import { App } from "./App";
import "./index.css";

const rootElement = document.getElementById("app");
if (rootElement) {
  render(<App />, rootElement);
}
