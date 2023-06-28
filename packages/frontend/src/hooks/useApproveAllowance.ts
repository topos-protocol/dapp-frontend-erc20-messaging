import * as BurnableMintableCappedERC20JSON from '@topos-protocol/topos-smart-contracts/artifacts/contracts/topos-core/BurnableMintableCappedERC20.sol/BurnableMintableCappedERC20.json'
import { BigNumber, ContractTransaction, ethers } from 'ethers'
import React from 'react'

import { Token } from '../types'
import useEthers from './useEthers'

export default function useApproveAllowance() {
  const { provider } = useEthers({
    viaMetaMask: true,
  })
  const [loading, setLoading] = React.useState(false)

  const approveAllowance = React.useCallback(
    (token: Token, amount: BigNumber) =>
      new Promise((resolve, reject) => {
        const erc20MessagingContractAddress = import.meta.env
          .VITE_ERC20_MESSAGING_CONTRACT_ADDRESS

        if (!erc20MessagingContractAddress) {
          reject(
            `Error when looking for the address of the ERC20Messaging contract to approve the allowance for!`
          )
        }

        if (token && token.addr) {
          setLoading(true)

          const contract = new ethers.Contract(
            token?.addr,
            BurnableMintableCappedERC20JSON.abi,
            provider.getSigner()
          )

          contract
            .approve(erc20MessagingContractAddress, amount)
            .then((tx: ContractTransaction) => {
              tx.wait()
                .then((receipt) => {
                  resolve(receipt)
                })
                .catch((error: any) => {
                  console.error(error)
                  reject(
                    `Error when waiting for the allowance approval tx inclusion!`
                  )
                })
            })
            .catch((error: any) => {
              console.error(error)
              reject(`Error when sending the allowance approval transaction!`)
            })
            .finally(() => {
              setLoading(false)
            })
        }
      }),
    [provider]
  )

  return { approveAllowance, loading }
}
