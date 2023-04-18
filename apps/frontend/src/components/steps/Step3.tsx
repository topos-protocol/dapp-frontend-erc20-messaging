import { ThunderboltTwoTone } from '@ant-design/icons'
import { Button, Result, Typography } from 'antd'
import React from 'react'

import { TracingContext } from '../../contexts/tracing'
import { MultiStepFormContext } from '../../contexts/multiStepForm'
import { StepProps } from '../MultiStepForm'
import useTracingCreateSpan from '../../hooks/useTracingCreateSpan'

const { Title } = Typography

const Step3 = ({ onFinish }: StepProps) => {
  const { receivingSubnet, sendingSubnet } =
    React.useContext(MultiStepFormContext)

  const { activeSpan } = React.useContext(TracingContext)
  const { span } = useTracingCreateSpan('step-3', activeSpan)

  const reset = React.useCallback(() => {
    span?.end()
    onFinish()
  }, [span])

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
        <Button type="primary" key="transact" onClick={reset}>
          Transact again
        </Button>,
      ]}
    />
  )
}

export default Step3
