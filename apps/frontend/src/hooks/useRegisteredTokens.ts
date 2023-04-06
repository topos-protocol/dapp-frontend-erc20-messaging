import { ethers } from 'ethers'
import React from 'react'

import { toposCoreContract } from '../contracts'
import { Subnet, Token } from '../types'
import useEthers from './useEthers'

export default function useRegisteredTokens(subnet?: Subnet) {
  const { provider } = useEthers({
    subnet,
    viaMetaMask: true,
  })
  const [errors, setErrors] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(false)
  const [tokens, setTokens] = React.useState<Token[]>()

  const contract = toposCoreContract.connect(provider)

  const getRegisteredTokens = React.useCallback(async () => {
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
      const promises: Promise<Token>[] = []
      let i = 0
      while (i < registeredTokensCount) {
        const tokenKey: ethers.BytesLike = await contract
          .getTokenKeyAtIndex(i)
          .catch((error: any) => {
            console.error(error)
            setErrors((e) => [
              ...e,
              `Error fetching the id of the registered token at index ${i}.`,
            ])
          })

        promises.push(
          contract.tokens(tokenKey).catch((error: any) => {
            console.error(error)
            setErrors((e) => [
              ...e,
              `Error fetching registered token with key ${tokenKey}.`,
            ])
          })
        )
        i++
      }

      const tokens = await Promise.all(promises)
      setTokens(tokens.filter((t) => t !== undefined))
    }

    setLoading(false)
  }, [])

  React.useEffect(
    function init() {
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

  return { errors, getRegisteredTokens, loading, tokens }
}
