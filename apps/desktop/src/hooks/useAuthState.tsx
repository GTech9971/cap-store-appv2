import { useOktaAuth } from "@okta/okta-react";

/**
 * 
 * @returns true 認証済(developmentの場合は常にtrue)
 */
export const useAuthState = () => {

    const { authState } = useOktaAuth();

    return {
        isAuthenticated: import.meta.env.MODE === 'development'
            ? true
            : authState?.isAuthenticated ?? false
    }
}