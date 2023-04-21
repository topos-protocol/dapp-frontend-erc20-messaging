import * as BurnableMintableCappedERC20JSON from '@toposware/topos-smart-contracts/brownie/build/contracts/BurnableMintableCappedERC20.json'
import { BigNumber, ethers } from 'ethers'
import React from 'react'

import { Token } from '../types'
import useEthers from './useEthers'

export default function useApproveAllowance() {
  const { provider } = useEthers({
    viaMetaMask: true,
  })
  const [errors, setErrors] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(false)

  const approveAllowance = React.useCallback(
    async (token: Token, amount: BigNumber) => {
      const toposCoreContractAddress = import.meta.env
        .VITE_TOPOS_CORE_CONTRACT_ADDRESS

      if (!toposCoreContractAddress) {
        setErrors((e) => [
          ...e,
          `Error when looking for the address of the Topos Core contract to approve the allowance for`,
        ])
        return
      }

      if (token && token.tokenAddress) {
        setLoading(true)

        const contract = new ethers.Contract(
          token?.tokenAddress,
          BurnableMintableCappedERC20JSON.abi,
          provider.getSigner()
        )

        const tx: ethers.ContractTransaction = await contract
          .approve(import.meta.env.VITE_TOPOS_CORE_CONTRACT_ADDRESS, amount)
          .catch((error: any) => {
            console.error(error)
            setErrors((e) => [...e, `Error when approving the allowance`])
          })

        return tx
          .wait()
          .catch((error: any) => {
            console.error(error)
            setErrors((e) => [
              ...e,
              `Error when waiting for the allowance approval tx inclusion`,
            ])
          })
          .finally(() => {
            setLoading(false)
          })
      }
    },
    [provider]
  )

  return { errors, approveAllowance, loading }
}
