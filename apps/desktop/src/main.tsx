import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { IonApp, setupIonicReact } from "@ionic/react";

import '@ionic/react/css/core.css';
import { enableMocking } from "./mocks";

setupIonicReact({
  mode: 'ios'
});

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <IonApp>
        <App />
      </IonApp>
    </React.StrictMode>,
  );
})

