import { useQueryClient, useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useCookies } from "react-cookie"
import { useNavigate, useParams } from "react-router-dom"
import { Delete, GetById } from "../../../service"
import { Caption, CustomTable, QueryPATH } from "../../../components"
import { Button, Modal, Skeleton, Tag } from "antd"
import {
    ArrowLeftOutlined, CalendarOutlined, DeleteFilled, EditFilled,
    FieldNumberOutlined, FlagOutlined, HistoryOutlined, TeamOutlined,
    UserOutlined, ApartmentOutlined, CustomerServiceOutlined,
    ScheduleOutlined, ClockCircleOutlined,
} from "@ant-design/icons"
import { useCurrentUser } from "../../../hooks/useCurrentUser"
import { instance } from "../../../hooks"

const C = {
    accent: '#8f5c28',
    accentGradient: 'linear-gradient(135deg, #7a4520, #c8864a)',
    accentBg: 'linear-gradient(135deg, #f5ece3 0%, #fdf8f5 100%)',
    accentBorder: '#f5f0eb',
}

const formatDate = (dateStr: string) => {
    if (!dateStr) return "—"
    return new Intl.DateTimeFormat("uz-UZ", { year: "numeric", month: "long", day: "numeric" }).format(new Date(dateStr))
}

const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, { color: string, label: string }> = {
        ACTIVE: { color: "green", label: "Faol" },
        PAUSED: { color: "orange", label: "To'xtatilgan" },
        FINISHED: { color: "red", label: "Tugallangan" },
    }
    const s = map[status] ?? { color: "default", label: status }
    return <Tag color={s.color}>{s.label}</Tag>
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

const GroupsMore = () => {
    const navigate = useNavigate()
    const { groupId } = useParams()
    const [cookies] = useCookies(["accessToken"])
    const [delModal, setDelModal] = useState(false)
    const queryClient = useQueryClient()

    const currentUser = useCurrentUser()
    const isSupport = currentUser?.role === "SUPPORT"
    const isReadOnly = isSupport

    const { data: moreInfo = {}, isLoading } = GetById(groupId, cookies.accessToken, QueryPATH.groupsMore, "/groups")
    const { mutate: DeleteGroup, isPending } = Delete(cookies.accessToken, `/groups/${groupId}`, navigate, queryClient, QueryPATH.groups)



    const studentColumns = [
        { title: "ID", dataIndex: "id" },
        { title: "To'liq ismi", dataIndex: "fullName" },
        { title: "Telefon", dataIndex: "phone" },
        {
            title: "Holat", dataIndex: "isActive",
            render: (v: boolean) => <Tag color={v ? "green" : "red"}>{v ? "Faol" : "Nofaol"}</Tag>,
        },
    ]

    const students = (moreInfo.students ?? []).map((s: any) => ({
        ...s,
        fullName: s.user?.fullName ?? s.fullName ?? "—",
        phone: s.user?.phone ?? s.phone ?? "—",
        isActive: s.user?.isActive ?? s.isActive ?? false,
    }))


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
                                <h2 style={{ fontSize: 19, fontWeight: 700, color: '#1a1a1a', margin: 0, lineHeight: 1.25 }}>{moreInfo.name}</h2>
                                <p style={{ fontSize: 12, color: '#aaa', margin: '2px 0 0' }}>Guruh tafsilotlari</p>
                            </>
                        }
                    </div>
                </div>

                {!isReadOnly && (
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Button onClick={() => setDelModal(true)} danger type="primary" size="large" icon={<DeleteFilled />} style={{ borderRadius: 9, height: 40, fontWeight: 500 }}>O'chirish</Button>
                        <Button onClick={() => navigate("update")} size="large" type="primary" icon={<EditFilled />}
                            style={{ background: C.accentGradient, border: 'none', borderRadius: 9, height: 40, fontWeight: 500, boxShadow: '0 2px 8px rgba(143,92,40,0.22)' }}>
                            Tahrirlash
                        </Button>
                    </div>
                )}
            </div>

            {/* Content grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 18 }}>
                {/* Left card */}
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden' }}>
                    <div style={{ padding: '20px', background: C.accentBg, borderBottom: `1px solid #f0e8df`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 58, height: 58, borderRadius: '50%', background: C.accentGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22 }}>
                            <TeamOutlined />
                        </div>
                        {isLoading
                            ? <Skeleton.Input active style={{ width: 120 }} />
                            : <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a' }}>{moreInfo.name}</div>
                                {moreInfo.status && <div style={{ marginTop: 6 }}><StatusBadge status={moreInfo.status} /></div>}
                            </div>
                        }
                    </div>

                    <div style={{ padding: '4px 20px 8px' }}>
                        <InfoRow icon={<FieldNumberOutlined />} label="ID" value={<Tag color="orange">#{groupId}</Tag>} />
                        <InfoRow icon={<ApartmentOutlined />} label="Yo'nalish" value={moreInfo.direction?.name} isLoading={isLoading} />
                        <InfoRow icon={<UserOutlined />} label="Ustoz" value={moreInfo.teacher?.fullName} isLoading={isLoading} />
                        <InfoRow icon={<CustomerServiceOutlined />} label="Support" value={moreInfo.support?.fullName} isLoading={isLoading} />
                        <InfoRow icon={<FlagOutlined />} label="Holat" value={moreInfo.status ? <StatusBadge status={moreInfo.status} /> : null} isLoading={isLoading} />
                        <InfoRow icon={<CalendarOutlined />} label="Boshlanish" value={formatDate(moreInfo.startDate)} isLoading={isLoading} />
                        <InfoRow icon={<HistoryOutlined />} label="Tugash" value={formatDate(moreInfo.endDate)} isLoading={isLoading} />
                        <InfoRow icon={<TeamOutlined />} label="O'quvchilar" value={<Tag color="blue">{students.length} ta</Tag>} isLoading={isLoading} />
                        {moreInfo.lessonDays && moreInfo.lessonDays.length > 0 && (
                            <InfoRow
                                icon={<ScheduleOutlined />}
                                label="Dars kunlari"
                                value={
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                        {(moreInfo.lessonDays as string[]).map((day: string) => (
                                            <Tag key={day} color="blue" style={{ margin: 0, fontSize: 11 }}>{day}</Tag>
                                        ))}
                                    </div>
                                }
                            />
                        )}
                        {moreInfo.lessonTime && (
                            <InfoRow
                                icon={<ClockCircleOutlined />}
                                label="Dars vaqti"
                                value={
                                    <span style={{ fontWeight: 700, color: C.accent, fontSize: 15 }}>
                                        🕐 {moreInfo.lessonTime}
                                        {moreInfo.lessonDuration && (
                                            <span style={{ fontWeight: 400, fontSize: 12, color: '#888', marginLeft: 6 }}>
                                                ({moreInfo.lessonDuration} daq)
                                            </span>
                                        )}
                                    </span>
                                }
                            />
                        )}
                    </div>
                </div>

                {/* Right: tabs — o'quvchilar + davomat */}
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden' }}>
                    <div style={{ padding: '16px' }}>
                        <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <TeamOutlined style={{ color: C.accent }} />
                            <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>O'quvchilar</span>
                            <span style={{ fontSize: 12, color: '#aaa', marginLeft: 4 }}>({students.length} ta)</span>
                        </div>
                        <CustomTable loading={isLoading} columns={studentColumns} data={students} />
                    </div>
                </div>
            </div>

            {/* Delete modal */}
            {!isReadOnly && (
                <Modal open={delModal} onCancel={() => setDelModal(false)} onOk={() => DeleteGroup()}
                    confirmLoading={isPending} okText="Ha, o'chirish" cancelText="Bekor qilish"
                    okButtonProps={{ danger: true, style: { borderRadius: 8, fontWeight: 500 } }}
                    cancelButtonProps={{ style: { borderRadius: 8 } }}
                    title={<span style={{ fontSize: 15, fontWeight: 600, color: '#dc2626' }}>O'chirishni tasdiqlang</span>}
                    centered width={380}>
                    <p style={{ color: '#666', fontSize: 13.5, margin: '12px 0 4px', lineHeight: 1.6 }}>
                        <strong style={{ color: '#1a1a1a' }}>"{moreInfo.name}"</strong> guruhini o'chirsangiz, u bilan bog'liq barcha ma'lumotlar ham o'chib ketishi mumkin.
                    </p>
                </Modal>
            )}
        </div>
    )
}

export default GroupsMore
