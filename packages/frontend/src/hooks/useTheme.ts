import { theme } from 'antd'

export default function useTheme() {
  const { token } = theme.useToken()
  token.colorPrimary = '#27c794'
  token.colorPrimaryHover = '#15523f'

  return token
}
