import { Divider, Form, Select } from 'antd'
import { useEffect } from 'react'
import { SEARCH_ENGINE_OPTIONS } from '~const'
import { getUserOptions, setUserOptions } from '~store/options'
import { version } from '../../package.json'
import './index.css'

function IndexPopup() {
  const [form] = Form.useForm()

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
    <div className="w-[300px] h-[450px] p-4">
      <div className="flex justify-between items-center">
        <div className="text-lg font-bold">⚙️ 配置</div>
        <div className="text-sm text-gray-500">
          v
          {version}
        </div>
      </div>
      <Divider size="small" />
      <Form
        form={form}
        layout="horizontal"
        size="middle"
        onValuesChange={(_, allValues) => {
          handleFormChange(allValues)
        }}
      >
        <Form.Item label="搜索引擎" name="searchEngine">
          <Select
            options={SEARCH_ENGINE_OPTIONS}
            placeholder="请选择搜索引擎"
          />
        </Form.Item>
      </Form>
    </div>
  )
}

export default IndexPopup
