import { BigNumber, ethers } from 'ethers'
import React from 'react'

import { Values } from '../components/RegisterToken'
import { ErrorsContext } from '../contexts/errors'
import { toposMessagingContract } from '../contracts'
import { Subnet } from '../types'
import useEthers from './useEthers'

export default function useRegisterToken(subnet?: Subnet) {
  const { provider } = useEthers({
    subnet,
    viaMetaMask: true,
  })
  const { setErrors } = React.useContext(ErrorsContext)
  const [loading, setLoading] = React.useState(false)

  const contract = toposMessagingContract.connect(provider)

  const mint = React.useCallback(
    async (symbol: string, amount: BigNumber, successCallback: () => void) => {
      const tx = await contract.giveToken(
        symbol,
        await provider.getSigner().getAddress(),
        amount,
        { gasLimit: 4_000_000 }
      )

      return tx
        .wait()
        .then(successCallback)
        .catch((error: Error) => {
          console.error(error)
          setErrors((e) => [...e, `Error when minting token`])
        })
    },
    [contract, provider]
  )

  const registerToken = React.useCallback(
    async (
      {
        address = '0x0000000000000000000000000000000000000000',
        cap,
        dailyMintLimit,
        name,
        symbol,
      }: Values,
      registrationSuccessCallback: () => void,
      mintSuccessCallback: () => void
    ) => {
      setLoading(true)

      const params = ethers.utils.defaultAbiCoder.encode(
        ['string', 'string', 'uint256', 'address', 'uint256'],
        [
          name,
          symbol,
          ethers.utils.parseUnits(cap.toString()),
          address,
          ethers.utils.parseUnits(dailyMintLimit.toString()),
        ]
      )

      const tx = await contract.deployToken(params)

      return tx
        .wait()
        .then(async () => {
          registrationSuccessCallback()
          await mint(
            symbol,
            ethers.utils.parseUnits('1000'),
            mintSuccessCallback
          )
        })
        .catch((error: Error) => {
          console.error(error)
          setErrors((e) => [...e, `Error when registering the token`])
        })
        .finally(() => {
          setLoading(false)
        })
    },
    [contract, mint]
  )

  return { loading, registerToken }
}
