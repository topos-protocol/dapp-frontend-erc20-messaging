import { Typography } from 'antd'
import { useMetaMask } from 'metamask-react'
import React from 'react'

import { shortenAddress } from '../util'
import Balance from './Balance'

const { Text } = Typography

export default () => {
  const { account } = useMetaMask()

  return (
    <Text>
      {shortenAddress(account || '')} | <Balance account={account || ''} />
    </Text>
  )
}
