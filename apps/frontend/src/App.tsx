import styled from '@emotion/styled';
import { Alert, ConfigProvider, Layout, theme } from 'antd';
import React from 'react';

import Header from './components/Header';
import MultiStepForm from './components/MultiStepForm';
import { ErrorsContext, SubnetsContext } from './contexts';
import { Subnet } from './types';

import 'antd/dist/reset.css';

const { Content: _Content } = Layout;

const Errors = styled.div`
  margin: 1rem auto;
  width: 80%;
  max-width: 800px;
`;

const Content = styled(_Content)`
  padding: 3rem 0;
`;

const App = () => {
  const [errors, setErrors] = React.useState<string[]>([]);
  const [registeredSubnets, setRegisteredSubnets] = React.useState<Subnet[]>(
    []
  );

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        components: {
          Layout: {
            colorBgHeader: 'transparent',
          },
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <ErrorsContext.Provider value={{ setErrors }}>
          <SubnetsContext.Provider
            value={{
              registeredSubnets,
              setRegisteredSubnets,
            }}
          >
            <Header />
            <Errors>
              {errors.map((e) => (
                <Alert type="error" showIcon closable message={e} key={e} />
              ))}
            </Errors>
            <Content>
              <MultiStepForm />
            </Content>
          </SubnetsContext.Provider>
        </ErrorsContext.Provider>
      </Layout>
    </ConfigProvider>
  );
};

export default App;
