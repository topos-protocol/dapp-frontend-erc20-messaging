import { ethers } from 'ethers'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { ErrorsContext } from '../contexts/errors'
import { erc20MessagingContract } from '../contracts'
import { Subnet, Token } from '../types'
import useEthers from './useEthers'

export default function useRegisteredTokens(subnet?: Subnet) {
  const { provider } = useEthers({
    subnet,
  })
  const { setErrors } = useContext(ErrorsContext)
  const [loading, setLoading] = useState(false)
  const [tokens, setTokens] = useState<Token[]>()

  const contract = useMemo(
    () => (subnet ? erc20MessagingContract.connect(provider) : undefined),
    [subnet, provider]
  )

  const getRegisteredTokens = useCallback(async () => {
    if (contract) {
      setLoading(true)

      const registeredTokensCount = await contract
        .getTokenCount()
        .then((count: ethers.BigNumber) => count.toNumber())
        .catch((error: any) => {
          console.error(error)
          setErrors((e) => [
            ...e,
            `Error when fetching the count of registered token.`,
          ])
        })

      if (registeredTokensCount !== undefined) {
        const promises = []
        let i = 0
        while (i < registeredTokensCount) {
          const tokenKey = await contract
            .getTokenKeyAtIndex(i)
            .catch((error: any) => {
              console.error(error)
              setErrors((e) => [
                ...e,
                `Error fetching the id of the registered token at index ${i}.`,
              ])
            })

          if (tokenKey !== undefined) {
            promises.push(
              contract.tokens(tokenKey).catch((error: any) => {
                console.error(error)
                setErrors((e) => [
                  ...e,
                  `Error fetching registered token with key ${tokenKey}.`,
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
  }, [contract])

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
      if (contract && getRegisteredTokens) {
        contract.on('TokenDeployed', getRegisteredTokens)
      }

      return function cleanup() {
        if (contract && getRegisteredTokens) {
          contract.removeListener('TokenDeployed', getRegisteredTokens)
        }
      }
    },
    [contract, getRegisteredTokens]
  )

  return { loading, tokens }
}
