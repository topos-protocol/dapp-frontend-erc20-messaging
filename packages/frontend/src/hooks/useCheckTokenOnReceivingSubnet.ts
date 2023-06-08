import { ethers } from 'ethers'
import React from 'react'

import { ErrorsContext } from '../contexts/errors'
import { SubnetsContext } from '../contexts/subnets'
import { toposMessagingContract } from '../contracts'
import { Token } from '../types'

export default function useCheckTokenOnSubnet() {
  const { setErrors } = React.useContext(ErrorsContext)
  const { data: subnets } = React.useContext(SubnetsContext)
  const [loading, setLoading] = React.useState(false)

  const checkTokenOnSubnet = React.useCallback(
    (token?: Token, subnetId?: string) =>
      new Promise<void>(async (resolve, reject) => {
        setLoading(true)

        const subnet = subnets?.find((s) => s.id === subnetId)

        const subnetProvider = subnet?.endpoint
          ? new ethers.providers.WebSocketProvider(
              `ws://${subnet?.endpoint}/ws`
            )
          : null

        if (subnet && subnetProvider && token) {
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
              .getTokenByAddress(token.addr)
              .finally(() => {
                setLoading(false)
              })

            if (!onChainToken.symbol) {
              setLoading(false)
              reject(`${token.symbol} is not registered on ${subnet.name}!`)
            }
          }
        }

        setLoading(false)
        resolve()
      }),
    [subnets]
  )

  return { checkTokenOnSubnet, loading }
}
