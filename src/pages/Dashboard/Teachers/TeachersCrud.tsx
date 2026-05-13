import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useCookies } from "react-cookie"
import { useNavigate, useParams } from "react-router-dom"
import { Create, GetAll, GetById, Update } from "../../../service"
import { CustomSelect, QueryPATH } from "../../../components"
import { Button, Input, Select } from "antd"
import {
  ArrowLeftOutlined, SaveOutlined, UserOutlined,
  PhoneOutlined, LockOutlined, SendOutlined, IdcardOutlined, BankOutlined,
} from "@ant-design/icons"

const C = {
  accent: '#8f5c28',
  accentGradient: 'linear-gradient(135deg, #7a4520, #c8864a)',
  accentBg: 'linear-gradient(135deg, #f5ece3 0%, #fdf9f6 100%)',
  accentBorder: '#f0e8df',
  inputStyle: { borderRadius: 9, borderColor: '#e5d8cc', background: '#fdfaf7', minHeight: 44 } as React.CSSProperties,
}

const Field = ({ label, hint, required, children }: {
  label: React.ReactNode, hint?: string, required?: boolean, children: React.ReactNode
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <span style={{ fontSize: 12, fontWeight: 600, color: C.accent, letterSpacing: '0.4px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5 }}>
      {label}{required && <span style={{ color: '#ef4444' }}>*</span>}
    </span>
    {children}
    {hint && <span style={{ fontSize: 11.5, color: '#999' }}>{hint}</span>}
  </div>
)

const TeachersCrud = () => {
  const { teacherId } = useParams()
  const navigate = useNavigate()
  const [cookies] = useCookies(["accessToken"])
  const queryClient = useQueryClient()

  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [telegramId, setTelegramId] = useState("")
  const [directionIds, setDirectionIds] = useState<number[]>([])
  const [branchId, setBranchId] = useState<number | null>(null)

  const { mutate: TeacherCreate, isPending: createLoading } = Create(cookies.accessToken, "/teachers", navigate, queryClient, QueryPATH.teachers)
  const { mutate: TeacherUpdate, isPending: updateLoading } = Update(cookies.accessToken, `/teachers/${teacherId}`, navigate, queryClient, QueryPATH.teachersMore, QueryPATH.teachers)
  const { data: moreInfo = {} } = teacherId ? GetById(teacherId, cookies.accessToken, QueryPATH.teachersMore, "/teachers") : { data: {} }

  // Yo'nalishlar ro'yxati
  const { data: directions = [] } = GetAll(QueryPATH.directions, [], cookies.accessToken, "/directions", undefined)

  useEffect(() => {
    if (teacherId && moreInfo) {
      setFullName(moreInfo.fullName ?? "")
      setUsername(moreInfo.username ?? "")
      setPhone(moreInfo.phone ?? "")
      setPassword("")
      setTelegramId(moreInfo.telegramId ?? "")
      // Ko'p yo'nalishlarni yuklash
      const ids = moreInfo.directionIds
        ? moreInfo.directionIds.map(Number)
        : moreInfo.directionId
          ? [Number(moreInfo.directionId)]
          : []
      setDirectionIds(ids)
      setBranchId(moreInfo.branchId ?? null)
    }
  }, [teacherId, moreInfo])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = {
      fullName,
      username,
      phone,
      password: password || undefined,
      telegramId: telegramId || undefined,
      directionIds,
      directionId: directionIds[0] ?? undefined,
      branchId,
    }
    teacherId ? TeacherUpdate(data) : TeacherCreate(data)
  }

  const directionOptions = directions.map((d: any) => ({ value: d.id, label: d.name }))

  const isUpdate = Boolean(teacherId)
  const isLoading = isUpdate ? updateLoading : createLoading

  return (
    <form onSubmit={handleSubmit} style={{ padding: '24px 24px', maxWidth: 860, margin: '0 auto' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}
          style={{ borderRadius: 8, borderColor: '#d6c4b0', color: C.accent, height: 36, display: 'flex', alignItems: 'center', gap: 4 }}>
          Orqaga
        </Button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: C.accentGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 15 }}>
            {isUpdate ? <SaveOutlined /> : <UserOutlined />}
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
            {isUpdate ? "Ustozni tahrirlash" : "Yangi ustoz qo'shish"}
          </h1>
        </div>
        <Button loading={isLoading} htmlType="submit" size="large"
          style={{ background: C.accentGradient, border: 'none', borderRadius: 9, color: '#fff', fontWeight: 600, fontSize: 13.5, height: 40, paddingInline: 22, boxShadow: '0 2px 8px rgba(143,92,40,0.25)' }}>
          {isUpdate ? "Yangilash" : "Saqlash"}
        </Button>
      </div>

      {/* Form card */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.accentBorder}`, background: C.accentBg }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: C.accent }}>Ustoz ma'lumotlari</div>
          <div style={{ fontSize: 12.5, color: '#999', marginTop: 3 }}>
            <span style={{ color: '#ef4444' }}>*</span> belgili maydonlar majburiy
          </div>
        </div>

        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 28px' }}>
          <Field label={<><UserOutlined /> To'liq ism</>} required>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} size="large" placeholder="Ali Karimov" style={C.inputStyle} required />
          </Field>

          <Field label={<><IdcardOutlined /> Username</>} hint="Harf, raqam, nuqta, _ va - ishlatilsin" required>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} size="large" placeholder="ali_karimov" style={C.inputStyle} required />
          </Field>

          <Field label={<><PhoneOutlined /> Telefon raqami</>} hint="Format: +998901234567" required>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} size="large" placeholder="+998901234567" style={C.inputStyle} required />
          </Field>

          <Field label={<><LockOutlined /> Parol</>} hint={isUpdate ? "Bo'sh qoldirsangiz o'zgarmaydi" : "Kamida 6 ta belgi"} required={!isUpdate}>
            <Input.Password value={password} onChange={(e) => setPassword(e.target.value)} size="large" placeholder="••••••••" style={C.inputStyle} required={!isUpdate} />
          </Field>

          {/* Ko'p yo'nalishlar */}
          <Field label={<>📚 Yo'nalishlar</>} hint="Bir nechta yo'nalish tanlash mumkin" required>
            <Select
              mode="multiple"
              size="large"
              placeholder="Yo'nalishlarni tanlang"
              value={directionIds}
              onChange={(vals) => setDirectionIds(vals)}
              options={directionOptions}
              allowClear
              showSearch
              optionFilterProp="label"
              style={{ ...C.inputStyle, height: 'auto', minHeight: 44 }}
            />
          </Field>

          <Field label={<><BankOutlined /> Filial</>} hint="Ixtiyoriy">
            <CustomSelect URL="/branches" placeholder="Filialni tanlang"
              queryKey={QueryPATH.branches}
              setValue={(val: any) => setBranchId(val ? Number(val) : null)}
              value={branchId} />
          </Field>

          <Field label={<><SendOutlined /> Telegram ID</>} hint="Ixtiyoriy">
            <Input value={telegramId} onChange={(e) => setTelegramId(e.target.value)} size="large" placeholder="1234567890" style={C.inputStyle} />
          </Field>
        </div>

        <div style={{ padding: '12px 24px', borderTop: `1px solid ${C.accentBorder}`, background: '#fdfaf7' }}>
          <span style={{ fontSize: 12, color: '#b0a090' }}>* Barcha majburiy maydonlarni to'ldiring va "Saqlash" tugmasini bosing</span>
        </div>
      </div>
    </form>
  )
}

export default TeachersCrud
