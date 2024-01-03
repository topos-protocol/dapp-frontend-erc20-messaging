import { renderHook, waitFor } from '@testing-library/react'
import * as typechainExports from '@topos-protocol/topos-smart-contracts/typechain-types'
import { vi } from 'vitest'

import useRegisteredSubnets from './useRegisteredSubnets'
import { Subnet } from '../types'

const registeredSubnets: { [x: string]: Subnet } = {
  subnet1: {
    chainId: BigInt(1),
    currencySymbol: 'TST',
    endpointHttp: '',
    endpointWs: '',
    logoURL: '',
    name: 'subnetMock',
  },
  subnet2: {
    chainId: BigInt(2),
    currencySymbol: 'TST2',
    endpointHttp: '',
    endpointWs: '',
    logoURL: '',
    name: 'subnetMock',
  },
  incal: {
    chainId: BigInt(2),
    currencySymbol: 'TST2',
    endpointHttp: '',
    endpointWs: '',
    logoURL: '',
    name: 'Incal',
  },
}

const subnetIdsByIndexes = ['subnet1', 'subnet2']

const expectedSubnets = subnetIdsByIndexes.map((id) => ({
  ...registeredSubnets[id],
  id,
}))

const getSubnetCountMock = vi
  .fn()
  .mockResolvedValue(BigInt(subnetIdsByIndexes.length))

const getSubnetIdAtIndexMock = vi
  .fn()
  .mockImplementation((index: number) =>
    Promise.resolve(subnetIdsByIndexes[index])
  )

const subnetsMock = vi
  .fn()
  .mockImplementation((subnetId: string) =>
    Promise.resolve(registeredSubnets[subnetId])
  )

const contractConnectMock = vi.fn().mockReturnValue({
  getSubnetCount: getSubnetCountMock,
  getSubnetIdAtIndex: getSubnetIdAtIndexMock,
  subnets: subnetsMock,
})

vi.spyOn(typechainExports, 'SubnetRegistrator__factory', 'get').mockReturnValue(
  { connect: contractConnectMock } as any
)

vi.mock('./useEthers', () => ({
  default: vi.fn().mockReturnValue({ provider: {} }),
}))

describe('useRegisteredSubnets', () => {
  it('should return registered subnets', async () => {
    const { result } = renderHook(() => useRegisteredSubnets())

    expect(result.current.loading).toBe(true)
    expect(result.current.registeredSubnets).toBeUndefined()

    expect(getSubnetCountMock).toHaveBeenCalled()

    await waitFor(() => {
      expect(getSubnetIdAtIndexMock).toHaveBeenCalled()
    })

    expect(getSubnetIdAtIndexMock).toHaveBeenCalledWith(0)
    expect(getSubnetIdAtIndexMock).toHaveBeenCalledWith(1)
    expect(subnetsMock).toHaveBeenCalledWith('subnet1')
    expect(subnetsMock).toHaveBeenCalledWith('subnet2')
    expect(result.current.loading).toBe(false)
    expect(result.current.registeredSubnets).toStrictEqual(
      expectedSubnets.filter((s) => s.name === 'Incal')
    )
  })
})
