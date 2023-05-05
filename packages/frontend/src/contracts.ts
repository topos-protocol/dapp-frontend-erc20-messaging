import * as SubnetRegistratorJSON from '@topos-network/topos-smart-contracts/artifacts/contracts/topos-core/SubnetRegistrator.sol/SubnetRegistrator.json'
import * as ToposMessagingJSON from '@topos-network/topos-smart-contracts/artifacts/contracts/topos-core/ToposMessaging.sol/ToposMessaging.json'
import * as ToposCoreJSON from '@topos-network/topos-smart-contracts/artifacts/contracts/topos-core/ToposCore.sol/ToposCore.json'
import {
  SubnetRegistrator,
  ToposCore,
  ToposMessaging,
} from '@topos-network/topos-smart-contracts/typechain-types/contracts/topos-core'
import { ethers } from 'ethers'

export const subnetRegistratorContract = new ethers.Contract(
  import.meta.env.VITE_SUBNET_REGISTRATOR_CONTRACT_ADDRESS || '',
  SubnetRegistratorJSON.abi
) as SubnetRegistrator

export const toposCoreContract = new ethers.Contract(
  import.meta.env.VITE_TOPOS_CORE_CONTRACT_ADDRESS || '',
  ToposCoreJSON.abi
) as ToposCore

export const toposMessagingContract = new ethers.Contract(
  import.meta.env.VITE_TOPOS_MESSAGING_CONTRACT_ADDRESS || '',
  ToposMessagingJSON.abi
) as ToposMessaging
