import { act, renderHook } from '@testing-library/react'
import * as typechainExports from '@topos-protocol/topos-smart-contracts/typechain-types'
import { vi } from 'vitest'

import useSendToken from './useSendToken'

const sendTokenMock = vi
  .fn()
  .mockResolvedValue({ wait: vi.fn().mockResolvedValue({}) })

const contractConnectMock = vi.fn().mockReturnValue({
  sendToken: sendTokenMock,
})

vi.spyOn(typechainExports, 'ERC20Messaging__factory', 'get').mockReturnValue({
  connect: contractConnectMock,
} as any)

vi.mock('./useEthers', () => ({
  default: vi.fn().mockReturnValue({ provider: { getSigner: vi.fn() } }),
}))

describe('useSendToken', () => {
  it('should return sendToken callback', () => {
    const { result } = renderHook(() => useSendToken())
    expect(result.current.loading).toBe(false)
    expect(result.current.sendToken).toBeTruthy()
  })
})

describe('sendToken', () => {
  it('should send token', async () => {
    const { result } = renderHook(() => useSendToken())

    const receivingSubnetId = 'receiving'
    const tokenSymbol = 'tokenSymbol'
    const recipientAddress = 'receivingAddr'
    const amount = BigInt(1)

    await act(() => {
      result.current
        .sendToken(receivingSubnetId, tokenSymbol, recipientAddress, amount)
        .then(() => {
          expect(result.current.loading).toBe(true)
          expect(sendTokenMock).toHaveBeenCalledWith(
            receivingSubnetId,
            tokenSymbol,
            recipientAddress,
            amount,
            { gasLimit: 4_000_000 }
          )
        })
    })

    expect(result.current.loading).toBe(false)
  })
})
