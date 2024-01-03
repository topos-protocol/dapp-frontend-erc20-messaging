import { ERC20Messaging__factory } from '@topos-protocol/topos-smart-contracts/typechain-types'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { ErrorsContext } from '../contexts/errors'
import { Subnet, Token } from '../types'
import useEthers from './useEthers'

export default function useRegisteredTokens(subnet?: Subnet) {
  const { provider } = useEthers({
    subnet,
  })
  const { setErrors } = useContext(ErrorsContext)
  const [loading, setLoading] = useState(false)
  const [tokens, setTokens] = useState<Token[]>()

  const erc20Messaging = useMemo(
    () =>
      subnet
        ? ERC20Messaging__factory.connect(
            import.meta.env.VITE_ERC20_MESSAGING_CONTRACT_ADDRESS,
            provider
          )
        : undefined,
    [subnet, provider]
  )

  const getRegisteredTokens = useCallback(async () => {
    if (erc20Messaging) {
      setLoading(true)

      const registeredTokensCount = await erc20Messaging
        .getTokenCount()
        .then((count) => Number(count))
        .catch((error: any) => {
          console.error(error)
          setErrors((e) => [
            ...e,
            { message: `Error when fetching the count of registered token.` },
          ])
        })

      if (registeredTokensCount !== undefined) {
        const promises = []
        let i = 0
        while (i < registeredTokensCount) {
          const tokenKey = await erc20Messaging
            .getTokenKeyAtIndex(i)
            .catch((error: any) => {
              console.error(error)
              setErrors((e) => [
                ...e,
                {
                  message: `Error fetching the id of the registered token at index ${i}.`,
                },
              ])
            })

          if (tokenKey !== undefined) {
            promises.push(
              erc20Messaging.tokens(tokenKey).catch((error: any) => {
                console.error(error)
                setErrors((e) => [
                  ...e,
                  {
                    message: `Error fetching registered token with key ${tokenKey}.`,
                  },
                ])
              })
            )
          }
          i++
        }

        const tokens = await Promise.allSettled(promises).then((values) =>
          values
            .filter((v) => v.status === 'fulfilled')
            .map((v) => (v.status === 'fulfilled' ? v.value : undefined))
            .filter((v) => v)
        )
        setTokens(tokens as Token[])
      }

      setLoading(false)
    }
  }, [erc20Messaging])

  useEffect(
    function onSubnetChange() {
      if (subnet) {
        getRegisteredTokens()
      }
    },
    [subnet]
  )

  useEffect(
    function watchTokenDeployed() {
      if (erc20Messaging && getRegisteredTokens) {
        erc20Messaging.on(
          erc20Messaging.filters.TokenDeployed,
          getRegisteredTokens
        )
      }

      return function cleanup() {
        if (erc20Messaging && getRegisteredTokens) {
          erc20Messaging.removeListener(
            erc20Messaging.filters.TokenDeployed,
            getRegisteredTokens
          )
        }
      }
    },
    [erc20Messaging, getRegisteredTokens]
  )

  return { loading, tokens }
}
