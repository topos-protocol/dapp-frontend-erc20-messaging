import { act, renderHook } from '@testing-library/react'
import { BigNumber } from 'ethers'
import { vi } from 'vitest'

import * as useEthersExports from './useEthers'
import useTransactionTrie from './useTransactionTrie'
import { RLP } from '@ethereumjs/rlp'

// Taken from a local subnet
const blockWithTransactionsMock = {
  hash: '0x928f6050b963f564c300c238f123b27523cd709ba4c7942f7397d194376c767d',
  parentHash:
    '0x20574309c08faf64cdf7ff08c5bec851a48c73d8af4bcbcf2ed700a4a19a5b81',
  number: 384,
  timestamp: 1690961574,
  nonce: '0x0000000000000000',
  difficulty: 384,
  gasLimit: BigNumber.from('0x989680'),
  gasUsed: BigNumber.from('0xabb1'),
  miner: '0x0000000000000000000000000000000000000000',
  extraData:
    '0x0000000000000000000000000000000000000000000000000000000000000000f90239f90120f84694bf993cf1088d0f6ce842515c8dba95fe8909b48db0a3732129cde191b0b2e597af213f4a092d540e5c0f915f71e639d4385adb8a104e60ddccc8e44e756ca606cfc4a2a427f84694684df871e884d62949d7823e50292e28ef428717b0ade2097520e46f3b99efc4ffb30704261751c14b7f864317bcc0258caf2ca45e59fc1c2e961df22c5e198183e6a4e7c4f846948a43a14e6b146029cc70c72520230822f9226bcbb0927ad70fe1ebf80af6ed2e61a2a068ade871f766157b8616adc9d9dc3f0206a5d8a7989fd1e5409eb800b3d846198917f846940c439ffb0a2f40f8512e102eced2b1769f770f2fb0aef8af9b92c69c891f402701761ef80ecb1421672db6f36534e206afa7989012170ef63d2ba712469996d54f3d762b25b84165b7cd7f500af19630c946d6f8c8bd61a27ef808de111bb655e5a8af3c2ad68c4a4b794e0d7e33d2de2de8a1ed6d8c58f8f7d3e77e9659d09c92b88295cdfadb01f8630bb860ad8e250a4102a8d22f6ba4e42fba778223bd89d0fc22c2de6466b25109992f6cefe18153d0c9beb54500ca08444af0300cba36443a03a9a16452979d915f4de5ee8300a11f31950ebce2013804d60379a72c4fb5661b7953a77518c804aa22a0f8630eb86098f148247a8aae09102cd2a03797cc58ec5dd349ca81301fc23c3ce1848c3dd8162607e9d725255ac993d6aada6deaeb158f184e45b479a333fd26644b39915b98c9481df579a923789036b8e98b95a17216c43f744c6ac250ef926ba37f7d7c880000000000000000',
  transactions: [
    {
      hash: '0x414d2d918f3c03e490bb43fdb25a8ac73f4383fdcabb77132fd9fea7ea5e35ad',
      type: 0,
      accessList: null as any,
      blockHash:
        '0x928f6050b963f564c300c238f123b27523cd709ba4c7942f7397d194376c767d',
      blockNumber: 384,
      transactionIndex: 0,
      confirmations: 1,
      from: '0x4AAb25B4fAd0Beaac466050f3A7142A502f4Cf0a',
      gasPrice: BigNumber.from('0x00'),
      gasLimit: BigNumber.from('0x3d0900'),
      to: '0x3B5aCC9B6e58543512828EFAe26B29B7292c8273',
      value: BigNumber.from('0x00'),
      nonce: 11,
      data: '0x5c914ec6bdd7addd5138f2e4ea0003be21a0d6bbd374407b87e5aa971135593cbf99eeb70000000000000000000000004aab25b4fad0beaac466050f3a7142a502f4cf0a000000000000000000000000eaf8162fe52092d442f214650b624a1b4485a9a60000000000000000000000000000000000000000000000000de0b6b3a7640000',
      r: '0x8c8e613e94747487f73896474b30e11c70c400e44eadf47b462fd67f5c3217c4',
      s: '0x5ba305b050a271151dbfa92c6454bfa68b4d52a69c6894fe8681d285472c69ab',
      v: 4751,
      creates: null,
      chainId: 2358,
      wait: vi.fn(),
    },
  ],
  _difficulty: BigNumber.from('0x0180'),
}

const transactionMock = {
  hash: '0x414d2d918f3c03e490bb43fdb25a8ac73f4383fdcabb77132fd9fea7ea5e35ad',
  type: 0,
  accessList: null as any,
  blockHash: null,
  blockNumber: null,
  transactionIndex: null,
  confirmations: 0,
  from: '0x4AAb25B4fAd0Beaac466050f3A7142A502f4Cf0a',
  gasPrice: BigNumber.from('0x00'),
  gasLimit: BigNumber.from('0x3d0900'),
  to: '0x3B5aCC9B6e58543512828EFAe26B29B7292c8273',
  value: BigNumber.from('0x00'),
  nonce: 11,
  data: '0x5c914ec6bdd7addd5138f2e4ea0003be21a0d6bbd374407b87e5aa971135593cbf99eeb70000000000000000000000004aab25b4fad0beaac466050f3a7142a502f4cf0a000000000000000000000000eaf8162fe52092d442f214650b624a1b4485a9a60000000000000000000000000000000000000000000000000de0b6b3a7640000',
  r: '0x8c8e613e94747487f73896474b30e11c70c400e44eadf47b462fd67f5c3217c4',
  s: '0x5ba305b050a271151dbfa92c6454bfa68b4d52a69c6894fe8681d285472c69ab',
  v: 4751,
  creates: null,
  chainId: 2358,
}

vi.mock('./useEthers', () => ({
  default: vi.fn().mockReturnValue({
    provider: {
      getSigner: vi.fn(),
      send: vi.fn().mockResolvedValue({
        transactionsRoot:
          '0x413d29317b5ffe2c6c123ec0359d456a238ecf5e8fee48d263faf3c3c98034d7',
      }),
    },
  }),
}))

describe('useTransactionTrie', () => {
  it('should return createMerkleProof callback', () => {
    const { result } = renderHook(() => useTransactionTrie())
    expect(result.current.createMerkleProof).toBeDefined()
  })
})

describe('createMerkleProof', () => {
  it('should return valid trie and proof', async () => {
    const { result } = renderHook(() => useTransactionTrie())

    const { proof, trie } = await result.current.createMerkleProof(
      blockWithTransactionsMock,
      transactionMock
    )

    expect(result.current.errors.length).toBe(0)
    expect(proof).toBeTruthy()
  })

  it("should return error if transaction trie roots don't match", async () => {
    vi.spyOn(useEthersExports, 'default').mockReturnValue({
      provider: {
        getSigner: vi.fn(),
        send: vi.fn().mockResolvedValue({
          transactionsRoot:
            // Changed last character to fake unmatching roots
            '0x413d29317b5ffe2c6c123ec0359d456a238ecf5e8fee48d263faf3c3c98034d8',
        }),
      },
    } as any)

    const { result } = renderHook(() => useTransactionTrie())

    await act(async () => {
      const { proof, trie } = await result.current.createMerkleProof(
        blockWithTransactionsMock,
        transactionMock
      )

      expect(proof).toBeUndefined()
    })

    expect(result.current.errors.length).toBe(1)
    expect(result.current.errors[0]).toBe(
      'Error when recomputing the transaction trie'
    )
  })
})
