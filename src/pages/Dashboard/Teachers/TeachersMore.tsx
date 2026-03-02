import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useCookies } from "react-cookie"
import { useNavigate, useParams } from "react-router-dom"
import { Delete, GetById } from "../../../service"
import {QueryPATH } from "../../../components"
import { Button, Modal } from "antd"
import { ArrowLeftOutlined, DeleteFilled, EditFilled } from "@ant-design/icons"
import Groups from "../Groups/Groups"

const TeachersMore = () => {
    const navigate = useNavigate()
    const { teacherId } = useParams()
    const [cookies] = useCookies(['token'])
    const [delModal, setDelModal] = useState<boolean>(false)
    const queryClient = useQueryClient()

    // Stack Get By Id
    const { data: moreInfo = {}, isLoading } = GetById(teacherId, cookies.token, QueryPATH.teachersMore, "/teachers")
    // Stack Delete
    const { mutate: DeleteStack, isPending } = Delete(cookies.token, `/teachers/${teacherId}`, navigate, queryClient, QueryPATH.teachers)

    return (
        <div className="p-5">
            <div className="flex items-center justify-between">
                <div className="flex gap-2 items-center">
                    <Button onClick={() => navigate(-1)} type="dashed" icon={<ArrowLeftOutlined />}></Button>
                    <h2 className="font-bold text-[25px]">{isLoading ? "Loading..." : `${moreInfo.firstName} ${moreInfo.lastName}`}</h2>
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
                        <strong>{teacherId}</strong>
                    </div>
                    <div className="text-[18px] font-bold">
                        <span className="text-[#8f5c28]">Ismi:</span>
                        <strong>{moreInfo.firstName}</strong>
                    </div>
                    <div className="text-[18px] font-bold">
                        <span className="text-[#8f5c28]">Familiyasi:</span>
                        <strong>{moreInfo.lastName}</strong>
                    </div>
                    <div className="text-[18px] font-bold">
                        <span className="text-[#8f5c28]">Rasmi:</span>
                        <strong>{moreInfo?.image ? moreInfo.image : "Yo'q"}</strong>
                    </div>
                    <div className="text-[18px] font-bold">
                        <span className="text-[#8f5c28]">Email:</span>
                        <strong>{moreInfo.email}</strong>
                    </div>
                </div>
                <div className="w-[50%] space-y-3 p-5 rounded-xl border border-slate-500">
                    <div className="text-[18px] font-bold">
                        <span className="text-[#8f5c28]">Telefon Raqami:</span>
                        <strong>{moreInfo.phone}</strong>
                    </div>
                    <div className="text-[18px] font-bold">
                        <span className="text-[#8f5c28]">StackId:</span>
                        <strong>{moreInfo.stackId}</strong>
                    </div>
                    <div className="text-[18px] font-bold">
                        <span className="text-[#8f5c28]">Yo'nalishi:</span>
                        <strong>{moreInfo.stack?.name}</strong>
                    </div>
                    <div className="text-[18px] font-bold">
                        <span className="text-[#8f5c28]">Yaratilgan vaqt:</span>
                        <strong>{moreInfo.createdAt}</strong>
                    </div>
                    <div className="text-[18px] font-bold">
                        <span className="text-[#8f5c28]">Yangilangan vaqt:</span>
                        <strong>{moreInfo.updatedAt}</strong>
                    </div>
                </div>
            </div>
            <Modal confirmLoading={isPending} onOk={() => DeleteStack()} okText="O'chirish" cancelText="Bekor qilish" open={delModal} onCancel={() => setDelModal(false)} title="O'chirmoqchimisiz?"></Modal>
            <div className="p-5 flex flex-col gap-5 bg-slate-300 rounded-xl mt-5">
                <Groups title={`Guruhlar`} stackPropId={0} teacherPropId={moreInfo.id}/>
            </div>
        </div>
    )
}

export default TeachersMore