import { ArrowLeftOutlined, DeleteFilled, EditFilled } from "@ant-design/icons"
import { Button, Modal } from "antd"
import { useNavigate, useParams } from "react-router-dom"
import { QueryPATH } from "../../../components"
import { useCookies } from "react-cookie"
import { Delete, GetById } from "../../../service"
import { useState } from "react"
import {useQueryClient } from "@tanstack/react-query"
import Groups from "../Groups/Groups"

const StacksMore = () => {
  const navigate = useNavigate()
  const { stackId } = useParams()
  const [cookies] = useCookies(['token'])
  const [delModal, setDelModal] = useState<boolean>(false)
  const queryClient = useQueryClient()
  
  // Stack Get By Id
  const {data:moreInfo = {}, isLoading} = GetById(stackId, cookies.token, QueryPATH.stacksMore, "/stacks")
  // Stack Delete
  const {mutate:DeleteStack,isPending} = Delete(cookies.token, `/stacks/${stackId}`, navigate, queryClient, QueryPATH.stacks)
  return (
    <div className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <Button onClick={() => navigate(-1)} type="dashed" icon={<ArrowLeftOutlined />}></Button>
          <h2 className="font-bold text-[25px]">{isLoading ? "Loading..." :moreInfo.name}</h2>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setDelModal(true)} className="bg-red-500!" type="primary" size="large" icon={<DeleteFilled />}></Button>
          <Button onClick={() => navigate("update")} size="large" type="primary" icon={<EditFilled />}>Tahrirlash</Button>
        </div>
      </div>
      <div className="w-[50%] mt-5 space-y-3 p-5 rounded-xl border border-slate-500">
        <div className="text-[18px] font-bold">
          <span className="text-[#8f5c28]">#ID:</span>
          <strong>{stackId}</strong>
        </div>
        <div className="text-[18px] font-bold">
          <span className="text-[#8f5c28]">Nomi:</span>
          <strong>{moreInfo.name}</strong>
        </div>
        <div className="text-[18px] font-bold">
          <span className="text-[#8f5c28]">Ma'lumot:</span>
          <strong>{moreInfo.description}</strong>
        </div>
        <div className="text-[18px] font-bold">
          <span className="text-[#8f5c28]">Yaratilingan vaqt:</span>
          <strong>{moreInfo.createdAt}</strong>
        </div>
        <div className="text-[18px] font-bold">
          <span className="text-[#8f5c28]">O'zgartirilgan vaqt:</span>
          <strong>{moreInfo.updatedAt}</strong>
        </div>
      </div>
      <Modal confirmLoading={isPending} onOk={() => DeleteStack()} okText="O'chirish" cancelText="Bekor qilish" open={delModal} onCancel={() => setDelModal(false)} title="O'chirmoqchimisiz?"></Modal>
      {/* Groups logic */}
      <Groups stackPropId={Number(stackId)} title={`${moreInfo.name}/guruxlar`}/>
    </div>
  )
}

export default StacksMore