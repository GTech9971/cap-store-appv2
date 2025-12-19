import { describe, expect, it } from "vitest";
import {
    createProjectReducer,
    createInitialState,
    type Action,
    CreateProjectState,
    EmptyExternalLink
} from './CreateProjectProvider';
import { RegistryProjectRequest } from "cap-store-api-def";


describe('新規プロジェクト作成のテスト', () => {

    it('空の外部リンクが作られる', () => {
        const action: Action = {
            type: 'addEmptyExternalLink'
        };

        const state: CreateProjectState = createProjectReducer(createInitialState(), action);

        expect(state.form.externalLinks?.length).toBe(1);
        const sut = state.form.externalLinks?.[0];
        expect(sut).not.toBeUndefined();
        expect(sut?.link).toBe(EmptyExternalLink.link);
        expect(sut?.tag).toBe(EmptyExternalLink.tag);
        expect(sut?.title).toBe(EmptyExternalLink.title);
    });

    // TODO 外部リンクの内容が書き換わる

    // TODO 外部リンクが削除されている

    it('指定した外部リンクのみが削除される', () => {
        const action: Action = { type: 'deleteExternalLink', index: 0 };

        let state: CreateProjectState = createInitialState();
        state.form.externalLinks = [
            { title: 'A', link: 'https://sample.com' },
            { title: 'B', link: 'https://sample.com' }
        ];

        state = createProjectReducer(state, action);

        expect(state.form.externalLinks?.[0].title).toBe('B');
    });

    it('名前の変更が反映されている(正常)', () => {
        const action: Action = { type: 'changeForm', field: 'name', value: 'change' };

        const state: CreateProjectState = createProjectReducer(createInitialState(), action);

        expect(state.form.name).toBe(action.value);
    });

    it('submit時に内容に不備があればエラー(名前がない)', () => {
        const action: Action = { type: 'validateNewProject', };

        const init: RegistryProjectRequest = {
            name: '',
            summary: 'test',
        }


        const state: CreateProjectState = createProjectReducer({ form: init, errors: {} }, action);

        expect(state.errors.name).not.toBeUndefined();
        expect(state.errors.summary).toBeUndefined();
        expect(state.errors.description).toBeUndefined();
    });

});