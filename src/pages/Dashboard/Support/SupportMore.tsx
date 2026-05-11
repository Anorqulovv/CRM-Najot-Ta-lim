import {
    ArrowLeftOutlined, CalendarOutlined, DeleteFilled, EditFilled,
    FieldNumberOutlined, HistoryOutlined, IdcardOutlined, PhoneOutlined,
    SendOutlined, UserOutlined, ApartmentOutlined,
} from "@ant-design/icons"
import { Button, Modal, Skeleton, Tag } from "antd"
import { useNavigate, useParams } from "react-router-dom"
import { QueryPATH } from "../../../components"
import { useCookies } from "react-cookie"
import { Delete, GetById } from "../../../service"
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import Groups from "../Groups/Groups"

const C = {
    accent: '#8f5c28',
    accentGradient: 'linear-gradient(135deg, #7a4520, #c8864a)',
    accentBg: 'linear-gradient(135deg, #f5ece3 0%, #fdf8f5 100%)',
    accentBorder: '#f5f0eb',
}

const formatDate = (dateStr: string) => {
    if (!dateStr) return "—"
    return new Intl.DateTimeFormat("uz-UZ", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(dateStr))
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
    const { mutate: DeleteSupport, isPending } = Delete(cookies.accessToken, `/supports/${supportId}`, navigate, queryClient, QueryPATH.support)

    const initials = moreInfo.fullName
        ? `${moreInfo.fullName.split(" ")[0]?.[0] ?? ""}${moreInfo.fullName.split(" ")[1]?.[0] ?? ""}`
        : null
    const avatar = moreInfo.avatar ?? null

    return (
        <div style={{ padding: '24px 24px' }}>
            {/* Top bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}
                        style={{ borderRadius: 8, borderColor: '#d6c4b0', color: C.accent, height: 36, display: 'flex', alignItems: 'center' }} />
                    <div>
                        {isLoading
                            ? <Skeleton.Input active style={{ width: 180, height: 26 }} />
                            : <>
                                <h2 style={{ fontSize: 19, fontWeight: 700, color: '#1a1a1a', margin: 0, lineHeight: 1.25 }}>{moreInfo.fullName}</h2>
                                <p style={{ fontSize: 12, color: '#aaa', margin: '2px 0 0' }}>Support tafsilotlari</p>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 18 }}>
                {/* Left card */}
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden' }}>
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
                                  {moreInfo.direction?.id === id ? moreInfo.direction?.name : `ID:${id}`}
                                </Tag>
                              ))
                            : moreInfo.direction?.name || "—"
                        } isLoading={isLoading} />
                        <InfoRow icon={<CalendarOutlined />} label="Yaratilingan vaqt" value={formatDate(moreInfo.createdAt)} isLoading={isLoading} />
                        <InfoRow icon={<HistoryOutlined />} label="O'zgartirilgan vaqt" value={formatDate(moreInfo.updatedAt)} isLoading={isLoading} />
                    </div>
                </div>

                {/* Right: groups */}
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden' }}>
                    <Groups title="Guruhlar" supportPropId={supportId ? Number(supportId) : null} basePath={`/support/${supportId}`} />
                </div>
            </div>

            {/* Delete modal */}
            <Modal open={delModal} onCancel={() => setDelModal(false)} onOk={() => DeleteSupport()}
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