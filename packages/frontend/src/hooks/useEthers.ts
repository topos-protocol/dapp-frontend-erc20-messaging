import { BrowserProvider, getDefaultProvider } from 'ethers'
import { useEffect, useMemo } from 'react'
import { useMetaMask } from 'metamask-react'

import { Subnet } from '../types'

interface Args {
  subnet?: Subnet
  viaMetaMask?: boolean
}

export default function useEthers({ subnet, viaMetaMask }: Args = {}) {
  const { account, addChain, connect, ethereum, status, switchChain } =
    useMetaMask()

  const provider = useMemo(() => {
    if (viaMetaMask && ethereum) {
      return new BrowserProvider(ethereum)
    }

    if (!subnet) {
      const toposSubnetEndpointWs = import.meta.env
        .VITE_TOPOS_SUBNET_ENDPOINT_WS
      return getDefaultProvider(toposSubnetEndpointWs)
    }

    const endpoint = subnet.endpointWs || subnet.endpointHttp
    return getDefaultProvider(endpoint)
  }, [subnet, viaMetaMask, ethereum])

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
