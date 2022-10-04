import React from 'react'
import { render } from '@testing-library/react'

import Subnets from './Subnets'

test('Should match snapshot', () => {
  const { asFragment } = render(<Subnets />)
  expect(asFragment()).toMatchSnapshot()
})
