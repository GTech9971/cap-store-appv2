import { akizukiHandlers } from './handlers/akizukiHandlers';
import { categoryHandlers } from './handlers/categoryHandlers';
import { makerHandlers } from './handlers/makerHandlers';
import { componentHandlers } from './handlers/componentHandlers';
import { inventoryHandlers } from './handlers/inventoryHandlers';
import { projectHandlers } from './handlers/projectHandlers';
import { projectHistoryHandlers } from './handlers/projectHistoryHandler';
import { locationHandler } from './handlers/locationHandlers';
import { storageHandlers } from './handlers/storageHandlers';

export const handlers = [
    ...akizukiHandlers,
    ...categoryHandlers,
    ...makerHandlers,
    ...componentHandlers,
    ...inventoryHandlers,
    ...projectHandlers,
    ...projectHistoryHandlers,
    ...locationHandler,
    ...storageHandlers,
];
