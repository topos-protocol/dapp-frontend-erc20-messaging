import { SignatureLike } from '@ethersproject/bytes'
import { ethers, Transaction } from 'ethers'

export function shortenAddress(
  address: string,
  prefixSuffixLength: number = 5
) {
  return `${address.slice(0, prefixSuffixLength)}...${address.slice(
    address.length - prefixSuffixLength
  )}`
}

export function getRawTransaction(tx: Transaction) {
  function addKey(accum: any, key: keyof Transaction) {
    if (tx[key]) {
      accum[key] = tx[key]
    }
    return accum
  }

  // Extract the relevant parts of the transaction and signature
  const txFields =
    'accessList chainId data gasPrice gasLimit maxFeePerGas maxPriorityFeePerGas nonce to type value'.split(
      ' '
    ) as Array<keyof Transaction>
  const sigFields = 'v r s'.split(' ') as Array<keyof SignatureLike>

  // Seriailze the signed transaction
  const raw = ethers.utils.serializeTransaction(
    txFields.reduce(addKey, {} as unknown as Transaction),
    sigFields.reduce(addKey, {} as unknown as SignatureLike)
  )

  // Double check things went well
  if (ethers.utils.keccak256(raw) !== tx.hash) {
    throw new Error('serializing failed!')
  }

  return raw
}
