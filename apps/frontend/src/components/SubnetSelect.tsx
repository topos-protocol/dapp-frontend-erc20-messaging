import { Avatar, Select, SelectProps, Space, Typography } from 'antd'
import React from 'react'

import { Subnet } from '../types'

const { Option } = Select
const { Text } = Typography

interface Props extends SelectProps {
  subnets: Subnet[]
}

export default ({ subnets, ...selectProps }: Props) => (
  <Select {...selectProps}>
    {subnets.map((subnet) => (
      <Option key={subnet.name} value={subnet.chainId.toHexString()}>
        <Space>
          <Avatar size="small" src={subnet.logoURL} />
          <Text>{subnet.name}</Text>
        </Space>
      </Option>
    ))}
  </Select>
)
