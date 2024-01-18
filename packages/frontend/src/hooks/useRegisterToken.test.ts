import { renderHook } from '@testing-library/react'
import * as typechainExports from '@topos-protocol/topos-smart-contracts/typechain-types'
import { AbiCoder, parseUnits } from 'ethers'
import { vi } from 'vitest'

import useRegisterToken from './useRegisterToken'

const deployTokenMock = vi
  .fn()
  .mockResolvedValue({ wait: vi.fn().mockResolvedValue({}) })

const contractConnectMock = vi.fn().mockReturnValue({
  deployToken: deployTokenMock,
})

vi.spyOn(typechainExports, 'ERC20Messaging__factory', 'get').mockReturnValue({
  connect: contractConnectMock,
} as any)

vi.mock('./useEthers', () => ({
  default: vi.fn().mockReturnValue({ provider: { getSigner: vi.fn() } }),
}))

describe('useRegisterToken', () => {
  it('should return registerToken callback', () => {
    const { result } = renderHook(() => useRegisterToken())
    expect(result.current.loading).toBe(false)
    expect(result.current.registerToken).toBeTruthy()
  })
})

describe('registerToken', () => {
  it('should register token', () => {
    const { result } = renderHook(() => useRegisterToken())

    const cap = 1_000_000
    const dailyMintLimit = 10_000
    const name = 'token'
    const symbol = 'TST'
    const supply = 1_000

    const params = AbiCoder.defaultAbiCoder().encode(
      ['string', 'string', 'uint256', 'uint256', 'uint256'],
      [
        name,
        symbol,
        parseUnits(cap.toString()),
        parseUnits(dailyMintLimit.toString()),
        parseUnits(supply.toString()),
      ]
    )

    result.current
      .registerToken({
        cap,
        dailyMintLimit,
        name,
        symbol,
        supply,
      })
      .then(() => {
        expect(deployTokenMock).toHaveBeenCalledWith(params, {
          gasLimit: 5_000_000,
        })
      })
      .finally(() => {
        expect(result.current.loading).toBe(false)
      })
  })
})
