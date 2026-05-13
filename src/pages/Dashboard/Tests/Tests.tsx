import { useState, type FC, type JSX } from "react";
import { Button, Input, Modal, Tag, Tooltip, Progress } from "antd";
import { Delete, GetAll, GetById, GetMe } from "../../../service";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { debounce } from "../../../hooks";
import {
  DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined,
  FileTextOutlined, ClockCircleOutlined, CalendarOutlined,
  ThunderboltOutlined, ApartmentOutlined, TeamOutlined,
  PlayCircleOutlined, TrophyOutlined, CheckCircleFilled, CloseCircleFilled,
  LockOutlined,
} from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { QueryPATH, PATH } from "../../../components";
import { useCurrentUser } from "../../../hooks/useCurrentUser";

interface TestsType { title: string; }

const typeConfig: Record<string, { label: string; color: string; icon: JSX.Element; bg: string }> = {
  DAILY: { label: "Kunlik", color: "#16a34a", icon: <ClockCircleOutlined />, bg: "linear-gradient(135deg, #dcfce7, #bbf7d0)" },
  WEEKLY: { label: "Haftalik", color: "#2563eb", icon: <CalendarOutlined />, bg: "linear-gradient(135deg, #dbeafe, #bfdbfe)" },
  MONTHLY: { label: "Oylik", color: "#7c3aed", icon: <ThunderboltOutlined />, bg: "linear-gradient(135deg, #ede9fe, #ddd6fe)" },
};

const Tests: FC<TestsType> = ({ title }) => {
  const [cookies] = useCookies(["accessToken"]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: userInfo = {} } = GetMe(cookies.accessToken);

  const currentUser = useCurrentUser();
  const isTeacher = currentUser?.role === "TEACHER";
  const canManage = ["SUPERADMIN", "ADMIN", "TEACHER"].includes(userInfo?.role);
  const canDelete = ["SUPERADMIN", "ADMIN"].includes(userInfo?.role);
  const isStudent = userInfo?.role === "STUDENT";

  const [delModal, setDelModal] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "DAILY" | "WEEKLY" | "MONTHLY">("ALL");
  const name = debounce(search, 1000);

  // Barcha testlar
  const { data: allTests = [], isPending } = GetAll(
    QueryPATH.tests,
    [name],
    cookies.accessToken,
    "/tests",
    { title: name }
  );

  // Teacher o'zining directionId sini olish uchun
  const { data: myTeacherInfo = {} } = GetById(
    isTeacher ? String(currentUser?.id) : undefined,
    cookies.accessToken,
    QueryPATH.teachersMore,
    "/teachers"
  );

  // Teacher o'ziga tegishli guruhlarni alohida endpoint dan olish
  const { data: myGroupsRaw = [] } = GetAll(
    QueryPATH.groups,
    [isTeacher ? currentUser?.id : null],
    cookies.accessToken,
    "/groups",
    isTeacher && currentUser?.id ? { teacherId: currentUser.id } : {},
    undefined,
    undefined
  );

  // Studentni topish uchun barcha studentlar olinadi.
  // Muhim: student role'dagi user faqat o'z groupId va group.directionId bo'yicha test ko'rishi kerak.
  const { data: allStudentsRaw = [] } = GetAll(
    QueryPATH.students,
    [isStudent ? userInfo?.id : null],
    cookies.accessToken,
    "/students",
    {},
    undefined,
    undefined
  );

  const currentStudent = isStudent
    ? allStudentsRaw.find((student: any) => {
        const userId = Number(student.userId ?? student.user?.id);
        return userId === Number(userInfo?.id);
      })
    : null;

  const studentGroupId = Number(
    currentStudent?.groupId ??
    currentStudent?.group?.id ??
    0
  );

  const studentDirectionId = Number(
    currentStudent?.group?.directionId ??
    currentStudent?.directionId ??
    currentStudent?.direction?.id ??
    userInfo?.directionId ??
    0
  );

  // Teacher guruh ID lari
  const myGroupIds: number[] = isTeacher
    ? myGroupsRaw.map((g: any) => Number(g.id))
    : [];

  const isTestForStudent = (test: any) => {
    // Guruhi yo'q o'quvchiga hech qanday test ko'rinmasin
    if (!studentGroupId) return false;

    // Guruhga biriktirilgan test faqat o'sha guruh o'quvchilariga ko'rinsin
    if (test.groupId) {
      return Number(test.groupId) === studentGroupId;
    }

    // Yo'nalishga biriktirilgan test faqat o'quvchining guruhi shu yo'nalishda bo'lsa ko'rinsin
    if (test.directionId) {
      return Number(test.directionId) === studentDirectionId;
    }

    // Umumiy test studentga ko'rinmasin
    return false;
  };

  const isTestForTeacher = (test: any) => {
    // Guruhga bog'liq test — o'sha guruh teacherniki bo'lishi kerak
    if (test.groupId) {
      return myGroupIds.includes(Number(test.groupId));
    }

    // Yo'nalishga bog'liq test — teacher shu yo'nalishda bo'lishi kerak
    if (test.directionId) {
      return Number(test.directionId) === Number(myTeacherInfo?.directionId);
    }

    // Umumiy test teacher uchun ko'rsatilmaydi
    return false;
  };

  // Student uchun backendning o'zi faqat o'z guruhiga tegishli testlarni qaytaradi.
  // Frontendda qayta filter qilsak, /students response ichida groupId topilmasa testlar yashirinib qoladi.
  const roleFilteredTests = isStudent
    ? allTests
    : isTeacher
      ? allTests.filter(isTestForTeacher)
      : allTests;

  const tests = typeFilter === "ALL"
    ? roleFilteredTests
    : roleFilteredTests.filter((test: any) => test.type === typeFilter);

  const deleteUrl = selectedId ? `/tests/${selectedId}` : "";
  const { mutate: DeleteTest, isPending: deleteLoading } = Delete(
    cookies.accessToken, deleteUrl, undefined, queryClient, QueryPATH.tests
  );

  const handleDelete = () => {
    DeleteTest();
    setDeleted(true);
    setTimeout(() => {
      setDelModal(false);
      setSelectedId(null);
      setDeleted(false);
    }, 2000);
  };

  const handleCardClick = (test: any) => {
    if (isStudent) {
      if (test.myResult) {
        navigate(`/tests/${test.id}`);
      } else {
        navigate(`/tests/${test.id}/take`);
      }
    } else {
      navigate(`/tests/${test.id}`);
    }
  };

  return (
    <div style={{ padding: "20px", background: "#f8f7f4", minHeight: "100%" }}>

      {/* ── Tepa: Sarlavha + Yaratish tugmasi ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #8f5c28, #b8782a)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 15px rgba(143,92,40,0.3)" }}>
            <FileTextOutlined style={{ color: "#fff", fontSize: 22 }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#1a1a1a" }}>{title}</h1>
            <span style={{ color: "#8b7355", fontSize: 13 }}>
              {isStudent
                ? `Sizga tegishli ${tests.length} ta test`
                : isTeacher
                  ? `Sizning guruhlaringizga tegishli ${tests.length} ta test`
                  : `Jami ${tests.length} ta test mavjud`}
            </span>
          </div>
        </div>

        {canManage && (
          <Button
            onClick={() => navigate(PATH.testsCreate)}
            size="large"
            icon={<PlusOutlined />}
            style={{ background: "linear-gradient(135deg, #8f5c28, #b8782a)", border: "none", color: "#fff", borderRadius: 12, height: 46, paddingInline: 24, fontWeight: 600, boxShadow: "0 4px 15px rgba(143,92,40,0.3)" }}
          >
            Yangi test
          </Button>
        )}
      </div>

      {/* Student info banner */}
      {isStudent && (
        <div style={{ marginBottom: 20, padding: "12px 18px", borderRadius: 12, background: "#dbeafe", border: "1px solid #93c5fd", color: "#1d4ed8", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
          <TeamOutlined />
          <span>Faqat sizning guruhingizga va yo'nalishingizga tegishli testlar ko'rsatilmoqda. Testni boshlash uchun kartochkaga bosing.</span>
        </div>
      )}

      {/* Teacher info banner */}
      {isTeacher && (
        <div style={{ marginBottom: 20, padding: "12px 18px", borderRadius: 12, background: "#fef9c3", border: "1px solid #fde047", color: "#854d0e", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
          <TeamOutlined />
          <span>Faqat sizning guruhlaringizga va yo'nalishingizga tegishli testlar ko'rsatilmoqda.</span>
        </div>
      )}


      {/* Test type filter */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { value: "ALL", label: "Barchasi" },
          { value: "DAILY", label: "Kunlik testlar" },
          { value: "WEEKLY", label: "Haftalik testlar" },
          { value: "MONTHLY", label: "Oylik testlar" },
        ].map((item: any) => (
          <Button
            key={item.value}
            onClick={() => setTypeFilter(item.value)}
            style={{
              borderRadius: 10,
              fontWeight: 700,
              background: typeFilter === item.value ? "linear-gradient(135deg, #8f5c28, #b8782a)" : "#fff",
              color: typeFilter === item.value ? "#fff" : "#8f5c28",
              border: "1px solid #d6c4b0",
            }}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {/* Qidiruv */}
      <div style={{ marginBottom: 24 }}>
        <Input
          size="large"
          prefix={<SearchOutlined style={{ color: "#8b7355" }} />}
          placeholder="Test nomini qidirish..."
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ maxWidth: 400, borderRadius: 12, border: "2px solid #e8ddd0", background: "#fff" }}
        />
      </div>

      {/* Loading skeleton */}
      {isPending ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ height: 200, borderRadius: 18, background: "linear-gradient(90deg, #f0ebe4 25%, #e8e0d5 50%, #f0ebe4 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
          ))}
        </div>

      ) : tests.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "#9c8572" }}>
          <FileTextOutlined style={{ fontSize: 64, marginBottom: 16, opacity: 0.3 }} />
          <p style={{ fontSize: 18, fontWeight: 500 }}>Testlar topilmadi</p>
          <p style={{ fontSize: 14, opacity: 0.7 }}>
            {isStudent
              ? "Hali sizning guruhingizga tegishli test yo'q"
              : isTeacher
                ? "Sizning guruhlaringizga tegishli test yo'q"
                : "Yangi test qo'shing"}
          </p>
        </div>

      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {tests.map((test: any) => {
            const cfg = typeConfig[test.type] ?? typeConfig.DAILY;
            const myResult = test.myResult ?? (test.results?.[0]);
            const hasResult = !!myResult;
            const passed = hasResult && myResult.score >= (test.minScore ?? 60);

            return (
              <div
                key={test.id}
                style={{ background: "#fff", borderRadius: 18, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: `1px solid ${hasResult && isStudent ? (passed ? "#16a34a" : "#dc2626") : "#f0e8de"}`, transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer", position: "relative", overflow: "hidden" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 28px rgba(143,92,40,0.15)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"; }}
                onClick={() => handleCardClick(test)}
              >
                {/* Dekorativ burchak */}
                <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, borderRadius: "0 18px 0 80px", background: cfg.bg, opacity: 0.6 }} />

                {/* Student natija badge */}
                {isStudent && hasResult && (
                  <div style={{ position: "absolute", top: 12, right: 12, display: "flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, background: passed ? "#dcfce7" : "#fee2e2", border: `1px solid ${passed ? "#16a34a" : "#dc2626"}`, fontSize: 11, fontWeight: 700, color: passed ? "#16a34a" : "#dc2626" }}>
                    {passed ? <CheckCircleFilled /> : <CloseCircleFilled />}
                    {myResult.score} ball
                  </div>
                )}

                {/* Ikon + Type tag */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ width: 44, minHeight: 44, borderRadius: 12, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", color: cfg.color, fontSize: 20 }}>
                    {cfg.icon}
                  </div>
                  <Tag style={{ background: cfg.bg, color: cfg.color, border: "none", borderRadius: 20, padding: "2px 12px", fontWeight: 600, fontSize: 12 }}>
                    {cfg.label}
                  </Tag>
                </div>

                {/* Test nomi */}
                <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.3 }}>
                  {test.title}
                </h3>

                {/* Guruh / Yo'nalish / Umumiy */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                  {test.group && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, padding: "2px 10px", borderRadius: 20, background: "#dbeafe", color: "#1d4ed8", fontWeight: 600 }}>
                      <TeamOutlined /> {test.group.name}
                    </span>
                  )}
                  {test.direction && !test.group && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, padding: "2px 10px", borderRadius: 20, background: "#ede9fe", color: "#6d28d9", fontWeight: 600 }}>
                      <ApartmentOutlined /> {test.direction.name}
                    </span>
                  )}
                  {!test.direction && !test.group && (
                    <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 20, background: "#f3f4f6", color: "#6b7280", fontWeight: 500 }}>
                      Umumiy test
                    </span>
                  )}
                </div>

                {/* Min ball */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, color: "#8b7355", fontSize: 13 }}>
                  <TrophyOutlined style={{ color: "#8f5c28" }} />
                  Min ball: <strong style={{ color: "#1a1a1a" }}>{test.minScore ?? 60}</strong>
                </div>

                {/* Student uchun: natija yoki boshlash */}
                {isStudent ? (
                  hasResult ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <Progress
                        percent={myResult.score}
                        strokeColor={passed ? "#16a34a" : "#dc2626"}
                        trailColor="#f0e8de"
                        strokeWidth={6}
                        format={(p) => <span style={{ fontSize: 12, fontWeight: 700, color: passed ? "#16a34a" : "#dc2626" }}>{p}</span>}
                      />
                      <div style={{ fontSize: 12, textAlign: "center", color: passed ? "#16a34a" : "#dc2626", fontWeight: 600 }}>
                        {passed ? "✅ O'tdingiz" : "❌ O'tmadingiz"} — min: {test.minScore ?? 60}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontSize: 11, color: "#9c8572", background: "#f9f5f0", borderRadius: 8, padding: "5px 0", border: "1px solid #e8ddd0" }}>
                        <LockOutlined style={{ fontSize: 11 }} />
                        Qayta ishlash uchun ustoz ruxsati kerak
                      </div>
                    </div>
                  ) : (
                    <Button
                      icon={<PlayCircleOutlined />}
                      style={{ width: "100%", background: "linear-gradient(135deg, #16a34a, #15803d)", border: "none", color: "#fff", borderRadius: 10, height: 38, fontWeight: 700 }}
                      onClick={(e) => { e.stopPropagation(); navigate(`/tests/${test.id}/take`); }}
                    >
                      Testni boshlash
                    </Button>
                  )
                ) : (
                  // Admin / Teacher uchun: tahrirlash + o'chirish
                  canManage && (
                    <div style={{ display: "flex", gap: 8 }} onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="Tahrirlash">
                        <Button
                          icon={<EditOutlined />}
                          onClick={() => navigate(`/tests/${test.id}/update`)}
                          style={{ flex: 1, borderRadius: 10, border: "1.5px solid #e8ddd0", color: "#8f5c28", fontWeight: 500 }}
                        >
                          Tahrirlash
                        </Button>
                      </Tooltip>
                      {canDelete && (
                        <Tooltip title="O'chirish">
                          <Button
                            icon={<DeleteOutlined />}
                            danger
                            onClick={() => { setDelModal(true); setSelectedId(test.id); }}
                            style={{ borderRadius: 10 }}
                          />
                        </Tooltip>
                      )}
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* O'chirish modali */}
      <Modal
        confirmLoading={deleteLoading}
        onOk={handleDelete}
        okText={deleted ? "O'chirildi ✓" : "O'chirish"}
        okButtonProps={{ danger: !deleted, style: deleted ? { background: "#16a34a", border: "none", color: "#fff" } : {} }}
        cancelText="Bekor qilish"
        cancelButtonProps={{ disabled: deleteLoading || deleted }}
        open={delModal}
        onCancel={() => { if (!deleteLoading && !deleted) { setDelModal(false); setSelectedId(null); } }}
        title="Testni o'chirmoqchimisiz?"
        centered
      >
        {deleted ? (
          <p style={{ color: "#16a34a", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
            Test muvaffaqiyatli o'chirildi!
          </p>
        ) : (
          <p style={{ color: "#6b5742" }}>Bu amalni ortga qaytarib bo'lmaydi. Test va uning natijalari o'chiriladi.</p>
        )}
      </Modal>

      <style>{`
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>
    </div>
  );
};

export default Tests;