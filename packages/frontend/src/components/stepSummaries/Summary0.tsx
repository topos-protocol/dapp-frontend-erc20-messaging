import { Avatar, Space, Typography } from 'antd'
import React from 'react'

import { MultiStepFormContext } from '../../contexts/multiStepForm'

const { Text } = Typography

export default function Summary0() {
  const { sendingSubnet } = React.useContext(MultiStepFormContext)

  return (
    <Space direction="vertical" size={4}>
      <Text strong>Sending subnet</Text>
      <Space>
        <Avatar size="small" src={sendingSubnet?.logoURL} />
        <Text id="summary0SendingSubnet">{sendingSubnet?.name}</Text>
      </Space>
    </Space>
  )
}
