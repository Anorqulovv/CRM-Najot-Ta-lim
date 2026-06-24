import {
    ArrowLeftOutlined, CalendarOutlined, DeleteFilled, EditFilled,
    FieldNumberOutlined, HistoryOutlined, IdcardOutlined, PhoneOutlined,
    SendOutlined, UserOutlined, ApartmentOutlined,
} from "@ant-design/icons"
import { Button, Modal, Skeleton, Tag } from "antd"
import { useNavigate, useParams } from "react-router-dom"
import { QueryPATH } from "../../../components"
import { useCookies } from "react-cookie"
import { GetById, GetAll } from "../../../service"
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { instance } from "../../../hooks"
import Groups from "../Groups/Groups"
import toast from "react-hot-toast"
import { formatDateTime } from "../../../utils/formatDate"

const C = {
    accent: '#8f5c28',
    accentGradient: 'linear-gradient(135deg, #7a4520, #c8864a)',
    accentBg: 'linear-gradient(135deg, #f5ece3 0%, #fdf8f5 100%)',
    accentBorder: '#f5f0eb',
}



const InfoRow = ({ icon, label, value, isLoading }: {
    icon: React.ReactNode, label: string, value: React.ReactNode, isLoading?: boolean
}) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '11px 0', borderBottom: `1px solid ${C.accentBorder}` }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f5ece3', color: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, marginTop: 2 }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 10.5, color: '#bbb', fontWeight: 600, margin: '0 0 3px', letterSpacing: '0.6px', textTransform: 'uppercase' }}>{label}</p>
            {isLoading
                ? <Skeleton.Input active size="small" style={{ width: 160 }} />
                : <div style={{ fontSize: 14.5, fontWeight: 600, color: '#1a1a1a', wordBreak: 'break-word' }}>
                    {value || <span style={{ color: '#ddd', fontWeight: 400 }}>—</span>}
                </div>
            }
        </div>
    </div>
)

const SupportMore = () => {
    const navigate = useNavigate()
    const { supportId } = useParams()
    const [cookies] = useCookies(["accessToken"])
    const [delModal, setDelModal] = useState(false)
    const queryClient = useQueryClient()

    const { data: moreInfo = {}, isLoading } = GetById(supportId, cookies.accessToken, QueryPATH.supportMore, "/supports")
    const { data: directions = [] } = GetAll(QueryPATH.directions, [], cookies.accessToken, "/directions", undefined)
    const [isPending, setIsPending] = useState(false)

    const handleDeleteSupport = async () => {
        if (!supportId) return

        setIsPending(true)

        try {
            await instance(cookies.accessToken).delete(`/supports/${supportId}`)

            setDelModal(false)

            await queryClient.invalidateQueries({ queryKey: [QueryPATH.support] })
            await queryClient.invalidateQueries({ queryKey: [QueryPATH.supportMore] })
            await queryClient.invalidateQueries({ queryKey: [QueryPATH.groups] })

            toast.success("Support o'chirildi")

            navigate("/support", { replace: true })
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? "Supportni o'chirishda xatolik")
        } finally {
            setIsPending(false)
        }
    }

    const getDirectionName = (id: number) => {
        const fromDirections = directions.find((direction: any) => Number(direction.id) === Number(id))
        if (fromDirections?.name) return fromDirections.name

        const fromMoreInfoDirections = moreInfo.directions?.find((direction: any) => Number(direction.id) === Number(id))
        if (fromMoreInfoDirections?.name) return fromMoreInfoDirections.name

        if (Number(moreInfo.direction?.id) === Number(id)) return moreInfo.direction?.name

        return `ID:${id}`
    }

    const initials = moreInfo.fullName
        ? `${moreInfo.fullName.split(" ")[0]?.[0] ?? ""}${moreInfo.fullName.split(" ")[1]?.[0] ?? ""}`
        : null
    const avatar = moreInfo.avatar ?? null

    return (
        <div className="p-4 sm:p-5 lg:p-6">
            {/* Top bar */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Button
                        onClick={() => navigate(-1)}
                        icon={<ArrowLeftOutlined />}
                        size="large"
                        style={{
                            height: 42,
                            borderRadius: 12,
                            border: 'none',
                            background: 'linear-gradient(135deg, #8f5c28, #a36532)',
                            color: '#fff',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            boxShadow: '0 10px 24px rgba(143,92,40,0.26)',
                        }}
                    >
                        Orqaga
                    </Button>
                    <div>
                        {isLoading
                            ? <Skeleton.Input active style={{ width: 180, height: 26 }} />
                            : <>
                                <h2 style={{ fontSize: 19, fontWeight: 800, color: '#ffffff', margin: 0, lineHeight: 1.25, textShadow: '0 2px 10px rgba(0,0,0,0.55)' }}>{moreInfo.fullName}</h2>
                                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.76)', margin: '2px 0 0', fontWeight: 600, textShadow: '0 2px 8px rgba(0,0,0,0.45)' }}>Support tafsilotlari</p>
                            </>
                        }
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Button onClick={() => setDelModal(true)} danger type="primary" size="large" icon={<DeleteFilled />} style={{ borderRadius: 9, height: 40, fontWeight: 500 }}>O'chirish</Button>
                    <Button onClick={() => navigate("update")} size="large" type="primary" icon={<EditFilled />}
                        style={{ background: C.accentGradient, border: 'none', borderRadius: 9, height: 40, fontWeight: 500, boxShadow: '0 2px 8px rgba(143,92,40,0.22)' }}>
                        Tahrirlash
                    </Button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[360px_1fr]">
                {/* Left card */}
                <div className="support-more-left-card" style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden' }}>
                    <div style={{ padding: '20px', background: C.accentBg, borderBottom: `1px solid #f0e8df`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 58, height: 58, borderRadius: '50%', background: C.accentGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, fontWeight: 700, overflow: 'hidden' }}>
                            {avatar
                                ? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : initials || <UserOutlined />
                            }
                        </div>
                        {isLoading
                            ? <Skeleton.Input active style={{ width: 120 }} />
                            : <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a' }}>{moreInfo.fullName}</div>
                                <Tag color="orange" style={{ marginTop: 6 }}>Support</Tag>
                            </div>
                        }
                    </div>
                    <div style={{ padding: '4px 20px 8px' }}>
                        <InfoRow icon={<FieldNumberOutlined />} label="ID" value={<Tag color="orange">#{supportId}</Tag>} />
                        <InfoRow icon={<IdcardOutlined />} label="Username" value={moreInfo.username} isLoading={isLoading} />
                        <InfoRow icon={<PhoneOutlined />} label="Telefon raqami" value={moreInfo.phone} isLoading={isLoading} />
                        <InfoRow icon={<SendOutlined />} label="Telegram ID" value={moreInfo.telegramId || "—"} isLoading={isLoading} />
                        <InfoRow icon={<ApartmentOutlined />} label="Yo'nalishlar" value={
                            moreInfo.directionIds && moreInfo.directionIds.length > 0
                                ? moreInfo.directionIds.map((id: number) => (
                                    <Tag key={id} color="orange" style={{ marginBottom: 2 }}>
                                        {getDirectionName(id)}
                                    </Tag>
                                ))
                                : moreInfo.directions && moreInfo.directions.length > 0
                                    ? moreInfo.directions.map((direction: any) => (
                                        <Tag key={direction.id} color="orange" style={{ marginBottom: 2 }}>
                                            {direction.name}
                                        </Tag>
                                    ))
                                    : moreInfo.direction?.name || "—"
                        } isLoading={isLoading} />
                        <InfoRow icon={<CalendarOutlined />} label="Yaratilingan vaqt" value={formatDateTime(moreInfo.createdAt)} isLoading={isLoading} />
                        <InfoRow icon={<HistoryOutlined />} label="O'zgartirilgan vaqt" value={formatDateTime(moreInfo.updatedAt)} isLoading={isLoading} />
                    </div>
                </div>

                {/* Right: groups */}
                <div className="support-more-groups" style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden' }}>
                    <Groups title="Guruhlar" supportPropId={supportId ? Number(supportId) : null} basePath={`/support/${supportId}`} />
                </div>
            </div>

            {/* Delete modal */}
            <Modal open={delModal} onCancel={() => setDelModal(false)} onOk={handleDeleteSupport}
                confirmLoading={isPending} okText="Ha, o'chirish" cancelText="Bekor qilish"
                okButtonProps={{ danger: true, style: { borderRadius: 8, fontWeight: 500 } }}
                cancelButtonProps={{ style: { borderRadius: 8 } }}
                title={<span style={{ fontSize: 15, fontWeight: 600, color: '#dc2626' }}>O'chirishni tasdiqlang</span>}
                centered width={380}>
                <p style={{ color: '#666', fontSize: 13.5, margin: '12px 0 4px', lineHeight: 1.6 }}>
                    <strong style={{ color: '#1a1a1a' }}>"{moreInfo.fullName}"</strong> ni o'chirsangiz, u bilan bog'liq ma'lumotlar ham o'chib ketishi mumkin.
                </p>
            </Modal>
        </div>
    )
}

export default SupportMore