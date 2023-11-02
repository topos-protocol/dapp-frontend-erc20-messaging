import { Button, Form } from 'antd'
import { useCallback, useContext, useEffect, useMemo } from 'react'

import { MultiStepFormContext } from '../../contexts/multiStepForm'
import { SubnetsContext } from '../../contexts/subnets'
import { TracingContext } from '../../contexts/tracing'
import { StepProps } from '../MultiStepForm'
import SubnetSelect from '../SubnetSelect'
import useEthers from '../../hooks/useEthers'
import useTracingCreateSpan from '../../hooks/useTracingCreateSpan'
import { ERROR, INFO } from '../../constants/wordings'

const Step0 = ({ onFinish }: StepProps) => {
  const { rootSpan } = useContext(TracingContext)
  const stepSpan = useMemo(
    () => useTracingCreateSpan('Step0', 'step-0', rootSpan),
    [rootSpan]
  )

  const { data: registeredSubnets, loading: getRegisteredSubnetsLoading } =
    useContext(SubnetsContext)
  const { form0, sendingSubnet } = useContext(MultiStepFormContext)

  const { status } = useEthers({
    subnet: sendingSubnet,
    viaMetaMask: sendingSubnet !== undefined,
  })

  const nextStep = useCallback(() => {
    stepSpan?.end()
    onFinish()
  }, [stepSpan])

  useEffect(
    function traceFetchRegisteredSubnets() {
      if (registeredSubnets) {
        stepSpan?.addEvent('fetched registered subnets', {
          registeredSubnets: JSON.stringify(registeredSubnets),
        })
      }
    },
    [registeredSubnets]
  )

  useEffect(
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
        tooltip={status == 'notConnected' && INFO.FIRST_CONNECT_METAMASK}
        rules={[
          {
            required: true,
            message: ERROR.MISSING_SENDING_SUBNET,
          },
        ]}
      >
        <SubnetSelect
          disabled={status !== 'connected'}
          loading={getRegisteredSubnetsLoading}
          size="large"
          subnets={registeredSubnets}
        />
      </Form.Item>
      <Form.Item>
        <Button
          id="nextButton"
          type="primary"
          htmlType="submit"
          disabled={status !== 'connected'}
        >
          Next
        </Button>
      </Form.Item>
    </Form>
  )
}

export default Step0
