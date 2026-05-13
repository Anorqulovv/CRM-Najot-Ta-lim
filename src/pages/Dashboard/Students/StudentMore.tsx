import { useQueryClient, useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useCookies } from "react-cookie"
import { useNavigate, useParams } from "react-router-dom"
import { Delete, GetById } from "../../../service"
import { QueryPATH } from "../../../components"
import { Button, Modal, Skeleton, Tag } from "antd"
import {
  ArrowLeftOutlined, CalendarOutlined, DeleteFilled, EditFilled,
  FieldNumberOutlined, HistoryOutlined, IdcardOutlined, PhoneOutlined,
  TeamOutlined, UserOutlined, ApartmentOutlined,
} from "@ant-design/icons"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
} from "recharts"
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

const SectionCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden' }}>
    <div style={{ padding: '14px 20px', borderBottom: `1px solid #f0e8df`, background: C.accentBg, display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.accent }} />
      <span style={{ fontWeight: 600, fontSize: 13.5, color: C.accent }}>{title}</span>
    </div>
    <div style={{ padding: '4px 20px 8px' }}>{children}</div>
  </div>
)

const StudentMore = () => {
  const navigate = useNavigate()
  const { studentId } = useParams()
  const [cookies] = useCookies(["accessToken"])
  const queryClient = useQueryClient()
  const [delModal, setDelModal] = useState(false)

  const currentUser = useCurrentUser()
  const isSupport = currentUser?.role === "SUPPORT"
  const isReadOnly = isSupport
  const canViewAnalytics = ["SUPERADMIN", "ADMIN", "TEACHER"].includes(currentUser?.role ?? "")

  const { data: moreInfo = {}, isLoading } = GetById(studentId, cookies.accessToken, QueryPATH.studentsMore, "/students")
  const { mutate: DeleteStudent, isPending: deleteLoading } = Delete(cookies.accessToken, `/students/${studentId}`, navigate, queryClient, QueryPATH.students)

  const { data: analytics = {}, isLoading: analyticsLoading } = useQuery({
    queryKey: ["student-analytics", studentId, cookies.accessToken],
    queryFn: async () => {
      const res = await instance(cookies.accessToken).get(`/tests/student/${studentId}/analytics`)
      return res.data?.data
    },
    enabled: Boolean(canViewAnalytics && studentId && cookies.accessToken),
  })

  const initials = moreInfo.user?.fullName
    ? `${moreInfo.user.fullName.split(" ")[0]?.[0] ?? ""}${moreInfo.user.fullName.split(" ")[1]?.[0] ?? ""}`
    : null
  const avatar = moreInfo.user?.avatar ?? null

  return (
    <div style={{ padding: '24px' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}
            style={{ borderRadius: 8, borderColor: '#d6c4b0', color: C.accent, height: 36, display: 'flex', alignItems: 'center' }} />
          <div>
            {isLoading
              ? <Skeleton.Input active style={{ width: 180, height: 26 }} />
              : <>
                <h2 style={{ fontSize: 19, fontWeight: 700, color: '#1a1a1a', margin: 0, lineHeight: 1.25 }}>{moreInfo.user?.fullName ?? "O'quvchi"}</h2>
                <p style={{ fontSize: 12, color: '#aaa', margin: '2px 0 0' }}>O'quvchi tafsilotlari</p>
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

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 18 }}>
        {/* Left: profile card */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden' }}>
          <div style={{ padding: '20px', background: C.accentBg, borderBottom: `1px solid #f0e8df`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 58, height: 58, borderRadius: '50%', background: C.accentGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, fontWeight: 700, overflow: 'hidden' }}>
              {avatar
                ? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials ?? <UserOutlined />
              }
            </div>
            {isLoading
              ? <Skeleton.Input active style={{ width: 120 }} />
              : <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a' }}>{moreInfo.user?.fullName ?? "—"}</div>
                <Tag color="blue" style={{ marginTop: 6 }}>O'quvchi</Tag>
              </div>
            }
          </div>
          <div style={{ padding: '4px 20px 8px' }}>
            <InfoRow icon={<FieldNumberOutlined />} label="ID" value={<Tag color="orange">#{studentId}</Tag>} />
            <InfoRow icon={<IdcardOutlined />} label="Username" value={moreInfo.user?.username} isLoading={isLoading} />
            <InfoRow icon={<PhoneOutlined />} label="Telefon" value={moreInfo.user?.phone} isLoading={isLoading} />
            <InfoRow icon={<IdcardOutlined />} label="Karta ID" value={moreInfo.cardId} isLoading={isLoading} />
            <InfoRow icon={<TeamOutlined />} label="Guruh" value={moreInfo.group?.name} isLoading={isLoading} />
            <InfoRow icon={<UserOutlined />} label="Ustoz" value={moreInfo.group?.teacher?.fullName} isLoading={isLoading} />
            <InfoRow icon={<ApartmentOutlined />} label="Yo'nalish" value={moreInfo.group?.direction?.name} isLoading={isLoading} />
            <InfoRow icon={<CalendarOutlined />} label="Yaratilingan" value={formatDate(moreInfo.createdAt)} isLoading={isLoading} />
            <InfoRow icon={<HistoryOutlined />} label="O'zgartirilgan" value={formatDate(moreInfo.updatedAt)} isLoading={isLoading} />
          </div>
        </div>

        {/* Right: sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <SectionCard title="Guruh ma'lumotlari">
            <InfoRow icon={<TeamOutlined />} label="Guruh nomi" value={moreInfo.group?.name} isLoading={isLoading} />
            <InfoRow icon={<UserOutlined />} label="Ustoz" value={moreInfo.group?.teacher?.fullName} isLoading={isLoading} />
            <InfoRow icon={<ApartmentOutlined />} label="Yo'nalish" value={moreInfo.group?.direction?.name} isLoading={isLoading} />
            <InfoRow icon={<CalendarOutlined />} label="Boshlanish" value={formatDate(moreInfo.group?.startDate)} isLoading={isLoading} />
            <InfoRow icon={<HistoryOutlined />} label="Tugash" value={formatDate(moreInfo.group?.endDate)} isLoading={isLoading} />
          </SectionCard>

          {moreInfo.parent && (
            <SectionCard title="Ota-ona ma'lumotlari">
              <InfoRow icon={<UserOutlined />} label="To'liq ismi" value={moreInfo.parent?.user?.fullName} isLoading={isLoading} />
              <InfoRow icon={<PhoneOutlined />} label="Telefon" value={moreInfo.parent?.user?.phone} isLoading={isLoading} />
            </SectionCard>
          )}
        </div>
      </div>

        {canViewAnalytics && (
          <SectionCard title="Test natijalari diagrammasi">
            {analyticsLoading ? (
              <div style={{ padding: 20 }}>
                <Skeleton active paragraph={{ rows: 4 }} />
              </div>
            ) : analytics?.tests?.length ? (
              <div style={{ padding: "16px 0" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 18 }}>
                  <div style={{ padding: 12, borderRadius: 12, background: "#f5ece3" }}>
                    <div style={{ fontSize: 11, color: "#8f5c28", fontWeight: 700 }}>Jami test</div>
                    <div style={{ fontSize: 22, fontWeight: 800 }}>{analytics.totalTests ?? 0}</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 12, background: "#ecfdf5" }}>
                    <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 700 }}>O'rtacha</div>
                    <div style={{ fontSize: 22, fontWeight: 800 }}>{analytics.averageScore ?? 0}%</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 12, background: "#eff6ff" }}>
                    <div style={{ fontSize: 11, color: "#2563eb", fontWeight: 700 }}>Eng yuqori</div>
                    <div style={{ fontSize: 22, fontWeight: 800 }}>{analytics.highestScore ?? 0}%</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 12, background: "#fff7ed" }}>
                    <div style={{ fontSize: 11, color: "#ea580c", fontWeight: 700 }}>Eng past</div>
                    <div style={{ fontSize: 22, fontWeight: 800 }}>{analytics.lowestScore ?? 0}%</div>
                  </div>
                </div>

                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer>
                    <LineChart data={analytics.tests}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <ChartTooltip />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#8f5c28"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div style={{ padding: 20, color: "#999", fontSize: 13 }}>
                Bu o'quvchida hali test natijalari yo'q.
              </div>
            )}
          </SectionCard>
        )}

      {/* Delete modal */}
      {!isReadOnly && (
        <Modal open={delModal} onCancel={() => setDelModal(false)} onOk={() => DeleteStudent()}
          confirmLoading={deleteLoading} okText="Ha, o'chirish" cancelText="Bekor qilish"
          okButtonProps={{ danger: true, style: { borderRadius: 8, fontWeight: 500 } }}
          cancelButtonProps={{ style: { borderRadius: 8 } }}
          title={<span style={{ fontSize: 15, fontWeight: 600, color: '#dc2626' }}>O'chirishni tasdiqlang</span>}
          centered width={380}>
          <p style={{ color: '#666', fontSize: 13.5, margin: '12px 0 4px', lineHeight: 1.6 }}>
            <strong style={{ color: '#1a1a1a' }}>"{moreInfo.user?.fullName}"</strong> o'quvchini o'chirsangiz, uning barcha ma'lumotlari ham o'chib ketadi.
          </p>
        </Modal>
      )}
    </div>
  )
}

export default StudentMore