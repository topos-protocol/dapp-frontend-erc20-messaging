import { ThunderboltTwoTone } from '@ant-design/icons'
import { Button, Result, Typography } from 'antd'
import React from 'react'

import { TracingContext } from '../../contexts/tracing'
import { MultiStepFormContext } from '../../contexts/multiStepForm'
import useCreateTracingSpan from '../../hooks/useCreateTracingSpan'
import { StepProps } from '../MultiStepForm'

const { Title } = Typography

const Step3 = ({ onFinish }: StepProps) => {
  const { receivingSubnet, sendingSubnet } =
    React.useContext(MultiStepFormContext)

  const { rootSpan } = React.useContext(TracingContext)
  const stepSpan = React.useMemo(
    () => useCreateTracingSpan('step-3', rootSpan),
    [rootSpan]
  )

  const reset = React.useCallback(() => {
    stepSpan?.end()
    rootSpan?.end()
    onFinish()
  }, [stepSpan, rootSpan])

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
        <Button id="resetButton" type="primary" key="transact" onClick={reset}>
          Transact again
        </Button>,
      ]}
    />
  )
}

export default Step3
