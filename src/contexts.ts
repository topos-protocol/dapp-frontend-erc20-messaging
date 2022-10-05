import React from 'react'

import logo from './logo.svg'
import { Subnet } from './types'

export const MOCKED_SUBNETS: Subnet[] = [
  {
    endpoint: 'wss://wss.topos-subnet.demo.toposware.com',
    name: 'Topos',
    chainId: '0x2a',
    logoUrl: logo,
  },
  {
    endpoint: 'wss://wss.incal.demo.toposware.com',
    name: 'Incal',
    chainId: '0x2b',
    logoUrl:
      'https://assets-global.website-files.com/5f973c970bea5548ad4287ef/61a7eb59d69e3f7e399a852a_optimistic.png',
  },
  {
    endpoint: 'wss://wss.edena.demo.toposware.com',
    chainId: '0x2c',
    name: 'Edena',
    logoUrl: 'https://trufflesuite.com/assets/logo.png',
  },
]

interface SubnetsContext {
  subnets: Subnet[]
}

export const SubnetsContext = React.createContext<SubnetsContext>({
  subnets: MOCKED_SUBNETS,
})
