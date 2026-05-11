import {
    ArrowLeftOutlined,
    CalendarOutlined,
    DeleteFilled,
    EditFilled,
    FieldNumberOutlined,
    HistoryOutlined,
    IdcardOutlined,
    PhoneOutlined,
    SendOutlined,
    UserOutlined,
    SafetyCertificateOutlined,
    MailOutlined,
} from "@ant-design/icons"
import { Button, Modal, Skeleton, Tag } from "antd"
import { useNavigate, useParams } from "react-router-dom"
import { QueryPATH } from "../../../components"
import { useCookies } from "react-cookie"
import { Delete, GetById } from "../../../service"
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"

// Sanani chiroyli formatga o'tkazish
const formatDate = (dateStr: string) => {
    if (!dateStr) return "—"
    return new Intl.DateTimeFormat("uz-UZ", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(dateStr))
}

// Role uchun rang va label
const getRoleTag = (role: string) => {
    switch (role) {
        case "SUPERADMIN":
            return <Tag color="red">Super Admin</Tag>
        case "ADMIN":
            return <Tag color="volcano">Admin</Tag>
        case "TEACHER":
            return <Tag color="orange">Ustoz</Tag>
        case "STUDENT":
            return <Tag color="blue">O'quvchi</Tag>
        default:
            return <Tag color="default">{role || "—"}</Tag>
    }
}

const InfoRow = ({
    icon,
    label,
    value,
    isLoading,
}: {
    icon: React.ReactNode
    label: string
    value: React.ReactNode
    isLoading?: boolean
}) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
        <div className="w-8 h-8 rounded-lg bg-[#f5ece3] flex items-center justify-center text-[#8f5c28] shrink-0 mt-0.5">
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 font-medium mb-0.5 uppercase tracking-wide">
                {label}
            </p>
            {isLoading ? (
                <Skeleton.Input active size="small" style={{ width: 160 }} />
            ) : (
                <p className="text-[15px] font-semibold text-gray-800 wrap-break-word">
                    {value || <span className="text-gray-300 font-normal">—</span>}
                </p>
            )}
        </div>
    </div>
)

const UsersMore = () => {
    const navigate = useNavigate()
    const { userId } = useParams()
    const [cookies] = useCookies(["accessToken"])
    const [delModal, setDelModal] = useState(false)
    const queryClient = useQueryClient()

    const { data: moreInfo = {}, isLoading } = GetById(userId, cookies.accessToken, QueryPATH.usersMore, "/users")
    const { mutate: DeleteUser, isPending } = Delete(cookies.accessToken, `/users/${userId}`, navigate, queryClient, QueryPATH.users)

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => navigate(-1)}
                        icon={<ArrowLeftOutlined />}
                        className="rounded-lg!"
                    />
                    <div>
                        {isLoading ? (
                            <Skeleton.Input active style={{ width: 180, height: 28 }} />
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold text-gray-800 leading-tight">
                                    {moreInfo.fullName}
                                </h2>
                                <p className="text-sm text-gray-400 mt-0.5">Foydalanuvchi tafsilotlari</p>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => setDelModal(true)}
                        danger
                        type="primary"
                        size="large"
                        icon={<DeleteFilled />}
                        className="rounded-lg! hover:bg-red-600! duration-300"
                    >
                        O'chirish
                    </Button>
                    <Button
                        onClick={() => navigate("update")}
                        size="large"
                        type="primary"
                        icon={<EditFilled />}
                        className="rounded-lg! hover:bg-blue-600! duration-300"
                        style={{ background: "#8f5c28", border: "none" }}
                    >
                        Tahrirlash
                    </Button>
                </div>
            </div>

            {/* ── Karta ── */}
            <div className="max-w-lg">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                    {/* Avatar + ism bloki */}
                    <div
                        className="px-5 py-5 flex flex-col items-center gap-3 border-b border-gray-100"
                        style={{ background: "linear-gradient(135deg, #f5ece3 0%, #fdf8f5 100%)" }}
                    >
                        <div
                            className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center text-white text-2xl font-bold shadow-sm"
                            style={{ background: "linear-gradient(135deg, #8f5c28, #c8864a)" }}
                        >
                            {moreInfo.avatar
                                ? <img src={moreInfo.avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                : moreInfo.fullName
                                    ? `${moreInfo.fullName.split(" ")[0]?.[0] ?? ""}${moreInfo.fullName.split(" ")[1]?.[0] ?? ""}`
                                    : <UserOutlined />
                            }
                        </div>
                        {isLoading ? (
                            <Skeleton.Input active style={{ width: 120 }} />
                        ) : (
                            <div className="text-center">
                                <p className="font-bold text-[16px] text-gray-800">{moreInfo.fullName}</p>
                                <div className="mt-1">
                                    {getRoleTag(moreInfo.role)}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Info qatorlari */}
                    <div className="px-5 py-2">
                        <InfoRow
                            icon={<FieldNumberOutlined />}
                            label="ID"
                            value={<Tag color="orange">#{userId}</Tag>}
                        />
                        <InfoRow
                            icon={<IdcardOutlined />}
                            label="Username"
                            value={moreInfo.username}
                            isLoading={isLoading}
                        />
                        <InfoRow
                            icon={<PhoneOutlined />}
                            label="Telefon raqami"
                            value={moreInfo.phone}
                            isLoading={isLoading}
                        />
                        <InfoRow
                            icon={<MailOutlined />}
                            label="Email"
                            value={moreInfo.email}
                            isLoading={isLoading}
                        />
                        <InfoRow
                            icon={<SendOutlined />}
                            label="Telegram ID"
                            value={moreInfo.telegramId || "—"}
                            isLoading={isLoading}
                        />
                        <InfoRow
                            icon={<SafetyCertificateOutlined />}
                            label="Rol"
                            value={getRoleTag(moreInfo.role)}
                            isLoading={isLoading}
                        />
                        <InfoRow
                            icon={<CalendarOutlined />}
                            label="Yaratilingan vaqt"
                            value={formatDate(moreInfo.createdAt)}
                            isLoading={isLoading}
                        />
                        <InfoRow
                            icon={<HistoryOutlined />}
                            label="O'zgartirilgan vaqt"
                            value={formatDate(moreInfo.updatedAt)}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            </div>

            {/* ── O'chirish modali ── */}
            <Modal
                open={delModal}
                onCancel={() => setDelModal(false)}
                onOk={() => DeleteUser()}
                confirmLoading={isPending}
                okText="Ha, o'chirish"
                cancelText="Bekor qilish"
                okButtonProps={{ danger: true }}
                cancelButtonProps={{ style: { borderRadius: 8 } }}
                title={
                    <span className="text-[15px] font-semibold text-red-500">
                        O'chirishni tasdiqlang
                    </span>
                }
                centered
                width={380}
            >
                <p className="text-gray-500 text-sm mt-3 mb-1">
                    <strong className="text-gray-700">"{moreInfo.fullName}"</strong> foydalanuvchini
                    o'chirsangiz, u bilan bog'liq ma'lumotlar ham o'chib ketishi mumkin.
                </p>
            </Modal>
        </div>
    )
}

export default UsersMore