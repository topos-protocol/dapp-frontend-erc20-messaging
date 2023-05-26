import { Col, Form, Row, Space } from 'antd'
import React from 'react'

import { SubnetsContext } from '../contexts/subnets'
import { MultiStepFormContext } from '../contexts/multiStepForm'
import Step0 from './steps/Step0'
import Step1 from './steps/Step1'
import Step2 from './steps/Step2'
import Step3 from './steps/Step3'
import Summary0 from './stepSummaries/Summary0'
import Summary1 from './stepSummaries/Summary1'
import useRegisteredTokens from '../hooks/useRegisteredTokens'
import { SERVICE_NAME } from '../tracing'
import { trace } from '@opentelemetry/api'
import { TracingContext } from '../contexts/tracing'

const NUMBER_OF_STEPS = 4

export interface StepProps {
  onFinish: () => void
  onPrev?: () => void
}

export enum TransactionType {
  ASSET_TRANSFER = 'Asset Transfer',
  // SMART_CONTRACT_CALL = 'Smart Contract Call',
}

interface ITransactionTypeContext {
  transactionType: TransactionType
  setTransactionType: React.Dispatch<React.SetStateAction<TransactionType>>
}

export const TransactionTypeContext =
  React.createContext<ITransactionTypeContext>({
    transactionType: TransactionType.ASSET_TRANSFER,
    setTransactionType: () => {},
  })

const MultiStepForm = () => {
  const { data: registeredSubnets } = React.useContext(SubnetsContext)
  const [transactionType, setTransactionType] = React.useState<TransactionType>(
    TransactionType.ASSET_TRANSFER
  )
  const [currentStep, setCurrentStep] = React.useState(0)
  const [[form0], [form1]] = [Form.useForm(), Form.useForm()]

  const nextStep = React.useCallback(() => {
    setCurrentStep((currentStep) => Math.min(NUMBER_OF_STEPS, currentStep + 1))
  }, [])

  const prevStep = React.useCallback(() => {
    setCurrentStep((currentStep) => Math.max(0, currentStep - 1))
  }, [])

  const reset = React.useCallback(() => {
    setCurrentStep(0)
    form0.resetFields()
    form1.resetFields()
  }, [form0, form1])

  const sendingSubnetId =
    Form.useWatch('sendingSubnet', form0) ||
    form0.getFieldValue('sendingSubnet')

  const sendingSubnet = React.useMemo(
    () => registeredSubnets?.find((s) => s.id === sendingSubnetId),
    [registeredSubnets, sendingSubnetId]
  )

  const receivingSubnetId =
    Form.useWatch('receivingSubnet', form1) ||
    form1.getFieldValue('receivingSubnet')

  const receivingSubnet = React.useMemo(
    () => registeredSubnets?.find((s) => s.id === receivingSubnetId),
    [registeredSubnets, receivingSubnetId]
  )

  const { tokens: registeredTokens } = useRegisteredTokens(sendingSubnet)

  const tokenSymbol =
    Form.useWatch('token', form1) || form1.getFieldValue('token')

  const token = React.useMemo(
    () => registeredTokens?.find((t) => t.symbol === tokenSymbol),
    [registeredTokens, tokenSymbol]
  )

  const recipientAddress =
    Form.useWatch('recipientAddress', form1) ||
    form1.getFieldValue('recipientAddress')

  const amount = Form.useWatch('amount', form1) || form1.getFieldValue('amount')

  const rootSpan = React.useMemo(() => {
    const tracer = trace.getTracer(SERVICE_NAME)
    return tracer.startSpan('root')
  }, [])

  return (
    <Row justify="center">
      <MultiStepFormContext.Provider
        value={{
          amount,
          form0,
          form1,
          receivingSubnet,
          recipientAddress,
          registeredTokens,
          sendingSubnet,
          token,
        }}
      >
        <TransactionTypeContext.Provider
          value={{ transactionType, setTransactionType }}
        >
          <Col
            span={currentStep > 0 ? 3 : 1}
            style={{
              opacity: currentStep > 0 ? 1 : 0,
              transition: 'all 0.4s ease 0.1s, opacity 0.4s ease 0.2s',
            }}
          >
            <Space direction="vertical" size={12}>
              {currentStep > 0 && <Summary0 />}
              {currentStep > 1 && <Summary1 />}
            </Space>
          </Col>
          <Col
            span={6}
            style={{
              transition: 'all 0.4s ease 0.1s',
            }}
          >
            <TracingContext.Provider value={{ rootSpan }}>
              {currentStep === 0 && <Step0 onFinish={nextStep} />}
              {currentStep === 1 && (
                <Step1 onFinish={nextStep} onPrev={prevStep} />
              )}
              {currentStep === 2 && <Step2 onFinish={nextStep} />}
              {currentStep === 3 && <Step3 onFinish={reset} />}
            </TracingContext.Provider>
          </Col>
        </TransactionTypeContext.Provider>
      </MultiStepFormContext.Provider>
    </Row>
  )
}

export default MultiStepForm
