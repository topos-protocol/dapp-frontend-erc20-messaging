import { ethers } from 'ethers'
import { useCallback, useContext, useState } from 'react'

import { ErrorsContext } from '../contexts/errors'
import { SubnetsContext } from '../contexts/subnets'
import { erc20MessagingContract } from '../contracts'
import { Token } from '../types'
import { sanitizeURLProtocol } from '../utils'

export default function useCheckTokenOnSubnet() {
  const { setErrors } = useContext(ErrorsContext)
  const { data: subnets } = useContext(SubnetsContext)
  const [loading, setLoading] = useState(false)

  const checkTokenOnSubnet = useCallback(
    (token?: Token, subnetId?: string) =>
      new Promise<void>(async (resolve, reject) => {
        setLoading(true)

        const subnet = subnets?.find((s) => s.id === subnetId)

        const subnetProvider = subnet?.endpoint
          ? new ethers.providers.WebSocketProvider(
              sanitizeURLProtocol('ws', `${subnet?.endpoint}/ws`)
            )
          : null

        if (subnet && subnetProvider && token) {
          if (
            (await subnetProvider.getCode(erc20MessagingContract.address)) ===
            '0x'
          ) {
            setLoading(false)
            return Promise.reject(
              `ToposCore contract could not be found on ${subnet.name}!`
            )
          } else {
            const contract = erc20MessagingContract.connect(subnetProvider)

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
