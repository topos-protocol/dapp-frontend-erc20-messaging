import { act, renderHook } from '@testing-library/react'
import * as BurnableMintableCappedERC20JSON from '@topos-protocol/topos-smart-contracts/artifacts/contracts/topos-core/BurnableMintableCappedERC20.sol/BurnableMintableCappedERC20.json'
import { ethers } from 'ethers'
import { vi } from 'vitest'

import { Token } from '../types'
import useApproveAllowance from './useAllowance'

const tokenMock: Token = {
  addr: 'address',
  symbol: 'TST',
}

const txMock = {
  wait: vi.fn().mockResolvedValue({}),
}

const amountMock = ethers.BigNumber.from(1)
const approveMock = vi.fn().mockResolvedValue(txMock)
const allowanceMock = vi.fn().mockResolvedValue(1)

const contractSpy = vi
  .spyOn(ethers, 'Contract')
  .mockReturnValue({ allowance: allowanceMock, approve: approveMock } as any)

vi.mock('./useEthers', () => ({
  default: vi.fn().mockReturnValue({
    provider: {
      getSigner: vi.fn().mockReturnValue({
        getAddress: vi.fn().mockReturnValue('addr'),
      }),
    },
  }),
}))

describe('useApproveAllowance', () => {
  describe('approveAllowance', () => {
    it("should call instantiated contract's approve public method", () => {
      const { result } = renderHook(() => useApproveAllowance())
      expect(result.current.loading).toBe(false)

      act(() => {
        result.current.approveAllowance(tokenMock, amountMock).then(() => {
          expect(result.current.loading).toBe(true)
          expect(contractSpy).toHaveBeenCalledWith(
            tokenMock.addr,
            BurnableMintableCappedERC20JSON.abi,
            expect.anything()
          )

          expect(approveMock).toHaveBeenCalledWith(
            import.meta.env.VITE_ERC20_MESSAGING_CONTRACT_ADDRESS,
            amountMock
          )
        })
      })
    })
  })

  describe('getCurrentAllowance', () => {
    it("should call instantiated contract's allowance public method", () => {
      const { result } = renderHook(() => useApproveAllowance())
      expect(result.current.loading).toBe(false)

      act(() => {
        result.current
          .getCurrentAllowance(tokenMock)
          .then((currentAllowance) => {
            expect(result.current.loading).toBe(true)
            expect(contractSpy).toHaveBeenCalledWith(
              tokenMock.addr,
              BurnableMintableCappedERC20JSON.abi,
              expect.anything()
            )

            expect(allowanceMock).toHaveBeenCalledWith(
              'addr',
              import.meta.env.VITE_ERC20_MESSAGING_CONTRACT_ADDRESS
            )

            expect(currentAllowance).toBe(1)
          })
      })
    })
  })
})
