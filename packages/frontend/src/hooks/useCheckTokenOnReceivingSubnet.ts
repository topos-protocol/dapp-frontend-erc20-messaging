import { ethers } from 'ethers'
import React from 'react'

import { ErrorsContext } from '../contexts/errors'
import { RegisteredSubnetsContext } from '../contexts/registeredSubnets'
import { toposMessagingContract } from '../contracts'
import { Token } from '../types'

export default function useCheckTokenOnSubnet() {
  const { setErrors } = React.useContext(ErrorsContext)
  const { data: registeredSubnets } = React.useContext(RegisteredSubnetsContext)
  const [loading, setLoading] = React.useState(false)

  const checkTokenOnSubnet = React.useCallback(
    async (token?: Token, subnetId?: string) => {
      setLoading(true)

      const subnet = registeredSubnets?.find((s) => s.subnetId === subnetId)

      const subnetProvider = new ethers.providers.JsonRpcProvider(
        subnet?.endpoint
      )

      if (subnet && token) {
        if (
          (await subnetProvider.getCode(toposMessagingContract.address)) ===
          '0x'
        ) {
          setLoading(false)
          return Promise.reject(
            `ToposCore contract could not be found on ${subnet.name}!`
          )
        } else {
          const contract = toposMessagingContract.connect(subnetProvider)

          const onChainToken = await contract
            .getTokenBySymbol(token.symbol)
            .finally(() => {
              setLoading(false)
            })

          if (!onChainToken.symbol) {
            setLoading(false)
            return Promise.reject(
              `${token.symbol} is not registered on ${subnet.name}!`
            )
          }
        }
      }

      setLoading(false)
    },
    [registeredSubnets]
  )

  return { checkTokenOnSubnet, loading }
}
