import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import Header from './Header'

vi.mock('./MetaMask', () => ({
  default: vi.fn().mockReturnValue('MetaMask Component'),
}))

describe('Header', () => {
  it('should display web app logo', async () => {
    render(<Header />)
    expect(screen.queryByRole('img', { name: 'logo' })).toBeInTheDocument()
  })

  it('should display web app title', async () => {
    render(<Header />)
    expect(screen.queryByText('ERC20 Messaging')).toBeInTheDocument()
  })

  it('should render the MetaMask component', async () => {
    render(<Header />)
    expect(screen.queryByText('MetaMask Component')).toBeInTheDocument()
  })
})
