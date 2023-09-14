import { ThunderboltTwoTone } from '@ant-design/icons'
import { Button, Result, Typography } from 'antd'
import React, { useCallback, useContext, useMemo } from 'react'

import { TracingContext } from '../../contexts/tracing'
import { MultiStepFormContext } from '../../contexts/multiStepForm'
import { StepProps } from '../MultiStepForm'

const { Title } = Typography

const Step3 = ({ onFinish }: StepProps) => {
  const { receivingSubnet, sendingSubnet } = useContext(MultiStepFormContext)

  const { transaction: apmTransaction } = useContext(TracingContext)
  const stepSpan = useMemo(
    () => apmTransaction?.startSpan('multi-step-form-step-3', 'app'),
    [apmTransaction]
  )

  const reset = useCallback(() => {
    stepSpan?.end()
    apmTransaction?.end()
    onFinish()
  }, [stepSpan])

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
