import { ContractTransaction, ethers } from 'ethers'
import React from 'react'

import { Values } from '../components/RegisterToken'
import { ErrorsContext } from '../contexts/errors'
import { erc20MessagingContract } from '../contracts'
import useEthers from './useEthers'

export const zeroAddress = '0x0000000000000000000000000000000000000000'

export default function useRegisterToken() {
  const { provider } = useEthers({
    viaMetaMask: true,
  })
  const { setErrors } = React.useContext(ErrorsContext)
  const [loading, setLoading] = React.useState(false)

  const contract = React.useMemo(
    () => erc20MessagingContract.connect(provider.getSigner()),
    [provider]
  )

  const registerToken = React.useCallback(
    async ({ cap, dailyMintLimit, name, symbol, supply }: Values) => {
      setLoading(true)

      const params = ethers.utils.defaultAbiCoder.encode(
        ['string', 'string', 'uint256', 'address', 'uint256', 'uint256'],
        [
          name,
          symbol,
          ethers.utils.parseUnits(cap.toString()),
          zeroAddress,
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
                setErrors((e) => [...e, `Error when registering the token`])
                reject(error)
              })
          )
          .catch((error: Error) => {
            console.error(error)
            setErrors((e) => [...e, `Error when registering the token`])
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
