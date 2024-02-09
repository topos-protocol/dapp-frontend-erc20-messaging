export interface Subnet {
  chainId: bigint
  currencySymbol: string
  endpointHttp: string
  endpointWs: string
  logoURL: string
  name: string
}

export interface SubnetWithId extends Subnet {
  id: string
}

export interface Token {
  addr: string
  symbol: string
}

export interface FetchData<T> {
  data?: T
  error?: Error
  loading?: boolean
}

export enum ExecuteProcessorError {
  PROVIDER_INVALID_ENDPOINT = 'PROVIDER_INVALID_ENDPOINT',
  CONTRACT_INVALID_ADDRESS = 'CONTRACT_INVALID_ADDRESS',
  CONTRACT_INVALID_NO_CODE = 'CONTRACT_INVALID_NO_CODE',
  WALLET_INVALID_PRIVATE_KEY = 'WALLET_INVALID_PRIVATE_KEY',
  CERTIFICATE_NOT_FOUND = 'CERTIFICATE_NOT_FOUND',
  EXECUTE_TRANSACTION_FAILED_INIT = 'EXECUTE_TRANSACTION_FAILED_INIT',
  EXECUTE_TRANSACTION_REVERT = 'EXECUTE_TRANSACTION_REVERT',
}

export interface ExecuteError {
  type: ExecuteProcessorError
  message: string
}

export interface ExecuteTransactionError {
  decoded?: boolean
  data: string
}
