import { Button, Form } from 'antd'
import React from 'react'

import { MultiStepFormContext } from '../../contexts/multiStepForm'
import { RegisteredSubnetsContext } from '../../contexts/registeredSubnets'
import { TracingContext } from '../../contexts/tracing'
import { StepProps } from '../MultiStepForm'
import SubnetSelect from '../SubnetSelect'
import useEthers from '../../hooks/useEthers'
import useCreateTracingSpan from '../../hooks/useCreateTracingSpan'

const Step0 = ({ onFinish }: StepProps) => {
  const { rootSpan } = React.useContext(TracingContext)
  const stepSpan = React.useMemo(() => useCreateTracingSpan('step-0', rootSpan), [rootSpan])

  const { data: registeredSubnets, loading: getRegisteredSubnetsLoading } =
    React.useContext(RegisteredSubnetsContext)
  const { form0, sendingSubnet } = React.useContext(MultiStepFormContext)

  useEthers({
    subnet: sendingSubnet,
    viaMetaMask: sendingSubnet !== undefined,
  })

  const nextStep = React.useCallback(() => {
    stepSpan?.end()
    onFinish()
  }, [stepSpan])

  React.useEffect(
    function traceFetchRegisteredSubnets() {
      if (registeredSubnets) {
        stepSpan?.addEvent('fetch registered subnets', {
          registeredSubnets: JSON.stringify(registeredSubnets),
        })
      }
    },
    [registeredSubnets]
  )

  React.useEffect(
    function traceSelectSendingSubnet() {
      stepSpan?.addEvent('select sending subnet', {
        sendingSubnet: JSON.stringify(sendingSubnet),
      })
    },
    [sendingSubnet]
  )

  return (
    <Form form={form0} layout="vertical" onFinish={nextStep}>
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
        <SubnetSelect
          loading={getRegisteredSubnetsLoading}
          size="large"
          subnets={registeredSubnets}
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Next
        </Button>
      </Form.Item>
    </Form>
  )
}

export default Step0
