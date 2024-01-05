import { ERC20Messaging__factory } from '@topos-protocol/topos-smart-contracts/typechain-types'
import { getDefaultProvider } from 'ethers'
import { useCallback, useContext, useState } from 'react'

import { SubnetsContext } from '../contexts/subnets'
import { Token } from '../types'

const erc20MessagingContractAddress = import.meta.env
  .VITE_ERC20_MESSAGING_CONTRACT_ADDRESS

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
          const subnetProvider = getDefaultProvider(endpoint)

          if (subnetProvider) {
            if (
              (await subnetProvider.getCode(erc20MessagingContractAddress)) ===
              '0x'
            ) {
              setLoading(false)
              return Promise.reject(
                `ToposCore contract could not be found on ${subnet.name}!`
              )
            } else {
              const contract = ERC20Messaging__factory.connect(
                erc20MessagingContractAddress,
                subnetProvider
              )

              const onChainToken = await contract
                .getTokenBySymbol(token.symbol)
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
