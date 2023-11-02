import { createContext, Dispatch, ReactNode, SetStateAction } from 'react'

export interface Error {
  message: string
  description?: ReactNode
}

interface ErrorsContext {
  setErrors: Dispatch<SetStateAction<Error[]>>
}

export const ErrorsContext = createContext<ErrorsContext>({
  setErrors: () => {},
})
