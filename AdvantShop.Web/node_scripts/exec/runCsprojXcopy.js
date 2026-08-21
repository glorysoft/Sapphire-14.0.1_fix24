import path from 'path';
import { replaceVars } from './replaceVars.js';
import { runCmd } from './runCmd.js';
import fs from 'fs';

export async function runPostBuildXcopy(csprojPath) {
    const xml = fs.readFileSync(csprojPath, 'utf8');

    const match = xml.match(/<PostBuildEvent>([\s\S]*?)<\/PostBuildEvent>/);

    if (!match) {
        console.log('ℹ️ No PostBuildEvent found');
        return;
    }

    const commands = match[1]
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

    const projectDir = path.dirname(csprojPath) + path.sep;
    const solutionDir = path.resolve(path.dirname(csprojPath), '..', '..') + path.sep;
    for (const cmd of commands) {
        await runCmd(
            replaceVars(cmd, {
                '$(ProjectDir)': projectDir,
                '$(SolutionDir)': solutionDir,
            }),
        );
    }
}
