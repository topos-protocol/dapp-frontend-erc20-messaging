import { Observable } from 'rxjs'

const defaultApi = {
  accounts: { all: new Observable(), create: () => ({ json: '' }) },
  config: { appName: '', endpoint: '', loadAccountsFromExtension: false },
  create: jest.fn(),
  createApi: jest.fn(),
  explorer: { recentBlock: new Observable() },
  generic: {
    getMapEntries: () => new Observable(),
  },
  loadApi: jest.fn(),
}

export const apiWithAccountsFromExtension = {
  ...defaultApi,
  config: { ...defaultApi.config, loadAccountsFromExtension: true },
}

export default defaultApi
