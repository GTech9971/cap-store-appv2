import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonModal,
    IonTitle,
    IonToolbar,
} from "@ionic/react"
import { Storage, Location } from "cap-store-api-def";
import { useCallback, useState } from "react";
import { NorthRoom } from "ui/components/locations/NorthRoom"
import './NorthRoomModal.css';
import { useDefaultStorage } from "@/api/useDefaultStorage";


interface Props {
    isOpen: boolean,
    /** 初期ストレージ */
    storage?: Storage,
    onSelect: (selected?: Storage, selectedLocation?: Location) => void,
    onClose: () => void
}

export const NorthRoomModal: React.FC<Props> = ({
    isOpen,
    storage,
    onSelect,
    onClose
}) => {
    // 選択した保管庫
    const [selected, setSelected] = useState<Storage | undefined>(storage);
    const [selectedLocation, setSelectedLocation] = useState<Location | undefined>(undefined);

    // Api
    const { cabinet, desk, handleSaveStorage, highlight, highlighOff } = useDefaultStorage();

    /**
     * 選択完了処理
     */
    const handleSelectStorage = useCallback(() => {
        onSelect(selected, selectedLocation);
        onClose();
    }, [onSelect, onClose, selected, selectedLocation]);


    return (
        <IonModal isOpen={isOpen} className="modal">
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start" >
                        <IonButton onClick={onClose}>
                            閉じる
                        </IonButton>
                    </IonButtons>

                    <IonTitle>北の部屋</IonTitle>

                    <IonButtons slot="end">
                        <IonButton onClick={handleSelectStorage}>
                            選択
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent className="ion-padding" color="light">

                {(desk && cabinet) &&
                    <NorthRoom
                        deskLocation={desk}
                        cabinetLocation={cabinet}
                        onSave={handleSaveStorage}
                        defaultSelected={storage}
                        onSelected={(selected, selectedLocation) => {
                            setSelected(selected);
                            setSelectedLocation(selectedLocation);
                        }}
                        onHighlight={highlight}
                        onHighlightOff={() => highlighOff(cabinet)}
                    />
                }

            </IonContent>

        </IonModal>
    )
}