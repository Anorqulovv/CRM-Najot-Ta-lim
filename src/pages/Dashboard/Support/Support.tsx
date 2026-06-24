import { Input } from "antd"
import { SearchOutlined, CustomerServiceOutlined } from "@ant-design/icons"
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
    <div className="p-4 sm:p-5 lg:p-6">
      <Caption count={supports.length} title="Yordamchi Ustoz" icon={<CustomerServiceOutlined />} />

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
        <Input
          onChange={(e) => setSearch(e.target.value)}
          prefix={<SearchOutlined style={{ color: '#c8864a' }} />}
          size="large" allowClear placeholder="Ism bo'yicha qidirish..."
          className="w-full max-w-full rounded-xl border-[#e5d8cc] bg-white text-[13.5px] md:max-w-[320px]"
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
      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
        <CustomTable loading={isPending} columns={columns} data={supports} />
      </div>
    </div>
  )
}

export default Supports