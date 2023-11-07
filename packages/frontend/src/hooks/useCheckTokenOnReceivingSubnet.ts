import { providers } from 'ethers'
import { useCallback, useContext, useState } from 'react'

import { SubnetsContext } from '../contexts/subnets'
import { erc20MessagingContract } from '../contracts'
import { Token } from '../types'

export default function useCheckTokenOnSubnet() {
  const { data: subnets } = useContext(SubnetsContext)
  const [loading, setLoading] = useState(false)

  const checkTokenOnSubnet = useCallback(
    (token?: Token, subnetId?: string) =>
      new Promise<void>(async (resolve, reject) => {
        setLoading(true)

        const subnet = subnets?.find((s) => s.id === subnetId)

        if (subnet && token) {
          const endpoint = subnet?.endpointWs || subnet?.endpointHttp
          const url = new URL(endpoint)
          const subnetProvider = url.protocol.startsWith('ws')
            ? new providers.WebSocketProvider(endpoint)
            : new providers.JsonRpcProvider(endpoint)

          if (subnetProvider) {
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
        }

        setLoading(false)
        resolve()
      }),
    [subnets]
  )

  return { checkTokenOnSubnet, loading }
}
