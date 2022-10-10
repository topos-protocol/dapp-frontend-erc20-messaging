import { Typography } from 'antd'
import { useMetaMask } from 'metamask-react'
import React from 'react'

import { shortenAddress } from '../util'

const { Text } = Typography

export default () => {
  const { account } = useMetaMask()

  return <Text>{shortenAddress(account || '')}</Text>
}
