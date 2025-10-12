import {
    IonBackButton,
    IonBadge,
    IonButton,
    IonButtons,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
    IonItem,
    IonList,
    IonNote,
    IonRow,
    IonSelect,
    IonText,
    IonTextarea,
    IonTitle,
    IonToolbar
} from "@ionic/react"
import ImageCarousel from "../../components/ImageCarousel"
import { Editable } from "../../components/editable/Editable"

import { timeOutline, createOutline, pricetagOutline } from "ionicons/icons"
import { ExternalLinkCard } from "../../components/external-link/ExternalLinkCard"

export const ProjectMainPage = () => {
    return (
        <>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton></IonBackButton>
                    </IonButtons>

                    <IonTitle>DrinkMeter P-123456</IonTitle>

                    <IonButtons slot="end">
                        <IonButton fill="clear">
                            更新
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen>

                <IonGrid>
                    <IonRow>
                        <IonCol>
                            <IonRow>
                                <IonList lines="none">
                                    <IonItem>
                                        <IonText>
                                            <Editable text="DrinkMeter" defaultText="タイトル" onCommit={() => { }}>
                                                <h2 />
                                            </Editable>
                                        </IonText>
                                    </IonItem>
                                    <IonItem>
                                        <ImageCarousel images={[]} />
                                    </IonItem>
                                    <IonItem>
                                        <IonSelect label="画像URL"></IonSelect>
                                    </IonItem>
                                </IonList>

                            </IonRow>

                        </IonCol>

                        <IonCol>
                            <IonRow>
                                <IonText>
                                    <Editable text="コカコーラの残量を計測する" defaultText="サマリー" onCommit={() => { }}>
                                        <h3 />
                                    </Editable>
                                </IonText>


                                <IonTextarea
                                    label="説明・備考"
                                    labelPlacement="stacked"
                                    rows={30}
                                />
                            </IonRow>
                        </IonCol>

                        <IonCol>
                            <IonRow style={{ justifyContent: 'end' }}>
                                <IonNote style={{ display: 'flex', alignItems: 'center' }}>
                                    <IonIcon icon={timeOutline} />
                                    2025/10/01 16:32:02
                                </IonNote>
                            </IonRow>

                            <IonRow style={{ justifyContent: 'end' }}>
                                <IonNote style={{ display: 'flex', alignItems: 'center' }}>
                                    <IonIcon icon={createOutline} />
                                    2025/12/13 10:24:11
                                </IonNote>
                            </IonRow>

                            <IonRow style={{ justifyContent: 'end', marginTop: '10px' }}>
                                <IonBadge>計画中</IonBadge>
                            </IonRow>
                            <IonRow style={{ justifyContent: 'end' }}>
                                <IonBadge color='light' style={{ display: 'flex', alignItems: 'center' }}>
                                    <IonIcon icon={pricetagOutline} />
                                    <Editable text="ネタ" defaultText="タグなし" onCommit={() => { }}>
                                        <IonText />
                                    </Editable>
                                </IonBadge>
                            </IonRow>

                            <IonRow style={{ marginTop: '10px' }}>
                                <IonList style={{ overflow: 'scroll', height: '20vh' }}>

                                    <ExternalLinkCard
                                        link="http://localhost:6006/?path=/story/components-externallinkcard--default"
                                        title="ストーリーブック"
                                        onEditedLink={() => { }}
                                        onEditedTitle={() => { }}
                                        tag="Storybook"
                                        onEditedTag={() => { }}
                                    />

                                    <ExternalLinkCard
                                        link="http://localhost:6006/?path=/story/components-externallinkcard--default"
                                        title="ストーリーブック"
                                        onEditedLink={() => { }}
                                        onEditedTitle={() => { }}
                                        tag="Storybook"
                                        onEditedTag={() => { }}
                                    />

                                    <ExternalLinkCard
                                        link="http://localhost:6006/?path=/story/components-externallinkcard--default"
                                        title="ストーリーブック"
                                        onEditedLink={() => { }}
                                        onEditedTitle={() => { }}
                                        tag="Storybook"
                                        onEditedTag={() => { }}
                                    />
                                </IonList>
                            </IonRow>
                        </IonCol>

                    </IonRow>
                </IonGrid>

            </IonContent>

        </>
    )
}