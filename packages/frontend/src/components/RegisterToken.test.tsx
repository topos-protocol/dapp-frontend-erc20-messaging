import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import RegisterToken from './RegisterToken'
import TestId from '../utils/testId'
import { userEvent } from '../utils/tests'

vi.mock('../hooks/useRegisterToken', () => ({
  default: vi.fn().mockReturnValue(''),
}))

describe('RegisterToken', () => {
  it('should render button', async () => {
    render(<RegisterToken />)
    expect(
      screen.queryByTestId(TestId.REGISTER_TOKEN_BUTTON)
    ).toBeInTheDocument()
  })

  it('should render modal when click button', async () => {
    render(<RegisterToken />)
    await userEvent.click(screen.queryByTestId(TestId.REGISTER_TOKEN_BUTTON)!)
    expect(
      screen.queryByTestId(TestId.REGISTER_TOKEN_MODAL)
    ).toBeInTheDocument()
  })

  it('should render modal form fields when click button', async () => {
    render(<RegisterToken />)
    await userEvent.click(screen.queryByTestId(TestId.REGISTER_TOKEN_BUTTON)!)
    expect(
      screen.queryByTestId(TestId.REGISTER_TOKEN_FORM_FIELD_NAME)
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId(TestId.REGISTER_TOKEN_FORM_FIELD_SYMBOL)
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId(TestId.REGISTER_TOKEN_FORM_FIELD_SUPPLY)
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId(TestId.REGISTER_TOKEN_FORM_FIELD_CAP)
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId(TestId.REGISTER_TOKEN_FORM_FIELD_DAILY_MINT_LIMIT)
    ).toBeInTheDocument()
  })
})
