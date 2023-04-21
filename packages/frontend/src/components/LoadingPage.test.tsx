import React from 'react'
import { render } from '@testing-library/react'

import LoadingPage from './LoadingPage'

test('Should match snapshot', () => {
  const { asFragment } = render(<LoadingPage endpoint="" />)
  expect(asFragment()).toMatchSnapshot()
})
