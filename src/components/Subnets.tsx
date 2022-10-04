import { WarningOutlined } from '@ant-design/icons'
import { Card, Space, Table, Typography } from 'antd'
import React from 'react'

import { SubnetsContext } from '../contexts'

export default () => {
  const { subnets } = React.useContext(SubnetsContext)
  const [error, setError] = React.useState<Error>()

  return (
    <Card title="Registered subnets">
      <Space direction="vertical">
        {error ? (
          <Typography.Text type="warning">
            <WarningOutlined /> {error.message}
          </Typography.Text>
        ) : (
          <Table
            columns={[
              { title: 'Name', dataIndex: 'name', key: 'name' },
              { title: 'Endpoint', dataIndex: 'endpoint', key: 'endpoint' },
            ]}
            dataSource={subnets}
            rowKey="name"
          />
        )}
      </Space>
    </Card>
  )
}
