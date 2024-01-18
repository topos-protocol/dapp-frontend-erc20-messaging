import { ERC20Messaging__factory } from '@topos-protocol/topos-smart-contracts/typechain-types'
import { AbiCoder, BrowserProvider, parseUnits } from 'ethers'
import { useCallback, useState } from 'react'

import { Values } from '../components/RegisterToken'
import useEthers from './useEthers'

export default function useRegisterToken() {
  const { provider } = useEthers({
    viaMetaMask: true,
  })
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

      try {
        const tx = await erc20Messaging.deployToken(params, {
          gasLimit: 5_000_000,
        })
        const receipt = await tx.wait()
        setLoading(false)
        return receipt
      } catch (error: any) {
        console.error(error)
        setLoading(false)
        throw Error(
          `Error when registering the token (reason: ${error.reason})`
        )
      }
    },
    [provider]
  )

  return { loading, registerToken }
}
