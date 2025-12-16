import { Route, Routes, useNavigate } from "react-router-dom"
// import Home from "./pages/Home"
// import { PartDetailPage } from "./pages/PartDetailPage"
import { LoginCallback, Security } from '@okta/okta-react';
import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';
import { oktaConfig } from "./config/OktaConfig";


const oktaAuth = new OktaAuth(oktaConfig);

export const App = () => {

  const navigate = useNavigate();
  const restoreOriginalUri = (_oktaAuth: unknown, originalUri: string) => {
    const url: string = toRelativeUrl(originalUri || '/', window.location.origin);

    // エイリアス設定を行なっていた場合、/ドメイン名/ドメイン名/のようにURLが書き換えられるので防止
    // if (import.meta.env.MODE !== 'development' && url.includes(import.meta.env.BASE_URL)) {
    //     url = url.replace(import.meta.env.BASE_URL, '/');
    // }

    navigate(url);
  };


  return (
    <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri}>
      <Routes>
        {/* <Route path="/" element={<Home />} />
        <Route path="/parts/:id" element={<PartDetailPage />} /> */}
        {/* <Route path="/projects/new" element={<NewProjectPage />} />
        <Route path="/projects/:projectId" element={<ProjectMainPage />} /> */}

        <Route path="/login/callback" element={<LoginCallback loadingElement={<h3>Loading...</h3>} />} />

      </Routes>
    </Security>
  )
}