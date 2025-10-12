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
    IonItemDivider,
    IonItemGroup,
    IonLabel,
    IonList,
    IonNote,
    IonRow,
    IonSelect,
    IonText,
    IonTextarea,
    IonTitle,
    IonToolbar
} from "@ionic/react"
import ImageCarousel from "ui/components/ImageCarousel"
import { Editable } from "ui/components/editable/Editable"

import { timeOutline, createOutline, pricetagOutline } from "ionicons/icons"
import { ExternalLinkCard } from "ui/components/external-link/ExternalLinkCard"
import ImageCarouselSelectModal from "ui/components/ImageCarouselSelectModal"

export const ProjectMainPage = () => {
    return (
        <>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/"></IonBackButton>
                    </IonButtons>

                    <IonTitle>DrinkMeter P-123456</IonTitle>

                    <IonButtons slot="end">
                        <IonButton fill="clear">
                            更新
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen color='light'>

                <IonGrid>
                    <IonRow>
                        <IonCol size="4">
                            <IonList lines="none" inset color="light">
                                <IonItem>
                                    <IonLabel>プロジェクト名</IonLabel>
                                    <IonText>
                                        <Editable text="DrinkMeter" defaultText="タイトル" onCommit={() => { }}>
                                            <h2 />
                                        </Editable>
                                    </IonText>
                                </IonItem>

                                <ImageCarousel images={[]} />
                                <IonItem>
                                    <IonButton slot="end" fill="clear">編集</IonButton>
                                </IonItem>

                            </IonList>

                            <ImageCarouselSelectModal
                                images={[]}
                                onDismiss={() => { }}
                                onChange={e => { }}
                                isOpen={false}
                            />

                        </IonCol>

                        <IonCol >

                            <IonList inset>
                                <IonItem>
                                    <IonLabel>概要</IonLabel>
                                    <IonText>
                                        <Editable text="コカコーラの残量を計測する" defaultText="サマリー" onCommit={() => { }}>
                                            <h3 />
                                        </Editable>
                                    </IonText>

                                </IonItem>

                                <IonItem>
                                    <IonTextarea
                                        label="説明・備考"
                                        labelPlacement="stacked"
                                        rows={12}
                                    />

                                </IonItem>
                            </IonList>




                        </IonCol>

                        <IonCol size="3">

                            <IonList inset color="light">

                                <IonItem lines="none">
                                    <IonNote style={{ display: 'flex', alignItems: 'center' }}>
                                        <IonIcon icon={timeOutline} />
                                        2025/10/01 16:32:02
                                    </IonNote>
                                </IonItem>


                                <IonItem>
                                    <IonNote style={{ display: 'flex', alignItems: 'center' }}>
                                        <IonIcon icon={createOutline} />
                                        2025/12/13 10:24:11
                                    </IonNote>
                                </IonItem>
                                <IonItem>
                                    <IonBadge>計画中</IonBadge>

                                    <IonBadge slot="end" color='light' style={{ display: 'flex', alignItems: 'center' }}>
                                        <IonIcon icon={pricetagOutline} />
                                        <Editable text="ネタ" defaultText="タグなし" onCommit={() => { }}>
                                            <IonText />
                                        </Editable>
                                    </IonBadge>
                                </IonItem>


                            </IonList>

                            {/* <IonRow style={{ marginTop: '10px' }}>
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
                            </IonRow> */}
                        </IonCol>

                    </IonRow>
                </IonGrid>

            </IonContent>

        </>
    )
}