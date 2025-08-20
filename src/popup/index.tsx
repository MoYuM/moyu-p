import { ConfigProvider, Divider, Form, Layout, Select, theme, Typography } from 'antd'
import { useEffect } from 'react'
import { APPEARANCE_OPTIONS, LANGUAGE_OPTIONS, SEARCH_ENGINE_OPTIONS } from '~const'
import { useTheme } from '~hooks/useTheme'
import { getUserOptions, setUserOptions } from '~store/options'
import { t } from '~utils/i18n'
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
          <Title level={5}>{t('settings')}</Title>
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
          <Form.Item label={t('searchEngine')} name="searchEngine" className="w-full">
            <Select
              options={SEARCH_ENGINE_OPTIONS}
              placeholder={t('selectSearchEngine')}
            />
          </Form.Item>
          <Form.Item label={t('appearance')} name="appearance" className="w-full">
            <Select
              options={APPEARANCE_OPTIONS}
              placeholder={t('selectAppearance')}
            />
          </Form.Item>
          <Form.Item label={t('language')} name="language" className="w-full">
            <Select
              options={LANGUAGE_OPTIONS}
              placeholder={t('selectLanguage')}
            />
          </Form.Item>
        </Form>
      </Layout>
    </ConfigProvider>
  )
}

export default IndexPopup
