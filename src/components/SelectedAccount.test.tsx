import React from 'react'
import { render } from '@testing-library/react'

import AccountSelect from './SelectedAccount'

test('Should match snapshot', () => {
  const { asFragment } = render(<AccountSelect />)
  expect(asFragment()).toMatchSnapshot()
})
