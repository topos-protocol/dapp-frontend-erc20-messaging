import { act, renderHook } from '@testing-library/react'
import { vi } from 'vitest'

import * as useEthersExports from './useEthers'
import useReceiptTrie from './useReceiptTrie'
import { Block } from 'ethers'

// Taken from a local subnet
const receiptMock = {
  to: '0xd8A6034001862c42982b0f3F9E3dB7a104420646',
  from: '0x4AAb25B4fAd0Beaac466050f3A7142A502f4Cf0a',
  contractAddress: null,
  transactionIndex: 0,
  root: '0x0000000000000000000000000000000000000000000000000000000000000000',
  gasUsed: BigInt('0xeec7'),
  logsBloom:
    '0x00000000000000000000000000000001000000000400000000000020080000001000080000000000000000000000000000000000000000000000000000200000800080000000000000000008400000000000000000000000000000000000000000000000020000000001000000000800000200000000000000000010000000000000000000000000000000000080100000000020000080000000000000000000020000000000001000001000000020000000100000000000000000000000000000000002000000000000000040000000000000000000000000000000002028000010000000000000000000000000000000000000020000000000000008000000',
  blockHash:
    '0xfcbd59ae7bc294511e06f8b43503d0743bf3bcac5faf2707ba2a1d6e40a8bd99',
  transactionHash:
    '0xc5ff2012213c9d99671d2477bb386ec5e72f28e5b59a26d58301cb93dabfbb66',
  logs: [
    {
      transactionIndex: 0,
      blockNumber: 1148,
      transactionHash:
        '0xc5ff2012213c9d99671d2477bb386ec5e72f28e5b59a26d58301cb93dabfbb66',
      address: '0x3add941f2DA6bA73dBA5C70cF433bbC1C1DF39ad',
      topics: [
        '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
        '0x0000000000000000000000004aab25b4fad0beaac466050f3a7142a502f4cf0a',
        '0x000000000000000000000000d8a6034001862c42982b0f3f9e3db7a104420646',
      ],
      data: '0x00000000000000000000000000000000000000000000000053444835ec580000',
      logIndex: 0,
      blockHash:
        '0xfcbd59ae7bc294511e06f8b43503d0743bf3bcac5faf2707ba2a1d6e40a8bd99',
    },
    {
      transactionIndex: 1,
      blockNumber: 1148,
      transactionHash:
        '0xc5ff2012213c9d99671d2477bb386ec5e72f28e5b59a26d58301cb93dabfbb66',
      address: '0x3add941f2DA6bA73dBA5C70cF433bbC1C1DF39ad',
      topics: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x0000000000000000000000004aab25b4fad0beaac466050f3a7142a502f4cf0a',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      ],
      data: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
      logIndex: 1,
      blockHash:
        '0xfcbd59ae7bc294511e06f8b43503d0743bf3bcac5faf2707ba2a1d6e40a8bd99',
    },
    {
      transactionIndex: 2,
      blockNumber: 1148,
      transactionHash:
        '0xc5ff2012213c9d99671d2477bb386ec5e72f28e5b59a26d58301cb93dabfbb66',
      address: '0xd8A6034001862c42982b0f3F9E3dB7a104420646',
      topics: [
        '0x920718295e8e03a7fda1fe1d8d41ba008f378b1d679ea1a5f70eca3a389a2578',
        '0xff63b98e7d02220e3cca1d3c37d28db75b18bae171fb03fd8e280cd634f4030f',
      ],
      data: '0x0000000000000000000000003add941f2da6ba73dba5c70cf433bbc1c1df39ad0000000000000000000000004aab25b4fad0beaac466050f3a7142a502f4cf0a0000000000000000000000000000000000000000000000000de0b6b3a7640000',
      logIndex: 2,
      blockHash:
        '0xfcbd59ae7bc294511e06f8b43503d0743bf3bcac5faf2707ba2a1d6e40a8bd99',
    },
    {
      transactionIndex: 3,
      blockNumber: 1148,
      transactionHash:
        '0xc5ff2012213c9d99671d2477bb386ec5e72f28e5b59a26d58301cb93dabfbb66',
      address: '0x56f1D12755d4E4B8092F126FBf09EC11be64A624',
      topics: [
        '0xf27439dc0ef741d8be6e7efbd4f85c0995f73cc11fc82ad08ede2b7bf735a640',
        '0xff63b98e7d02220e3cca1d3c37d28db75b18bae171fb03fd8e280cd634f4030f',
      ],
      data: '0x',
      logIndex: 3,
      blockHash:
        '0xfcbd59ae7bc294511e06f8b43503d0743bf3bcac5faf2707ba2a1d6e40a8bd99',
    },
  ],
  blockNumber: 1148,
  confirmations: 7,
  cumulativeGasUsed: BigInt('0xeec7'),
  status: 1,
  type: 0,
  byzantium: true,
  events: [
    {
      transactionIndex: 0,
      blockNumber: 1148,
      transactionHash:
        '0xc5ff2012213c9d99671d2477bb386ec5e72f28e5b59a26d58301cb93dabfbb66',
      address: '0x3add941f2DA6bA73dBA5C70cF433bbC1C1DF39ad',
      topics: [
        '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
        '0x0000000000000000000000004aab25b4fad0beaac466050f3a7142a502f4cf0a',
        '0x000000000000000000000000d8a6034001862c42982b0f3f9e3db7a104420646',
      ],
      data: '0x00000000000000000000000000000000000000000000000053444835ec580000',
      logIndex: 0,
      blockHash:
        '0xfcbd59ae7bc294511e06f8b43503d0743bf3bcac5faf2707ba2a1d6e40a8bd99',
    },
    {
      transactionIndex: 1,
      blockNumber: 1148,
      transactionHash:
        '0xc5ff2012213c9d99671d2477bb386ec5e72f28e5b59a26d58301cb93dabfbb66',
      address: '0x3add941f2DA6bA73dBA5C70cF433bbC1C1DF39ad',
      topics: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x0000000000000000000000004aab25b4fad0beaac466050f3a7142a502f4cf0a',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      ],
      data: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
      logIndex: 1,
      blockHash:
        '0xfcbd59ae7bc294511e06f8b43503d0743bf3bcac5faf2707ba2a1d6e40a8bd99',
    },
    {
      transactionIndex: 2,
      blockNumber: 1148,
      transactionHash:
        '0xc5ff2012213c9d99671d2477bb386ec5e72f28e5b59a26d58301cb93dabfbb66',
      address: '0xd8A6034001862c42982b0f3F9E3dB7a104420646',
      topics: [
        '0x920718295e8e03a7fda1fe1d8d41ba008f378b1d679ea1a5f70eca3a389a2578',
        '0xff63b98e7d02220e3cca1d3c37d28db75b18bae171fb03fd8e280cd634f4030f',
      ],
      data: '0x0000000000000000000000003add941f2da6ba73dba5c70cf433bbc1c1df39ad0000000000000000000000004aab25b4fad0beaac466050f3a7142a502f4cf0a0000000000000000000000000000000000000000000000000de0b6b3a7640000',
      logIndex: 2,
      blockHash:
        '0xfcbd59ae7bc294511e06f8b43503d0743bf3bcac5faf2707ba2a1d6e40a8bd99',
      args: [
        '0xff63b98e7d02220e3cca1d3c37d28db75b18bae171fb03fd8e280cd634f4030f',
        '0x3add941f2DA6bA73dBA5C70cF433bbC1C1DF39ad',
        '0x4AAb25B4fAd0Beaac466050f3A7142A502f4Cf0a',
        BigInt('0x0de0b6b3a7640000'),
      ],
      event: 'TokenSent',
      eventSignature: 'TokenSent(bytes32,address,address,uint256)',
    },
    {
      transactionIndex: 3,
      blockNumber: 1148,
      transactionHash:
        '0xc5ff2012213c9d99671d2477bb386ec5e72f28e5b59a26d58301cb93dabfbb66',
      address: '0x56f1D12755d4E4B8092F126FBf09EC11be64A624',
      topics: [
        '0xf27439dc0ef741d8be6e7efbd4f85c0995f73cc11fc82ad08ede2b7bf735a640',
        '0xff63b98e7d02220e3cca1d3c37d28db75b18bae171fb03fd8e280cd634f4030f',
      ],
      data: '0x',
      logIndex: 3,
      blockHash:
        '0xfcbd59ae7bc294511e06f8b43503d0743bf3bcac5faf2707ba2a1d6e40a8bd99',
    },
  ],
}

const blockWithTransactionsMock = {
  hash: '0xfcbd59ae7bc294511e06f8b43503d0743bf3bcac5faf2707ba2a1d6e40a8bd99',
  parentHash:
    '0x91ef3cbd4e41043bc59929e5bdc49d76a23c9461f0f51ac14caec0597236ba7a',
  number: 1148,
  timestamp: 1693209380,
  nonce: '0x0000000000000000',
  difficulty: 1148,
  gasLimit: BigInt('0x989680'),
  gasUsed: BigInt('0xeec7'),
  miner: '0x0000000000000000000000000000000000000000',
  extraData:
    '0x0000000000000000000000000000000000000000000000000000000000000000f90239f90120f846943e8eec8c2c7e0bdf4c84ec81dc84393b59d6fab7b0a15ca1ed6f1a54e2c2e7c17a3a79a2410b583d6d0feb9611f2aa3f23d9ac7c92bf8e1176b0abd1226ebb5422d8381b43f84694bc41222403d787b568daa4b7008330d905310224b080e9c2d9d46921725ad4c4751c9f84c0e56d32c59caeeb3623b910f3ba02c428833d1ece9f879d3e9c27a7e5262901c1f846949f7fcfafd01ab7d12c24fe637ec86d1f1d278d96b0a28573fa4eedbaab32906923fc243205bedfb775463e2b30aa8a394c3f502a48fdfbd78e67534f5661ff109c9a267af5f84694425824b54e3a69f866e001f6c97e67f5063b35aab0acc44552254e317711bef743022e7458c434006f67b18402e0f59d6044ef716e967039fbc1ea38161263ec923a79ac02b8419df1edd4a995a4040e0d71304f2bfc45bc48775fa982ab84609e4cdc6d9eb9b974cdca2ab34ac789be33a28ff63ef2048292c70eb29bdae010638ca0843f16a900f8630db86096ab3f355eee0fb58d3ee9989d1e9569db9536a5a98324332349afcc7b1469a6987f8a8aa7ebf001a0c17d7bc498313109f86acc81411010900813c11cb655e033657c639065c660602541d40163935baddc4a0bc42d8a3159dd23b1bff9f0fef8630bb8608a6533aa1538ec3fee846b7a6b2c0c450267597bdc44db3f01a1999956e3895483b8a326d44462514d443eec21d7bc000866822a96b5ba7a3de7a6e7bf8822bf866ee41905b9178843c1e1bc7ae2c935a6a09291b7242c664627efd747d8b71a880000000000000000',
  prefetchedTransactions: [
    {
      hash: '0xc5ff2012213c9d99671d2477bb386ec5e72f28e5b59a26d58301cb93dabfbb66',
      type: 0,
      accessList: null as any,
      blockHash:
        '0xfcbd59ae7bc294511e06f8b43503d0743bf3bcac5faf2707ba2a1d6e40a8bd99',
      blockNumber: 1148,
      transactionIndex: 0,
      confirmations: 7,
      from: '0x4AAb25B4fAd0Beaac466050f3A7142A502f4Cf0a',
      gasPrice: BigInt('0x00'),
      gasLimit: BigInt('0x3d0900'),
      to: '0xd8A6034001862c42982b0f3F9E3dB7a104420646',
      value: BigInt('0x00'),
      nonce: 9,
      data: '0x5c914ec6ff63b98e7d02220e3cca1d3c37d28db75b18bae171fb03fd8e280cd634f4030f0000000000000000000000003add941f2da6ba73dba5c70cf433bbc1c1df39ad0000000000000000000000004aab25b4fad0beaac466050f3a7142a502f4cf0a0000000000000000000000000000000000000000000000000de0b6b3a7640000',
      r: '0x6e2b73aa905e903861ebcbdf5d74accf20e2e890c31d26cd0a562515b5eff750',
      s: '0x40a1faa3a657a3db670a6d31c0362de85a69a207363aa8b22cffc4329808d583',
      v: 4752,
      creates: null,
      chainId: 2358,
      wait: vi.fn().mockResolvedValue(receiptMock),
    },
  ],
  _difficulty: BigInt('0x047c'),
} as unknown as Block

vi.mock('./useEthers', () => ({
  default: vi.fn().mockReturnValue({
    provider: {
      getSigner: vi.fn(),
      send: vi.fn().mockResolvedValue({
        receiptsRoot:
          '0x7cb6f851cd992acf30fa8fddf704f3829923c5a86d61acea1d7f58124fa4b443',
      }),
    },
  }),
}))

describe('useReceiptTrie', () => {
  it('should return createMerkleProof callback', () => {
    const { result } = renderHook(() => useReceiptTrie())
    expect(result.current.createMerkleProof).toBeDefined()
  })
})

describe('createMerkleProof', () => {
  it('should return valid trie and proof', async () => {
    const { result } = renderHook(() => useReceiptTrie())

    const { proof } = await result.current.createMerkleProof(
      blockWithTransactionsMock,
      blockWithTransactionsMock.prefetchedTransactions[0]
    )

    expect(result.current.errors.length).toBe(0)
    expect(proof).toBeTruthy()
  })

  it("should return error if receipt trie roots don't match", async () => {
    vi.spyOn(useEthersExports, 'default').mockReturnValue({
      provider: {
        getSigner: vi.fn(),
        send: vi.fn().mockResolvedValue({
          receiptsRoot:
            // Changed last character to fake unmatching roots
            '0x7cb6f851cd992acf30fa8fddf704f3829923c5a86d61acea1d7f58124fa4b444',
        }),
      },
    } as any)

    const { result } = renderHook(() => useReceiptTrie())

    await act(async () => {
      const { proof } = await result.current.createMerkleProof(
        blockWithTransactionsMock,
        blockWithTransactionsMock.prefetchedTransactions[0]
      )

      expect(proof).toBe('')
    })

    expect(result.current.errors.length).toBe(1)
    expect(result.current.errors[0]).toBe(
      'Receipt trie root does not match with the block header'
    )
  })
})
