import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState, type SubmitEvent } from "react"
import { useCookies } from "react-cookie"
import { useNavigate, useParams } from "react-router-dom"
import { Create, GetById, Update } from "../../../service"
import { QueryPATH } from "../../../components"
import { Button, Input } from "antd"
import { ArrowLeftOutlined, PlusCircleOutlined } from "@ant-design/icons"

const RoomsCrud = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cookies] = useCookies(['token'])
  const queryClient = useQueryClient()

  const [name, setname] = useState<string>("")
  const [capacity, setCapacity] = useState<number>(0)

  // Create Rooms
  const { mutate: RoomCreate, isPending: createLoading } = Create(cookies.token, "/rooms", navigate, queryClient, QueryPATH.rooms)

  // Update
  const { mutate: RoomUpdate, isPending: updateLoading } = Update(cookies.token, `/rooms/${id}`, navigate, queryClient, QueryPATH.rooms, "")

  // Submit FN
  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = { name,capacity}
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    id ? RoomUpdate(data) : RoomCreate(data)
  }

  // Get By Id for Update
  const { data: moreInfo = {} } = id ? GetById(id, cookies.token, QueryPATH.rooms, "/rooms") : {}
  useEffect(() => {
    if (moreInfo && id) {
      setname(moreInfo.name)
      setCapacity(moreInfo.capacity)
    }
  }, [id, moreInfo])
  return (
    <form onSubmit={handleSubmit} className="p-5">
      <div className="flex items-center justify-between">
        <Button onClick={() => navigate(-1)} type="dashed" icon={<ArrowLeftOutlined />}></Button>
        <h1 className="font-bold text-[25px]">Xona {id ? "tahrirlash" : "qo'shish"}</h1>
        <Button loading={id ? updateLoading : createLoading} htmlType="submit" icon={<PlusCircleOutlined />} size="large" type="primary">Saqlash</Button>
      </div>
      <div className="grid grid-cols-2 gap-5 m-5">
        <div className="w-full flex flex-col gap-3">
          <label className="flex flex-col w-full! gap-1">
            <span className="text-[#8f5c28] pl-1">Xona nomi:</span>
            <Input value={name} onChange={(e) => setname(e.target.value)} className="w-full" allowClear size="large" placeholder="Xona" />
          </label>
          <label className="flex flex-col w-full! gap-1">
            <span className="text-[#8f5c28] pl-1">Joylar soni:</span>
            <Input value={capacity} onChange={(e) => setCapacity(Number(e.target.value) || 0)} className="w-full" allowClear size="large" placeholder="Joylar" />
          </label>
        </div>
        
      </div>
    </form>
  )
}

export default RoomsCrud