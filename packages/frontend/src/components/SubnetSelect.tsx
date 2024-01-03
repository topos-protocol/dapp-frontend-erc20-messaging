import { Avatar, Select, SelectProps, Space, Typography } from 'antd'

import { SubnetWithId } from '../types'

const { Option } = Select
const { Text } = Typography

interface Props extends SelectProps {
  subnets?: SubnetWithId[]
}

export default ({ subnets, ...selectProps }: Props) => (
  <Select {...selectProps} size="middle">
    {subnets?.map((subnet) => (
      <Option key={subnet.name} value={subnet.id}>
        <Space>
          <Avatar size="small" src={subnet.logoURL} />
          <Text>{subnet.name}</Text>
        </Space>
      </Option>
    ))}
  </Select>
)
