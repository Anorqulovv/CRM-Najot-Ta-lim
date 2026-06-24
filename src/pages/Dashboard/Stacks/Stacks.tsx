import { Input } from "antd"
import { SearchOutlined, ApartmentOutlined } from "@ant-design/icons"
import { Caption, CustomTable, QueryPATH } from "../../../components"
import { useCookies } from "react-cookie"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { GetAll } from "../../../service"
import { debounce } from "../../../hooks"
import { useCurrentUser } from "../../../hooks/useCurrentUser"

const Stacks = () => {
  const navigate = useNavigate()
  const [cookies] = useCookies(["accessToken"])
  const [search, setSearch] = useState("")
  const name = debounce(search, 1000)
  const currentUser = useCurrentUser()

  const canCreate = ["SUPERADMIN", "ADMIN"].includes(currentUser?.role ?? "")

  const columns = [
    { title: "№", dataIndex: "order", width: 70 },
    { title: "Yo'nalish nomi", dataIndex: "name" },
    { title: "Kurs haqida", dataIndex: "description" },
    { title: "Batafsil", dataIndex: "action", width: 110 },
  ]

  const { data: rawStacks = [], isLoading } = GetAll(
    QueryPATH.directions,
    [name],
    cookies.accessToken,
    "/directions",
    { name },
    navigate
  )

  const stacks = rawStacks.map((item: any, index: number) => ({
    ...item,
    order: index + 1,
  }))

  return (
    <div className="p-4 sm:p-5 lg:p-6">
      <Caption count={stacks.length} title="Yo'nalishlar" icon={<ApartmentOutlined />} hideCreate={!canCreate} />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          prefix={<SearchOutlined className="text-[#c8864a]" />}
          onChange={(e) => setSearch(e.target.value)}
          size="large"
          placeholder="Yo'nalish qidirish..."
          allowClear
          className="w-full max-w-full rounded-xl border-[#e5d8cc] bg-white text-[13.5px] sm:max-w-[360px]"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
        <CustomTable loading={isLoading} columns={columns} data={stacks} />
      </div>
    </div>
  )
}

export default Stacks
