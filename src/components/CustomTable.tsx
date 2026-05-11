import React from 'react';
import { Table } from 'antd';

const CustomTable: React.FC<{
  columns: any[]
  data: any[]
  loading: boolean
}> = ({ columns, data, loading }) => {
  // Find if there's a navigate function embedded in action column
  const hasAction = data?.[0]?.action !== undefined

  const getRowNavigate = (record: any) => {
    if (!record?.action) return undefined
    // Extract onClick from the action button props
    try {
      return record.action?.props?.onClick
    } catch {
      return undefined
    }
  }

  return (
    <Table
      loading={loading}
      columns={columns}
      dataSource={data}
      showSorterTooltip={{ target: 'sorter-icon' }}
      onRow={(record) => {
        const onClick = getRowNavigate(record)
        if (!onClick) return {}
        return {
          onClick,
          style: { cursor: 'pointer' },
        }
      }}
    />
  )
}

export default CustomTable;
