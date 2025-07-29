import { ConfigProvider, Divider, Form, Layout, Select, theme, Typography } from 'antd'
import { useEffect } from 'react'
import { APPEARANCE_OPTIONS, SEARCH_ENGINE_OPTIONS } from '~const'
import { useTheme } from '~hooks/useTheme'
import { getUserOptions, setUserOptions } from '~store/options'
import { version } from '../../package.json'
import './index.css'

const algorithmMap = {
  light: theme.defaultAlgorithm,
  dark: theme.darkAlgorithm,
}

const { Title } = Typography

function IndexPopup() {
  const [form] = Form.useForm()
  const [theme] = useTheme()

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    const userOptions = await getUserOptions()
    form.setFieldsValue(userOptions)
  }

  const handleFormChange = (allValues: any) => {
    setUserOptions(allValues)
  }

  return (
    <ConfigProvider theme={{ algorithm: algorithmMap[theme] }}>
      <Layout className="w-[300px] h-[450px] p-4">
        <div className="flex justify-between items-center">
          <Title level={5}>⚙️ 配置</Title>
          <div className="text-sm text-gray-500">
            v
            {version}
          </div>
        </div>
        <Divider size="small" />
        <Form
          form={form}
          layout="inline"
          size="small"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          onValuesChange={(_, allValues) => {
            handleFormChange(allValues)
          }}
        >
          <Form.Item label="搜索引擎" name="searchEngine" className="w-full">
            <Select
              options={SEARCH_ENGINE_OPTIONS}
              placeholder="请选择搜索引擎"
            />
          </Form.Item>
          <Form.Item label="外观" name="appearance" className="w-full">
            <Select
              options={APPEARANCE_OPTIONS}
              placeholder="请选择外观"
            />
          </Form.Item>
        </Form>
      </Layout>
    </ConfigProvider>
  )
}

export default IndexPopup
