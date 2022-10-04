import React from 'react'

import { Subnet } from './types'

interface SubnetsContext {
  subnets: Subnet[]
  sendingSubnet: Subnet | undefined
  receivingSubnet: Subnet | undefined
  setSendingSubnet: React.Dispatch<React.SetStateAction<Subnet | undefined>>
  setReceivingSubnet: React.Dispatch<React.SetStateAction<Subnet | undefined>>
}

export const SubnetsContext = React.createContext<SubnetsContext>({
  subnets: [],
  sendingSubnet: undefined,
  receivingSubnet: undefined,
  setSendingSubnet: () => {},
  setReceivingSubnet: () => {},
})
