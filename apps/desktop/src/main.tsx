import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { setupIonicReact } from "@ionic/react";

import '@ionic/react/css/core.css';

setupIonicReact({
  mode: 'ios'
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
