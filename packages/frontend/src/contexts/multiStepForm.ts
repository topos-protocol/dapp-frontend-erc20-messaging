import { FormInstance } from 'antd'
import React from 'react'

import { Subnet, Token } from '../types'

interface MultiStepFormContext {
  amount?: number
  form0?: FormInstance<any>
  form1?: FormInstance<any>
  receivingSubnet?: Subnet
  recipientAddress?: string
  registeredTokens?: Token[]
  sendingSubnet?: Subnet
  token?: Token
}

export const MultiStepFormContext = React.createContext<MultiStepFormContext>(
  {}
)
