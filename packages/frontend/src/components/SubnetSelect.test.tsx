import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import SubnetSelect from './SubnetSelect'
import { SubnetWithId } from '../types'
import { BigNumber } from 'ethers'
import { userEvent } from '../utils/tests'

const subnetsMock: SubnetWithId[] = [
  {
    chainId: BigNumber.from(1),
    currencySymbol: 'TST',
    endpointHttp: '',
    endpointWs: '',
    id: '',
    logoURL: '',
    name: 'subnetMock',
  },
]

vi.mock('./MetaMask', () => ({
  default: vi.fn().mockReturnValue('MetaMask Component'),
}))

describe('SubnetSelect', () => {
  it('should render select', async () => {
    render(<SubnetSelect subnets={subnetsMock} />)
    expect(screen.queryByRole('combobox')).toBeInTheDocument()
  })

  it('should render subnets as options when input click', async () => {
    render(<SubnetSelect subnets={subnetsMock} />)
    await userEvent.click(screen.queryByRole('combobox')!)
    expect(screen.queryByText('subnetMock')).toBeInTheDocument()
  })
})
