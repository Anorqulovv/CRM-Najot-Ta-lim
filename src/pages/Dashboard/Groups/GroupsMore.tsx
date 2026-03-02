import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useCookies } from "react-cookie"
import { useNavigate, useParams } from "react-router-dom"
import { Delete, GetById } from "../../../service"
import { Caption, CustomTable, QueryPATH } from "../../../components"
import { Button, Modal } from "antd"
import { ArrowLeftOutlined, DeleteFilled, EditFilled } from "@ant-design/icons"

const GroupsMore = () => {
    const navigate = useNavigate()
    const { groupId } = useParams()
    const [cookies] = useCookies(['token'])
    const [delModal, setDelModal] = useState<boolean>(false)
    const queryClient = useQueryClient()

    // Stack Get By Id
    const { data: moreInfo = {}, isLoading } = GetById(groupId, cookies.token, QueryPATH.groupsMore, "/groups")
    // Stack Delete
    const { mutate: DeleteStack, isPending } = Delete(cookies.token, `/groups/${groupId}`, navigate, queryClient, QueryPATH.groups)

    // Group Students
    const column = [
        {title:"ID", dataIndex:"id"},
        {title:"Ismi", dataIndex:"firstName"},
        {title:"Familiya", dataIndex:"lastName"},
        {title:"Email", dataIndex:"email"},
        {title:"Telefon raqam", dataIndex:"phone"},
        {title:"Batafsil", dataIndex:"actions"},
    ]
    return (
        <div className="p-5">
            <div className="flex items-center justify-between">
                <div className="flex gap-2 items-center">
                    <Button onClick={() => navigate(-1)} type="dashed" icon={<ArrowLeftOutlined />}></Button>
                    <h2 className="font-bold text-[25px]">{isLoading ? "Loading..." : moreInfo.name}</h2>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setDelModal(true)} className="bg-red-500!" type="primary" size="large" icon={<DeleteFilled />}></Button>
                    <Button onClick={() => navigate("update")} size="large" type="primary" icon={<EditFilled />}>Tahrirlash</Button>
                </div>
            </div>
            <div className="flex justify-center gap-5 mt-5">
                <div className="w-[50%] space-y-3 p-5 rounded-xl border border-slate-500">
                    <div className="text-[18px] font-bold">
                        <span className="text-[#8f5c28]">#ID:</span>
                        <strong>{groupId}</strong>
                    </div>
                    <div className="text-[18px] font-bold">
                        <span className="text-[#8f5c28]">Nomi:</span>
                        <strong>{moreInfo.name}</strong>
                    </div>
                    <div className="text-[18px] font-bold">
                        <span className="text-[#8f5c28]">Yo'nalish nomi:</span>
                        <strong>{moreInfo?.stack?.name}</strong>
                    </div>
                    <div className="text-[18px] font-bold">
                        <span className="text-[#8f5c28]">Ustoz:</span>
                        <strong>{moreInfo?.teacher?.firstName} {moreInfo?.teacher?.lastName}</strong>
                    </div>
                </div>
                <div className="w-[50%] space-y-3 p-5 rounded-xl border border-slate-500">
                    <div className="text-[18px] font-bold">
                        <span className="text-[#8f5c28]">Boshlangan vaqt:</span>
                        <strong>{moreInfo.startDate}</strong>
                    </div>
                    <div className="text-[18px] font-bold">
                        <span className="text-[#8f5c28]">Tugash vaqt:</span>
                        <strong>{moreInfo.endDate}</strong>
                    </div>
                </div>
            </div>
            <Modal confirmLoading={isPending} onOk={() => DeleteStack()} okText="O'chirish" cancelText="Bekor qilish" open={delModal} onCancel={() => setDelModal(false)} title="O'chirmoqchimisiz?"></Modal>
            <div className="p-5 flex flex-col gap-5 bg-slate-300 rounded-xl mt-5">
                <Caption title={`${moreInfo.name}/o'quvchilari`} count={5}/>
                <CustomTable loading={false} columns={column} data={moreInfo.students}/>
            </div>
        </div>
    )
}

export default GroupsMore