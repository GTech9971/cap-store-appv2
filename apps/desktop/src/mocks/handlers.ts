import { akizukiHandlers } from './handlers/akizukiHandlers';
import { categoryHandlers } from './handlers/categoryHandlers';
import { makerHandlers } from './handlers/makerHandlers';
import { componentHandlers } from './handlers/componentHandlers';
import { inventoryHandlers } from './handlers/inventoryHandlers';
import { projectHandlers } from './handlers/projectHandlers';

export const handlers = [
    ...akizukiHandlers,
    ...categoryHandlers,
    ...makerHandlers,
    ...componentHandlers,
    ...inventoryHandlers,
    ...projectHandlers
];
