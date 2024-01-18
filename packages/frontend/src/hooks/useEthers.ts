import { BrowserProvider, getDefaultProvider } from 'ethers'
import { useContext, useEffect, useMemo } from 'react'
import { useMetaMask } from 'metamask-react'

import { Subnet } from '../types'
import { ErrorsContext } from '../contexts/errors'

interface Args {
  subnet?: Subnet
  viaMetaMask?: boolean
}

export default function useEthers({ subnet, viaMetaMask }: Args = {}) {
  const { setErrors } = useContext(ErrorsContext)
  const { account, addChain, connect, ethereum, status, switchChain } =
    useMetaMask()

  const provider = useMemo(() => {
    if (viaMetaMask && ethereum) {
      return new BrowserProvider(ethereum)
    }

    const endpoint = subnet
      ? subnet.endpointWs || subnet.endpointHttp
      : import.meta.env.VITE_TOPOS_SUBNET_ENDPOINT_WS

    return getDefaultProvider(endpoint)
  }, [subnet, viaMetaMask, ethereum])

  useEffect(
    function verifyProviderReadiness() {
      const timeoutId = window.setTimeout(() => {
        if (!viaMetaMask && !(provider as any).ready) {
          setErrors((e) => [
            ...e,
            {
              message: `Could not reach provider's endoint${
                ' (' +
                (subnet
                  ? subnet.endpointWs || subnet.endpointHttp
                  : import.meta.env.VITE_TOPOS_SUBNET_ENDPOINT_WS) +
                ')'
              }`,
            },
          ])
        }
      }, 3000)

      return function clearTimeout() {
        window.clearTimeout(timeoutId)
      }
    },
    [provider]
  )

  useEffect(
    function switchNetworkAndConnect() {
      const _ = async () => {
        if (subnet && viaMetaMask && ethereum) {
          const chainId = `0x${subnet.chainId.toString(16)}`

          if (ethereum.networkVersion !== chainId) {
            try {
              await switchChain(chainId)
            } catch (err: any) {
              // This error code indicates that the chain has not been added to MetaMask
              if (err.code === 4902) {
                await addChain({
                  chainName: subnet.name,
                  chainId,
                  nativeCurrency: {
                    name: subnet.currencySymbol,
                    symbol: subnet.currencySymbol,
                    decimals: 18,
                  },
                  rpcUrls: [subnet.endpointHttp, subnet.endpointWs],
                })
              }
            }
          }
          if (!account) {
            await connect()
          }
        }
      }

      _()
    },
    [subnet, ethereum]
  )

  return {
    status,
    provider,
  }
}
