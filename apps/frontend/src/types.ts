import { BigNumber, ethers } from 'ethers'

export interface Subnet {
  chainId: BigNumber
  currencySymbol: string
  endpoint: string
  logoURL: string
  name: string
  subnetId: string
}

export interface Token {
  tokenAddress: string
  symbol: string
}
