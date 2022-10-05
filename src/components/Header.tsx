import React from 'react'
import { Col, Layout, Row, Space } from 'antd'

import logo from '../logo.svg'
import SelectedAccount from './SelectedAccount'

const { Header } = Layout

export default () => {
  return (
    <Header style={{ backgroundColor: '#242526' }}>
      <Row justify="space-between">
        <Col span={6}>
          <Space align="start">
            <img src={logo} width={40} />
            <h3 style={{ color: '#fff', fontWeight: 'bold' }}>
              Cross-subnet messages
            </h3>
          </Space>
        </Col>
        <Col span={3}>
          <SelectedAccount />
        </Col>
      </Row>
    </Header>
  )
}
