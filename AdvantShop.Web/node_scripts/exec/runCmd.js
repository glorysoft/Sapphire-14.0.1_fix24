import { exec } from 'node:child_process';

export function runCmd(command) {
    return new Promise((resolve, reject) => {
        console.log('▶', command);

        exec(command, { windowsHide: true }, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}
