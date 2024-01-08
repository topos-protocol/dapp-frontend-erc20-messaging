import { Col, Layout, Row, Space } from 'antd'

import packageJson from '../../../../package.json'

const { Footer: AntdFooter } = Layout

const Footer = () => {
  return (
    <AntdFooter>
      <Row justify="space-between">
        <Col>zk Foundation © {new Date().getFullYear()}</Col>
        <Col>v{packageJson.version}</Col>
      </Row>
    </AntdFooter>
  )
}

export default Footer
