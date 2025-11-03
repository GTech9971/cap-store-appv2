import { useState, type DOMAttributes, type ReactElement } from "react";

import './Diff.css';
import { IonContent, IonPopover, IonText } from "@ionic/react";


export interface Prop {
    children: ReactElement<DOMAttributes<HTMLElement>>,
    showDiff: boolean,
    diffContext: string | number,
}

export const Diff: React.FC<Prop> = ({
    children,
    showDiff,
    diffContext
}) => {

    const [isShow, setIsShow] = useState<boolean>(false);

    return (
        showDiff ?
            <>
                <div
                    id={diffContext.toString()}
                    className='is-edit'
                    onClick={() => setIsShow(!isShow)}>
                    {children}
                </div>

                <IonPopover trigger={diffContext.toString()} >
                    <IonContent className="ion-padding">
                        <IonText>変更前:</IonText>
                        <IonText style={{ marginLeft: '5px' }}>
                            {diffContext}
                        </IonText>
                    </IonContent>
                </IonPopover>
            </>
            :
            children
    )
}