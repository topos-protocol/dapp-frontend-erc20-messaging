import * as BurnableMintableCappedERC20JSON from '@toposware/topos-smart-contracts/artifacts/contracts/topos-core/BurnableMintableCappedERC20.sol/BurnableMintableCappedERC20.json'
import { ethers } from 'ethers'
import React from 'react'

import { Subnet, Token } from '../types'
import useEthers from './useEthers'

export default function useTokenBalance(subnet?: Subnet, token?: Token) {
  const { provider } = useEthers({
    subnet: subnet,
    viaMetaMask: true,
  })
  const [loading, setLoading] = React.useState(false)
  const [balance, setBalance] = React.useState<string>()

  const signerAddress = React.useMemo(() => {
    const signer = provider.getSigner()
    return signer.getAddress()
  }, [provider])

  const tokenContract = React.useMemo(
    () =>
      token
        ? new ethers.Contract(
            token.tokenAddress,
            BurnableMintableCappedERC20JSON.abi,
            provider
          )
        : null,
    [token, provider]
  )

  React.useEffect(
    function getTokenBalance() {
      async function _() {
        if (tokenContract) {
          const balance = await tokenContract.balanceOf(signerAddress)
          setBalance(ethers.utils.formatUnits(balance))
        }
      }

      _()
    },
    [tokenContract, signerAddress]
  )

  return { balance, loading }
}
