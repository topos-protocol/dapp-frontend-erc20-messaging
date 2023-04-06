import { Button, Result } from 'antd'
import React from 'react'

import { SubnetsContext } from '../../contexts'
import { FormsContext, StepProps } from '../MultiStepForm'

const Step3 = ({ onFinish }: StepProps) => {
  const { registeredSubnets } = React.useContext(SubnetsContext)
  const { form0, form1 } = React.useContext(FormsContext)
  const sendingSubnet = React.useMemo(
    () =>
      registeredSubnets.find(
        (s) => s.chainId.toHexString() === form0.getFieldValue('sendingSubnet')
      ),
    [form0]
  )
  const receivingSubnet = React.useMemo(
    () =>
      registeredSubnets.find(
        (s) =>
          s.chainId.toHexString() === form1.getFieldValue('receivingSubnet')
      ),
    [form1]
  )

  return (
    <Result
      status="success"
      title={`Successfully transacted from ${sendingSubnet?.name} to ${receivingSubnet?.name}`}
      subTitle={`Transaction was submitted on ${receivingSubnet?.name}`}
      extra={[
        <Button type="primary" key="transact" onClick={onFinish}>
          Transact again
        </Button>,
      ]}
    />
  )
}

export default Step3
