import {
    IonBadge,
    IonContent,
    IonHeader,
    IonIcon,
    IonRouterOutlet,
    IonTab,
    IonTabBar,
    IonTabButton,
    IonTabs,
    IonTitle,
    IonToolbar
} from "@ionic/react"

import { informationOutline, hardwareChipOutline } from 'ionicons/icons';
import { ProjectMainPage } from "./ProjectMainPage";

export const ProjectPage = () => {
    return (

        <IonRouterOutlet>
            <IonTabs>
                <IonTab tab="home">
                    <div id='home-page' style={{ height: '100%' }}>
                        <ProjectMainPage />
                    </div>
                </IonTab>

                <IonTab tab="bom">
                    <div id="bom-page" style={{ height: '100%' }}>
                        <IonHeader>
                            <IonToolbar>
                                <IonTitle>BOM</IonTitle>
                            </IonToolbar>
                        </IonHeader>
                        <IonContent>
                            <div className="example-content">BOM content</div>
                        </IonContent>
                    </div>
                </IonTab>

                <IonTabBar slot="bottom">
                    <IonTabButton tab="home">
                        <IonIcon icon={informationOutline} />
                        Info
                    </IonTabButton>
                    <IonTabButton tab="bom">
                        <IonIcon icon={hardwareChipOutline} />
                        BOM
                        <IonBadge>5</IonBadge>
                    </IonTabButton>
                </IonTabBar>

            </IonTabs>
        </IonRouterOutlet>
    )
}