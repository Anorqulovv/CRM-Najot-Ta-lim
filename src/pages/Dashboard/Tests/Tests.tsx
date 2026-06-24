import { useEffect, useState, type FC, type JSX } from "react";
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


const getStatusView = (status?: string) => {
  if (status === "ACTIVE") {
    return {
      label: "Faol",
      color: "#16a34a",
      bg: "#dcfce7",
      border: "#86efac",
    }
  }

  if (status === "IN_PROGRESS") {
    return {
      label: "Jarayonda",
      color: "#d97706",
      bg: "#fef3c7",
      border: "#fcd34d",
    }
  }

  return {
    label: "Nofaol",
    color: "#dc2626",
    bg: "#fee2e2",
    border: "#fca5a5",
  }
}

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
  const isSupport = currentUser?.role === "SUPPORT";
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

  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: [QueryPATH.tests] });
    }, 30_000);

    return () => clearInterval(interval);
  }, [queryClient]); // auto-refresh-test-statuses

  // Teacher o'zining directionId sini olish uchun
  const { data: myTeacherInfo = {} } = GetById(
    isTeacher ? String(currentUser?.id) : undefined,
    cookies.accessToken,
    QueryPATH.teachersMore,
    "/teachers"
  );

  // Teacher/Support o'ziga tegishli guruhlarni olish
  const { data: myGroupsRaw = [] } = GetAll(
    QueryPATH.groups,
    [isTeacher || isSupport ? currentUser?.id : null],
    cookies.accessToken,
    "/groups",
    isTeacher && currentUser?.id
      ? { teacherId: currentUser.id }
      : isSupport && currentUser?.id
        ? { supportId: currentUser.id }
        : {},
    undefined,
    undefined
  );

  // Student uchun /tests endpointining o'zi faqat tegishli testlarni qaytaradi.
  // Shu sabab /students so'rovi yuborilmaydi; student rolida 403 bo'lmasligi kerak.
  const studentGroupId = 0;
  const studentDirectionId = 0;

  // Teacher/Support guruh ID lari
  const myGroupIds: number[] = (isTeacher || isSupport)
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
    if (test.groupId) {
      return myGroupIds.includes(Number(test.groupId));
    }

    if (test.directionId) {
      return Number(test.directionId) === Number(myTeacherInfo?.directionId);
    }

    return false;
  };

  const isTestForSupport = (test: any) => {
    if (test.groupId) {
      return myGroupIds.includes(Number(test.groupId));
    }

    const supportDirectionIds = myGroupsRaw
      .map((g: any) => Number(g.directionId))
      .filter(Boolean);

    if (test.directionId) {
      return supportDirectionIds.includes(Number(test.directionId));
    }

    // Umumiy test support uchun ko'rsatilmaydi
    return false;
  };

  // Student uchun backendning o'zi faqat o'z guruhiga tegishli testlarni qaytaradi.
  // Frontendda qayta filter qilsak, /students response ichida groupId topilmasa testlar yashirinib qoladi.
  const roleFilteredTests = isStudent
    ? allTests
    : isTeacher
      ? allTests.filter(isTestForTeacher)
      : isSupport
        ? allTests.filter(isTestForSupport)
        : allTests;

  const searchedTests = roleFilteredTests.filter((test: any) => {
    const q = String(name ?? "").trim().toLowerCase();
    if (!q) return true;
    return String(test.title ?? "").toLowerCase().includes(q);
  });

  const tests = typeFilter === "ALL"
    ? searchedTests
    : searchedTests.filter((test: any) => test.type === typeFilter);

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
    <div className="tests-page min-h-full bg-transparent p-4 sm:p-5 lg:p-6">

      {/* ── Tepa: Sarlavha + Yaratish tugmasi ── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7a4520] to-[#c8864a] shadow-lg shadow-[#8f5c28]/25">
            <FileTextOutlined className="text-[22px] text-white" />
          </div>
          <div>
            <h1
              className="m-0 text-2xl font-extrabold sm:text-[26px]"
              style={{ color: "#ffffff", textShadow: "0 2px 10px rgba(0,0,0,0.55)" }}
            >
              {title}
            </h1>
            <span
              className="text-[13px] font-semibold"
              style={{ color: "rgba(255,255,255,0.78)", textShadow: "0 2px 8px rgba(0,0,0,0.45)" }}
            >
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
            className="tests-create-btn h-11 w-full px-6 font-bold text-white sm:w-auto"
            style={{
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg, #8f5c28, #a36532)",
              color: "#fff",
              boxShadow: "0 10px 24px rgba(143,92,40,0.28)",
            }}
          >
            Yangi test
          </Button>
        )}
      </div>

      {/* Student info banner */}
      {isStudent && (
        <div className="mb-5 flex items-center gap-2 rounded-2xl border border-[#93c5fd] bg-[#dbeafe] px-4 py-3 text-[13px] text-[#1d4ed8]">
          <TeamOutlined />
          <span>Faqat sizning guruhingizga va yo'nalishingizga tegishli testlar ko'rsatilmoqda. Testni boshlash uchun kartochkaga bosing.</span>
        </div>
      )}

      {/* Teacher info banner */}
      {isTeacher && (
        <div className="mb-5 flex items-center gap-2 rounded-2xl border border-[#fde047] bg-[#fef9c3] px-4 py-3 text-[13px] text-[#854d0e]">
          <TeamOutlined />
          <span>Faqat sizning guruhlaringizga va yo'nalishingizga tegishli testlar ko'rsatilmoqda.</span>
        </div>
      )}


      {/* Test type filter */}
      <div className="mb-5 flex flex-wrap gap-2">
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
              fontWeight: 800,
              background:
                typeFilter === item.value
                  ? "linear-gradient(135deg, #8f5c28, #a36532)"
                  : "rgba(255,255,255,0.92)",
              color: typeFilter === item.value ? "#fff" : "#8f5c28",
              border: "none",
              boxShadow:
                typeFilter === item.value
                  ? "0 8px 18px rgba(143,92,40,0.25)"
                  : "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {/* Qidiruv */}
      <div className="mb-6">
        <Input
          size="large"
          prefix={<SearchOutlined style={{ color: "#c8864a" }} />}
          placeholder="Test nomini qidirish..."
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          className="w-full max-w-full rounded-2xl border-2 border-[#e8ddd0] bg-white sm:max-w-[420px]"
        />
      </div>

      {/* Loading skeleton */}
      {isPending ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ height: 200, borderRadius: 18, background: "linear-gradient(90deg, #f0ebe4 25%, #e8e0d5 50%, #f0ebe4 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
          ))}
        </div>

      ) : tests.length === 0 ? (
        <div
          className="px-6 py-16 text-center"
          style={{
            background: "transparent",
            border: "none",
            boxShadow: "none",
            color: "rgba(255,255,255,0.82)",
          }}
        >
          <FileTextOutlined style={{ fontSize: 64, marginBottom: 16, opacity: 0.6, color: "rgba(255,255,255,0.82)" }} />
          <p style={{ fontSize: 18, fontWeight: 800, color: "#ffffff", textShadow: "0 2px 10px rgba(0,0,0,0.45)" }}>Testlar topilmadi</p>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.72)" }}>
            {isStudent
              ? "Hali sizning guruhingizga tegishli test yo'q"
              : isTeacher
                ? "Sizning guruhlaringizga tegishli test yo'q"
                : "Yangi test qo'shing"}
          </p>
        </div>

      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {tests.map((test: any) => {
            const cfg = typeConfig[test.type] ?? typeConfig.DAILY;
            const statusView = getStatusView(test.status);
            const canDeleteTest =
              ["SUPERADMIN", "ADMIN"].includes(userInfo?.role) ||
              (isTeacher && Number(test.createdById) === Number(userInfo?.id));
            const myResult = test.myResult ?? (test.results?.[0]);
            const hasResult = !!myResult;
            const passed = hasResult && myResult.score >= (test.minScore ?? 60);

            return (
              <div
                key={test.id}
                className="group relative cursor-pointer overflow-hidden rounded-3xl border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#8f5c28]/10"
                style={{ borderColor: hasResult && isStudent ? (passed ? "#16a34a" : "#dc2626") : "#f0e8de" }}
 
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
                <h3 className="mb-3 line-clamp-2 text-[17px] font-extrabold leading-snug text-[#1a1a1a]">
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "3px 10px",
                      borderRadius: 999,
                      background: statusView.bg,
                      color: statusView.color,
                      border: `1px solid ${statusView.border}`,
                      fontSize: 11,
                      fontWeight: 700,
                      marginRight: 8,
                    }}
                  >
                    {statusView.label}
                  </span>
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
                    <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 20, background: "#f3f4f6", color: "#6b5742", fontWeight: 500 }}>
                      Umumiy test
                    </span>
                  )}
                </div>

                {/* Min ball */}
                <div className="mb-4 flex items-center gap-1.5 text-[13px] text-[#8b7355]">
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
                          style={{ flex: 1, borderRadius: 10, border: "1.5px solid #e8ddd0", color: "#8f5c28", fontWeight: 700, background: "#fff" }}
                        >
                          Tahrirlash
                        </Button>
                      </Tooltip>
                      {canDeleteTest && (
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