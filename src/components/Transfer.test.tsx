import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import TestId from '../util/testid'
import Transfer from './Transfer'

test('Should match snapshot', () => {
  const { asFragment } = render(<Transfer />)
  expect(asFragment()).toMatchSnapshot()
})

describe('About dialog', () => {
  beforeEach(async () => {
    render(<Transfer />)
    fireEvent.click(screen.getByTestId(TestId.TRANSFER_BUTTON))

    await waitFor(() => screen.getByText('Transfer an amount to an account'))
  })

  test('Should open dialog on button click', async () => {
    expect(screen.getByText('Transfer an amount to an account'))
  })

  test('Should close dialog on Cancel click', () => {
    fireEvent.click(screen.getByText('Cancel'))
    expect(!screen.getByText('Transfer an amount to an account'))
  })
})
