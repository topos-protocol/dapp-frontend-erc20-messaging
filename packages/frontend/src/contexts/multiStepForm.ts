import { FormInstance } from 'antd'
import React from 'react'

import { SubnetWithId, Token } from '../types'

interface MultiStepFormContext {
  amount?: number
  form0?: FormInstance<any>
  form1?: FormInstance<any>
  receivingSubnet?: SubnetWithId
  recipientAddress?: string
  registeredTokens?: Token[]
  registeredTokensLoading?: boolean
  sendingSubnet?: SubnetWithId
  token?: Token
}

export const MultiStepFormContext = React.createContext<MultiStepFormContext>(
  {}
)
