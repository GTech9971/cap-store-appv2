import { ProjectExternalLink, RegistryProjectRequest } from "cap-store-api-def";
import { createContext, Dispatch, FC, ReactNode, useCallback, useContext, useMemo, useReducer } from "react";
import z from "zod";

export type SubmitError = Partial<Record<keyof RegistryProjectRequest, string>>;

/**
 * 最初に表示される未入力の外部リンク
 */
export const EmptyExternalLink: ProjectExternalLink = {
    link: 'http://localhost:1420',
    tag: "タグ無し",
    title: 'タイトルなし'
}

const projectSchema = z.object({
    name: z.string().min(1, 'プロジェクト名は必須です'),
    summary: z.string().min(1, 'プロジェクト概要は必須です'),
    description: z.string().optional(),
    tag: z.string().optional(),
    imgUrls: z.array(
        z.object({
            url: z.string().min(1, '画像URLは必須です'),
            tag: z.string().optional(),
            title: z.string().optional()
        })
    ).optional(),
    externalLinks: z.array(
        z.object({
            link: z.string().min(1, 'リンクは必須です'),
            tag: z.string().optional(),
            title: z.string().optional()
        })
    ).optional()
});

export type CreateProjectState = {
    /** 入力フォーム */
    form: RegistryProjectRequest,
    /** 他のエラー? */
    errors: SubmitError,
}

export type Action =
    | ChangeForm
    | ChangeExternalLinkAction
    | DeleteExternalLinkAction
    | AddEmptyExternalLinkAction
    | ValidateNewProjectAction
    | ClearFormAction
    ;

/** Formの変更 */
type ChangeForm = {
    type: 'changeForm',
    field: keyof RegistryProjectRequest,
    value: RegistryProjectRequest[keyof RegistryProjectRequest]
}

/** 外部リンク変更 */
type ChangeExternalLinkAction = {
    type: 'changeExternalLink',
    index: number,
    patch: Partial<ProjectExternalLink>
};

/** 外部リンク削除 */
type DeleteExternalLinkAction = {
    type: 'deleteExternalLink',
    index: number
};

/** 空の外部リンク作成 */
type AddEmptyExternalLinkAction = { type: 'addEmptyExternalLink', }

/** 入力内容でsubmit */
type ValidateNewProjectAction = {
    type: 'validateNewProject'
}

/** フォームの状態をクリア */
type ClearFormAction = { type: 'clearForm' }


export type CreateProjectContextValue = {
    state: CreateProjectState,
    dispatch: Dispatch<Action>,
    validateAndSubmit: (onValid: (form: RegistryProjectRequest) => Promise<void>) => Promise<void>
};

const CreateProjectContext = createContext<CreateProjectContextValue | undefined>(undefined);
export const createProjectReducer = (state: CreateProjectState, action: Action): CreateProjectState => {
    switch (action.type) {
        case 'changeForm': {
            let errors = state.errors;
            if (state.errors[action.field]) {
                const next = { ...errors };
                delete next[action.field];
                errors = next;
            }

            return {
                ...state,
                form: { ...state.form, [action.field]: action.value },
                errors: errors,
            };
        }
        case 'addEmptyExternalLink': {
            return {
                ...state,
                form: !state.form
                    ? state.form
                    : {
                        ...state.form,
                        externalLinks: [...state.form.externalLinks ?? []
                            , EmptyExternalLink
                        ]
                    },
            }
        }
        case 'changeExternalLink': {
            const links: ProjectExternalLink[] = state.form.externalLinks ?? [];
            const nextLinks: ProjectExternalLink[] = links.map((link, idx) => idx === action.index ? { ...link, ...action.patch } : link);

            let errors = state.errors;
            if (state.errors.externalLinks) {
                const next = { ...errors };
                delete next.externalLinks;
                errors = next;
            }

            return {
                ...state,
                form: { ...state.form, externalLinks: nextLinks },
                errors: errors,
            };
        }

        case 'deleteExternalLink': {
            const links: ProjectExternalLink[] = state.form.externalLinks ?? [];
            const nextLinks: ProjectExternalLink[] = links.filter((_, idx) => idx !== action.index);

            let errors = state.errors;
            if (state.errors.externalLinks) {
                const next = { ...errors };
                delete next.externalLinks;
                errors = next;
            }

            return {
                ...state,
                form: {
                    ...state.form,
                    externalLinks: nextLinks
                },
                errors: errors,
            };
        }

        case 'validateNewProject': {

            const sanitizedImages = (state.form.imgUrls ?? [])
                .map(image => ({
                    url: image.url.trim(),
                    tag: image.tag?.trim() || undefined,
                    title: image.title?.trim() || undefined
                }))
                .filter(image => image.url.length > 0);

            const sanitizedExternalLinks: ProjectExternalLink[] = (state.form.externalLinks ?? [])
                .map(link => ({
                    link: (link.link ?? '').trim(),
                    tag: link.tag?.trim() || undefined,
                    title: link.title?.trim() || undefined
                }))
                .filter(link => link.link.length > 0);

            const sanitizedForm: RegistryProjectRequest = {
                name: state.form.name.trim(),
                summary: state.form.summary.trim(),
                description: state.form.description?.trim() || undefined,
                tag: state.form.tag?.trim() || undefined,
                imgUrls: sanitizedImages,
                externalLinks: sanitizedExternalLinks
            };

            const validation = projectSchema.safeParse(sanitizedForm);
            let fieldErrors: Partial<Record<keyof RegistryProjectRequest, string>> = {};
            if (!validation.success) {
                fieldErrors = {};
                validation.error.issues.forEach(issue => {
                    const [field] = issue.path;
                    if (field) {
                        fieldErrors[field as keyof RegistryProjectRequest] = issue.message;
                    }
                });
            }

            return {
                ...state,
                form: {
                    ...state.form,
                    ...sanitizedForm
                },
                errors: fieldErrors,
            }
        }
        case 'clearForm': {
            return createInitialState();
        }
        default: { return state; }
    }
}


type Props = {
    children: ReactNode
}

export const createInitialState = (): CreateProjectState => {
    return {
        form: {
            name: '',
            summary: '',
            description: undefined,
            tag: undefined,
            imgUrls: [],
            externalLinks: []
        },
        errors: {},
    }
};

export const CreateProjectProvider: FC<Props> = ({
    children
}) => {
    const initialState: CreateProjectState = useMemo(() => createInitialState(), []);

    const [state, dispatch] = useReducer(createProjectReducer, initialState);

    const validateAndSubmit = useCallback(
        async (onValid: (form: RegistryProjectRequest) => Promise<void>) => {

            dispatch({ type: 'validateNewProject' });

            // reducer 後の最新 state を使う
            const hasError = Object.keys(state.errors).length > 0
            if (hasError) return

            await onValid(state.form);
        },
        [dispatch, state.form, state.errors]
    )


    const createProjectContextValue: CreateProjectContextValue = useMemo(() => ({
        state,
        dispatch,
        validateAndSubmit
    }), [state, dispatch, validateAndSubmit]);


    return (
        <CreateProjectContext.Provider value={createProjectContextValue}>
            {children}
        </CreateProjectContext.Provider>
    )

}

export const useCreateProjectContext = (): CreateProjectContextValue => {
    const context = useContext(CreateProjectContext);
    if (!context) { throw new Error('useCreateProjectContext must be used within CreateContext provider'); }

    return context;
}