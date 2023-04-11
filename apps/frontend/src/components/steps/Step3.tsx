import { ThunderboltTwoTone } from '@ant-design/icons'
import { Button, Result, Typography } from 'antd'
import React from 'react'

import { SubnetsContext } from '../../contexts'
import { FormsContext, StepProps } from '../MultiStepForm'

const { Title } = Typography

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
      icon={<ThunderboltTwoTone twoToneColor="#00c890" />}
      status="success"
      title={
        <Title level={3}>
          Successfully transacted <br /> from {sendingSubnet?.name} to{' '}
          {receivingSubnet?.name}
        </Title>
      }
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
