import React from 'react'
import { render } from '@testing-library/react'

import Header from './Header'

test('Should match snapshot', () => {
  const { asFragment } = render(<Header />)
  expect(asFragment()).toMatchSnapshot()
})
