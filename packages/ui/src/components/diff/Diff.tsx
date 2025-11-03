import { type DOMAttributes, type ReactElement } from "react";
import './Diff.css';
import { IonContent, IonText, useIonPopover } from "@ionic/react";

const Popover = (diffContext: string | undefined) =>
    <IonContent className="ion-padding">
        <IonText>変更前:</IonText>
        <IonText style={{ marginLeft: '5px' }}>
            {diffContext}
        </IonText>
    </IonContent>

export interface Prop {
    children: ReactElement<DOMAttributes<HTMLElement>>,
    showDiff: boolean,
    diffContext: string | undefined,
}

export const Diff: React.FC<Prop> = ({
    children,
    showDiff,
    diffContext
}) => {

    const [present] = useIonPopover(Popover(diffContext));

    return (
        showDiff ?
            <>
                <div className='is-edit'
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onClick={(e: any) => present({ event: e })}>
                    {children}
                </div>
            </>
            :
            children
    )
}