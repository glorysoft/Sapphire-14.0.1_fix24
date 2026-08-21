export function replaceVars(cmd, vars) {
    let out = cmd;
    for (const [key, value] of Object.entries(vars)) {
        out = out.replaceAll(key, value);
    }
    return out;
}
