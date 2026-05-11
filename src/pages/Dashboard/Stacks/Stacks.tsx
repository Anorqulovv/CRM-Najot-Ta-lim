import { Input } from "antd"
import { SearchOutlined } from "@ant-design/icons"
import { Caption, CustomTable, QueryPATH } from "../../../components"
import { useCookies } from "react-cookie"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { GetAll } from "../../../service"
import { debounce } from "../../../hooks"
import { useCurrentUser } from "../../../hooks/useCurrentUser"

const Stacks = () => {
  const navigate = useNavigate()
  const [cookies] = useCookies(['accessToken'])
  const [search, setSearch] = useState<string>("")
  const name = debounce(search, 1000)
  const currentUser = useCurrentUser()
  const canCreate = currentUser?.role === "SUPERADMIN" || currentUser?.role === "ADMIN"

  const columns = [
    { title: 'ID', dataIndex: 'key' },
    { title: "Yo'nalish nomi", dataIndex: 'name' },
    { title: 'Kurs haqida', dataIndex: 'description' },
    { title: 'Batafsil', dataIndex: 'action' },
  ]

  const { data: stacks = [], isLoading } = GetAll(
    QueryPATH.directions,
    [name],
    cookies.accessToken,
    "/directions",
    { name },
    navigate
  )

  return (
    <div style={{ padding: '24px 24px' }}>
      {/* Page header */}
      <Caption count={stacks.length} title="Yo'nalishlar" hideCreate={!canCreate} />

      {/* Search bar */}
      <div style={{ marginBottom: 18 }}>
        <Input
          prefix={<SearchOutlined style={{ color: '#c8864a', fontSize: 14 }} />}
          onChange={(e) => setSearch(e.target.value)}
          size="large"
          placeholder="Yo'nalish qidirish..."
          allowClear
          style={{
            width: 320,
            borderRadius: 9,
            borderColor: '#e5d8cc',
            background: '#fff',
            fontSize: 13.5,
          }}
        />
      </div>

      {/* Table */}
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid rgba(0,0,0,0.07)',
          overflow: 'hidden',
        }}
      >
        <CustomTable loading={isLoading} columns={columns} data={stacks} />
      </div>
    </div>
  )
}

export default Stacks