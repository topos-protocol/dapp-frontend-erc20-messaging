import { Trie } from '@ethereumjs/trie'
import { RLP } from '@ethereumjs/rlp'
import { BlockWithTransactions } from '@ethersproject/abstract-provider'
import { Buffer } from 'buffer'
import { ethers } from 'ethers'
import React from 'react'
import useEthers from './useEthers'

export default function useTransactionTrie() {
  const { provider } = useEthers({
    viaMetaMask: true,
  })
  const [errors, setErrors] = React.useState<string[]>([])

  const createTransactionTrie = React.useCallback(
    async (block: BlockWithTransactions) => {
      const trie = new Trie()

      await Promise.all(
        block.transactions.map((tx, index) => {
          const { nonce, gasPrice, gasLimit, to, value, data, v, r, s } = tx
          return trie.put(
            Buffer.from(RLP.encode(index)),
            Buffer.from(
              RLP.encode([
                nonce,
                gasPrice?.toNumber(),
                gasLimit.toNumber(),
                to,
                value.toNumber(),
                data,
                v,
                r,
                s,
              ])
            )
          )
        })
      ).catch((error) => {
        console.error(error)
        setErrors((e) => [...e, `Error when creating the transaction trie`])
      })

      return trie
    },
    []
  )

  const createMerkleProof = React.useCallback(
    async (block: BlockWithTransactions, transaction: ethers.Transaction) => {
      const trie = await createTransactionTrie(block)
      let proof = ''

      const rawBlock = await provider.send('eth_getBlockByHash', [
        ethers.utils.hexValue(block.hash),
        true,
      ])

      const trieRoot = ethers.utils.hexlify(trie.root())
      console.log(trieRoot)
      if (trieRoot !== rawBlock.transactionsRoot) {
        console.error(
          `Transaction trie root is not matching with the block header`
        )
        console.error(`local trie root`, trieRoot)
        console.error(`trie root in block header`, rawBlock.transactionsRoot)
      }

      if (trie) {
        try {
          const indexOfTx = block.transactions.findIndex(
            (tx) => tx.hash === transaction.hash
          )

          const key = Buffer.from(RLP.encode(indexOfTx))

          const { stack: _stack } = await trie.findPath(key)
          const stack = _stack.map((node) => node.raw())

          proof = ethers.utils.hexlify(RLP.encode([1, indexOfTx, stack]))
        } catch (error) {
          console.error(error)
          setErrors((e) => [...e, `Error when creating the merkle proof`])
        }
      }

      return { proof, trie }
    },
    [createTransactionTrie]
  )

  return { errors, createMerkleProof }
}
