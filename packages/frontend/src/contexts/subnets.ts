import React from 'react'

import { FetchData, SubnetWithId } from '../types'

export const SubnetsContext = React.createContext<FetchData<SubnetWithId[]>>({})
