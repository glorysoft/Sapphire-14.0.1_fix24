import chokidar from 'chokidar';
import path from 'path';
import { BLACK_LIST_DIR, BLACK_LIST_EXT } from './constantsModules.js';
import { runPostBuildXcopy } from '../../../exec/runCsprojXcopy.js';
import fs from 'fs';

const PROJECT_ROOT = path.resolve(process.cwd(), '..');

const isValidPath = (filePath) =>
    !BLACK_LIST_DIR.some((dir) => filePath.includes(path.sep + dir + path.sep)) && !BLACK_LIST_EXT.some((ext) => filePath.endsWith(ext));

const mapToBuilded = (moduleSource, moduleBuild, filePath) => filePath.replace(moduleSource, moduleBuild);
const formatingPath = (filePath) => filePath.replace(PROJECT_ROOT, '');

async function initialSync(moduleSource, ctx) {
    console.log('🔁 Initial sync started...');

    const moduleSourceCsproj = path.resolve(moduleSource, `${moduleSource.split(path.sep).at(-1)  }.csproj`);
    if (!moduleSourceCsproj) {
        throw new Error('Module source csproj does not exist.');
    }
    await runPostBuildXcopy(moduleSourceCsproj);
    await ctx.rebuild();

    console.log('✅ Initial sync completed');
}
const errCallback = (err) => {
    if (!err) return;
    console.error(err);
};

async function syncFile(moduleSource, moduleBuild, filePath) {
    const target = mapToBuilded(moduleSource, moduleBuild, filePath);

    await fs.mkdir(path.dirname(target), { recursive: true }, errCallback);
    await fs.cp(filePath, target, { recursive: true }, errCallback);

    console.log('✔ synced:', formatingPath(filePath), '→', formatingPath(target));
}

async function removeFile(moduleSource, moduleBuild, filePath) {
    const target = mapToBuilded(moduleSource, moduleBuild, filePath);

    await fs.rm(target, { recursive: true, force: true }, errCallback);

    console.log('✖ removed:', formatingPath(filePath));
}

export async function watchModule(ctx, value) {
    const moduleSource = value.sourceModulePath;
    const moduleBuild = value.buildModulePath;

    if (!moduleSource) {
        throw new Error(`Cannot watch module '${moduleBuild}'`);
    }

    await initialSync(moduleSource, ctx);

    const rebuild = async () => {
        try {
            await ctx.rebuild();
        } catch (e) {
            console.error(e);
        }
    };
    chokidar
        .watch(moduleSource, {
            ignoreInitial: true,
            ignored: (pathFile, stats) => stats?.isFile() && !isValidPath(pathFile.replaceAll('/', path.sep)),
        })
        .on('add', async (file) => {
            await syncFile(moduleSource, moduleBuild, file);
            await rebuild();
        })
        .on('ready', () => {
            console.log(`Watch directory: ${  moduleSource}`);
        })
        .on('change', async (file) => {
            await syncFile(moduleSource, moduleBuild, file);
            await rebuild();
        })
        .on('unlink', async (file) => {
            await removeFile(moduleSource, moduleBuild, file);
            await rebuild();
        });
}
