import { ContractTransaction, ethers } from 'ethers'
import { useCallback, useContext, useMemo, useState } from 'react'

import { Values } from '../components/RegisterToken'
import { ErrorsContext } from '../contexts/errors'
import { erc20MessagingContract } from '../contracts'
import useEthers from './useEthers'

export default function useRegisterToken() {
  const { provider } = useEthers({
    viaMetaMask: true,
  })
  const { setErrors } = useContext(ErrorsContext)
  const [loading, setLoading] = useState(false)

  const contract = useMemo(
    () => erc20MessagingContract.connect(provider.getSigner()),
    [provider]
  )

  const registerToken = useCallback(
    async ({ cap, dailyMintLimit, name, symbol, supply }: Values) => {
      setLoading(true)

      const params = ethers.utils.defaultAbiCoder.encode(
        ['string', 'string', 'uint256', 'uint256', 'uint256'],
        [
          name,
          symbol,
          ethers.utils.parseUnits(cap.toString()),
          ethers.utils.parseUnits(dailyMintLimit.toString()),
          ethers.utils.parseUnits(supply.toString()),
        ]
      )

      return new Promise((resolve, reject) => {
        contract
          .deployToken(params)
          .then((tx: ContractTransaction) =>
            tx
              .wait()
              .then((receipt) => {
                resolve(receipt)
              })
              .catch((error: Error) => {
                console.error(error)
                setErrors((e) => [
                  ...e,
                  { message: `Error when registering the token` },
                ])
                reject(error)
              })
          )
          .catch((error: Error) => {
            console.error(error)
            setErrors((e) => [
              ...e,
              { message: `Error when registering the token` },
            ])
            reject(error)
          })
          .finally(() => {
            setLoading(false)
          })
      })
    },
    [contract]
  )

  return { loading, registerToken }
}
