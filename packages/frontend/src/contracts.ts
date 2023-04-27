import * as SubnetRegistratorJSON from '@toposware/topos-smart-contracts/artifacts/contracts/topos-core/SubnetRegistrator.sol/SubnetRegistrator.json'
import * as ToposMessagingContractJSON from '@toposware/topos-smart-contracts/artifacts/contracts/topos-core/ToposMessaging.sol/ToposMessaging.json'
import { ethers } from 'ethers'

export const subnetRegistratorContract = new ethers.Contract(
  import.meta.env.VITE_SUBNET_REGISTRATOR_CONTRACT_ADDRESS || '',
  SubnetRegistratorJSON.abi
)

export const toposMessagingContract = new ethers.Contract(
  import.meta.env.VITE_TOPOS_MESSAGING_CONTRACT_ADDRESS || '',
  ToposMessagingContractJSON.abi
)
