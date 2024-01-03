import { Progress as AntdProgress } from 'antd'

interface Props {
  progress: number
}

const Progress = ({ progress }: Props) => {
  return (
    <AntdProgress
      strokeColor={{
        from: '#108ee9',
        to: '#87d068',
      }}
      percent={progress}
      status="active"
      showInfo={false}
    />
  )
}

export default Progress
