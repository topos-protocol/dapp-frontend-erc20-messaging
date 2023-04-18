import React from 'react'

interface ErrorsContext {
  setErrors: React.Dispatch<React.SetStateAction<string[]>>
}

export const ErrorsContext = React.createContext<ErrorsContext>({
  setErrors: () => {},
})
