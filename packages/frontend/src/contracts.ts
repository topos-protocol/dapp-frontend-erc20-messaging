import * as SubnetRegistratorJSON from '@topos-protocol/topos-smart-contracts/artifacts/contracts/topos-core/SubnetRegistrator.sol/SubnetRegistrator.json'
import * as ERC20MessagingJSON from '@topos-protocol/topos-smart-contracts/artifacts/contracts/examples/ERC20Messaging.sol/ERC20Messaging.json'
import * as ToposCoreJSON from '@topos-protocol/topos-smart-contracts/artifacts/contracts/topos-core/ToposCore.sol/ToposCore.json'
import {
  SubnetRegistrator,
  ToposCore,
} from '@topos-protocol/topos-smart-contracts/typechain-types/contracts/topos-core'
import { ERC20Messaging } from '@topos-protocol/topos-smart-contracts/typechain-types/contracts/examples'
import { ethers } from 'ethers'

export const subnetRegistratorContract = new ethers.Contract(
  import.meta.env.VITE_SUBNET_REGISTRATOR_CONTRACT_ADDRESS || '',
  SubnetRegistratorJSON.abi
) as SubnetRegistrator

export const toposCoreContract = new ethers.Contract(
  import.meta.env.VITE_TOPOS_CORE_CONTRACT_ADDRESS || '',
  ToposCoreJSON.abi
) as ToposCore

export const erc20MessagingContract = new ethers.Contract(
  import.meta.env.VITE_ERC20_MESSAGING_CONTRACT_ADDRESS || '',
  ERC20MessagingJSON.abi
) as ERC20Messaging
