import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    assetsInclude: ['**/*.html'],
    test: {
        globals: true,
        environment: 'happy-dom',
        setupFiles: './vitest.setup.ts',
    },
    plugins: [tsconfigPaths()],
});
