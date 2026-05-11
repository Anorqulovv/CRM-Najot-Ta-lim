import { useState } from "react"
import { Input, Tag, Table, Tooltip } from "antd"
import { useCookies } from "react-cookie"
import { useNavigate } from "react-router-dom"
import {
  UserOutlined, TeamOutlined, PhoneOutlined, IdcardOutlined,
  SearchOutlined, CheckCircleFilled, CloseCircleFilled, LinkOutlined,
} from "@ant-design/icons"
import { GetAll } from "../../../service"
import { debounce } from "../../../hooks"

const C = {
  accent: '#8f5c28',
  accentGradient: 'linear-gradient(135deg, #7a4520, #c8864a)',
}

const IdBadge = ({ label, value, color }: { label: string, value: any, color: string }) => (
  <Tooltip title={label}>
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: color, borderRadius: 6, padding: "2px 8px",
      fontSize: 11, fontWeight: 700, color: "#fff", marginRight: 4, marginBottom: 3,
    }}>
      <IdcardOutlined style={{ fontSize: 10 }} />
      {label}: {value ?? "—"}
    </span>
  </Tooltip>
)

const StudentsParents = () => {
  const [cookies] = useCookies(["accessToken"])
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const debouncedSearch = debounce(search, 600)

  const { data: rawData = [], isPending } = GetAll(
    "students-with-parents", [], cookies.accessToken, "/students/with-parents", {}, navigate
  )

  const data = rawData.filter((s: any) => {
    if (!debouncedSearch) return true
    const q = debouncedSearch.toLowerCase()
    return (
      s.fullName?.toLowerCase().includes(q) ||
      s.phone?.toLowerCase().includes(q) ||
      s.parentFullName?.toLowerCase().includes(q) ||
      s.parentPhone?.toLowerCase().includes(q) ||
      String(s.studentId).includes(q) ||
      String(s.studentUserId).includes(q) ||
      String(s.parentId ?? "").includes(q) ||
      String(s.parentUserId ?? "").includes(q)
    )
  })

  const withParent = data.filter((s: any) => s.parentId).length
  const withoutParent = data.length - withParent

  const columns = [
    {
      title: "O'quvchi", key: "student", width: 240,
      render: (r: any) => (
        <div>
          <div style={{ fontWeight: 700, color: '#1a1a1a', fontSize: 13.5 }}>
            {r.fullName}
            {r.isActive
              ? <CheckCircleFilled style={{ color: "#16a34a", marginLeft: 6, fontSize: 11 }} />
              : <CloseCircleFilled style={{ color: "#dc2626", marginLeft: 6, fontSize: 11 }} />
            }
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6b5742', fontSize: 12, marginTop: 2 }}>
            <PhoneOutlined style={{ fontSize: 11 }} /> {r.phone}
          </div>
          {r.groupName !== "—" && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#2563eb', fontSize: 11, marginTop: 2 }}>
              <TeamOutlined style={{ fontSize: 10 }} /> {r.groupName}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "O'quvchi IDlari", key: "studentIds", width: 200,
      render: (r: any) => (
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          <IdBadge label="Student ID" value={r.studentId} color="#8f5c28" />
          <IdBadge label="User ID" value={r.studentUserId} color="#b45309" />
          {r.cardId && <IdBadge label="Card" value={r.cardId} color="#92400e" />}
          {r.groupId && <IdBadge label="Group ID" value={r.groupId} color="#6b5742" />}
        </div>
      ),
    },
    {
      title: "Ota-ona", key: "parent", width: 240,
      render: (r: any) => {
        if (!r.parentId) return <span style={{ fontSize: 12, color: '#9c8572', fontStyle: 'italic' }}>Ota-ona biriktirilmagan</span>
        return (
          <div>
            <div style={{ fontWeight: 700, color: '#1a1a1a', fontSize: 13.5 }}>{r.parentFullName ?? "—"}</div>
            {r.parentPhone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6b5742', fontSize: 12, marginTop: 2 }}>
                <PhoneOutlined style={{ fontSize: 11 }} /> {r.parentPhone}
              </div>
            )}
            {r.parentTelegramId && (
              <div style={{ fontSize: 11, color: '#2563eb', marginTop: 2 }}>Telegram: {r.parentTelegramId}</div>
            )}
          </div>
        )
      },
    },
    {
      title: "Ota-ona IDlari", key: "parentIds", width: 180,
      render: (r: any) => {
        if (!r.parentId) return <Tag color="default" style={{ borderRadius: 6, fontSize: 11 }}>Yo'q</Tag>
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            <IdBadge label="Parent ID" value={r.parentId} color="#16a34a" />
            <IdBadge label="User ID" value={r.parentUserId} color="#15803d" />
          </div>
        )
      },
    },
    {
      title: "", key: "action", width: 48,
      render: (r: any) => (
        <Tooltip title="O'quvchi sahifasiga o'tish">
          <span onClick={() => navigate(`/students/${r.studentId}`)}
            style={{ cursor: 'pointer', color: C.accent, fontSize: 15 }}>
            <LinkOutlined />
          </span>
        </Tooltip>
      ),
    },
  ]

  return (
    <div style={{ padding: '24px 24px' }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
        <div style={{ width: 42, height: 42, borderRadius: 11, background: C.accentGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20 }}>
          <UserOutlined />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: '#1a1a1a' }}>O'quvchilar va ota-onalar</h1>
          <span style={{ color: '#8b7355', fontSize: 12 }}>Barcha o'quvchilar va ularning ota-onalari</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 22, flexWrap: 'wrap' }}>
        {[
          { label: "Jami o'quvchilar", value: data.length, color: '#8f5c28', bg: '#fdf6f0', border: '#f0d8c0' },
          { label: "Ota-ona biriktirilgan", value: withParent, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
          { label: "Ota-ona yo'q", value: withoutParent, color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
        ].map((stat) => (
          <div key={stat.label} style={{
            flex: '1 1 150px', background: stat.bg, borderRadius: 12,
            padding: '14px 18px', border: `1px solid ${stat.border}`,
          }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: 12.5, color: '#6b5742', marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 18 }}>
        <Input
          size="large"
          prefix={<SearchOutlined style={{ color: '#c8864a' }} />}
          placeholder="Ism, telefon, ID bo'yicha qidirish..."
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ maxWidth: 400, borderRadius: 9, borderColor: '#e5d8cc', background: '#fff' }}
        />
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.07)' }}>
        <Table
          loading={isPending}
          dataSource={data.map((s: any) => ({ ...s, key: s.studentId }))}
          columns={columns}
          pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `Jami ${t} ta` }}
          scroll={{ x: 900 }}
          rowStyle={(r: any) => ({ background: r.parentId ? '#fff' : '#fffbeb' })}
          size="middle"
        />
      </div>
    </div>
  )
}

export default StudentsParents