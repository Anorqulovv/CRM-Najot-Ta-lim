import { Input, Modal, Select, Spin, Empty } from "antd"
import { SearchOutlined, CalendarOutlined, CheckCircleOutlined, CloseCircleOutlined, TeamOutlined, SaveOutlined, UserOutlined } from "@ant-design/icons"
import { Caption, CustomSelect, CustomTable, QueryPATH } from "../../../components"
import { useEffect, useState, type FC } from "react"
import { GetAll } from "../../../service"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { instance } from "../../../hooks"
import { Tooltip } from "antd"
import { useCookies } from "react-cookie"
import { useNavigate } from "react-router-dom"
import { debounce } from "../../../hooks"
import { useCurrentUser } from "../../../hooks/useCurrentUser"
import { GetMe } from "../../../service"
import toast from "react-hot-toast"

const INPUT_STYLE: React.CSSProperties = {
  borderRadius: 10, borderColor: '#e5d8cc',
  background: '#fff', fontSize: 13.5,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
}

const C = {
  accent: '#8f5c28',
  accentGradient: 'linear-gradient(135deg, #7a4520, #c8864a)',
  accentLight: '#f5ece3',
}

const DAYS_UZ: Record<string, string> = {
  Dushanba: "Du", Seshanba: "Se", Chorshanba: "Ch",
  Payshanba: "Pa", Juma: "Ju", Shanba: "Sh", Yakshanba: "Ya",
}

interface GroupType {
  title: string
  stackPropId?: number | null
  teacherPropId?: number | null
  supportPropId?: number | null
  basePath?: string
}

// ── Yo'qlama Modal ──────────────────────────────────────────────
const AttendanceModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [cookies] = useCookies(["accessToken"])
  const { data: userInfo = {} } = GetMe(cookies.accessToken)
  const queryClient = useQueryClient()

  const role = userInfo?.role
  const isTeacher = role === "TEACHER"

  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
  const [attendanceMap, setAttendanceMap] = useState<Record<number, boolean>>({})

  const { data: allGroups = [] } = useQuery({
    queryKey: ["mark-groups-modal", userInfo?.id],
    queryFn: () =>
      instance(cookies.accessToken)
        .get("/groups")
        .then((res) => {
          const data = res.data.data || []
          if (isTeacher) return data.filter((g: any) => g.teacherId === userInfo?.id)
          return data
        }),
    enabled: open && !!userInfo?.id,
  })



  const selectedGroup = allGroups.find((g: any) => g.id === selectedGroupId)

  const { data: groupStudents = [], isPending: studentsLoading } = useQuery({
    queryKey: ["group-students-modal", selectedGroupId],
    queryFn: () =>
      instance(cookies.accessToken)
        .get(`/students`, { params: { groupId: selectedGroupId } })
        .then((res) => {
          const all = res.data.data || []
          // Client-side filter — faqat shu guruh studentlari
          return all.filter((s: any) => s.groupId === selectedGroupId)
        }),

  })




  const { mutate: saveAttendance, isPending: saving } = useMutation({
    mutationFn: (payload: { groupId: number; attendances: { studentId: number; isPresent: boolean }[] }) =>
      instance(cookies.accessToken).post(`/attendance/group/${payload.groupId}`, {
        attendances: payload.attendances,
      }),
    onSuccess: () => {
      toast.success("Yo'qlama saqlandi! Ota-onalarga TG xabar yuborildi.")
      handleClose()
      queryClient.invalidateQueries({ queryKey: ["attendance"] })
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? "Xatolik yuz berdi"),
  })

  const handleClose = () => {
    setSelectedGroupId(null)
    setAttendanceMap({})
    onClose()
  }

  const handleGroupChange = (groupId: number) => {
    setSelectedGroupId(groupId)
    setAttendanceMap({})
  }

  const handleSave = () => {
    if (!selectedGroupId) return toast.error("Guruh tanlang!")
    if (groupStudents.length === 0) return toast.error("Bu guruhda o'quvchilar yo'q")
    const attendances = groupStudents.map((s: any) => ({
      studentId: s.id,
      isPresent: attendanceMap[s.id] !== false,
    }))
    saveAttendance({ groupId: selectedGroupId, attendances })
  }

  const presentCount = groupStudents.filter((s: any) => attendanceMap[s.id] !== false).length
  const absentCount = groupStudents.length - presentCount

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={620}
      styles={{ body: { padding: 0 } }}
      closable={false}
      centered
    >
      {/* Gradient Header */}
      <div style={{
        background: C.accentGradient,
        padding: "22px 28px 18px",
        borderRadius: "16px 16px 0 0",
        position: "relative",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 14,
            background: "rgba(255,255,255,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(4px)",
          }}>
            <CalendarOutlined style={{ color: "#fff", fontSize: 20 }} />
          </div>
          <div>
            <h2 style={{ margin: 0, color: "#fff", fontSize: 18, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
              Yo'qlama qilish
            </h2>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.72)", fontSize: 12.5 }}>
              {new Date().toLocaleDateString("uz-UZ", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
        <button
          onClick={handleClose}
          style={{
            position: "absolute", top: 16, right: 16,
            background: "rgba(255,255,255,0.18)", border: "none",
            width: 32, height: 32, borderRadius: 9, cursor: "pointer",
            color: "#fff", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >✕</button>
      </div>

      {/* Group selector */}
      <div style={{ padding: "20px 28px 0" }}>
        <label style={{
          fontSize: 11, fontWeight: 700, color: C.accent,
          textTransform: "uppercase", letterSpacing: "0.6px",
          display: "block", marginBottom: 8,
        }}>Guruh tanlang</label>
        <Select
          placeholder="Guruh tanlang..."
          style={{ width: "100%" }}
          size="large"
          value={selectedGroupId}
          onChange={handleGroupChange}
          options={allGroups.map((g: any) => ({
            label: (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontWeight: 600 }}>{g.name}</span>
                <span style={{ fontSize: 11, color: "#aaa", display: "flex", gap: 5 }}>
                  {g.lessonTime && <span>🕐{g.lessonTime}</span>}
                  {g.lessonDays?.slice(0, 3).map((d: string) => (
                    <span key={d} style={{ background: "#f5ece3", color: C.accent, borderRadius: 4, padding: "0 4px", fontWeight: 600 }}>
                      {DAYS_UZ[d] ?? d}
                    </span>
                  ))}
                </span>
              </div>
            ),
            value: g.id,
          }))}
          optionLabelProp="label"
        />
      </div>

      {/* Schedule badges */}
      {selectedGroup && (selectedGroup.lessonDays?.length > 0 || selectedGroup.lessonTime) && (
        <div style={{ padding: "10px 28px 0", display: "flex", gap: 6, flexWrap: "wrap" }}>
          {selectedGroup.lessonDays?.map((d: string) => (
            <span key={d} style={{
              fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
              background: C.accentLight, color: C.accent, border: "1px solid #e8d5c4",
            }}>{d}</span>
          ))}
          {selectedGroup.lessonTime && (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
              background: "#e0f2fe", color: "#0369a1", border: "1px solid #bae6fd",
            }}>🕐 {selectedGroup.lessonTime}{selectedGroup.lessonDuration ? ` — ${selectedGroup.lessonDuration} daq` : ""}</span>
          )}
        </div>
      )}

      {/* Students */}
      {selectedGroupId && (
        <div style={{ padding: "16px 28px" }}>
          {/* Stats */}
          {!studentsLoading && groupStudents.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
              {[
                { count: presentCount, label: "Keldi", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", icon: <CheckCircleOutlined /> },
                { count: absentCount, label: "Kelmadi", color: "#dc2626", bg: "#fff5f5", border: "#fecaca", icon: <CloseCircleOutlined /> },
                { count: groupStudents.length, label: "Jami", color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: <TeamOutlined /> },
              ].map((s) => (
                <div key={s.label} style={{
                  padding: "10px 14px", borderRadius: 12,
                  background: s.bg, border: `1px solid ${s.border}`,
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{ color: s.color, fontSize: 16 }}>{s.icon}</span>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1, fontFamily: "'Outfit', sans-serif" }}>{s.count}</div>
                    <div style={{ fontSize: 11, color: s.color, opacity: 0.7 }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick actions */}
          {!studentsLoading && groupStudents.length > 0 && (
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <button
                onClick={() => {
                  const map: Record<number, boolean> = {}
                  groupStudents.forEach((s: any) => (map[s.id] = true))
                  setAttendanceMap(map)
                }}
                style={{
                  flex: 1, padding: "8px 12px", borderRadius: 10,
                  border: "1.5px solid #bbf7d0", background: "#f0fdf4",
                  color: "#16a34a", fontWeight: 600, fontSize: 12.5,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              ><CheckCircleOutlined /> Barchasi keldi</button>
              <button
                onClick={() => {
                  const map: Record<number, boolean> = {}
                  groupStudents.forEach((s: any) => (map[s.id] = false))
                  setAttendanceMap(map)
                }}
                style={{
                  flex: 1, padding: "8px 12px", borderRadius: 10,
                  border: "1.5px solid #fecaca", background: "#fff5f5",
                  color: "#dc2626", fontWeight: 600, fontSize: 12.5,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              ><CloseCircleOutlined /> Barchasi kelmadi</button>
            </div>
          )}

          {/* Student list */}
          <div style={{
            border: "1px solid #f0e9e2", borderRadius: 14, overflow: "hidden",
            maxHeight: 300, overflowY: "auto",
          }}>
            {studentsLoading ? (
              <div style={{ textAlign: "center", padding: 40 }}>
                <Spin size="large" />
                <p style={{ color: "#aaa", marginTop: 12, fontSize: 13 }}>Yuklanmoqda...</p>
              </div>
            ) : groupStudents.length === 0 ? (
              <div style={{ padding: 32 }}>
                <Empty description="Bu guruhda o'quvchilar yo'q" />
              </div>
            ) : (
              groupStudents.map((student: any, idx: number) => {
                const isPresent = attendanceMap[student.id] !== false
                const initials = student.user?.fullName?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?"
                return (
                  <div
                    key={student.id}
                    onClick={() => setAttendanceMap(prev => ({ ...prev, [student.id]: !isPresent }))}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "11px 16px",
                      borderBottom: idx < groupStudents.length - 1 ? "1px solid #faf5f0" : "none",
                      background: isPresent ? "#f9fffa" : "#fff9f9",
                      cursor: "pointer", userSelect: "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: "50%",
                        background: isPresent
                          ? "linear-gradient(135deg, #4ade80, #16a34a)"
                          : "linear-gradient(135deg, #f87171, #dc2626)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontSize: 13, fontWeight: 800, flexShrink: 0,
                        boxShadow: isPresent ? "0 2px 10px rgba(22,163,74,0.25)" : "0 2px 10px rgba(220,38,38,0.25)",
                        fontFamily: "'Outfit', sans-serif",
                      }}>
                        {initials || <UserOutlined style={{ fontSize: 14 }} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13.5, color: "#1a1a1a" }}>
                          {student.user?.fullName ?? "—"}
                        </div>
                        <div style={{ fontSize: 11.5, color: "#bbb" }}>{student.user?.phone ?? ""}</div>
                      </div>
                    </div>

                    <div style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "5px 14px", borderRadius: 20,
                      background: isPresent ? "#dcfce7" : "#fee2e2",
                      border: `1.5px solid ${isPresent ? "#86efac" : "#fca5a5"}`,
                    }}>
                      {isPresent
                        ? <CheckCircleOutlined style={{ color: "#16a34a", fontSize: 13 }} />
                        : <CloseCircleOutlined style={{ color: "#dc2626", fontSize: 13 }} />
                      }
                      <span style={{ fontWeight: 700, fontSize: 12, color: isPresent ? "#16a34a" : "#dc2626" }}>
                        {isPresent ? "Keldi" : "Kelmadi"}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
          <p style={{ fontSize: 11.5, color: "#bbb", marginTop: 8, textAlign: "center" }}>
            O'quvchi kartasiga bosib holatini o'zgartiring
          </p>
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: "12px 28px 24px", display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button
          onClick={handleClose}
          style={{
            padding: "10px 22px", borderRadius: 10,
            border: "1px solid #e5d8cc", background: "#fff",
            color: "#777", fontWeight: 600, fontSize: 13.5, cursor: "pointer",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >Bekor qilish</button>
        <button
          onClick={handleSave}
          disabled={!selectedGroupId || groupStudents.length === 0 || saving}
          style={{
            padding: "10px 24px", borderRadius: 10,
            background: (!selectedGroupId || groupStudents.length === 0) ? "#e5d8cc" : C.accentGradient,
            border: "none", color: "#fff", fontWeight: 700,
            fontSize: 13.5, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8,
            boxShadow: "0 4px 14px rgba(143,92,40,0.28)",
            opacity: saving ? 0.7 : 1,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {saving ? <Spin size="small" style={{ marginRight: 4 }} /> : <SaveOutlined />}
          Saqlash va xabar yuborish
        </button>
      </div>
    </Modal>
  )
}

// ── Main Groups component ────────────────────────────────────────
const Groups: FC<GroupType> = ({
  stackPropId, teacherPropId, supportPropId, basePath = "/groups"
}) => {
  const [cookies] = useCookies(["accessToken"])
  const navigate = useNavigate()
  const currentUser = useCurrentUser()

  const isSupport = currentUser?.role === "SUPPORT"
  const isTeacher = currentUser?.role === "TEACHER"
  const canMark = ['SUPERADMIN', 'ADMIN', 'TEACHER'].includes(currentUser?.role ?? '')

  const [directionId, setDirectionId] = useState<number | null>(stackPropId ?? null)
  const [teacherId, setTeacherId] = useState<number | null>(
    isTeacher ? currentUser?.id : (teacherPropId ?? null)
  )
  const [branchId, setBranchId] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const [attendanceModal, setAttendanceModal] = useState(false)
  const name = debounce(search, 1000)

  useEffect(() => { setDirectionId(stackPropId ?? null) }, [stackPropId])
  useEffect(() => {
    if (!isTeacher) setTeacherId(teacherPropId ?? null)
  }, [teacherPropId, isTeacher])

  const handleDirectionChange = (val: any) => {
    setDirectionId(val ? Number(val) : null)
    if (!teacherPropId && !isTeacher) setTeacherId(null)
  }

  function returnFn(value: any) {
    return {
      ...value,
      key: value.id,
      teacherName: value.teacher?.fullName ?? value.teacherId ?? "➖",
    }
  }

  const isAdminOrTeacher = ['SUPERADMIN', 'ADMIN', 'TEACHER'].includes(currentUser?.role ?? '')

  const ScoreCell = ({ groupId }: { groupId: number }) => {
    const { data } = useQuery({
      queryKey: ['group-score', groupId],
      queryFn: () =>
        instance(cookies.accessToken)
          .get(`/groups/${groupId}/score`)
          .then(r => r.data.data),
      enabled: !!groupId && isAdminOrTeacher,
      staleTime: 60_000,
    })
    if (!data) return <span style={{ color: '#ccc' }}>—</span>
    const gradeColor: Record<string, string> = { A: '#16a34a', B: '#2563eb', C: '#ca8a04', D: '#ea580c', F: '#dc2626' }
    return (
      <Tooltip title={`Test: ${data.avgTestScore}% | Davomat: ${data.attendanceRate}%`}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '3px 12px', borderRadius: 20,
          background: gradeColor[data.grade] + '18',
          border: `1px solid ${gradeColor[data.grade]}40`,
          fontWeight: 700, fontSize: 13,
          color: gradeColor[data.grade] ?? '#555',
        }}>
          {data.grade} <span style={{ fontWeight: 400, fontSize: 11, color: '#888' }}>({data.overallScore}%)</span>
        </span>
      </Tooltip>
    )
  }

  const columns = [
    { title: "ID", dataIndex: "key" },
    { title: "Nomi", dataIndex: "name" },
    { title: "Ustoz", dataIndex: "teacherName" },
    {
      title: "Dars jadvali", dataIndex: "lessonDays",
      render: (_: any, row: any) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {row.lessonTime && (
            <span style={{ fontSize: 12, fontWeight: 700, color: '#8f5c28' }}>🕐 {row.lessonTime}{row.lessonDuration ? ` (${row.lessonDuration}daq)` : ''}</span>
          )}
          {row.lessonDays && row.lessonDays.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {row.lessonDays.map((d: string) => (
                <span key={d} style={{
                  fontSize: 10.5, background: '#f5ece3', color: '#8f5c28',
                  borderRadius: 5, padding: '2px 7px', fontWeight: 600,
                }}>{d}</span>
              ))}
            </div>
          ) : <span style={{ color: '#ddd', fontSize: 12 }}>—</span>}
        </div>
      ),
    },
    {
      title: "Holat", dataIndex: "status",
      render: (status: string) => (
        <span style={{
          color: status === "ACTIVE" ? "#16a34a" : "#dc2626",
          fontWeight: 600, fontSize: 13,
          display: 'inline-flex', alignItems: 'center', gap: 5,
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: status === "ACTIVE" ? "#16a34a" : "#dc2626",
            display: 'inline-block',
          }} />
          {status === "ACTIVE" ? "Faol" : status}
        </span>
      ),
    },
    ...(isAdminOrTeacher ? [{
      title: "Ko'rsatkich",
      dataIndex: "id",
      render: (_: any, row: any) => <ScoreCell groupId={row.id} />,
    }] : []),
    { title: "Batafsil", dataIndex: "action" },
  ]

  const { data: allGroups = [], isPending } = GetAll(
    QueryPATH.groups, [name], cookies.accessToken, "/groups", {}, navigate, returnFn, basePath
  )

  const groups = allGroups
    .filter((g: any) => {
      const matchName = !name || g.name?.toLowerCase().includes(name.toLowerCase())
      const matchDirection = !directionId || g.directionId === directionId
      const matchTeacher = isTeacher
        ? g.teacherId === Number(currentUser?.id)
        : (!teacherId || g.teacherId === teacherId)
      const matchSupport = isSupport
        ? g.supportId === Number(currentUser?.id)
        : (!supportPropId || g.supportId === supportPropId)
      const matchBranch = !branchId || g.branchId === branchId
      return matchName && matchDirection && matchTeacher && matchSupport && matchBranch
    })
    .map((g: any, index: number) => ({ ...g, key: index + 1 }))

  const renderLayout = (filters: React.ReactNode) => (
    <div style={{ padding: '20px' }}>
      <Caption count={groups.length} title="Guruxlar" />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <Input
          onChange={(e) => setSearch(e.target.value)}
          prefix={<SearchOutlined style={{ color: '#c8864a' }} />}
          size="large"
          allowClear
          placeholder="Qidirish..."
          style={{ ...INPUT_STYLE, width: 260 }}
        />
        {filters}

        {/* Yo'qlama button */}
        {canMark && (
          <button
            onClick={() => setAttendanceModal(true)}
            style={{
              marginLeft: 'auto',
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 20px', borderRadius: 10,
              background: 'linear-gradient(135deg, #7a4520, #c8864a)',
              border: 'none', color: '#fff', fontWeight: 700,
              fontSize: 13.5, cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(143,92,40,0.3)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <CalendarOutlined />
            Yo'qlama qilish
          </button>
        )}
      </div>

      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <CustomTable loading={isPending} columns={columns} data={groups} />
      </div>

      {/* Attendance modal */}
      <AttendanceModal open={attendanceModal} onClose={() => setAttendanceModal(false)} />
    </div>
  )

  if (isTeacher) return renderLayout(null)

  if (isSupport) return renderLayout(
    <CustomSelect
      disabled={!!teacherPropId}
      placeholder="Ustoz tanlang"
      URL="/teachers"
      queryKey={QueryPATH.teachers}
      setValue={(val: any) => setTeacherId(val ? Number(val) : null)}
      value={teacherId}
    />
  )

  return renderLayout(
    <>
      <CustomSelect
        disabled={!!stackPropId}
        placeholder="Yo'nalish tanlang"
        URL="/directions"
        queryKey={QueryPATH.directions}
        setValue={handleDirectionChange}
        value={directionId}
      />
      <CustomSelect
        disabled={!!teacherPropId}
        params={directionId ? { directionId } : {}}
        placeholder="Ustoz tanlang"
        URL="/teachers"
        queryKey={QueryPATH.teachers}
        setValue={(val: any) => setTeacherId(val ? Number(val) : null)}
        value={teacherId}
      />
      <CustomSelect
        placeholder="Filial tanlang"
        URL="/branches"
        queryKey={QueryPATH.branches}
        setValue={(val: any) => setBranchId(val ? Number(val) : null)}
        value={branchId}
      />
    </>
  )
}

export default Groups
