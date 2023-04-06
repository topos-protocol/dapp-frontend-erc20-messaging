import { Avatar, Space, Typography } from 'antd';
import React from 'react';

import { SubnetsContext } from '../../contexts';
import { FormsContext } from '../MultiStepForm';

const { Text } = Typography;

const Summary0 = () => {
  const { form0 } = React.useContext(FormsContext);
  const { registeredSubnets } = React.useContext(SubnetsContext);
  const subnet = registeredSubnets.find(
    (s) => s.chainId.toHexString() === form0.getFieldValue('sendingSubnet')
  );

  return (
    <Space direction="vertical" size={4}>
      <Text strong>Sending subnet</Text>
      <Space>
        <Avatar size="small" src={subnet?.logoURL} />
        <Text>{subnet?.name}</Text>
      </Space>
    </Space>
  );
};

export default Summary0;
