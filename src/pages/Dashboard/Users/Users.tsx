import { Input, Tag } from "antd";
import { Caption, CustomTable, QueryPATH } from "../../../components";
import { useState } from "react";
import { GetAll } from "../../../service";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { debounce } from "../../../hooks";

// ── Role badge ──
const RoleBadge = ({ role }: { role: string }) => {
    const config: Record<string, { color: string; label: string }> = {
        SUPERADMIN: { color: "red", label: "Super Admin" },
        ADMIN: { color: "orange", label: "Admin" },
        TEACHER: { color: "blue", label: "Ustoz" },
        STUDENT: { color: "green", label: "O'quvchi" },
        SUPPORT: { color: "purple", label: "Support" },
        PARENT: { color: "cyan", label: "Ota-ona" },
    };
    const s = config[role] ?? { color: "default", label: role };
    return <Tag color={s.color}>{s.label}</Tag>;
};

const Users = () => {
    const [cookies] = useCookies(["accessToken"]);
    const navigate = useNavigate();

    // ── Jadval ustunlari ──
    const columns = [
        { title: "ID", dataIndex: "key", width: 60 },
        { title: "To'liq ismi", dataIndex: "fullName" },
        { title: "Username", dataIndex: "username" },
        { title: "Telefon", dataIndex: "phone" },
        {
            title: "Role", dataIndex: "role",
            render: (role: string) => <RoleBadge role={role} />,
        },
        {
            title: "Holat", dataIndex: "isActive",
            render: (v: boolean) => (
                <Tag color={v ? "green" : "red"}>{v ? "Faol" : "Nofaol"}</Tag>
            ),
        },
        { title: "Batafsil", dataIndex: "action", align: "center" as const, width: 100 },
    ];

    // ── returnFn ──
    function returnFn(value: any) {
        return {
            ...value,
            key: value.id,
            fullName: value.fullName ?? "➖",
            username: value.username ?? "➖",
            phone: value.phone ?? "➖",
        };
    }

    // ── Search va Filter ──
    const [search, setSearch] = useState("");
    const [role, setRole] = useState<string | null>(null);
    const debouncedSearch = debounce(search, 800);

    // ── Ma'lumotlarni olish ──
    const { data: allUsers = [], isPending } = GetAll(
        QueryPATH.users, [], cookies.accessToken, "/users", {}, navigate, returnFn
    );

    // ── Frontend filter ──
    const users = allUsers.filter((u: any) => {
        const matchName = !debouncedSearch ||
            u.fullName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            u.username?.toLowerCase().includes(debouncedSearch.toLowerCase())
        const matchRole = !role || u.role === role
        return matchName && matchRole
    });

    const roleOptions = [
        { label: "Barchasi", value: null },
        { label: "Super Admin", value: "SUPERADMIN" },
        { label: "Admin", value: "ADMIN" },
        { label: "Ustoz", value: "TEACHER" },
        { label: "O'quvchi", value: "STUDENT" },
        { label: "Support", value: "SUPPORT" },
        { label: "Ota-ona", value: "PARENT" },
    ];

    return (
        <div className="p-5">
            <Caption title="Foydalanuvchilar" count={users.length} extraclass="!none" />


            <div className="flex items-center gap-4 my-6 flex-wrap">
                <Input onChange={(e) => setSearch(e.target.value)} size="large" allowClear placeholder="Ism yoki username bo'yicha qidirish..." className="max-w-sm!" />

                {/* Role filter — tab ko'rinishida */}
                <div className="flex items-center gap-2 flex-wrap">
                    {roleOptions.map((opt) => (
                        <button key={String(opt.value)} type="button" onClick={() => setRole(opt.value)} style={{ padding: "6px 16px", borderRadius: 20, border: "1px solid", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.15s", borderColor: role === opt.value ? "#8f5c28" : "#e5e7eb", background: role === opt.value ? "#8f5c28" : "#fff", color: role === opt.value ? "#fff" : "#6b7280", }} >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                {[
                    { label: "Jami", value: allUsers.length, color: "#8f5c28" },
                    { label: "Super Admin", value: allUsers.filter((u: any) => u.role === "SUPERADMIN").length, color: "#ef4444" },
                    { label: "Admin", value: allUsers.filter((u: any) => u.role === "ADMIN").length, color: "#f97316" },
                    { label: "Ustozlar", value: allUsers.filter((u: any) => u.role === "TEACHER").length, color: "#3b82f6" },
                    { label: "O'quvchilar", value: allUsers.filter((u: any) => u.role === "STUDENT").length, color: "#22c55e" },
                    { label: "Support", value: allUsers.filter((u: any) => u.role === "SUPPORT").length, color: "#a855f7" },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center" >
                        <p className="text-2xl font-bold" style={{ color: stat.color }} >
                            {stat.value}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 font-medium">
                            {stat.label}
                        </p>
                    </div>
                ))}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100" style={{ background: "linear-gradient(135deg, #f5ece3 0%, #fdf8f5 100%)" }}  >
                    <h3 className="font-semibold text-[#8f5c28] text-[15px]">
                        Foydalanuvchilar ro'yxati
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Jami {users.length} ta foydalanuvchi
                    </p>
                </div>
                <div className="p-4">
                    <CustomTable loading={isPending} columns={columns} data={users} />
                </div>
            </div>
        </div>
    );
};

export default Users;