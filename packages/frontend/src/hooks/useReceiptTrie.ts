import { Trie } from '@ethereumjs/trie'
import { RLP } from '@ethereumjs/rlp'
import { Buffer } from 'buffer'
import { Block, BrowserProvider, TransactionResponse, hexlify } from 'ethers'
import { useCallback, useState } from 'react'

import useEthers from './useEthers'

export default function useTransactionTrie() {
  const { provider } = useEthers({
    viaMetaMask: true,
  })
  const [errors, setErrors] = useState<string[]>([])

  const createReceiptTrie = useCallback(async (block: Block) => {
    const trie = new Trie()

    await Promise.all(
      block.prefetchedTransactions.map(async (tx, index) => {
        const receipt = await tx.wait()

        if (receipt) {
          const { cumulativeGasUsed, logs, logsBloom, status } = receipt

          return trie.put(
            Buffer.from(RLP.encode(index)),
            Buffer.from(
              RLP.encode([
                status,
                Number(cumulativeGasUsed),
                logsBloom,
                logs.map((l) => [l.address, l.topics as any, l.data]),
              ])
            )
          )
        }
      })
    ).catch((error) => {
      console.error(error)
      setErrors((e) => [...e, `Error when creating the transaction trie`])
    })

    return trie
  }, [])

  const createMerkleProof = useCallback(
    async (block: Block, transaction: TransactionResponse) => {
      const trie = await createReceiptTrie(block)
      let proof = ''

      const receipt = await transaction.wait()

      const rawBlock = await (provider as BrowserProvider).send(
        'eth_getBlockByHash',
        [receipt?.blockHash, true]
      )

      const trieRoot = hexlify(trie.root())

      if (trieRoot !== rawBlock.receiptsRoot) {
        const errorMessage =
          'Receipt trie root does not match with the block header'
        console.error(errorMessage)
        setErrors((e) => [...e, errorMessage])
        console.error(`local trie root`, trieRoot)
        console.error(`trie root in block header`, rawBlock.receiptsRoot)
      } else {
        if (trie) {
          try {
            const indexOfTx = block.prefetchedTransactions.findIndex(
              (tx) => tx.hash === transaction.hash
            )

            const key = Buffer.from(RLP.encode(indexOfTx))

            const { stack: _stack } = await trie.findPath(key)
            const stack = _stack.map((node) => node.raw())

            proof = hexlify(RLP.encode([1, indexOfTx, stack]))
          } catch (error) {
            console.error(error)
            setErrors((e) => [...e, `Error when creating the merkle proof`])
          }
        }
      }

      return { proof, trie }
    },
    [createReceiptTrie]
  )

  return { errors, createMerkleProof }
}
