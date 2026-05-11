import { Input, Button, Table, Tag, Tooltip, Modal } from "antd"
import { SearchOutlined, PlusCircleOutlined, EditOutlined, DeleteOutlined, BankOutlined, PhoneOutlined, EnvironmentOutlined } from "@ant-design/icons"
import { useCookies } from "react-cookie"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { GetAll, Delete } from "../../../service"
import { debounce } from "../../../hooks"
import { useQueryClient } from "@tanstack/react-query"
import { useCurrentUser } from "../../../hooks/useCurrentUser"
import { Caption } from "../../../components"

const ACCENT = '#8f5c28'
const ACCENT_GRADIENT = 'linear-gradient(135deg, #7a4520, #c8864a)'

const QueryBranches = "branches"

const Branches = () => {
  const navigate = useNavigate()
  const [cookies] = useCookies(['accessToken'])
  const [search, setSearch] = useState("")
  const [delModal, setDelModal] = useState<{ open: boolean; id?: number; name?: string }>({ open: false })
  const name = debounce(search, 600)
  const queryClient = useQueryClient()
  const currentUser = useCurrentUser()
  const isSuperAdmin = currentUser?.role === "SUPERADMIN"

  const { data: branches = [], isLoading } = GetAll(
    QueryBranches, [name], cookies.accessToken, "/branches", { name }, navigate
  )

  const { mutate: DeleteBranch, isPending: delLoading } = Delete(
    cookies.accessToken, `/branches/${delModal.id}`, navigate, queryClient, QueryBranches
  )

  const columns = [
    {
      title: "ID", dataIndex: "id", key: "id", width: 60,
      render: (id: number) => <Tag color="orange" style={{ borderRadius: 6, fontWeight: 700 }}>#{id}</Tag>
    },
    {
      title: "Filial nomi", dataIndex: "name", key: "name",
      render: (name: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 14, color: '#1a1a1a' }}>
          <BankOutlined style={{ color: ACCENT }} /> {name}
        </div>
      )
    },
    {
      title: "Manzil", dataIndex: "address", key: "address",
      render: (addr: string) => addr
        ? <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#555' }}><EnvironmentOutlined style={{ color: ACCENT }} />{addr}</span>
        : <span style={{ color: '#ccc' }}>—</span>
    },
    {
      title: "Telefon", dataIndex: "phone", key: "phone",
      render: (phone: string) => phone
        ? <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#555' }}><PhoneOutlined style={{ color: ACCENT }} />{phone}</span>
        : <span style={{ color: '#ccc' }}>—</span>
    },
    {
      title: "Holat", dataIndex: "isActive", key: "isActive", width: 90,
      render: (v: boolean) => <Tag color={v ? "green" : "red"} style={{ borderRadius: 6 }}>{v ? "Faol" : "Nofaol"}</Tag>
    },
    ...(isSuperAdmin ? [{
      title: "Amallar", key: "actions", width: 100,
      render: (r: any) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <Tooltip title="Tahrirlash">
            <Button size="small" type="primary" icon={<EditOutlined />}
              style={{ background: ACCENT_GRADIENT, border: 'none', borderRadius: 7 }}
              onClick={() => navigate(`/branches/${r.id}/update`)} />
          </Tooltip>
          <Tooltip title="O'chirish">
            <Button size="small" danger icon={<DeleteOutlined />} style={{ borderRadius: 7 }}
              onClick={() => setDelModal({ open: true, id: r.id, name: r.name })} />
          </Tooltip>
        </div>
      )
    }] : [])
  ]

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Caption count={branches.length} title="Filiallar"/>

      {/* Search */}
      <div style={{ marginBottom: 18 }}>
        <Input prefix={<SearchOutlined style={{ color: '#c8864a' }} />}
          onChange={e => setSearch(e.target.value)} size="large" placeholder="Filial nomini qidirish..."
          allowClear style={{ maxWidth: 360, borderRadius: 9, borderColor: '#e5d8cc' }} />
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <Table
          loading={isLoading}
          dataSource={branches.map((b: any) => ({ ...b, key: b.id }))}
          columns={columns}
          pagination={{ pageSize: 15, showSizeChanger: true, showTotal: t => `Jami ${t} ta` }}
          size="middle"
        />
      </div>

      {/* Delete modal */}
      <Modal open={delModal.open} onCancel={() => setDelModal({ open: false })}
        onOk={() => { DeleteBranch(); setDelModal({ open: false }) }}
        confirmLoading={delLoading} okText="Ha, o'chirish" cancelText="Bekor qilish"
        okButtonProps={{ danger: true, style: { borderRadius: 8 } }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
        title={<span style={{ color: '#dc2626', fontWeight: 600 }}>O'chirishni tasdiqlang</span>}
        centered width={380}>
        <p style={{ color: '#555', fontSize: 13.5, margin: '12px 0' }}>
          <strong>"{delModal.name}"</strong> filialini o'chirmoqchimisiz? Bu filialga biriktirilgan foydalanuvchilar filialsiz qoladi.
        </p>
      </Modal>
    </div>
  )
}

export default Branches
