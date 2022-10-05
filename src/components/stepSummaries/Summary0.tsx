import { Avatar, Space } from 'antd'
import React from 'react'

import { SubnetsContext } from '../../contexts'
import { FormsContext } from '../MultiStepForm'

export default () => {
  const { form0 } = React.useContext(FormsContext)
  const { subnets } = React.useContext(SubnetsContext)
  const subnet = subnets.find(
    (s) => s.name === form0.getFieldValue('sendingSubnet')
  )

  return (
    <Space direction="vertical" size={4}>
      <b>Sending subnet</b>
      <Space>
        <Avatar size="small" src={subnet?.logoUrl} />
        <>{subnet?.name}</>
      </Space>
    </Space>
  )
}
