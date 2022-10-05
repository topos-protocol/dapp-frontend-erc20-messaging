import { Avatar, Button, Form, Select } from 'antd'
import React from 'react'

import { SubnetsContext } from '../../contexts'
import { FormsContext, StepProps } from '../MultiStepForm'

const { Option } = Select

export default ({ onFinish }: StepProps) => {
  const { subnets } = React.useContext(SubnetsContext)
  const { form0 } = React.useContext(FormsContext)

  return (
    <Form form={form0} layout="vertical" onFinish={onFinish}>
      <Form.Item
        label="Sending subnet"
        name="sendingSubnet"
        rules={[
          {
            required: true,
            message: 'Please select a sending subnet!',
          },
        ]}
      >
        <Select size="large">
          {subnets.map((subnet) => (
            <Option key={subnet.name} value={subnet.name}>
              <Avatar size="small" src={subnet.logoUrl} /> {subnet.name}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Button type="primary" htmlType="submit">
          Next
        </Button>
      </Form.Item>
    </Form>
  )
}
