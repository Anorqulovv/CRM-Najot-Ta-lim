import React from 'react';
import { Table } from 'antd';

const CustomTable: React.FC<{
  columns: any[]
  data: any[]
  loading: boolean
}> = ({ columns, data, loading }) => {
  const getRowNavigate = (record: any) => {
    if (!record?.action) return undefined
    try {
      return record.action?.props?.onClick
    } catch {
      return undefined
    }
  }

  return (
    <div className="crm-responsive-table">
      <Table
        loading={loading}
        columns={columns}
        dataSource={data}
        showSorterTooltip={{ target: 'sorter-icon' }}
        scroll={{ x: 'max-content' }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          responsive: true,
        }}
        onRow={(record) => {
          const onClick = getRowNavigate(record)
          if (!onClick) return {}
          return {
            onClick,
            style: { cursor: 'pointer' },
          }
        }}
      />
    </div>
  )
}

export default CustomTable;
