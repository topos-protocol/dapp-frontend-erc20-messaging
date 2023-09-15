import { BigNumber, ContractReceipt, ContractTransaction } from 'ethers'
import { useCallback, useMemo, useState } from 'react'

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
  const [loading, setLoading] = useState(false)

  const contract = useMemo(
    () => erc20MessagingContract.connect(provider.getSigner()),
    [provider]
  )

  const sendToken = useCallback(
    (
      receivingSubnetId: string,
      tokenAddress: string,
      recipientAddress: string,
      amount: BigNumber
    ) =>
      new Promise<Data>((resolve, reject) => {
        setLoading(true)

        contract
          .sendToken(
            receivingSubnetId,
            tokenAddress,
            recipientAddress,
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
