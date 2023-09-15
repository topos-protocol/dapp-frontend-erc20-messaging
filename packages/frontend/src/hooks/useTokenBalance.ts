import * as BurnableMintableCappedERC20JSON from '@topos-protocol/topos-smart-contracts/artifacts/contracts/topos-core/BurnableMintableCappedERC20.sol/BurnableMintableCappedERC20.json'
import { ethers } from 'ethers'
import { useEffect, useMemo, useState } from 'react'

import { Subnet, Token } from '../types'
import useEthers from './useEthers'

export default function useTokenBalance(subnet?: Subnet, token?: Token) {
  const { provider } = useEthers({
    subnet: subnet,
    viaMetaMask: true,
  })
  const [loading, setLoading] = useState(false)
  const [balance, setBalance] = useState<string>()

  const signerAddress = useMemo(() => {
    const signer = provider.getSigner()
    return signer.getAddress()
  }, [provider])

  const tokenContract = useMemo(
    () =>
      token
        ? new ethers.Contract(
            token.addr,
            BurnableMintableCappedERC20JSON.abi,
            provider
          )
        : null,
    [token, provider]
  )

  useEffect(
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
