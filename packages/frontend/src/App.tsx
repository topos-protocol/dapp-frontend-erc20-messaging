import styled from '@emotion/styled'
import { Alert, ConfigProvider, Layout as _Layout, theme } from 'antd'
import React from 'react'

import Header from './components/Header'
import MultiStepForm from './components/MultiStepForm'
import { ErrorsContext } from './contexts/errors'
import { RegisteredSubnetsContext } from './contexts/registeredSubnets'

import 'antd/dist/reset.css'
import useRegisteredSubnets from './hooks/useRegisteredSubnets'

const { Content: _Content } = _Layout

const Errors = styled.div`
  margin: 1rem auto;
  width: 80%;
  max-width: 800px;
`

const Layout = styled(_Layout)`
  min-height: 100vh;
`

const Content = styled(_Content)`
  padding: 3rem 0;
`

const App = () => {
  const [errors, setErrors] = React.useState<string[]>([])
  const { loading, registeredSubnets } = useRegisteredSubnets()

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
      <ErrorsContext.Provider value={{ setErrors }}>
        <RegisteredSubnetsContext.Provider
          value={{
            loading,
            data: registeredSubnets,
          }}
        >
          <Layout>
            <Header />
            <Errors>
              {errors.map((e) => (
                <Alert type="error" showIcon closable message={e} key={e} />
              ))}
            </Errors>
            <Content>
              <MultiStepForm />
            </Content>
          </Layout>
        </RegisteredSubnetsContext.Provider>
      </ErrorsContext.Provider>
    </ConfigProvider>
  )
}

export default App
