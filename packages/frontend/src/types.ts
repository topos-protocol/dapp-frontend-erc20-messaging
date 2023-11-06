import { BigNumber } from 'ethers'

export interface Subnet {
  chainId: BigNumber
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
