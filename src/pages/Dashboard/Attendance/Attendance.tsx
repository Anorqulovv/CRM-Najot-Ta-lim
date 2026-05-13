import { useState, type FC } from "react";
import { Tag, Table, Badge, Button, Modal, Select, Spin, Empty, Tabs } from "antd";
import { GetMe } from "../../../service";
import { useCookies } from "react-cookie";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TeamOutlined,
  SaveOutlined,
  BarChartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { QueryPATH } from "../../../components";
import { instance } from "../../../hooks";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface AttendancePageProps {
  title?: string;
}

const C = {
  accent: "#8f5c28",
  accentGradient: "linear-gradient(135deg, #7a4520, #c8864a)",
  accentLight: "#f5ece3",
};

const DAYS_UZ: Record<string, string> = {
  Dushanba: "Du",
  Seshanba: "Se",
  Chorshanba: "Ch",
  Payshanba: "Pa",
  Juma: "Ju",
  Shanba: "Sh",
  Yakshanba: "Ya",
};

const AttendancePage: FC<AttendancePageProps> = ({ title = "Davomat" }) => {
  const [cookies] = useCookies(["accessToken"]);
  const { data: userInfo = {} } = GetMe(cookies.accessToken);
  const queryClient = useQueryClient();

  const role = userInfo?.role;
  const isStudent = role === "STUDENT";
  const isTeacher = role === "TEACHER";
  const canMark =
    isTeacher || role === "SUPERADMIN" || role === "ADMIN";

  const [markModal, setMarkModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [attendanceMap, setAttendanceMap] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState("all");
  const [groupFilterId, setGroupFilterId] = useState<number | null>(null);

  // Guruhlar — ustoz uchun faqat o'zinikini oladi
  const { data: allGroups = [] } = useQuery({
    queryKey: ["mark-groups", userInfo?.id],
    queryFn: () =>
      instance(cookies.accessToken)
        .get("/groups")
        .then((res) => {
          const data = res.data.data || [];
          if (isTeacher)
            return data.filter((g: any) => g.teacherId === userInfo?.id);
          return data;
        }),
    enabled: canMark && !!userInfo?.id,
  });

  const selectedGroup = allGroups.find((g: any) => g.id === selectedGroupId);

  // ✅ TO'G'RILANDI: faqat tanlangan guruh o'quvchilari
  const { data: groupStudents = [], isPending: studentsLoading } = useQuery({
    queryKey: ["group-students", selectedGroupId],
    queryFn: () =>
      instance(cookies.accessToken)
        .get(`/students`, { params: { groupId: selectedGroupId } })
        .then((res) => {
          const all = res.data.data || [];
          return all.filter((s: any) => s.groupId === selectedGroupId);
        }),
    enabled: !!selectedGroupId && markModal,
  });

  const { data: groupAttDetail = [], isPending: groupAttLoading } = useQuery({
    queryKey: ["group-att-detail", groupFilterId],
    queryFn: () =>
      instance(cookies.accessToken)
        .get(`/attendance/group/${groupFilterId}`)
        .then((res) => res.data.data || []),
    enabled: !!groupFilterId && activeTab === "group",
  });

  const handleGroupChange = (groupId: number) => {
    setSelectedGroupId(groupId);
    setAttendanceMap({});
  };

  const { mutate: saveAttendance, isPending: saving } = useMutation({
    mutationFn: (payload: {
      groupId: number;
      attendances: { studentId: number; isPresent: boolean }[];
    }) =>
      instance(cookies.accessToken).post(
        `/attendance/group/${payload.groupId}`,
        { attendances: payload.attendances }
      ),
    onSuccess: () => {
      toast.success("Yo'qlama saqlandi! Ota-onalarga TG xabar yuborildi.");
      setMarkModal(false);
      setSelectedGroupId(null);
      setAttendanceMap({});
      queryClient.invalidateQueries({
        queryKey: [QueryPATH.attendance ?? "attendance"],
      });
      queryClient.invalidateQueries({
        queryKey: ["group-att-detail", groupFilterId],
      });
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? "Xatolik yuz berdi"),
  });

  const handleSave = () => {
    if (!selectedGroupId) return toast.error("Guruh tanlang!");
    if (groupStudents.length === 0)
      return toast.error("Bu guruhda o'quvchilar yo'q");
    const attendances = groupStudents.map((s: any) => ({
      studentId: s.id,
      isPresent: attendanceMap[s.id] !== false,
    }));
    saveAttendance({ groupId: selectedGroupId, attendances });
  };

  const presentCount = groupStudents.filter(
    (s: any) => attendanceMap[s.id] !== false
  ).length;
  const absentCount = groupStudents.length - presentCount;

  // ── Davomat ma'lumotlari ──────────────────────────────────────────
  const attendanceUrl = isStudent ? "/attendance/my" : "/attendance";

  const { data: attendance = [], isPending } = useQuery({
    queryKey: [
      QueryPATH.attendance ?? "attendance",
      isStudent,
      isTeacher ? userInfo?.id : null,
      isTeacher ? allGroups.length : 0,
    ],
    queryFn: () =>
      instance(cookies.accessToken)
        .get(attendanceUrl)
        .then((res) => {
          const data = res.data.data || [];

          // ✅ TO'G'RILANDI: a.student?.groupId ishlatiladi
          if (isTeacher && allGroups.length > 0) {
            const myGroupIds = new Set(allGroups.map((g: any) => g.id));
            return data.filter((a: any) => myGroupIds.has(a.student?.groupId));
          }

          return data;
        }),
    enabled: !!cookies.accessToken && !!role,
  });

  // ── Jadval ustunlari ─────────────────────────────────────────────
  const columns = [
    { title: "Nr", dataIndex: "key", key: "key", width: 60 },
    ...(!isStudent
      ? [
        {
          title: "O'quvchi",
          key: "student",
          render: (_: any, row: any) =>
            row.student?.user?.fullName ?? String(row.studentId ?? "—"),
        },
      ]
      : []),
    {
      title: "Sana va Vaqt",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (val: string) =>
        val ? new Date(val).toLocaleString("uz-UZ") : "—",
    },
    {
      title: "Holat",
      dataIndex: "isPresent",
      key: "isPresent",
      render: (val: boolean) =>
        val ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Keldi
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="error">
            Kelmadi
          </Tag>
        ),
    },
    {
      title: "Turi",
      dataIndex: "type",
      key: "type",
      render: (val: string) => (
        <Badge
          color={val === "TURNSTILE" ? "#8f5c28" : "#2563eb"}
          text={val === "TURNSTILE" ? "Kartadan" : "Qo'lda"}
        />
      ),
    },
  ];

  const dataSource = attendance.map((item: any, index: number) => ({
    ...item,
    key: index + 1,
  }));

  // ── Guruh bo'yicha ustunlar ──────────────────────────────────────
  const groupAttColumns = [
    {
      title: "O'quvchi",
      dataIndex: "fullName",
      key: "fullName",
      render: (v: string) => (
        <span style={{ fontWeight: 600 }}>{v ?? "—"}</span>
      ),
    },
    {
      title: "Keldi",
      key: "present",
      render: (_: any, row: any) => {
        const cnt = (row.attendance ?? []).filter((a: any) => a.isPresent).length;
        return <Tag color="green">{cnt} ta</Tag>;
      },
    },
    {
      title: "Kelmadi",
      key: "absent",
      render: (_: any, row: any) => {
        const cnt = (row.attendance ?? []).filter((a: any) => !a.isPresent).length;
        return <Tag color="red">{cnt} ta</Tag>;
      },
    },
    {
      title: "Davomat %",
      key: "rate",
      render: (_: any, row: any) => {
        const total = (row.attendance ?? []).length;
        const present = (row.attendance ?? []).filter((a: any) => a.isPresent).length;
        const rate = total > 0 ? Math.round((present / total) * 100) : 0;
        return (
          <Tag color={rate >= 80 ? "green" : rate >= 50 ? "orange" : "red"}>
            {rate}%
          </Tag>
        );
      },
    },
    {
      title: "Oxirgi",
      key: "last",
      render: (_: any, row: any) => {
        const last = (row.attendance ?? [])[0];
        if (!last) return <span style={{ color: "#ccc" }}>—</span>;
        const d = new Date(last.timestamp);
        return (
          <span>
            {last.isPresent ? (
              <Tag icon={<CheckCircleOutlined />} color="success" style={{ margin: 0 }}>
                Keldi
              </Tag>
            ) : (
              <Tag icon={<CloseCircleOutlined />} color="error" style={{ margin: 0 }}>
                Kelmadi
              </Tag>
            )}{" "}
            {d.toLocaleDateString("uz-UZ")}
          </span>
        );
      },
    },
  ];

  // ── Tablar ───────────────────────────────────────────────────────
  const tabItems = [
    {
      key: "all",
      label: (
        <span>
          <CalendarOutlined />{" "}
          {isStudent ? "Mening davomatim" : "Barcha yozuvlar"}
        </span>
      ),
      children: (
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={isPending}
          pagination={{ pageSize: 15, showSizeChanger: false }}
          locale={{ emptyText: "Davomat ma'lumotlari topilmadi" }}
          style={{ borderRadius: 12, overflow: "hidden" }}
        />
      ),
    },
    ...(!isStudent && canMark
      ? [
        {
          key: "group",
          label: (
            <span>
              <BarChartOutlined /> Guruh bo'yicha
            </span>
          ),
          children: (
            <div>
              <div style={{ marginBottom: 16 }}>
                <Select
                  placeholder="Guruh tanlang..."
                  style={{ width: 320 }}
                  size="large"
                  value={groupFilterId}
                  onChange={setGroupFilterId}
                  allowClear
                  options={allGroups.map((g: any) => ({
                    label: `${g.name}${g.teacher?.fullName ? ` — ${g.teacher.fullName}` : ""}`,
                    value: g.id,
                  }))}
                />
              </div>
              {!groupFilterId ? (
                <Empty description="Guruh tanlang" />
              ) : (
                <Table
                  loading={groupAttLoading}
                  columns={groupAttColumns}
                  dataSource={groupAttDetail.map((r: any, i: number) => ({
                    ...r,
                    key: i,
                  }))}
                  pagination={{ pageSize: 20, showSizeChanger: false }}
                  locale={{ emptyText: "Bu guruhda davomat yozilmagan" }}
                  size="small"
                  style={{ borderRadius: 10, overflow: "hidden" }}
                />
              )}
            </div>
          ),
        },
      ]
      : []),
  ];

  return (
    <div style={{ padding: "20px", background: "#f8f7f4", minHeight: "100%" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 28,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: C.accentGradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 15px rgba(143,92,40,0.3)",
            }}
          >
            <CalendarOutlined style={{ color: "#fff", fontSize: 22 }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#1a1a1a" }}>
              {title}
            </h1>
            <p style={{ margin: 0, color: "#888", fontSize: 13 }}>
              {isStudent ? "Sizning davomatingiz" : "O'quvchilar davomati"}
            </p>
          </div>
        </div>

        {canMark && (
          <Button
            type="primary"
            size="large"
            icon={<TeamOutlined />}
            onClick={() => setMarkModal(true)}
            style={{
              background: C.accentGradient,
              border: "none",
              borderRadius: 10,
              fontWeight: 600,
              minHeight: 44,
              paddingInline: 22,
              boxShadow: "0 4px 14px rgba(143,92,40,0.3)",
            }}
          >
            Yo'qlama qilish
          </Button>
        )}
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "20px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          style={{ fontWeight: 500 }}
        />
      </div>

      {/* ═══════════════ YO'QLAMA MODALI ═══════════════ */}
      <Modal
        open={markModal}
        onCancel={() => {
          setMarkModal(false);
          setSelectedGroupId(null);
          setAttendanceMap({});
        }}
        footer={null}
        width={640}
        styles={{ body: { padding: 0 } }}
        closable={false}
        centered
      >
        {/* Gradient Header */}
        <div
          style={{
            background: C.accentGradient,
            padding: "24px 28px 20px",
            position: "relative",
            borderRadius: "8px 8px 0 0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                minHeight: 44,
                borderRadius: 12,
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CalendarOutlined style={{ color: "#fff", fontSize: 20 }} />
            </div>
            <div>
              <h2 style={{ margin: 0, color: "#fff", fontSize: 18, fontWeight: 700 }}>
                Yo'qlama qilish
              </h2>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.75)", fontSize: 13 }}>
                {new Date().toLocaleDateString("uz-UZ", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setMarkModal(false);
              setSelectedGroupId(null);
              setAttendanceMap({});
            }}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              background: "rgba(255,255,255,0.2)",
              border: "none",
              width: 32,
              height: 32,
              borderRadius: 8,
              cursor: "pointer",
              color: "#fff",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Guruh tanlash */}
        <div style={{ padding: "20px 28px 0" }}>
          <label
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: C.accent,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              display: "block",
              marginBottom: 8,
            }}
          >
            Guruh tanlang
          </label>
          <Select
            placeholder="Guruh tanlang..."
            style={{ width: "100%" }}
            size="large"
            value={selectedGroupId}
            onChange={handleGroupChange}
            options={allGroups.map((g: any) => ({
              label: (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{g.name}</span>
                  <span style={{ fontSize: 11, color: "#aaa", display: "flex", gap: 6 }}>
                    {g.lessonTime && <span>🕐{g.lessonTime}</span>}
                    {g.lessonDays?.slice(0, 3).map((d: string) => (
                      <span
                        key={d}
                        style={{
                          background: "#f5ece3",
                          color: C.accent,
                          borderRadius: 4,
                          padding: "0 4px",
                          fontWeight: 600,
                        }}
                      >
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

        {/* Dars jadvali badge */}
        {selectedGroup &&
          (selectedGroup.lessonDays?.length > 0 || selectedGroup.lessonTime) && (
            <div style={{ padding: "10px 28px 0", display: "flex", gap: 6, flexWrap: "wrap" }}>
              {selectedGroup.lessonDays?.map((d: string) => (
                <span
                  key={d}
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 20,
                    background: C.accentLight,
                    color: C.accent,
                    border: "1px solid #e8d5c4",
                  }}
                >
                  {d}
                </span>
              ))}
              {selectedGroup.lessonTime && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 20,
                    background: "#e0f2fe",
                    color: "#0369a1",
                    border: "1px solid #bae6fd",
                  }}
                >
                  🕐 {selectedGroup.lessonTime}
                  {selectedGroup.lessonDuration
                    ? ` — ${selectedGroup.lessonDuration} daqiqa`
                    : ""}
                </span>
              )}
            </div>
          )}

        {/* O'quvchilar ro'yxati */}
        {selectedGroupId && (
          <div style={{ padding: "16px 28px" }}>
            {/* Statistika */}
            {!studentsLoading && groupStudents.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <CheckCircleOutlined style={{ color: "#16a34a", fontSize: 18 }} />
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#16a34a", lineHeight: 1 }}>
                      {presentCount}
                    </div>
                    <div style={{ fontSize: 11, color: "#86efac" }}>Keldi</div>
                  </div>
                </div>
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: "#fff5f5",
                    border: "1px solid #fecaca",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <CloseCircleOutlined style={{ color: "#dc2626", fontSize: 18 }} />
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#dc2626", lineHeight: 1 }}>
                      {absentCount}
                    </div>
                    <div style={{ fontSize: 11, color: "#fca5a5" }}>Kelmadi</div>
                  </div>
                </div>
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <TeamOutlined style={{ color: "#d97706", fontSize: 18 }} />
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#d97706", lineHeight: 1 }}>
                      {groupStudents.length}
                    </div>
                    <div style={{ fontSize: 11, color: "#fcd34d" }}>Jami</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tezkor amallar */}
            {!studentsLoading && groupStudents.length > 0 && (
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <button
                  onClick={() => {
                    const map: Record<number, boolean> = {};
                    groupStudents.forEach((s: any) => (map[s.id] = true));
                    setAttendanceMap(map);
                  }}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1.5px solid #bbf7d0",
                    background: "#f0fdf4",
                    color: "#16a34a",
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                  }}
                >
                  <CheckCircleOutlined /> Barchasi keldi
                </button>
                <button
                  onClick={() => {
                    const map: Record<number, boolean> = {};
                    groupStudents.forEach((s: any) => (map[s.id] = false));
                    setAttendanceMap(map);
                  }}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1.5px solid #fecaca",
                    background: "#fff5f5",
                    color: "#dc2626",
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                  }}
                >
                  <CloseCircleOutlined /> Barchasi kelmadi
                </button>
              </div>
            )}

            {/* O'quvchi kartalar */}
            <div
              style={{
                border: "1px solid #f0e9e2",
                borderRadius: 12,
                overflow: "hidden",
                maxHeight: 320,
                overflowY: "auto",
              }}
            >
              {studentsLoading ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <Spin size="large" />
                  <p style={{ color: "#aaa", marginTop: 12 }}>Yuklanmoqda...</p>
                </div>
              ) : groupStudents.length === 0 ? (
                <div style={{ padding: 32 }}>
                  <Empty description="Bu guruhda o'quvchilar yo'q" />
                </div>
              ) : (
                groupStudents.map((student: any, idx: number) => {
                  const isPresent = attendanceMap[student.id] !== false;
                  const initials =
                    student.user?.fullName
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2) ?? "?";
                  return (
                    <div
                      key={student.id}
                      onClick={() =>
                        setAttendanceMap((prev) => ({
                          ...prev,
                          [student.id]: !isPresent,
                        }))
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "11px 16px",
                        borderBottom:
                          idx < groupStudents.length - 1
                            ? "1px solid #faf5f0"
                            : "none",
                        background: isPresent ? "#f8fff9" : "#fff9f9",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: isPresent
                              ? "linear-gradient(135deg, #4ade80, #16a34a)"
                              : "linear-gradient(135deg, #f87171, #dc2626)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontSize: 13,
                            fontWeight: 800,
                            flexShrink: 0,
                            boxShadow: isPresent
                              ? "0 2px 8px rgba(22,163,74,0.25)"
                              : "0 2px 8px rgba(220,38,38,0.25)",
                          }}
                        >
                          {initials || <UserOutlined style={{ fontSize: 13 }} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13.5, color: "#1a1a1a" }}>
                            {student.user?.fullName ?? "—"}
                          </div>
                          <div style={{ fontSize: 11, color: "#bbb" }}>
                            {student.user?.phone ?? ""}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "5px 13px",
                          borderRadius: 20,
                          background: isPresent ? "#dcfce7" : "#fee2e2",
                          border: `1.5px solid ${isPresent ? "#86efac" : "#fca5a5"}`,
                        }}
                      >
                        {isPresent ? (
                          <CheckCircleOutlined style={{ color: "#16a34a", fontSize: 14 }} />
                        ) : (
                          <CloseCircleOutlined style={{ color: "#dc2626", fontSize: 14 }} />
                        )}
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: 12,
                            color: isPresent ? "#16a34a" : "#dc2626",
                          }}
                        >
                          {isPresent ? "Keldi" : "Kelmadi"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <p style={{ fontSize: 11.5, color: "#bbb", marginTop: 8, textAlign: "center" }}>
              O'quvchi kartasiga bosib holatini o'zgartiring
            </p>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            padding: "12px 28px 24px",
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          <Button
            onClick={() => {
              setMarkModal(false);
              setSelectedGroupId(null);
              setAttendanceMap({});
            }}
            size="large"
            style={{
              borderRadius: 10,
              height: 42,
              paddingInline: 20,
              borderColor: "#e5d8cc",
              color: "#777",
            }}
          >
            Bekor qilish
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            size="large"
            loading={saving}
            disabled={!selectedGroupId || groupStudents.length === 0}
            onClick={handleSave}
            style={{
              background: C.accentGradient,
              border: "none",
              borderRadius: 10,
              fontWeight: 700,
              height: 42,
              paddingInline: 24,
              boxShadow: "0 4px 14px rgba(143,92,40,0.3)",
            }}
          >
            Saqlash va xabar yuborish
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AttendancePage;