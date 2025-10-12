import React, { cloneElement, useCallback, useRef, useState, type DOMAttributes, type ReactElement, } from "react";

export interface Prop {
    children: ReactElement<DOMAttributes<HTMLElement>>,
    text: string,
    defaultText: string,
    onCommit: (text: string) => void
}

/**
 * 編集可能
 * @param param0 
 * @returns 
 */
export const Editable: React.FC<Prop> = ({
    children,
    text,
    defaultText,
    onCommit
}) => {

    const ref = useRef<HTMLDivElement>(null);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [edit, setEdit] = useState<string>(text ?? defaultText);

    const commitEdit = useCallback((): string => {
        setIsEdit(false);
        if (!ref.current) { throw new Error(); }

        // editRef の内容を取得して state に反映
        const newText = ref.current.textContent ?? '';
        setEdit(newText);
        return newText;
    }, []);

    const handleKeyDownTagBadge = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const text = commitEdit();
            onCommit(text);
        }
        if (e.key === 'Backspace') {
            if (!ref.current) { return; }
            const text = ref.current.textContent ?? '';
            if (text.length === 1) { e.preventDefault(); }
        }
        if (e.key === 'Escape') {
            setEdit(text);
            setIsEdit(false);
        }
    }, [commitEdit, text, onCommit]);

    const handleInput = useCallback(() => {
        if (ref.current && ref.current.textContent === '') {
            // 1文字残す（例：ゼロ幅スペース）
            ref.current.textContent = defaultText;
            // キャレットを末尾に移動
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(ref.current);
            range.collapse(false);
            sel?.removeAllRanges();
            sel?.addRange(range);
        }
    }, [defaultText]);

    return (
        isEdit ?
            <div
                style={{ display: 'flex', width: 'fit-content' }}
                ref={ref}
                contentEditable
                suppressContentEditableWarning
                onBlur={commitEdit}
                onKeyDown={handleKeyDownTagBadge}
                onInput={handleInput}>
                {cloneElement(children, {
                    children: edit
                })}
            </div>
            :
            cloneElement(children, {
                onClick: () => setIsEdit(true),
                children: edit
            })
    )
}