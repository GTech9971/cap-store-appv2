import { useOktaAuth } from "@okta/okta-react"
import { toRelativeUrl } from "@okta/okta-auth-js"
import { useEffect } from "react";
import { Outlet } from "react-router-dom";

export const RequiredAuth: React.FC = () => {
    const { oktaAuth, authState } = useOktaAuth();

    useEffect(() => {
        if (!authState) {
            return;
        }

        if (!authState?.isAuthenticated) {
            const originalUri = toRelativeUrl(window.location.href, window.location.origin);
            oktaAuth.setOriginalUri(originalUri);
            oktaAuth.signInWithRedirect();
        }
    }, [oktaAuth, authState]);

    if (!authState || !authState?.isAuthenticated) {
        return (<h3>Loading...</h3>);
    }

    return (<Outlet />)
}
