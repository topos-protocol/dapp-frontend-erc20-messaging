import { ERC20Messaging__factory } from '@topos-protocol/topos-smart-contracts/typechain-types'
import {
  BrowserProvider,
  ContractTransactionReceipt,
  ContractTransactionResponse,
} from 'ethers'
import { useCallback, useState } from 'react'

import useEthers from './useEthers'

export interface SendTokenOutput {
  sendTokenTx: ContractTransactionResponse
  sendTokenReceipt: ContractTransactionReceipt | null
}

export default function useSendToken() {
  const { provider } = useEthers({
    viaMetaMask: true,
  })
  const [loading, setLoading] = useState(false)

  const sendToken = useCallback(
    async (
      receivingSubnetId: string,
      tokenSymbol: string,
      recipientAddress: string,
      amount: bigint
    ) => {
      setLoading(true)

      const signer = await (provider as BrowserProvider).getSigner()

      const erc20Messaging = ERC20Messaging__factory.connect(
        import.meta.env.VITE_ERC20_MESSAGING_CONTRACT_ADDRESS,
        signer
      )

      return new Promise<SendTokenOutput>((resolve, reject) => {
        erc20Messaging
          .sendToken(receivingSubnetId, tokenSymbol, recipientAddress, amount, {
            gasLimit: 4_000_000,
          })
          .then((tx) => {
            tx.wait()
              .then((receipt) => {
                resolve({ sendTokenTx: tx, sendTokenReceipt: receipt })
              })
              .catch((error: any) => {
                console.error(error)
                reject(
                  `Error when waiting for sendToken transaction inclusion!`
                )
              })
          })
          .catch((error: any) => {
            console.error(error)
            reject(`Error when sending sendToken transaction!`)
          })
          .finally(() => {
            setLoading(false)
          })
      })
    },
    [provider]
  )

  return { loading, sendToken }
}
