export default (name, callback) => ({
    name: 'esbuild-watch-callback-plugin',
    setup: (build) => {
        build.onStart(() => {
            // eslint-disable-next-line no-console
            console.log(`[${new Date().toLocaleTimeString()}] Start build: ${name}`);
        });
        build.onEnd(async (buildResult) => {
            await callback(buildResult);
            // eslint-disable-next-line no-console
            console.log(`[${new Date().toLocaleTimeString()}] Complete build: ${name}`);
        });
    },
});
