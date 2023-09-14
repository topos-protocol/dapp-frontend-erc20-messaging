import { Transaction } from '@elastic/apm-rum'
import React from 'react'

interface TracingContext {
  transaction?: Transaction
}

export const TracingContext = React.createContext<TracingContext>({})
