/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
const scripts = ['vitest related --bail=1 --passWithNoTests --run', 'eslint --fix', 'prettier --write'];
export default {
    '*.ts': (filenames) => [`tsc-files --noEmit ${filenames.join(' ')}`].concat(scripts.map((item) => `${item}  ${filenames.join(' ')}`)),
    '*.js': scripts,
    '*.{css,scss}': ['stylelint --fix --allow-empty-input', 'prettier --write'],
    '*.{md,html}': 'prettier --write',
};
