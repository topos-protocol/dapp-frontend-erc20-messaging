import { Space, Spin, Typography } from 'antd';
import React from 'react';

const { Text } = Typography;

interface Props {
  endpoint: string;
}

export default ({ endpoint }: Props) => (
  <div
    style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
    }}
  >
    <Space direction="vertical">
      <Spin size="large" />
      <Text code>Connecting to a Topos subnet node at {endpoint}</Text>
    </Space>
  </div>
);
