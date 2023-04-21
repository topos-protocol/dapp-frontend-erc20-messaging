import opentelemetry, { Context, Span, Tracer } from '@opentelemetry/api'
import { BigNumber } from 'ethers'
import React from 'react'

import logo from './logo.svg'
import { Subnet } from './types'

export const DEFAULT_SUBNETS: Subnet[] = [
  {
    currencySymbol: import.meta.env.VITE_TOPOS_SUBNET_CURRENCY_SYMBOL || '',
    endpoint: import.meta.env.VITE_TOPOS_SUBNET_ENDPOINT || '',
    name: 'Topos',
    chainId: BigNumber.from(import.meta.env.VITE_TOPOS_SUBNET_CHAIN_ID || ''),
    logoURL: logo,
    subnetId: '1',
  },
]
