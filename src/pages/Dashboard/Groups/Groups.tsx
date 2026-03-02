import { Input } from "antd"
import { Caption, CustomSelect, CustomTable, QueryPATH } from "../../../components"
import { useEffect, useState, type FC } from "react"
import { GetAll } from "../../../service"
import { useCookies } from "react-cookie"
import { useNavigate } from "react-router-dom"
import { debounce } from "../../../hooks"

interface GroupType {
  title:string,
  stackPropId?:number | null,
  teacherPropId?: number | undefined | null;
}

const Groups:FC<GroupType> = ({title, stackPropId, teacherPropId}) => {
  const [cookies] = useCookies(['token'])
  const navigate = useNavigate()
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function returnFn(value: any) {
    value.stackName = value.stack ? value?.stack?.name : "➖"
    value.teacherName = `${value?.teacher?.firstName} ${value?.teacher?.lastName}`
  }

  const columns = [
    { title: "ID", dataIndex: "key" },
    { title: "Nomi", dataIndex: "name" },
    { title: "Yo'nalish nomi", dataIndex: "stackName" },
    { title: "Ustoz", dataIndex: "teacherName" },
    { title: "Holat", dataIndex: "status" },
    { title: "Batafsil", dataIndex: "action" },
  ]
  
  // Search
  const [search, setSearch] = useState<string>("")
  const name = debounce(search, 1000)
  // Stack Filter
  const [stackId, setStackId] = useState<number | null>(stackPropId ? stackPropId : null)
  // Filter Teacher
  const [teacherId, setTeacherId] = useState<number | null>(null)

  useEffect(() => {
    setTeacherId(teacherPropId ?? null);
  }, [teacherPropId]);

  // Get All
  const { data: groups = [], isPending } = GetAll(QueryPATH.groups, [name, stackId, teacherId], cookies.token, "/groups", {name, stackId, teacherId}, navigate, returnFn)
  return (
    <div className="p-5">
      <Caption title={title} count={5} />
      <div className="flex items-center gap-5 my-5">
        <Input onChange={(e) => setSearch(e.target.value)} className="w-100!" size="large" allowClear placeholder="Qidirish..." />
        <CustomSelect disabled={stackPropId ? true : false} placeholder="Yo'nalish tanlang" URL="/stacks" queryKey={QueryPATH.stacks} setValue={setStackId} value={stackId} />
        <CustomSelect disabled={teacherPropId ? true : false} params={stackPropId ? {stackId:stackPropId} : {}} placeholder="Ustoz tanlang" URL="/teachers" queryKey={QueryPATH.teachers} setValue={setTeacherId} value={teacherId} />
      </div>
      <CustomTable loading={isPending} columns={columns} data={groups} />
    </div>
  )
}

export default Groups