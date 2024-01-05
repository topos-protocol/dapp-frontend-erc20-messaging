import { ERC20Messaging__factory } from '@topos-protocol/topos-smart-contracts/typechain-types'
import { AbiCoder, BrowserProvider, parseUnits } from 'ethers'
import { useCallback, useContext, useState } from 'react'

import { Values } from '../components/RegisterToken'
import { ErrorsContext } from '../contexts/errors'
import useEthers from './useEthers'

export default function useRegisterToken() {
  const { provider } = useEthers({
    viaMetaMask: true,
  })
  const { setErrors } = useContext(ErrorsContext)
  const [loading, setLoading] = useState(false)

  const registerToken = useCallback(
    async ({ cap, dailyMintLimit, name, symbol, supply }: Values) => {
      setLoading(true)

      const signer = await (provider as BrowserProvider).getSigner()

      const erc20Messaging = ERC20Messaging__factory.connect(
        import.meta.env.VITE_ERC20_MESSAGING_CONTRACT_ADDRESS,
        signer
      )

      const params = AbiCoder.defaultAbiCoder().encode(
        ['string', 'string', 'uint256', 'uint256', 'uint256'],
        [
          name,
          symbol,
          parseUnits(cap.toString()),
          parseUnits(dailyMintLimit.toString()),
          parseUnits(supply.toString()),
        ]
      )

      return new Promise((resolve, reject) => {
        erc20Messaging
          .deployToken(params)
          .then((tx) =>
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
            console.error(JSON.stringify(error))
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
    [provider]
  )

  return { loading, registerToken }
}
