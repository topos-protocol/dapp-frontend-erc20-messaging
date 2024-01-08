import { Col, Layout, Row, Space } from 'antd'

import packageJson from '../../../../package.json'

const { Footer: AntdFooter } = Layout

const Footer = () => {
  return (
    <AntdFooter>
      <Row justify="end">
        <Col>v{packageJson.version}</Col>
      </Row>
    </AntdFooter>
  )
}

export default Footer
