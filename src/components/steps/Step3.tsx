import { Button, Result } from 'antd'
import React from 'react'

import { SubnetsContext } from '../../contexts'
import { FormsContext, StepProps } from '../MultiStepForm'

export default ({ onFinish }: StepProps) => {
  const { subnets } = React.useContext(SubnetsContext)
  const { form0, form1 } = React.useContext(FormsContext)
  const sendingSubnet = React.useMemo(
    () => subnets.find((s) => s.name === form0.getFieldValue('sendingSubnet')),
    [form0]
  )
  const receivingSubnet = React.useMemo(
    () =>
      subnets.find((s) => s.name === form1.getFieldValue('receivingSubnet')),
    [form1]
  )

  return (
    <Result
      status="success"
      title={`Successfully transacted from ${sendingSubnet?.name} to ${receivingSubnet?.name}`}
      subTitle={`Transaction 0x38FE9...AD4CB was submitted on ${receivingSubnet?.name}`}
      extra={[
        <Button type="primary" key="transact">
          Transact again
        </Button>,
        <Button key="see">See transaction</Button>,
      ]}
    />
  )
}
