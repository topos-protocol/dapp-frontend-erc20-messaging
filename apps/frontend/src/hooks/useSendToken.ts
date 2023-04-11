import { BigNumber, ethers } from 'ethers'
import React from 'react'

import { toposCoreContract } from '../contracts'
import { Subnet, Token } from '../types'
import useEthers from './useEthers'

export default function useSendToken() {
  const { provider } = useEthers({
    viaMetaMask: true,
  })
  const [errors, setErrors] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(false)

  const contract = toposCoreContract.connect(provider.getSigner())

  const sendToken = React.useCallback(
    async (
      receivingSubnetId: string,
      recipientAddress: string,
      tokenSymbol: string,
      amount: BigNumber
    ) => {
      setLoading(true)

      const sendTokenTx: ethers.ContractTransaction = await contract
        .sendToken(receivingSubnetId, recipientAddress, tokenSymbol, amount, {
          gasLimit: 4_000_000,
        })
        .catch((error: any) => {
          console.error(error)
          setErrors((e) => [...e, `Error when sending token`])
        })

      const sendTokenReceipt = await sendTokenTx
        .wait()
        .catch((error: any) => {
          console.error(error)
          setErrors((e) => [
            ...e,
            `Error when waiting for token sending tx inclusion`,
          ])
        })
        .finally(() => {
          setLoading(false)
        })

      return { sendTokenTx, sendTokenReceipt }
    },
    [contract, provider]
  )

  return { errors, loading, sendToken }
}
