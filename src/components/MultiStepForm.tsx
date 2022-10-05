import styled from '@emotion/styled'
import { Col, Form, FormInstance, Row, Select } from 'antd'
import React from 'react'

import Step0 from './stepForms/Step0'
import Step1 from './stepForms/Step1'
import Step2 from './stepForms/Step2'
import Step3 from './stepForms/Step3'
import Step4 from './stepForms/Step4'

const { useForm } = Form

const Summary = styled.div``

export const SubnetLogo = styled.img``

const NUMBER_OF_STEPS = 5

const Summary0 = ({ sendingSubnet }: { sendingSubnet: string }) => {
  return <>Sending subnet: {sendingSubnet}</>
}

export interface StepProps {
  form: FormInstance<any>
  onFinish: () => void
  onPrev?: () => void
}

export default () => {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [[form0], [form1], [form2], [form3], [form4]] = [
    useForm(),
    useForm(),
    useForm(),
    useForm(),
    useForm(),
  ]

  const nextStep = React.useCallback(() => {
    setCurrentStep((currentStep) => Math.min(NUMBER_OF_STEPS, currentStep + 1))
  }, [])

  const prevStep = React.useCallback(() => {
    setCurrentStep((currentStep) => Math.max(0, currentStep - 1))
  }, [])

  const submit = React.useCallback(() => {
    console.log('submit')
  }, [])

  return (
    <div>
      <Row justify="space-around">
        <Col span={currentStep > 0 ? 4 : 0}>
          <Summary>
            {currentStep > 0 && (
              <Summary0 sendingSubnet={form0.getFieldValue('sendingSubnet')} />
            )}
          </Summary>
        </Col>
        <Col span={currentStep === 0 ? 12 : 8}>
          <>
            {currentStep === 0 && (
              <Step0 form={form0} onFinish={nextStep}></Step0>
            )}
            {currentStep === 1 && (
              <Step1 form={form1} onFinish={nextStep} onPrev={prevStep}></Step1>
            )}
            {currentStep === 2 && (
              <Step2 form={form2} onFinish={nextStep} onPrev={prevStep}></Step2>
            )}
            {currentStep === 3 && (
              <Step3 form={form3} onFinish={nextStep} onPrev={prevStep}></Step3>
            )}
            {currentStep === 4 && (
              <Step4 form={form4} onFinish={submit} onPrev={prevStep}></Step4>
            )}
          </>
        </Col>
      </Row>
    </div>
  )
}
