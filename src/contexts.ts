import React from 'react'

import { Subnet } from './types'

export const MOCKED_SUBNETS: Subnet[] = [
  {
    endpoint: 'wss://wss.incal.demo.toposware.com',
    name: 'Incal',
    logo_url: '',
  },
  {
    endpoint: 'wss://wss.edena.demo.toposware.com',
    name: 'Edena',
    logo_url: '',
  },
]

interface SubnetsContext {
  subnets: Subnet[]
}

export const SubnetsContext = React.createContext<SubnetsContext>({
  subnets: MOCKED_SUBNETS,
})
