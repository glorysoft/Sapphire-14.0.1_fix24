import fs from 'node:fs';
import path from 'path';
import { getDirname } from '../../../../../node_scripts/shopPath.js';

export default fs.readFileSync(path.join(getDirname(import.meta.url), '../../templates/spinbox.html')).toString();
