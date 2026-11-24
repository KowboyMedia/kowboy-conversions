// The tests run in the installed Chrome: locally Google Chrome, on GitHub's runners the same.
const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({ testDir: 'test', use: { channel: 'chrome' } });
