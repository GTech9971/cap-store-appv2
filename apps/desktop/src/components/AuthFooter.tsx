import { IonAvatar, IonButton, IonChip, IonFooter, IonItem, IonLabel, IonList } from "@ionic/react"
import { useOktaAuth } from "@okta/okta-react";
import { useState, useEffect } from "react";

export const AuthFooter = () => {
    // okta系
    const { authState, oktaAuth } = useOktaAuth();
    // ユーザー名取得用 state
    const [userName, setUserName] = useState<string>('');

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
                </IonItem>
            </IonList>
        </IonFooter>
    )
}