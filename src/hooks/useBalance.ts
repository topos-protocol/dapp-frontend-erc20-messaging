import BN from 'bn.js'
import { useMetaMask } from 'metamask-react'
import React from 'react'

export default function useBalance(account: string) {
  const { ethereum } = useMetaMask()
  const [balance, setBalance] = React.useState<string>()

  React.useEffect(() => {
    async function getBalance() {
      if (ethereum) {
        const balance: string = await ethereum.request({
          method: 'eth_getBalance',
          params: [account],
        })

        const humanBalance = new BN(balance.substring(2), 'hex').toString()
        setBalance(humanBalance)
      }
    }

    getBalance()
  }, [ethereum])

  return balance
}
