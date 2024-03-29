import { Col, Layout, Row, Space } from 'antd'

import logo from '../logo.svg'
import MetaMask from './MetaMask'

const { Header: AntdHeader } = Layout

const Header = () => {
  return (
    <AntdHeader>
      <Row justify="space-between">
        <Col>
          <Space align="start">
            <img src={logo} width={40} alt="logo" />
            <h3 style={{ color: '#fff', fontWeight: 'bold' }}>
              ERC20 Messaging
            </h3>
          </Space>
        </Col>
        <Col style={{ textAlign: 'right' }}>
          <MetaMask />
        </Col>
      </Row>
    </AntdHeader>
  )
}

export default Header
