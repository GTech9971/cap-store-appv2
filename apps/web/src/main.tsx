import React from "react";
import ReactDOM from "react-dom/client";
import { IonApp, setupIonicReact } from "@ionic/react";

import '@ionic/react/css/core.css';
import '@ionic/react/css/palettes/dark.class.css';

import { enableMocking } from "./mocks"
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";

setupIonicReact({
  mode: 'ios'
});


enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <IonApp>
          <App />
        </IonApp>
      </BrowserRouter>
    </React.StrictMode>,
  );
})
