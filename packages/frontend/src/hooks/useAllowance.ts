import { BurnableMintableCappedERC20__factory } from '@topos-protocol/topos-smart-contracts/typechain-types'
import { useCallback, useMemo, useState } from 'react'

import { Token } from '../types'
import useEthers from './useEthers'
import { BrowserProvider } from 'ethers'

export default function useAllowance() {
  const { provider } = useEthers({
    viaMetaMask: true,
  })

  const [loading, setLoading] = useState(false)

  const approveAllowance = useCallback(
    (token: Token, amount: bigint) =>
      new Promise(async (resolve, reject) => {
        const erc20MessagingContractAddress = import.meta.env
          .VITE_ERC20_MESSAGING_CONTRACT_ADDRESS

        if (!erc20MessagingContractAddress) {
          reject(
            `Error when looking for the address of the ERC20Messaging contract to approve the allowance for!`
          )
        }

        if (token && token.addr) {
          setLoading(true)

          const signer = await (provider as BrowserProvider).getSigner()

          const burnableMintableCappedERC20 =
            BurnableMintableCappedERC20__factory.connect(token.addr, signer)

          burnableMintableCappedERC20
            .approve(erc20MessagingContractAddress, amount)
            .then((tx) => {
              tx.wait()
                .then((receipt) => {
                  resolve(receipt)
                })
                .catch((error: any) => {
                  console.error(error)
                  reject(
                    `Error when waiting for the allowance approval tx inclusion!`
                  )
                })
            })
            .catch((error: any) => {
              console.error(error)
              reject(`Error when sending the allowance approval transaction!`)
            })
            .finally(() => {
              setLoading(false)
            })
        }
      }),
    [provider]
  )
  const getCurrentAllowance = useCallback(
    (token: Token) =>
      new Promise<bigint>(async (resolve, reject) => {
        const erc20MessagingContractAddress = import.meta.env
          .VITE_ERC20_MESSAGING_CONTRACT_ADDRESS

        if (!erc20MessagingContractAddress) {
          reject(
            `Error when looking for the address of the ERC20Messaging contract to approve the allowance for!`
          )
        }

        if (token && token.addr) {
          setLoading(true)

          const burnableMintableCappedERC20 =
            BurnableMintableCappedERC20__factory.connect(token.addr, provider)

          burnableMintableCappedERC20
            .allowance(
              (await (provider as BrowserProvider).getSigner()).getAddress(),
              erc20MessagingContractAddress
            )
            .then((allowance) => {
              resolve(allowance)
            })
            .catch((error: any) => {
              console.error(error)
              reject(`Error when getting the current sender allowance!`)
            })
            .finally(() => {
              setLoading(false)
            })
        }
      }),
    [provider]
  )

  return { approveAllowance, getCurrentAllowance, loading }
}
