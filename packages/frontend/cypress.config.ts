import { defineConfig } from 'cypress'
const synpressPlugins = require('@synthetixio/synpress/plugins')

export default defineConfig({
  chromeWebSecurity: true,
  defaultCommandTimeout: 30000,
  e2e: {
    baseUrl: 'http://localhost:3001',
    setupNodeEvents(on, config) {
      synpressPlugins(on, config)
    },
    supportFile: 'cypress/support/e2e.ts',
    testIsolation: true,
  },
  pageLoadTimeout: 30000,
  requestTimeout: 30000,
  userAgent: 'synpress',
})
