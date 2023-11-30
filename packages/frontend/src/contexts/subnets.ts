import { createContext } from 'react'

import { FetchData, SubnetWithId } from '../types'

export const SubnetsContext = createContext<FetchData<SubnetWithId[]>>({})
