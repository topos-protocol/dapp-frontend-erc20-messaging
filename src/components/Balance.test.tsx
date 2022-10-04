import React from 'react'
import { render } from '@testing-library/react'

import Balance from './Balance'

test('Should match snapshot', () => {
  const { asFragment } = render(<Balance account="" />)
  expect(asFragment()).toMatchSnapshot()
})
