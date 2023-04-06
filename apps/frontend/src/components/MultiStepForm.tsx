import { Col, Form, FormInstance, Row, Space } from 'antd';
import React from 'react';
import { Token } from '../types';

import Step0 from './steps/Step0';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Summary0 from './stepSummaries/Summary0';
import Summary1 from './stepSummaries/Summary1';

const { useForm } = Form;

const NUMBER_OF_STEPS = 4;

export interface StepProps {
  onFinish?: () => void;
  onPrev?: () => void;
}

interface IFormsContext {
  form0: FormInstance<any>;
  form1: FormInstance<any>;
}

export const FormsContext = React.createContext<IFormsContext>({
  form0: {} as FormInstance<any>,
  form1: {} as FormInstance<any>,
});

export enum TransactionType {
  ASSET_TRANSFER = 'Asset Transfer',
  SMART_CONTRACT_CALL = 'Smart Contract Call',
}

interface ITransactionTypeContext {
  transactionType: TransactionType;
  setTransactionType: React.Dispatch<React.SetStateAction<TransactionType>>;
}

export const TransactionTypeContext =
  React.createContext<ITransactionTypeContext>({
    transactionType: TransactionType.ASSET_TRANSFER,
    setTransactionType: () => {},
  });

interface IExtraDataContext {
  registeredTokens: Token[];
  setRegisteredTokens: React.Dispatch<React.SetStateAction<Token[]>>;
  // setToken: React.Dispatch<React.SetStateAction<Token | undefined>>
  // token: Token | undefined
}

export const ExtraDataContext = React.createContext<IExtraDataContext>({
  registeredTokens: [],
  setRegisteredTokens: () => {},
  // setToken: () => {},
  // token: undefined,
});

const MultiStepForm = () => {
  const [transactionType, setTransactionType] = React.useState<TransactionType>(
    TransactionType.ASSET_TRANSFER
  );
  const [registeredTokens, setRegisteredTokens] = React.useState<Token[]>([]);
  const [token, setToken] = React.useState<Token>();
  const [currentStep, setCurrentStep] = React.useState(0);
  const [[form0], [form1]] = [useForm(), useForm()];

  const nextStep = React.useCallback(() => {
    setCurrentStep((currentStep) => Math.min(NUMBER_OF_STEPS, currentStep + 1));
  }, []);

  const prevStep = React.useCallback(() => {
    setCurrentStep((currentStep) => Math.max(0, currentStep - 1));
  }, []);

  const reset = React.useCallback(() => {
    setCurrentStep(0);
    form0.resetFields();
    form1.resetFields();
  }, [form0, form1]);

  return (
    <Row justify="center">
      <FormsContext.Provider value={{ form0, form1 }}>
        <TransactionTypeContext.Provider
          value={{ transactionType, setTransactionType }}
        >
          <ExtraDataContext.Provider
            value={{ setRegisteredTokens, registeredTokens }}
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
              <>
                {currentStep === 0 && <Step0 onFinish={nextStep} />}
                {currentStep === 1 && (
                  <Step1 onFinish={nextStep} onPrev={prevStep} />
                )}
                {currentStep === 2 && <Step2 onFinish={nextStep} />}
                {currentStep === 3 && <Step3 onFinish={reset} />}
              </>
            </Col>
          </ExtraDataContext.Provider>
        </TransactionTypeContext.Provider>
      </FormsContext.Provider>
    </Row>
  );
};

export default MultiStepForm;
