import { ThunderboltTwoTone } from '@ant-design/icons'
import { Button, Result, Typography } from 'antd'
import { useCallback, useContext } from 'react'

import { MultiStepFormContext } from '../../contexts/multiStepForm'
import { StepProps } from '../MultiStepForm'

const { Title } = Typography

const Step3 = ({ onFinish }: StepProps) => {
  const { receivingSubnet, sendingSubnet } = useContext(MultiStepFormContext)

  const reset = useCallback(() => {
    onFinish()
  }, [])

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
