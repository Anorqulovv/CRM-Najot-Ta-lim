import { useRef, useState } from "react"
import { useCookies } from "react-cookie"
import { useQueryClient } from "@tanstack/react-query"
import { Skeleton } from "antd"
import {
  UserOutlined, EditOutlined, SaveOutlined,
  CloseOutlined, CameraOutlined, PhoneOutlined,
  IdcardOutlined, TeamOutlined, CalendarOutlined, LockOutlined,
} from "@ant-design/icons"
import { GetMe } from "../../../service"
import { QueryPATH } from "../../../components"
import { instance } from "../../../hooks"
import toast from "react-hot-toast"

const ROLE_LABELS: Record<string, string> = {
  SUPERADMIN: "Super Admin",
  ADMIN: "Admin",
  TEACHER: "Ustoz",
  SUPPORT: "Support",
  STUDENT: "O'quvchi",
  PARENT: "Ota-ona",
}

const ROLE_COLORS: Record<string, { bg: string; border: string; color: string; dot: string }> = {
  SUPERADMIN: { bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.3)", color: "#c4b5fd", dot: "#8b5cf6" },
  ADMIN:      { bg: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.3)",  color: "#93c5fd", dot: "#3b82f6" },
  TEACHER:    { bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.3)",  color: "#6ee7b7", dot: "#10b981" },
  SUPPORT:    { bg: "rgba(236,72,153,0.12)",  border: "rgba(236,72,153,0.3)",  color: "#f9a8d4", dot: "#ec4899" },
  STUDENT:    { bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.3)",  color: "#fcd34d", dot: "#f59e0b" },
  PARENT:     { bg: "rgba(6,182,212,0.12)",   border: "rgba(6,182,212,0.3)",   color: "#67e8f9", dot: "#06b6d4" },
}

interface InfoRowProps {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
  last?: boolean
}

const InfoRow = ({ icon, label, children, last }: InfoRowProps) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 14,
    padding: "16px 0",
    borderBottom: last ? "none" : "1px solid rgba(255,255,255,0.045)",
  }}>
    <div style={{
      width: 42, height: 42, borderRadius: 13,
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.07)",
      color: "#c8864a",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 15, flexShrink: 0,
    }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <p style={{
        fontSize: 10, color: "rgba(255,255,255,0.28)",
        fontWeight: 700, margin: "0 0 4px",
        letterSpacing: "1.1px", textTransform: "uppercase",
      }}>
        {label}
      </p>
      <div>{children}</div>
    </div>
  </div>
)

const Profile = () => {
  const [cookies] = useCookies(["accessToken"])
  const queryClient = useQueryClient()
  const { data: user, isLoading } = GetMe(cookies.accessToken)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    phone: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const fileRef = useRef<HTMLInputElement>(null)

  const initials = user?.fullName
    ? `${user.fullName.split(" ")[0]?.[0] ?? ""}${user.fullName.split(" ")[1]?.[0] ?? ""}`
    : user?.username?.[0]?.toUpperCase() ?? "?"

  const role = ROLE_COLORS[user?.role] ?? {
    bg: "rgba(255,255,255,0.07)", border: "rgba(255,255,255,0.15)",
    color: "rgba(255,255,255,0.6)", dot: "#888",
  }

  const daysSince = user?.createdAt
    ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86400000)
    : null

  const joinDate = user?.createdAt
    ? new Intl.DateTimeFormat("uz-UZ", { year: "numeric", month: "long", day: "numeric" })
        .format(new Date(user.createdAt))
    : "—"


  const startEdit = () => {
    setForm({
      fullName: user?.fullName ?? "",
      username: user?.username ?? "",
      phone: user?.phone ?? "",
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
    setEditing(true)
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
      const wantsPasswordChange =
        Boolean(form.oldPassword || form.newPassword || form.confirmPassword)

      if (wantsPasswordChange) {
        if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
          toast.error("Parolni o'zgartirish uchun barcha parol maydonlarini to'ldiring")
          return
        }

        if (form.newPassword.length < 6) {
          toast.error("Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak")
          return
        }

        if (form.newPassword !== form.confirmPassword) {
          toast.error("Yangi parol va tasdiqlash paroli mos emas")
          return
        }
      }

      const payload: any = {
        fullName: form.fullName,
        username: form.username,
        phone: form.phone,
      }

      if (wantsPasswordChange) {
        payload.oldPassword = form.oldPassword
        payload.newPassword = form.newPassword
        payload.confirmPassword = form.confirmPassword
      }

      await instance(cookies.accessToken).patch("/auth/profile", payload)
      queryClient.invalidateQueries({ queryKey: [QueryPATH.me] })
      toast.success(wantsPasswordChange ? "Profil va parol yangilandi!" : "Profil yangilandi!")
      setEditing(false)
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Xatolik yuz berdi")
    } finally { setSaving(false) }
  }


  const removeAvatar = async () => {
    try {
      await instance(cookies.accessToken).patch("/auth/profile", { avatar: "" })
      queryClient.invalidateQueries({ queryKey: [QueryPATH.me] })
      toast.success("Profil rasmi olib tashlandi")
    } catch {
      toast.error("Rasmni olib tashlab bo'lmadi")
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { toast.error("Rasm 10MB dan kichik bo'lishi kerak"); return }
    setAvatarLoading(true)
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        await instance(cookies.accessToken).patch("/auth/profile", { avatar: reader.result })
        queryClient.invalidateQueries({ queryKey: [QueryPATH.me] })
        toast.success("Avatar yangilandi!")
      } catch { toast.error("Avatar yuklab bo'lmadi") }
      finally { setAvatarLoading(false) }
    }
    reader.readAsDataURL(file)
  }

  if (isLoading) return (
    <div style={{ padding: 32, maxWidth: 680, margin: "0 auto" }}>
      <Skeleton active avatar paragraph={{ rows: 6 }} />
    </div>
  )

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 13px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff", fontSize: 14, outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  }

  return (
    <div style={{
      minHeight: "100%",
      padding: "18px 20px",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
    }}>
      <div style={{ width: "100%", maxWidth: 660, display: "flex", flexDirection: "column", gap: 12 }}>

        {/* ── MAIN CARD ── */}
        <div style={{
          borderRadius: 24,
          background: "linear-gradient(160deg,#130c08 0%,#1e1008 60%,#130c08 100%)",
          border: "1px solid rgba(255,255,255,0.07)",
          overflow: "hidden",
          boxShadow: "0 0 0 1px rgba(212,169,106,0.07), 0 28px 72px rgba(0,0,0,0.55)",
        }}>

          {/* Banner */}
          <div style={{
            height: 130,
            background: "linear-gradient(135deg,#2e1507 0%,#7a4020 40%,#c87a3a 72%,#e09050 100%)",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.09)" }} />
            <div style={{ position: "absolute", bottom: -28, left: 70, width: 120, height: 120, borderRadius: "50%", background: "rgba(0,0,0,0.14)" }} />
            <div style={{ position: "absolute", top: 8, left: "35%", width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          </div>

          {/* Header section */}
          <div style={{ padding: "0 28px 28px" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 18, marginTop: -54, marginBottom: 24, flexWrap: "wrap" }}>

              {/* Avatar */}
              <div style={{ position: "relative", flexShrink: 0, cursor: "pointer" }} onClick={() => fileRef.current?.click()}>
                <div style={{
                  width: 106, height: 106, borderRadius: "50%",
                  background: "conic-gradient(#d4a96a,#f0c87a,#c8864a,#8f5c28,#d4a96a)",
                  padding: 3,
                  boxShadow: "0 0 0 4px #130c08, 0 10px 28px rgba(0,0,0,0.55)",
                }}>
                  <div style={{
                    width: "100%", height: "100%", borderRadius: "50%",
                    background: "linear-gradient(135deg,#4a2208,#a06530)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 34, fontWeight: 800, color: "#fff",
                    overflow: "hidden", letterSpacing: -1,
                  }}>
                    {avatarLoading
                      ? <span style={{ fontSize: 13, opacity: 0.6 }}>...</span>
                      : user?.avatar
                        ? <img src={user.avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <span>{initials}</span>
                    }
                  </div>
                </div>
                <div style={{
                  position: "absolute", bottom: 2, right: 2,
                  width: 30, height: 30, borderRadius: "50%",
                  background: "#d4a96a", color: "#120b07",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, border: "3px solid #130c08",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.5)", cursor: "pointer",
                }}>
                  <CameraOutlined />
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
                {user?.avatar && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeAvatar()
                    }}
                    title="Rasmni olib tashlash"
                    style={{
                      position: "absolute",
                      bottom: 2,
                      left: 2,
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: "#ef4444",
                      color: "#fff",
                      border: "3px solid #130c08",
                      cursor: "pointer",
                      fontWeight: 800,
                    }}
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Name + badges */}
              <div style={{ flex: 1, minWidth: 170, paddingBottom: 4 }}>
                <div style={{ position: "relative", fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: -0.5, lineHeight: "1.15" }}>
                  {user?.fullName || user?.username || "—"}
                </div>
                <div style={{ display: "flex", gap: 7, marginTop: 10, flexWrap: "wrap" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 600,
                    background: role.bg, border: `1px solid ${role.border}`, color: role.color,
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: role.dot, flexShrink: 0 }} />
                    {ROLE_LABELS[user?.role] ?? user?.role}
                  </span>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 600,
                    background: user?.isActive ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                    border: `1px solid ${user?.isActive ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                    color: user?.isActive ? "#6ee7b7" : "#fca5a5",
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: user?.isActive ? "#10b981" : "#ef4444", flexShrink: 0 }} />
                    {user?.isActive ? "Faol" : "Nofaol"}
                  </span>
                </div>
              </div>

              {/* Edit buttons */}
              <div style={{ paddingBottom: 4, flexShrink: 0 }}>
                {!editing ? (
                  <button
                    onClick={startEdit}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 7,
                      padding: "0 16px", height: 38, borderRadius: 11,
                      background: "rgba(212,169,106,0.1)",
                      border: "1px solid rgba(212,169,106,0.25)",
                      color: "#d4a96a", fontSize: 13, fontWeight: 600,
                      cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    <EditOutlined style={{ fontSize: 13 }} /> Tahrirlash
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => setEditing(false)}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 7,
                        padding: "0 14px", height: 38, borderRadius: 11,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "rgba(255,255,255,0.5)", fontSize: 13,
                        cursor: "pointer", fontFamily: "inherit",
                      }}
                    >
                      <CloseOutlined style={{ fontSize: 12 }} /> Bekor
                    </button>
                    <button
                      onClick={saveProfile}
                      disabled={saving}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 7,
                        padding: "0 18px", height: 38, borderRadius: 11,
                        background: "linear-gradient(135deg,#a06530,#d4954a)",
                        border: "none", color: "#fff", fontSize: 13, fontWeight: 700,
                        cursor: "pointer", fontFamily: "inherit",
                        boxShadow: "0 4px 14px rgba(160,101,48,0.35)",
                      }}
                    >
                      <SaveOutlined style={{ fontSize: 13 }} />
                      {saving ? "Saqlanmoqda..." : "Saqlash"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "linear-gradient(to right,transparent,rgba(255,255,255,0.08),transparent)", marginBottom: 4 }} />

            {/* Info rows */}
            <InfoRow icon={<UserOutlined />} label="To'liq ism">
              {editing
                ? <input style={inputStyle} value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} placeholder="Ism Familiya" />
                : <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.82)" }}>{user?.fullName || "—"}</span>
              }
            </InfoRow>

            <InfoRow icon={<IdcardOutlined />} label="Username">
              {editing
                ? <input style={inputStyle} value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} placeholder="username" />
                : <span style={{ fontSize: 14, fontWeight: 600, color: "#c8864a" }}>@{user?.username || "—"}</span>
              }
            </InfoRow>

            <InfoRow icon={<PhoneOutlined />} label="Telefon raqami">
              {editing
                ? <input style={inputStyle} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+998 90 000 00 00" />
                : <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.82)" }}>{user?.phone || "—"}</span>
              }
            </InfoRow>

            {editing && (
              <>
                <InfoRow icon={<LockOutlined />} label="Eski parol">
                  <input
                    type="password"
                    style={inputStyle}
                    value={form.oldPassword}
                    onChange={e => setForm(p => ({ ...p, oldPassword: e.target.value }))}
                    placeholder="Eski parol"
                    autoComplete="current-password"
                  />
                </InfoRow>

                <InfoRow icon={<LockOutlined />} label="Yangi parol">
                  <input
                    type="password"
                    style={inputStyle}
                    value={form.newPassword}
                    onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))}
                    placeholder="Yangi parol"
                    autoComplete="new-password"
                  />
                </InfoRow>

                <InfoRow icon={<LockOutlined />} label="Yangi parolni tasdiqlash">
                  <input
                    type="password"
                    style={inputStyle}
                    value={form.confirmPassword}
                    onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Yangi parolni qayta kiriting"
                    autoComplete="new-password"
                  />
                </InfoRow>
              </>
            )}

            {user?.direction && (
              <InfoRow icon={<TeamOutlined />} label="Yo'nalish">
                <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.82)" }}>{user.direction?.name || "—"}</span>
              </InfoRow>
            )}

            <InfoRow icon={<CalendarOutlined />} label="Ro'yxatdan o'tgan" last>
              <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.82)" }}>{joinDate}</span>
            </InfoRow>
          </div>

        </div>


        <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.14)", letterSpacing: "0.4px" }}>
          Najot Ta'lim CRM — Profil sahifasi
        </p>
      </div>
    </div>
  )
}

export default Profile
