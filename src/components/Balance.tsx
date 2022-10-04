import React from 'react'

import useBalance from '../hooks/useBalance'

interface Props {
  account: string
}

export default ({ account }: Props) => {
  const balance = useBalance(account)
  return <span>{balance}</span>
}
