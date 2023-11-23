import { act, renderHook } from '@testing-library/react'
import { BigNumber, ethers } from 'ethers'
import { vi } from 'vitest'

import * as subnetsContextExports from '../contexts/subnets'
import * as contractsExports from '../contracts'
import { FetchData, SubnetWithId, Token } from '../types'
import useCheckTokenOnReceivingSubnet from './useCheckTokenOnReceivingSubnet'
import React from 'react'

const tokenMock: Token = {
  addr: 'address',
  symbol: 'TST',
}

const subnetsMock: SubnetWithId[] = [
  {
    chainId: BigNumber.from(1),
    currencySymbol: '',
    id: 'id',
    endpointHttp: 'http://endpoint',
    endpointWs: 'ws://endpoint',
    logoURL: '',
    name: '',
  },
]

vi.spyOn(subnetsContextExports, 'SubnetsContext', 'get').mockReturnValue(
  React.createContext<FetchData<SubnetWithId[]>>({ data: subnetsMock })
)

const getCodeMock = vi.fn().mockResolvedValue('code')

const providerSpy = vi
  .spyOn(ethers.providers, 'WebSocketProvider')
  .mockReturnValue({ getCode: getCodeMock } as any)

const getTokenBySymbolMock = vi.fn().mockResolvedValue(tokenMock)

const contractConnectMock = vi.fn().mockReturnValue({
  getTokenBySymbol: getTokenBySymbolMock,
})

const contractMock = {
  address: 'address',
  connect: contractConnectMock,
}

const contractSpy = vi
  .spyOn(contractsExports, 'erc20MessagingContract', 'get')
  .mockReturnValue(contractMock as any)

describe('useCheckTokenOnReceivingSubnet', () => {
  it("should call connected contract's getTokenByAddress public method", () => {
    const { result } = renderHook(() => useCheckTokenOnReceivingSubnet())
    expect(result.current.loading).toBe(false)

    act(() => {
      result.current
        .checkTokenOnSubnet(tokenMock, subnetsMock[0].id)
        .then(() => {
          expect(result.current.loading).toBe(true)
          expect(providerSpy).toHaveBeenCalledWith(subnetsMock[0].endpointWs)

          expect(contractSpy).toHaveBeenCalled()
          expect(getCodeMock).toHaveBeenCalledWith(contractMock.address)
          expect(contractConnectMock).toHaveBeenCalled()
          expect(getTokenBySymbolMock).toHaveBeenCalledWith(tokenMock.symbol)
        })
    })
  })
})
