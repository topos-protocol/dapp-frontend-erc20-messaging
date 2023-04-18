import React from 'react'

import { FetchData, Subnet } from '../types'

export const RegisteredSubnetsContext = React.createContext<
  FetchData<Subnet[]>
>({})
