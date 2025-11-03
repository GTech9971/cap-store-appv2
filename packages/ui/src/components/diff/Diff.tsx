import { type DOMAttributes, type ReactElement } from "react";
import './Diff.css';

export interface Prop {
    children: ReactElement<DOMAttributes<HTMLElement>>,
    showDiff: boolean
}

export const Diff: React.FC<Prop> = ({
    children,
    showDiff
}) => {

    return (
        showDiff ?
            <>
                <div className='is-edit'>
                    {children}
                </div>
            </>
            :
            children
    )
}