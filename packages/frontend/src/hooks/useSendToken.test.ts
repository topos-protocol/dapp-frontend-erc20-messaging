import { act, renderHook } from '@testing-library/react'
import { vi } from 'vitest'

import * as contractExports from '../contracts'
import useSendToken from './useSendToken'
import { BigNumber, ethers } from 'ethers'

const sendTokenMock = vi
  .fn()
  .mockResolvedValue({ wait: vi.fn().mockResolvedValue({}) })

const contractConnectMock = vi.fn().mockReturnValue({
  sendToken: sendTokenMock,
})

vi.spyOn(contractExports, 'erc20MessagingContract', 'get').mockReturnValue({
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
    const tokenAddress = 'tokenAddr'
    const recipientAddress = 'receivingAddr'
    const amount = BigNumber.from(1)

    await act(() => {
      result.current
        .sendToken(receivingSubnetId, tokenAddress, recipientAddress, amount)
        .then(() => {
          expect(result.current.loading).toBe(true)
          expect(sendTokenMock).toHaveBeenCalledWith(
            receivingSubnetId,
            tokenAddress,
            recipientAddress,
            amount,
            { gasLimit: 4_000_000 }
          )
        })
    })

    expect(result.current.loading).toBe(false)
  })
})
