import { Input } from "antd"
import { Caption, CustomTable, QueryPATH } from "../../../components"
import { debounce } from "../../../hooks"
import { useCookies } from "react-cookie"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { GetAll } from "../../../service"

const Stacks = () => {
  const navigate = useNavigate()
  const [cookies] = useCookies(['token'])
  const [search, setSearch] = useState<string>("")
  const name = debounce(search, 1000)
  const columns = [
    { title: 'ID', dataIndex: 'key'},
    { title: "Yo'nalish nomi", dataIndex: 'name'},
    { title: 'Kurs haqida', dataIndex: 'description'},
    { title: 'Batafsil', dataIndex: 'action'},
  ];
  const { data: stacks = [], isLoading } = GetAll(QueryPATH.stacks, [name], cookies.token, "/stacks", {name}, navigate)
  return (
    <div className="p-5">
      <Caption title="Yonalishlar" count={stacks.length} />
      <Input onChange={(e) => setSearch(e.target.value)} className="w-80! my-5" size="large" placeholder="Qidirish..." allowClear />
      <CustomTable loading={isLoading} columns={columns} data={stacks} />
    </div>

  )
}

export default Stacks