import { IonAvatar, IonButton, IonChip, IonFooter, IonItem, IonLabel, IonList, IonToggle, ToggleCustomEvent } from "@ionic/react"
import { useOktaAuth } from "@okta/okta-react";
import { useState, useEffect, useCallback } from "react";
import './AuthFooter.css';

export const AuthFooter = () => {
    // okta系
    const { authState, oktaAuth } = useOktaAuth();
    // ユーザー名取得用 state
    const [userName, setUserName] = useState<string>('');

    const [paletteToggle, setPaletteToggle] = useState(false);

    // Listen for the toggle check/uncheck to toggle the dark palette
    const toggleChange = (event: ToggleCustomEvent) => {
        toggleDarkPalette(event.detail.checked);
    };

    // Add or remove the "ion-palette-dark" class on the html element
    const toggleDarkPalette = (shouldAdd: boolean) => {
        document.documentElement.classList.toggle('ion-palette-dark', shouldAdd);
    };

    // Check/uncheck the toggle and update the palette based on isDark
    const initializeDarkPalette = useCallback((isDark: boolean) => {
        setPaletteToggle(isDark);
        toggleDarkPalette(isDark);
    }, []);

    useEffect(() => {
        // Use matchMedia to check the user preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

        // Initialize the dark palette based on the initial
        // value of the prefers-color-scheme media query
        initializeDarkPalette(prefersDark.matches);

        const setDarkPaletteFromMediaQuery = (mediaQuery: MediaQueryListEvent) => {
            initializeDarkPalette(mediaQuery.matches);
        };

        // Listen for changes to the prefers-color-scheme media query
        prefersDark.addEventListener('change', setDarkPaletteFromMediaQuery);

        return () => {
            prefersDark.removeEventListener('change', setDarkPaletteFromMediaQuery);
        };
    }, [initializeDarkPalette]);


    // 認証状態変化時にユーザー情報を取得
    useEffect(() => {
        (async () => {
            if (authState?.isAuthenticated) {
                const user = await oktaAuth.getUser();
                setUserName(user.name || '');
            }
        })();
    }, [authState, oktaAuth]);

    return (
        <IonFooter>
            <IonList>
                <IonItem lines="none">
                    {
                        authState?.isAuthenticated ? (
                            <>
                                <IonChip>
                                    <IonAvatar>
                                        <img alt="" src="https://ionicframework.com/docs/img/demos/avatar.svg" />
                                    </IonAvatar>
                                    <IonLabel>{userName}</IonLabel>
                                </IonChip>

                                <IonButton slot="end" fill="clear" onClick={() => oktaAuth.signOut()}>ログアウト</IonButton>
                            </>
                        ) : (
                            <IonLabel color='primary'>
                                <IonButton fill="clear" onClick={() => oktaAuth.signInWithRedirect()}>ログイン</IonButton>
                            </IonLabel>
                        )
                    }

                    <IonToggle slot="end" checked={paletteToggle} onIonChange={toggleChange} justify="space-between">
                        Dark Mode
                    </IonToggle>

                </IonItem>
            </IonList>
        </IonFooter>
    )
}