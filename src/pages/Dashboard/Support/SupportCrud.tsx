import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useCookies } from "react-cookie"
import { useNavigate, useParams } from "react-router-dom"
import { Create, GetAll, GetById, Update } from "../../../service"
import { CustomSelect, QueryPATH } from "../../../components"
import { Button, Input, Select } from "antd"
import {
  ArrowLeftOutlined, SaveOutlined, UserOutlined,
  PhoneOutlined, LockOutlined, SendOutlined, IdcardOutlined,
  CustomerServiceOutlined, BankOutlined,
} from "@ant-design/icons"
import { ensureUzPhonePrefix, normalizeUzPhoneInput, normalizeUzPhoneOnFocus } from "../../../utils/phone"


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

const SupportCrud = () => {
  const { supportId } = useParams()
  const navigate = useNavigate()
  const [cookies] = useCookies(["accessToken"])
  const queryClient = useQueryClient()

  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [phone, setPhone] = useState("+998")
  const [password, setPassword] = useState("")
  const [telegramId, setTelegramId] = useState("")
  const [directionIds, setDirectionIds] = useState<number[]>([])
  const [branchId, setBranchId] = useState<number | null>(null)

  const { mutate: SupportCreate, isPending: createLoading } = Create(cookies.accessToken, "/supports", navigate, queryClient, QueryPATH.support)
  const { mutate: SupportUpdate, isPending: updateLoading } = Update(cookies.accessToken, `/supports/${supportId}`, navigate, queryClient, QueryPATH.supportMore, QueryPATH.support)
  const { data: moreInfo = {} } = supportId ? GetById(supportId, cookies.accessToken, QueryPATH.supportMore, "/supports") : { data: {} }

  // Yo'nalishlar ro'yxati
  const { data: directions = [] } = GetAll(QueryPATH.directions, [], cookies.accessToken, "/directions", undefined)

  useEffect(() => {
    if (supportId && moreInfo) {
      setFullName(moreInfo.fullName ?? "")
      setUsername(moreInfo.username ?? "")
      setPhone(moreInfo.phone ?? "+998")
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
  }, [supportId, moreInfo])

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
    supportId ? SupportUpdate(data) : SupportCreate(data)
  }

  const directionOptions = directions.map((d: any) => ({ value: d.id, label: d.name }))

  const isUpdate = Boolean(supportId)
  const isLoading = isUpdate ? updateLoading : createLoading

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-5xl p-4 sm:p-5 lg:p-6">
      {/* Top bar */}
      <div className="mb-6 grid grid-cols-1 items-center gap-4 sm:grid-cols-3">
        <Button
          onClick={() => navigate(-1)}
          icon={<ArrowLeftOutlined />}
          size="large"
          className="w-full sm:w-fit"
          style={{
            height: 42,
            borderRadius: 12,
            border: 'none',
            background: 'linear-gradient(135deg, #8f5c28, #a36532)',
            color: '#fff',
            fontWeight: 800,
            boxShadow: '0 10px 24px rgba(143,92,40,0.26)',
          }}
        >
          Orqaga
        </Button>

        <div className="flex items-center justify-center">
          <h1
            className="m-0 text-center text-xl font-extrabold sm:text-[24px]"
            style={{
              color: '#ffffff',
              textShadow: '0 2px 10px rgba(0,0,0,0.55)',
            }}
          >
            {isUpdate ? "Supportni tahrirlash" : "Yangi support qo'shish"}
          </h1>
        </div>

        <div className="flex justify-start sm:justify-end">
          <Button
            loading={isLoading}
            htmlType="submit"
            icon={<SaveOutlined />}
            size="large"
            className="w-full sm:w-fit"
            style={{
              height: 42,
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, #8f5c28, #a36532)',
              color: '#fff',
              fontWeight: 800,
              boxShadow: '0 10px 24px rgba(143,92,40,0.26)',
            }}
          >
            {isUpdate ? "Yangilash" : "Saqlash"}
          </Button>
        </div>
      </div>

      {/* Form card */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.accentBorder}`, background: C.accentBg }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: C.accent }}>Support ma'lumotlari</div>
          <div style={{ fontSize: 12.5, color: '#999', marginTop: 3 }}>
            <span style={{ color: '#ef4444' }}>*</span> belgili maydonlar majburiy
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2 md:gap-x-7 md:p-6">
          <Field label={<><UserOutlined /> To'liq ism</>} required>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} size="large" placeholder="Ali Karimov" style={C.inputStyle} required />
          </Field>

          <Field label={<><IdcardOutlined /> Username</>} hint="Harf, raqam, nuqta, _ va - ishlatilsin" required>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} size="large" placeholder="ali_karimov" style={C.inputStyle} required />
          </Field>

          <Field label={<><PhoneOutlined /> Telefon raqami</>} hint="Format: +998901234567" required>
            <Input value={phone} onChange={(e) => setPhone(ensureUzPhonePrefix(e.target.value))} size="large" placeholder="+998901234567" style={C.inputStyle} required />
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

export default SupportCrud
