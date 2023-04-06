import * as SubnetRegistratorJSON from '@toposware/topos-smart-contracts/brownie/build/contracts/SubnetRegistrator.json';
import * as ToposCoreContractJSON from '@toposware/topos-smart-contracts/brownie/build/contracts/ToposCore.json';
import { ethers } from 'ethers';

export const subnetRegistratorContract = new ethers.Contract(
  import.meta.env.VITE_SUBNET_REGISTRATOR_CONTRACT_ADDRESS || '',
  SubnetRegistratorJSON.abi
);

export const toposCoreContract = new ethers.Contract(
  import.meta.env.VITE_TOPOS_CORE_CONTRACT_ADDRESS || '',
  ToposCoreContractJSON.abi
);
