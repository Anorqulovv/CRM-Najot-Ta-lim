import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState, type SubmitEvent } from "react"
import { useCookies } from "react-cookie"
import { useNavigate, useParams } from "react-router-dom"
import { Create, GetById, Update } from "../../../service"
import { CustomSelect, QueryPATH } from "../../../components"
import { Button, DatePicker, Input, Select } from "antd"
import { ArrowLeftOutlined, PlusCircleOutlined } from "@ant-design/icons"
import dayjs, { Dayjs } from "dayjs"

const GroupsCrud = () => {
  const { groupId, stackId:stackPathId,teacherId:teacherPathId } = useParams()
  const navigate = useNavigate()
  const [cookies] = useCookies(['token'])
  const queryClient = useQueryClient()

  const [name, setName] = useState<string>("")
  const [stackId, setStackId] = useState<number | null>(stackPathId ? Number(stackPathId) : null)
  const [teacherId, setTeacherId] = useState<number | null>(teacherPathId ? Number(teacherPathId): null)
  const [startDate, setStartDate] = useState<Dayjs | null>(null)
  const [endDate, setEndDate] = useState<Dayjs | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  const dateFormat = 'YYYY-MM-DD';

  // Create Groups
  const { mutate: GroupCreate, isPending: createLoading } = Create(cookies.token, "/groups", navigate, queryClient, QueryPATH.groups)

  // Update
  const { mutate: GroupUpdate, isPending: updateLoading } = Update(cookies.token, `/groups/${groupId}`, navigate, queryClient, QueryPATH.groupsMore, QueryPATH.groups)

  // Submit FN
  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = { name, stackId, teacherId, startDate, endDate, status }
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    groupId? GroupUpdate(data) : GroupCreate(data)
  }

  // Get By Id for Update
  const { data: moreInfo = {} } = groupId ? GetById(groupId, cookies.token, QueryPATH.groupsMore, "/groups") : {}
  useEffect(() => {
    if (moreInfo && groupId) {
      setName(moreInfo.name)
      setStackId(moreInfo.stackId)
      setTeacherId(moreInfo.teacherId)
      setStartDate(moreInfo.startDate ? dayjs(moreInfo.startDate) : null)
      setEndDate(moreInfo.endDate ? dayjs(moreInfo.endDate) : null)
      setStatus(moreInfo.status)
    } 
  }, [moreInfo,groupId])
  return (
    <form onSubmit={handleSubmit} className="p-5">
      <div className="flex items-center justify-between">
        <Button onClick={() => navigate(-1)} type="dashed" icon={<ArrowLeftOutlined />}></Button>
        <h1 className="font-bold text-[25px]">Gurux {groupId ? "tahrirlash" : "qo'shish"}</h1>
        <Button loading={groupId ? updateLoading : createLoading} htmlType="submit" icon={<PlusCircleOutlined />} size="large" type="primary">Saqlash</Button>
      </div>
      <div className="flex items-center justify-center gap-5 m-5">
        <div className="w-[45%] flex flex-col gap-3">
          <label className="flex flex-col w-full! gap-1">
            <span className="text-[#8f5c28] pl-1">Gurux nomini kiriting:</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="w-full" allowClear size="large" placeholder="Gurux nomi" />
          </label>
          <label className="flex flex-col w-full! gap-1">
            <span className="text-[#8f5c28] pl-1">Yo'nalish tanlang:</span>
            <CustomSelect disabled={stackPathId ? true : false} extraClass="w-full!" URL="/stacks" placeholder="Yo'nalish tanlang" queryKey={QueryPATH.stacks} setValue={setStackId} value={stackId} />
          </label>
          <label className="flex flex-col w-full! gap-1">
            <span className="text-[#8f5c28] pl-1">Ustoz tanlang:</span>
            <CustomSelect disabled={teacherPathId ? true : false} extraClass="w-full!" URL="/teachers" placeholder="Ustoz tanlang" queryKey={QueryPATH.teachers} setValue={setTeacherId} value={teacherId} params={{stackId}}/>
          </label>
        </div>
        <div className="w-[45%] flex flex-col gap-3">
          <label className="flex flex-col w-full! gap-1">
            <span className="text-[#8f5c28] pl-1">Boshlanish vaqti:</span>
            <DatePicker value={startDate} format={dateFormat} onChange={(date) => setStartDate(date)} size="large" className="w-full!" placeholder="Boshlanish vaqti" />
          </label>
          <label className="flex flex-col w-full! gap-1">
            <span className="text-[#8f5c28] pl-1">Tugash tanlang:</span>
            <DatePicker value={endDate} format={dateFormat} onChange={(date) => setEndDate(date)} size="large" className="w-full!" placeholder="Tugash vaqti" />
          </label>
          <label className="flex flex-col w-full! gap-1">
            <span className="text-[#8f5c28] pl-1">Ustoz tanlang:</span>
            <Select
              value={status}
              onChange={(e) => setStatus(e)}
              className={`w-full!`}
              allowClear
              size="large"
              showSearch={{ optionFilterProp: 'label' }}
              placeholder={"Status tanlagn"}
              options={[
                { label: "active", value: "active" },
                { label: "planned", value: "planned" },
                { label: "archived", value: "archived" },
              ]} />
          </label>
        </div>
      </div>
    </form>
  )
}

export default GroupsCrud