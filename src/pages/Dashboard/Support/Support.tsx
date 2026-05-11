import { Input } from "antd"
import { SearchOutlined } from "@ant-design/icons"
import { Caption, CustomSelect, CustomTable, QueryPATH } from "../../../components"
import { useState, type FC } from "react"
import { GetAll } from "../../../service"
import { useCookies } from "react-cookie"
import { useNavigate } from "react-router-dom"
import { debounce } from "../../../hooks"

const INPUT_STYLE: React.CSSProperties = {
  borderRadius: 9, borderColor: '#e5d8cc', background: '#fff', fontSize: 13.5,
}

interface SupportProps {
  title: string
  stackPropId?: number | null
}

const Supports: FC<SupportProps> = ({ stackPropId }) => {
  const [cookies] = useCookies(["accessToken"])
  const navigate = useNavigate()

  const returnFn = (value: any) => ({
    ...value,
    key: value.id,
    fullName: value.fullName ?? "➖",
    username: value.username ?? "➖",
    stackName: value.direction?.name ?? "➖",
  })

  const columns = [
    { title: "ID", dataIndex: "key", width: 80 },
    { title: "To'liq ismi", dataIndex: "fullName" },
    { title: "Username", dataIndex: "username" },
    { title: "Telefon", dataIndex: "phone" },
    { title: "Yo'nalish", dataIndex: "stackName", render: (t: string) => t || "➖" },
    { title: "Batafsil", dataIndex: "action", align: "center" as const, width: 120 },
  ]

  const [search, setSearch] = useState<string>("")
  const [directionId, setDirectionId] = useState<number | null>(stackPropId ? Number(stackPropId) : null)
  const [branchId, setBranchId] = useState<number | null>(null)
  const debouncedSearch = debounce(search, 800)

  const { data: supports = [], isPending } = GetAll(
    QueryPATH.support, [debouncedSearch, directionId, branchId], cookies.accessToken, "/supports",
    { name: debouncedSearch || undefined, directionId: directionId || undefined, branchId: branchId || undefined },
    navigate, returnFn
  )

  return (
    <div style={{ padding: '24px 24px' }}>
      <Caption count={supports.length} title="Yordamchi Ustoz" />

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <Input
          onChange={(e) => setSearch(e.target.value)}
          prefix={<SearchOutlined style={{ color: '#c8864a' }} />}
          size="large" allowClear placeholder="Ism bo'yicha qidirish..."
          style={{ ...INPUT_STYLE, width: 300 }}
        />
        <CustomSelect
          disabled={!!stackPropId}
          placeholder="Yo'nalish tanlang"
          URL="/directions"
          queryKey={QueryPATH.directions}
          setValue={(value: any) => setDirectionId(value ? Number(value) : null)}
          value={directionId}
        />
        <CustomSelect
          placeholder="Filial tanlang"
          URL="/branches"
          queryKey={QueryPATH.branches}
          setValue={(value: any) => setBranchId(value ? Number(value) : null)}
          value={branchId}
        />
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <CustomTable loading={isPending} columns={columns} data={supports} />
      </div>
    </div>
  )
}

export default Supports