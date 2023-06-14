import { BigNumber, ContractReceipt, ContractTransaction } from 'ethers'
import React from 'react'

import { erc20MessagingContract } from '../contracts'
import useEthers from './useEthers'

interface Data {
  sendTokenTx: ContractTransaction
  sendTokenReceipt: ContractReceipt
}

export default function useSendToken() {
  const { provider } = useEthers({
    viaMetaMask: true,
  })
  const [loading, setLoading] = React.useState(false)

  const contract = React.useMemo(
    () => erc20MessagingContract.connect(provider.getSigner()),
    [provider]
  )

  const sendToken = React.useCallback(
    (
      receivingSubnetId: string,
      recipientAddress: string,
      tokenAddress: string,
      amount: BigNumber
    ) =>
      new Promise<Data>((resolve, reject) => {
        setLoading(true)

        contract
          .sendToken(
            receivingSubnetId,
            recipientAddress,
            tokenAddress,
            amount,
            {
              gasLimit: 4_000_000,
            }
          )
          .then((tx: ContractTransaction) => {
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
      }),
    [contract]
  )

  return { loading, sendToken }
}
