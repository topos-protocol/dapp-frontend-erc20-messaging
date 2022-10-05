import { Button, Form, Select } from 'antd'
import React from 'react'

import { SubnetsContext } from '../../contexts'
import { StepProps, SubnetLogo } from '../MultiStepForm'

const { Option } = Select

export default ({ form, onFinish }: StepProps) => {
  const { subnets } = React.useContext(SubnetsContext)

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
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
              <SubnetLogo src={subnet.logo_url} /> {subnet.name}
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
