import { BurnableMintableCappedERC20__factory } from '@topos-protocol/topos-smart-contracts/typechain-types'
import { BrowserProvider, formatUnits } from 'ethers'
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

  const signerAddress = useMemo(async () => {
    const signer = await (provider as BrowserProvider).getSigner()
    return signer.getAddress()
  }, [provider])

  const tokenContract = useMemo(
    () =>
      token
        ? BurnableMintableCappedERC20__factory.connect(token.addr, provider)
        : null,
    [token, provider]
  )

  useEffect(
    function getTokenBalance() {
      async function _() {
        if (tokenContract) {
          const balance = await tokenContract.balanceOf(signerAddress)
          setBalance(formatUnits(balance))
        }
      }

      _()
    },
    [tokenContract, signerAddress]
  )

  return { balance, loading }
}
