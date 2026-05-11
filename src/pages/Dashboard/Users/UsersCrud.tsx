import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate, useParams } from "react-router-dom";
import { Create, GetById, Update } from "../../../service";
import { CustomSelect, QueryPATH } from "../../../components";
import { Button, Input, Select, Tag } from "antd";
import {
    ArrowLeftOutlined,
    SaveOutlined,
    UserOutlined,
    PhoneOutlined,
    LockOutlined,
    SendOutlined,
    IdcardOutlined,
    SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useCurrentUser } from "../../../hooks/useCurrentUser";

// SUPERADMIN uchun barcha rollar
const ALL_ROLES = [
    { label: "Super Admin", value: "SUPERADMIN" },
    { label: "Admin", value: "ADMIN" },
    { label: "Ustoz", value: "TEACHER" },
    { label: "Support", value: "SUPPORT" },
    { label: "O'quvchi", value: "STUDENT" },
];

// Rol badge
const RoleBadge = ({ role }: { role: string }) => {
    const map: Record<string, { color: string; label: string }> = {
        SUPERADMIN: { color: "red", label: "Super Admin" },
        ADMIN: { color: "orange", label: "Admin" },
        TEACHER: { color: "blue", label: "Ustoz" },
        SUPPORT: { color: "purple", label: "Support" },
        STUDENT: { color: "green", label: "O'quvchi" },
        PARENT: { color: "cyan", label: "Ota-ona" },
    };
    const s = map[role] ?? { color: "default", label: role };
    return <Tag color={s.color} style={{ fontSize: 14, padding: "4px 12px", borderRadius: 8 }}>{s.label}</Tag>;
};

const Field = ({
    label,
    hint,
    required,
    children,
}: {
    label: React.ReactNode;
    hint?: string;
    required?: boolean;
    children: React.ReactNode;
}) => (
    <div className="flex flex-col gap-1.5">
        <span className="text-[15px] font-semibold text-gray-700 flex items-center gap-2">
            {label}
            {required && <span className="text-red-400">*</span>}
        </span>
        {children}
        {hint && <span className="text-[12px] text-gray-500">{hint}</span>}
    </div>
);

const UserCrud = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [cookies] = useCookies(["accessToken"]);
    const queryClient = useQueryClient();
    const currentUser = useCurrentUser();
    const isSuperAdmin = currentUser?.role === "SUPERADMIN";

    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [telegramId, setTelegramId] = useState("");
    const [role, setRole] = useState<string | null>(null);
    const [branchId, setBranchId] = useState<number | null>(null);

    // Mutations
    const { mutate: UserCreate, isPending: createLoading } = Create(
        cookies.accessToken,
        "/users",
        navigate,
        queryClient,
        QueryPATH.users
    );

    const { mutate: UserUpdate, isPending: updateLoading } = Update(
        cookies.accessToken,
        `/users/${userId}`,
        navigate,
        queryClient,
        QueryPATH.usersMore,
        QueryPATH.users
    );

    // Get data for update
    const { data: moreInfo = {} } = userId
        ? GetById(userId, cookies.accessToken, QueryPATH.usersMore, "/users")
        : { data: {} };

    // Fill form when editing
    useEffect(() => {
        if (userId && moreInfo) {
            setFullName(moreInfo.fullName ?? "");
            setUsername(moreInfo.username ?? "");
            setPhone(moreInfo.phone ?? "");
            setPassword("");
            setTelegramId(moreInfo.telegramId ?? "");
            setRole(moreInfo.role ?? null);
            setBranchId(moreInfo.branchId ?? null);
        }
    }, [userId, moreInfo]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // SUPERADMIN rol tanlaydi, boshqalar uchun mavjud rol saqlanadi
        const selectedRole = isSuperAdmin ? (role || undefined) : undefined;

        const data: any = {
            fullName,
            username,
            phone,
            password: password || undefined,
            telegramId: telegramId || undefined,
            branchId: branchId || undefined,
        };

        // Faqat SUPERADMIN va yangi yaratishda role qo'shiladi
        if (isSuperAdmin && !userId && selectedRole) {
            data.role = selectedRole;
        }

        if (userId) {
            // Update da rol faqat SUPERADMIN o'zgartira oladi
            if (isSuperAdmin && selectedRole) data.role = selectedRole;
            UserUpdate(data);
        } else {
            UserCreate(data);
        }
    };

    const isUpdate = Boolean(userId);
    const isLoading = isUpdate ? updateLoading : createLoading;

    return (
        <form onSubmit={handleSubmit} className="p-6 max-w-4xl mx-auto">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-10">
                <Button
                    onClick={() => navigate(-1)}
                    icon={<ArrowLeftOutlined />}
                    size="large"
                    style={{ borderRadius: 12, height: 48 }}
                >
                    Orqaga
                </Button>

                <h1 className="text-3xl font-bold text-gray-800">
                    {isUpdate ? "Foydalanuvchini tahrirlash" : "Yangi foydalanuvchi qo'shish"}
                </h1>

                <Button
                    loading={isLoading}
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    size="large"
                    type="primary"
                    style={{
                        background: "#8f5c28",
                        border: "none",
                        borderRadius: 12,
                        height: 48,
                        fontSize: 16,
                        fontWeight: 600,
                        paddingInline: 32,
                    }}
                >
                    {isUpdate ? "Yangilash" : "Saqlash"}
                </Button>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Card Header */}
                <div
                    className="px-8 py-6 border-b border-[#f0e8df]"
                    style={{ background: "linear-gradient(135deg, #f5ece3 0%, #fdf9f6 100%)" }}
                >
                    <h3 className="text-xl font-bold text-[#8f5c28]">Foydalanuvchi ma'lumotlari</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        <span className="text-red-400">*</span> belgili maydonlar majburiy
                    </p>
                </div>

                {/* Form Fields */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7">
                    {/* To'liq ism */}
                    <Field label={<><UserOutlined className="text-[#8f5c28]" /> To'liq ism</>} required>
                        <Input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            size="large"
                            placeholder="Ali Karimov"
                            style={{ borderRadius: 12, height: 52 }}
                            required
                        />
                    </Field>

                    {/* Username */}
                    <Field
                        label={<><IdcardOutlined className="text-[#8f5c28]" /> Username</>}
                        hint="Faqat harf, raqam, nuqta, _ va - ishlatilsin"
                        required
                    >
                        <Input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            size="large"
                            placeholder="ali_karimov"
                            style={{ borderRadius: 12, height: 52 }}
                            required
                        />
                    </Field>

                    {/* Telefon */}
                    <Field
                        label={<><PhoneOutlined className="text-[#8f5c28]" /> Telefon raqami</>}
                        hint="Format: +998901234567"
                        required
                    >
                        <Input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            size="large"
                            placeholder="+998901234567"
                            style={{ borderRadius: 12, height: 52 }}
                            required
                        />
                    </Field>

                    {/* Parol */}
                    <Field
                        label={<><LockOutlined className="text-[#8f5c28]" /> Parol</>}
                        hint={isUpdate ? "Bo'sh qoldirsangiz o'zgarmaydi" : "Kamida 6 ta belgi"}
                        required={!isUpdate}
                    >
                        <Input.Password
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            size="large"
                            placeholder="••••••••"
                            style={{ borderRadius: 12, height: 52 }}
                            required={!isUpdate}
                        />
                    </Field>

                    {/* Rol — faqat SUPERADMIN ko'radi va tanlaydi */}
                    {isSuperAdmin ? (
                        <Field
                            label={<><SafetyCertificateOutlined className="text-[#8f5c28]" /> Rol</>}
                            required={!isUpdate}
                        >
                            <Select
                                value={role}
                                onChange={(val) => setRole(val)}
                                size="large"
                                placeholder="Rolni tanlang"
                                options={ALL_ROLES}
                                style={{ height: 52, borderRadius: 12 }}
                            />
                        </Field>
                    ) : isUpdate && role ? (
                        // Boshqa rollar update da faqat ko'radi
                        <Field label={<><SafetyCertificateOutlined className="text-[#8f5c28]" /> Rol</>}>
                            <div style={{ height: 52, display: "flex", alignItems: "center" }}>
                                <RoleBadge role={role} />
                            </div>
                        </Field>
                    ) : null}

                    {/* Telegram ID */}
                    <Field
                        label={<><SendOutlined className="text-[#8f5c28]" /> Telegram ID</>}
                        hint="Ixtiyoriy"
                    >
                        <Input
                            value={telegramId}
                            onChange={(e) => setTelegramId(e.target.value)}
                            size="large"
                            placeholder="1234567890"
                            style={{ borderRadius: 12, height: 52 }}
                        />
                    </Field>

                    {/* Filial */}
                    <Field label={<>🏦 Filial</>} hint="Ixtiyoriy">
                        <CustomSelect URL="/branches" placeholder="Filialni tanlang"
                            queryKey={QueryPATH.branches}
                            setValue={(val: any) => setBranchId(val ? Number(val) : null)}
                            value={branchId} />
                    </Field>
                </div>
            </div>
        </form>
    );
};

export default UserCrud;

