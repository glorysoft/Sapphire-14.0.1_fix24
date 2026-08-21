import fs from 'node:fs';
import path from 'path';
import { getDirname } from '../../../../node_scripts/shopPath.js';

export const getModalTemplate = () =>
    fs
        .readFileSync(
            path.join(
                getDirname(import.meta.url),
                '../templates/modal.html',
            ),
        )
        .toString();
