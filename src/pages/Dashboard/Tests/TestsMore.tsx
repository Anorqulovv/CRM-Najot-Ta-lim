import { useState, type JSX } from "react";
import { useCookies } from "react-cookie";
import { useNavigate, useParams } from "react-router-dom";
import { Delete, GetById, GetAll } from "../../../service";
import { QueryPATH } from "../../../components";
import {
  Button, Modal, InputNumber, Select, Table, Tag, Collapse, Progress
} from "antd";
import {
  ArrowLeftOutlined, DeleteFilled, EditFilled, PlusOutlined,
  TrophyOutlined, UserOutlined, CalendarOutlined, ClockCircleOutlined,
  ThunderboltOutlined, QuestionCircleOutlined, CheckCircleOutlined,
  CloseCircleOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined,
  DownloadOutlined, LockOutlined, CheckCircleFilled, CloseCircleFilled,
} from "@ant-design/icons";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { instance } from "../../../hooks";
import toast from "react-hot-toast";

const { Panel } = Collapse;

const typeConfig: Record<string, { label: string; color: string; icon: JSX.Element; bg: string }> = {
  DAILY: { label: "Kunlik", color: "#16a34a", icon: <ClockCircleOutlined />, bg: "#dcfce7" },
  WEEKLY: { label: "Haftalik", color: "#2563eb", icon: <CalendarOutlined />, bg: "#dbeafe" },
  MONTHLY: { label: "Oylik", color: "#7c3aed", icon: <ThunderboltOutlined />, bg: "#ede9fe" },
};

interface Choice { id?: number; text: string; isCorrect: boolean; }
interface Question { id?: number; text: string; choices: Choice[]; }
const emptyChoice = (): Choice => ({ text: "", isCorrect: false });

// ==================== PDF GENERATOR ====================
const generateTestPDF = async (test: any, _userInfo: any, myResult: any) => {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = 210;
  const margin = 18;
  const contentW = pageW - margin * 2;
  let y = 20;

  const addPage = () => { doc.addPage(); y = 20; };
  const checkY = (needed: number) => { if (y + needed > 270) addPage(); };

  doc.setFillColor(143, 92, 40);
  doc.rect(0, 0, pageW, 28, "F");
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Najot Ta'lim - Test Natijasi", margin, 18);
  y = 38;

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 26, 26);
  const titleLines = doc.splitTextToSize(test.title, contentW);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 8 + 4;

  const typeColors: Record<string, number[]> = {
    DAILY: [22, 163, 74], WEEKLY: [37, 99, 235], MONTHLY: [124, 58, 237]
  };
  const typeLabel: Record<string, string> = { DAILY: "Kunlik", WEEKLY: "Haftalik", MONTHLY: "Oylik" };
  const tc = typeColors[test.type] ?? typeColors.DAILY;
  doc.setFillColor(tc[0], tc[1], tc[2]);
  doc.setDrawColor(tc[0], tc[1], tc[2]);
  doc.roundedRect(margin, y, 30, 8, 2, 2, "F");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(typeLabel[test.type] ?? "Kunlik", margin + 4, y + 5.5);
  y += 14;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(90, 70, 50);
  doc.text(`Minimal ball: ${test.minScore ?? 60}`, margin, y);
  doc.text(`Savollar soni: ${test.questions?.length ?? 0} ta`, margin + 55, y);
  if (test.group) doc.text(`Guruh: ${test.group.name}`, margin + 115, y);
  else if (test.direction) doc.text(`Yo'nalish: ${test.direction.name}`, margin + 115, y);
  y += 6;

  doc.setDrawColor(230, 220, 210);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  if (myResult) {
    const passed = myResult.score >= (test.minScore ?? 60);
    const rc = passed ? [22, 163, 74] : [220, 38, 38];

    checkY(36);
    doc.setFillColor(passed ? 220 : 254, passed ? 252 : 226, passed ? 231 : 226);
    doc.roundedRect(margin, y, contentW, 28, 4, 4, "F");
    doc.setDrawColor(rc[0], rc[1], rc[2]);
    doc.setLineWidth(1);
    doc.roundedRect(margin, y, contentW, 28, 4, 4, "S");

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(rc[0], rc[1], rc[2]);
    doc.text(passed ? "Testdan o'tdingiz!" : "Testdan o'ta olmadingiz", margin + 6, y + 11);

    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.text(`${myResult.score}`, pageW - margin - 24, y + 18);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("/ 100", pageW - margin - 24, y + 24);

    doc.setFontSize(10);
    doc.setTextColor(90, 70, 50);
    doc.text(`Minimal ball: ${test.minScore ?? 60}`, margin + 6, y + 22);
    y += 36;

    doc.setDrawColor(230, 220, 210);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageW - margin, y);
    y += 8;
  }

  if (test.questions?.length > 0) {
    checkY(14);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(74, 55, 40);
    doc.text(`Savollar (${test.questions.length} ta)`, margin, y);
    y += 10;

    test.questions.forEach((q: Question, qi: number) => {
      checkY(20);

      doc.setFillColor(143, 92, 40);
      doc.circle(margin + 4, y + 1, 4, "F");
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(`${qi + 1}`, margin + 4, y + 2.2, { align: "center" });

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(26, 26, 26);
      const qLines = doc.splitTextToSize(q.text, contentW - 12);
      doc.text(qLines, margin + 11, y + 2);
      y += qLines.length * 6 + 4;

      q.choices?.forEach((c: Choice, ci: number) => {
        checkY(9);
        const letter = String.fromCharCode(65 + ci);
        const isCorrect = c.isCorrect;

        if (isCorrect) {
          doc.setFillColor(220, 252, 231);
          doc.roundedRect(margin + 8, y - 3, contentW - 8, 8, 2, 2, "F");
          doc.setDrawColor(22, 163, 74);
          doc.setLineWidth(0.5);
          doc.roundedRect(margin + 8, y - 3, contentW - 8, 8, 2, 2, "S");
        }

        doc.setFillColor(isCorrect ? 22 : 230, isCorrect ? 163 : 220, isCorrect ? 74 : 210);
        doc.circle(margin + 14, y + 1, 3.5, "F");
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(isCorrect ? 255 : 100, 255, isCorrect ? 255 : 100);
        doc.text(letter, margin + 14, y + 2, { align: "center" });

        doc.setFontSize(10);
        doc.setFont("helvetica", isCorrect ? "bold" : "normal");
        doc.setTextColor(isCorrect ? 21 : 60, isCorrect ? 128 : 60, isCorrect ? 61 : 60);
        const cLines = doc.splitTextToSize(c.text, contentW - 22);
        doc.text(cLines, margin + 20, y + 1.5);

        if (isCorrect) {
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(22, 163, 74);
          doc.text("✓", pageW - margin - 6, y + 1.5);
        }
        y += cLines.length * 5.5 + 3;
      });
      y += 4;
    });
  }

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(248, 247, 244);
    doc.rect(0, 285, pageW, 12, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(140, 120, 100);
    doc.text("Najot Ta'lim CRM tizimi", margin, 292);
    doc.text(`Sahifa ${i} / ${totalPages}`, pageW - margin - 20, 292);
    doc.text(new Date().toLocaleDateString("uz-UZ"), pageW / 2, 292, { align: "center" });
  }

  const safeTitle = test.title.replace(/[^a-zA-Z0-9\s]/g, "").trim().replace(/\s+/g, "_") || "test";
  doc.save(`${safeTitle}_natija.pdf`);
};

// ==================== MAIN COMPONENT ====================
const TestsMore = () => {
  const navigate = useNavigate();
  const { testId } = useParams();
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  const { data: userInfo = {} } = GetAll("me-tests", [], cookies.accessToken, "/auth/me");
  const userRole = (userInfo?.role ?? "").toUpperCase();
  const isEditable = ["SUPERADMIN", "ADMIN", "TEACHER"].includes(userRole);
  const isStudent = userRole === "STUDENT";

  const [delModal, setDelModal] = useState(false);
  const [scoreModal, setScoreModal] = useState(false);
  const [questionModal, setQuestionModal] = useState(false);
  const [editQModal, setEditQModal] = useState(false);
  const [delQModal, setDelQModal] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [resetModal, setResetModal] = useState(false);
  const [resetStudentId, setResetStudentId] = useState<number | null>(null);

  const [studentId, setStudentId] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [qText, setQText] = useState("");
  const [qChoices, setQChoices] = useState<Choice[]>([
    emptyChoice(), emptyChoice(), emptyChoice(), emptyChoice(),
  ]);
  const [editingQ, setEditingQ] = useState<Question | null>(null);
  const [deletingQId, setDeletingQId] = useState<number | null>(null);

  const { data: test = {}, isLoading } = GetById(
    testId, cookies.accessToken, QueryPATH.testsMore, "/tests"
  );
  const { data: students = [] } = GetAll(
    QueryPATH.students, [], cookies.accessToken, "/students", {}, undefined
  );
  const { mutate: DeleteTest, isPending: delLoading } = Delete(
    cookies.accessToken, `/tests/${testId}`, navigate, queryClient, QueryPATH.tests
  );
  const { mutate: AddScore, isPending: scoreLoading } = useMutation({
    mutationFn: (body: any) => instance(cookies.accessToken).post("/tests/score", body),
    onSuccess: () => {
      toast.success("Ball qo'shildi!");
      setScoreModal(false);
      queryClient.invalidateQueries({ queryKey: [QueryPATH.testsMore] });
    },
    onError: (err: any) => toast.error(err?.message ?? "Xatolik"),
  });
  const { mutate: AddQuestion, isPending: addQLoading } = useMutation({
    mutationFn: (body: any) => instance(cookies.accessToken).post("/questions", body),
    onSuccess: () => {
      toast.success("Savol qo'shildi!");
      setQuestionModal(false);
      resetQForm();
      queryClient.invalidateQueries({ queryKey: [QueryPATH.testsMore] });
    },
    onError: (err: any) => toast.error(err?.message ?? "Xatolik"),
  });
  const { mutate: UpdateQuestion, isPending: updateQLoading } = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) =>
      instance(cookies.accessToken).patch(`/questions/${id}`, body),
    onSuccess: () => {
      toast.success("Savol yangilandi!");
      setEditQModal(false);
      setEditingQ(null);
      resetQForm();
      queryClient.invalidateQueries({ queryKey: [QueryPATH.testsMore] });
    },
    onError: (err: any) => toast.error(err?.message ?? "Xatolik"),
  });
  const { mutate: DeleteQuestion, isPending: delQLoading } = useMutation({
    mutationFn: (id: number) => instance(cookies.accessToken).delete(`/questions/${id}`),
    onSuccess: () => {
      toast.success("Savol o'chirildi!");
      setDelQModal(false);
      setDeletingQId(null);
      queryClient.invalidateQueries({ queryKey: [QueryPATH.testsMore] });
    },
    onError: (err: any) => toast.error(err?.message ?? "Xatolik"),
  });
  const { mutate: ResetAttempt, isPending: resetLoading } = useMutation({
    mutationFn: (sId: number) =>
      instance(cookies.accessToken).delete(`/tests/${testId}/reset/${sId}`),
    onSuccess: () => {
      toast.success("O'quvchiga qayta ishlashga ruxsat berildi!");
      setResetModal(false);
      setResetStudentId(null);
      queryClient.invalidateQueries({ queryKey: [QueryPATH.testsMore] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? "Xatolik"),
  });

  function resetQForm() {
    setQText("");
    setQChoices([emptyChoice(), emptyChoice(), emptyChoice(), emptyChoice()]);
  }
  function openEditQ(q: Question) {
    setEditingQ(q);
    setQText(q.text);
    setQChoices(q.choices.map(c => ({ ...c })));
    setEditQModal(true);
  }
  function setChoiceText(ci: number, text: string) {
    setQChoices(prev => prev.map((c, j) => j === ci ? { ...c, text } : c));
  }
  function setCorrect(ci: number) {
    setQChoices(prev => prev.map((c, j) => ({ ...c, isCorrect: j === ci })));
  }
  function submitQuestion(isEdit: boolean) {
    if (!qText.trim()) return toast.error("Savol matni kiriting");
    const valid = qChoices.filter(c => c.text.trim());
    if (valid.length < 2) return toast.error("Kamida 2 ta variant kiriting");
    if (!valid.some(c => c.isCorrect)) return toast.error("To'g'ri javobni belgilang");
    const body = { text: qText, testId: Number(testId), choices: valid };
    if (isEdit && editingQ?.id) UpdateQuestion({ id: editingQ.id, body });
    else AddQuestion(body);
  }

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const myResult = isStudent ? (test.results?.find((r: any) => r.isCurrent === true) ?? null) : null;
      const testForPDF = isStudent
        ? {
          ...test,
          questions: test.questions?.map((q: Question) => ({
            ...q,
            choices: q.choices.map((c: Choice) => ({ ...c, isCorrect: false })),
          })),
        }
        : test;
      await generateTestPDF(testForPDF, userInfo, myResult);
      toast.success("PDF yuklab olindi!");
    } catch (err) {
      console.error(err);
      toast.error("PDF yaratishda xatolik yuz berdi");
    } finally {
      setPdfLoading(false);
    }
  };

  const cfg = typeConfig[test.type ?? "DAILY"] ?? typeConfig.DAILY;

  // ✅ ASOSIY TO'G'IRLASH: faqat isCurrent === true bo'lgan natijani olish
  // Reset qilinganda server isCurrent = false qiladi yoki natijani o'chiradi.
  // Shuning uchun ?? test.results?.[0] ishlatmadik — u arxivlangan natijani ham olib kelardi.
  const myResult = isStudent
    ? (test.results?.find((r: any) => r.isCurrent === true) ?? null)
    : null;

  const passed = myResult ? myResult.score >= (test.minScore ?? 60) : false;

  // ✅ O'quvchi testni boshlashi mumkinmi?
  // - myResult yo'q (hali topshirmagan) YOKI
  // - myResult yo'q (reset qilingan, isCurrent === true yo'q)
  const canTakeTest = isStudent && !myResult;

  const resultsColumns = [
    {
      title: "O'quvchi",
      dataIndex: "student",
      render: (s: any) => s?.user?.fullName ?? "-"
    },
    {
      title: "Urinish",
      dataIndex: "attempt",
      render: (a: number, row: any) => (
        <Tag color={row.isCurrent === true ? "blue" : "default"}>
          {a || 1}-urinish{row.isCurrent === true ? " (faol)" : " (arxiv)"}
        </Tag>
      )
    },
    {
      title: "Ball",
      dataIndex: "score",
      render: (s: number) => (
        <span style={{
          fontWeight: 700,
          color: s >= (test.minScore ?? 60) ? "#16a34a" : "#dc2626",
          fontSize: 16
        }}>
          {s}
        </span>
      )
    },
    {
      title: "Holati",
      dataIndex: "score",
      render: (s: number) =>
        s >= (test.minScore ?? 60)
          ? <Tag color="green">O'tdi ✓</Tag>
          : <Tag color="red">O'tmadi ✗</Tag>
    },
    {
      title: "Sana",
      dataIndex: "createdAt",
      render: (v: string) => v ? new Date(v).toLocaleDateString("uz-UZ") : "—"
    },
    ...(isEditable ? [{
      title: "Ruxsat",
      key: "action",
      render: (_: any, row: any) => row.isCurrent === true ? (
        <Button
          size="small"
          icon={<LockOutlined />}
          onClick={() => { setResetStudentId(row.studentId); setResetModal(true); }}
          style={{
            borderRadius: 8,
            border: "1.5px solid #f59e0b",
            color: "#b45309",
            background: "#fffbeb",
            fontWeight: 600,
            fontSize: 12
          }}
        >
          Qayta ishlashga ruxsat
        </Button>
      ) : <Tag color="default">Arxivlangan</Tag>,
    }] : []),
  ];

  const QuestionForm = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "8px 0" }}>
      <div>
        <label style={{
          display: "block", fontWeight: 600, color: "#4a3728", marginBottom: 6, fontSize: 13
        }}>
          Savol matni
        </label>
        <textarea
          value={qText}
          onChange={e => setQText(e.target.value)}
          placeholder="Savol matnini kiriting..."
          rows={3}
          style={{
            width: "100%", borderRadius: 10, border: "2px solid #e8ddd0",
            padding: "10px 12px", fontSize: 14, resize: "vertical",
            outline: "none", fontFamily: "inherit"
          }}
        />
      </div>
      <div style={{
        background: "#faf8f5", borderRadius: 12, padding: 14, border: "1px solid #ede5da"
      }}>
        <div style={{ fontWeight: 600, color: "#6b5742", fontSize: 13, marginBottom: 10 }}>
          Variantlar (to'g'risini ✓ belgilang)
        </div>
        {qChoices.map((choice, ci) => (
          <div key={ci} style={{
            display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
            padding: "7px 10px", borderRadius: 9,
            background: choice.isCorrect ? "#dcfce7" : "#fff",
            border: `1.5px solid ${choice.isCorrect ? "#16a34a" : "#e8ddd0"}`
          }}>
            <span style={{
              width: 22, height: 22, borderRadius: "50%",
              background: choice.isCorrect ? "#16a34a" : "#e8ddd0",
              color: choice.isCorrect ? "#fff" : "#8b7355",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 700, flexShrink: 0
            }}>
              {String.fromCharCode(65 + ci)}
            </span>
            <input
              value={choice.text}
              onChange={e => setChoiceText(ci, e.target.value)}
              placeholder={`${String.fromCharCode(65 + ci)} variant`}
              style={{
                flex: 1, border: "none", background: "transparent",
                fontSize: 13, outline: "none", fontFamily: "inherit"
              }}
            />
            <input
              type="radio"
              name={`correct-${editQModal ? "edit" : "add"}`}
              checked={choice.isCorrect}
              onChange={() => setCorrect(ci)}
              style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#16a34a" }}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ padding: "28px", background: "#f8f7f4", minHeight: "100%" }}>

      {/* ===== TOP ACTIONS ===== */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 28, flexWrap: "wrap", gap: 10
      }}>
        <Button
          onClick={() => navigate(-1)}
          icon={<ArrowLeftOutlined />}
          style={{ borderRadius: 10, border: "1.5px solid #e8ddd0", color: "#8f5c28", height: 40 }}
        >
          Orqaga
        </Button>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button
            onClick={handleDownloadPDF}
            loading={pdfLoading}
            icon={<DownloadOutlined />}
            style={{
              background: "#fff", border: "1.5px solid #e8ddd0",
              color: "#8f5c28", borderRadius: 10, fontWeight: 600
            }}
          >
            PDF yuklash
          </Button>

          {/* ✅ canTakeTest ishlatildi — reset qilingandan keyin ham ko'rinadi */}
          {canTakeTest && (
            <Button
              onClick={() => navigate(`/tests/${testId}/take`)}
              icon={<PlayCircleOutlined />}
              style={{
                background: "linear-gradient(135deg, #16a34a, #15803d)",
                border: "none", color: "#fff", borderRadius: 10,
                fontWeight: 700, boxShadow: "0 4px 12px rgba(22,163,74,0.3)"
              }}
            >
              Testni boshlash
            </Button>
          )}

          {isEditable && (
            <>
              <Button
                onClick={() => setScoreModal(true)}
                icon={<PlusOutlined />}
                style={{
                  background: "#16a34a", border: "none",
                  color: "#fff", borderRadius: 10, fontWeight: 600
                }}
              >
                Ball qo'shish
              </Button>
              <Button
                onClick={() => navigate("update")}
                icon={<EditFilled />}
                style={{
                  background: "linear-gradient(135deg, #8f5c28, #b8782a)",
                  border: "none", color: "#fff", borderRadius: 10, fontWeight: 600
                }}
              >
                Tahrirlash
              </Button>
              <Button
                onClick={() => setDelModal(true)}
                icon={<DeleteFilled />}
                danger
                style={{ borderRadius: 10 }}
              />
            </>
          )}
        </div>
      </div>

      {/* ===== TEST INFO CARD ===== */}
      {!isLoading && (
        <div style={{
          background: "#fff", borderRadius: 20, padding: 28, marginBottom: 24,
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #f0e8de",
          position: "relative", overflow: "hidden"
        }}>
          <div style={{
            position: "absolute", top: 0, right: 0,
            width: 160, height: 160, borderRadius: "0 20px 0 160px",
            background: cfg.bg, opacity: 0.4
          }} />
          <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16, background: cfg.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: cfg.color, fontSize: 28, flexShrink: 0
            }}>
              {cfg.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1a1a1a" }}>
                  {test.title}
                </h2>
                <Tag style={{
                  background: cfg.bg, color: cfg.color, border: "none",
                  borderRadius: 20, padding: "2px 14px", fontWeight: 700
                }}>
                  {cfg.label}
                </Tag>
              </div>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#6b5742" }}>
                  <TrophyOutlined style={{ color: "#8f5c28" }} />
                  <span>Minimal ball:</span>
                  <strong style={{ color: "#1a1a1a", fontSize: 16 }}>{test.minScore ?? 60}</strong>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#6b5742" }}>
                  <QuestionCircleOutlined style={{ color: "#8f5c28" }} />
                  <span>Savollar:</span>
                  <strong style={{ color: "#1a1a1a", fontSize: 16 }}>{test.questions?.length ?? 0} ta</strong>
                </div>
                {!isStudent && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#6b5742" }}>
                    <UserOutlined style={{ color: "#8f5c28" }} />
                    <span>Natijalar:</span>
                    <strong style={{ color: "#1a1a1a", fontSize: 16 }}>{test.results?.length ?? 0} ta</strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== STUDENT RESULT SECTION ===== */}
      {isStudent && (
        <div style={{
          background: "#fff", borderRadius: 20, padding: 24,
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          border: "1px solid #f0e8de", marginBottom: 20
        }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#4a3728" }}>
            <TrophyOutlined style={{ marginRight: 8, color: "#8f5c28" }} />
            Mening natijam
          </h3>

          {/* ✅ myResult yo'q = hali topshirmagan YOKI reset qilingan */}
          {!myResult ? (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              padding: "32px 0", gap: 12
            }}>
              <div style={{ fontSize: 48, opacity: 0.2 }}>🏆</div>
              <p style={{ fontSize: 15, fontWeight: 500, margin: 0, color: "#4a3728" }}>
                Hali natija yo'q
              </p>
              <p style={{ fontSize: 13, margin: 0, color: "#9c8572" }}>
                Testni ishlang, natija shu yerda ko'rinadi
              </p>
              <Button
                onClick={() => navigate(`/tests/${testId}/take`)}
                icon={<PlayCircleOutlined />}
                size="large"
                style={{
                  marginTop: 8,
                  background: "linear-gradient(135deg, #16a34a, #15803d)",
                  border: "none", color: "#fff", borderRadius: 12,
                  minHeight: 44, paddingInline: 28, fontWeight: 700,
                  boxShadow: "0 4px 12px rgba(22,163,74,0.3)"
                }}
              >
                Testni boshlash
              </Button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "20px 24px", borderRadius: 16,
                background: passed
                  ? "linear-gradient(135deg, #dcfce7, #bbf7d0)"
                  : "linear-gradient(135deg, #fee2e2, #fecaca)",
                border: `2px solid ${passed ? "#16a34a" : "#dc2626"}`
              }}>
                <div>
                  <div style={{
                    fontSize: 16, fontWeight: 700,
                    color: passed ? "#15803d" : "#b91c1c", marginBottom: 4
                  }}>
                    {passed
                      ? <><CheckCircleFilled style={{ marginRight: 6 }} />Testdan o'tdingiz!</>
                      : <><CloseCircleFilled style={{ marginRight: 6 }} />Testdan o'ta olmadingiz</>
                    }
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: passed ? "#166534" : "#991b1b", opacity: 0.8
                  }}>
                    Minimal ball: {test.minScore ?? 60}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{
                    fontSize: 52, fontWeight: 800,
                    color: passed ? "#16a34a" : "#dc2626", lineHeight: 1
                  }}>
                    {myResult.score}
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: passed ? "#166534" : "#991b1b", opacity: 0.7
                  }}>
                    / 100
                  </div>
                </div>
              </div>
              <Progress
                percent={myResult.score}
                strokeColor={passed ? "#16a34a" : "#dc2626"}
                trailColor="#f0e8de"
                strokeWidth={8}
              />
            </div>
          )}
        </div>
      )}

      {/* ===== QUESTIONS SECTION ===== */}
      <div style={{
        background: "#fff", borderRadius: 20, padding: 24,
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        border: "1px solid #f0e8de", marginBottom: 20
      }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: 16
        }}>
          <h3 style={{
            margin: 0, fontSize: 16, fontWeight: 700, color: "#4a3728",
            display: "flex", alignItems: "center", gap: 8
          }}>
            <QuestionCircleOutlined style={{ color: "#8f5c28" }} />
            Savollar ({test.questions?.length ?? 0} ta)
          </h3>
          {isEditable && (
            <Button
              onClick={() => { resetQForm(); setQuestionModal(true); }}
              icon={<PlusOutlined />}
              style={{
                background: "linear-gradient(135deg, #8f5c28, #b8782a)",
                border: "none", color: "#fff", borderRadius: 10, fontWeight: 600
              }}
            >
              Savol qo'shish
            </Button>
          )}
        </div>

        {isStudent ? (
          <div style={{
            padding: "28px 24px", borderRadius: 16,
            background: "linear-gradient(135deg, #fdf6f0, #faf0e6)",
            border: "1px dashed #c8a06a", textAlign: "center"
          }}>
            <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.6 }}>
              <LockOutlined style={{ color: "#8f5c28" }} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#4a3728", margin: "0 0 6px" }}>
              Savollar yashirilgan
            </p>
            <p style={{ fontSize: 13, color: "#9c8572", margin: 0 }}>
              Testni ishlash vaqtida savollar ko'rsatiladi. Testni boshlash uchun yuqoridagi tugmani bosing.
            </p>
          </div>
        ) : test.questions?.length > 0 ? (
          <Collapse accordion style={{ borderRadius: 12, border: "1px solid #f0e8de" }}>
            {test.questions.map((q: Question, qi: number) => (
              <Panel
                key={q.id ?? qi}
                header={
                  <div style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between", paddingRight: 8
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{
                        width: 26, height: 26, borderRadius: "50%",
                        background: "linear-gradient(135deg, #8f5c28, #b8782a)",
                        color: "#fff", display: "flex", alignItems: "center",
                        justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0
                      }}>
                        {qi + 1}
                      </span>
                      <span style={{ fontWeight: 500, color: "#1a1a1a", fontSize: 14 }}>
                        {q.text}
                      </span>
                    </div>
                    {isEditable && (
                      <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                        <Button
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => openEditQ(q)}
                          style={{
                            borderRadius: 7, border: "1px solid #e8ddd0",
                            color: "#8f5c28", height: 28
                          }}
                        />
                        <Button
                          size="small"
                          icon={<DeleteOutlined />}
                          danger
                          onClick={() => { setDeletingQId(q.id ?? null); setDelQModal(true); }}
                          style={{ borderRadius: 7, height: 28 }}
                        />
                      </div>
                    )}
                  </div>
                }
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 4 }}>
                  {q.choices?.map((c: Choice, ci: number) => (
                    <div key={c.id ?? ci} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 14px", borderRadius: 10,
                      background: c.isCorrect ? "#dcfce7" : "#f9f9f9",
                      border: `1.5px solid ${c.isCorrect ? "#16a34a" : "#e8e8e8"}`
                    }}>
                      <span style={{
                        width: 22, height: 22, borderRadius: "50%",
                        background: c.isCorrect ? "#16a34a" : "#e8ddd0",
                        color: c.isCorrect ? "#fff" : "#8b7355",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, fontWeight: 700, flexShrink: 0
                      }}>
                        {String.fromCharCode(65 + ci)}
                      </span>
                      <span style={{ flex: 1, fontSize: 13, color: "#1a1a1a" }}>{c.text}</span>
                      {c.isCorrect
                        ? <CheckCircleOutlined style={{ color: "#16a34a", fontSize: 16 }} />
                        : <CloseCircleOutlined style={{ color: "#d1d5db", fontSize: 16 }} />
                      }
                    </div>
                  ))}
                </div>
              </Panel>
            ))}
          </Collapse>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#9c8572" }}>
            <QuestionCircleOutlined style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }} />
            <p style={{ fontSize: 15, fontWeight: 500, margin: 0 }}>Savollar yo'q</p>
          </div>
        )}
      </div>

      {/* ===== RESULTS TABLE (admin/teacher) ===== */}
      {!isStudent && (
        <div style={{
          background: "#fff", borderRadius: 20, padding: 24,
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #f0e8de"
        }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#4a3728" }}>
            Natijalar jadvali
            <span style={{ fontSize: 12, fontWeight: 400, color: "#aaa", marginLeft: 8 }}>
              (barcha urinishlar, arxivlar bilan)
            </span>
          </h3>
          <Table
            columns={resultsColumns}
            dataSource={[...(test.results ?? [])].sort((a: any, b: any) => {
              if (a.studentId !== b.studentId) return a.studentId - b.studentId;
              return (b.attempt || 1) - (a.attempt || 1);
            })}
            rowKey="id"
            rowClassName={(row: any) => row.isCurrent === false ? "att-archived" : ""}
            pagination={{ pageSize: 15 }}
            style={{ borderRadius: 12 }}
          />
          <style>{`.att-archived td { opacity: 0.55; background: #fafafa !important; }`}</style>
        </div>
      )}

      {/* ===== MODALS ===== */}

      {/* Delete test */}
      {isEditable && (
        <Modal
          confirmLoading={delLoading}
          onOk={() => DeleteTest()}
          okText="O'chirish"
          okButtonProps={{ danger: true }}
          cancelText="Bekor qilish"
          open={delModal}
          onCancel={() => setDelModal(false)}
          title="Testni o'chirmoqchimisiz?"
          centered
        >
          <p style={{ color: "#6b5742" }}>Bu test va barcha natijalari o'chiriladi.</p>
        </Modal>
      )}

      {/* Add score */}
      {isEditable && (
        <Modal
          open={scoreModal}
          onCancel={() => setScoreModal(false)}
          title="O'quvchiga ball qo'shish"
          centered
          onOk={() => {
            if (!studentId) return toast.error("O'quvchini tanlang");
            AddScore({ testId: Number(testId), studentId, score });
          }}
          okText="Saqlash"
          confirmLoading={scoreLoading}
          okButtonProps={{
            style: { background: "linear-gradient(135deg, #8f5c28, #b8782a)", border: "none" }
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "16px 0" }}>
            <div>
              <label style={{ display: "block", fontWeight: 600, color: "#4a3728", marginBottom: 8 }}>
                O'quvchi
              </label>
              <Select
                style={{ width: "100%" }}
                size="large"
                placeholder="O'quvchini tanlang"
                onChange={val => setStudentId(val)}
                options={students.map((s: any) => ({
                  value: s.id,
                  label: s?.user?.fullName ?? `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim()
                }))}
                showSearch
                filterOption={(input, option) =>
                  (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                }
              />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, color: "#4a3728", marginBottom: 8 }}>
                Ball (0–100)
              </label>
              <InputNumber
                min={0}
                max={100}
                value={score}
                onChange={val => setScore(val ?? 0)}
                size="large"
                style={{ width: "100%", borderRadius: 10 }}
              />
              <div style={{
                marginTop: 8, padding: "8px 12px", borderRadius: 10,
                background: score >= (test.minScore ?? 60) ? "#dcfce7" : "#fee2e2",
                color: score >= (test.minScore ?? 60) ? "#16a34a" : "#dc2626",
                fontWeight: 600, fontSize: 13
              }}>
                {score >= (test.minScore ?? 60) ? "✓ O'tadi" : "✗ O'tmaydi"} — min: {test.minScore ?? 60}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add question */}
      <Modal
        open={questionModal}
        onCancel={() => { setQuestionModal(false); resetQForm(); }}
        title={
          <span style={{ fontWeight: 700, color: "#4a3728" }}>
            <QuestionCircleOutlined style={{ marginRight: 8, color: "#8f5c28" }} />
            Yangi savol qo'shish
          </span>
        }
        centered
        onOk={() => submitQuestion(false)}
        okText="Saqlash"
        confirmLoading={addQLoading}
        okButtonProps={{
          style: { background: "linear-gradient(135deg, #8f5c28, #b8782a)", border: "none" }
        }}
        width={560}
      >
        {QuestionForm}
      </Modal>

      {/* Edit question */}
      <Modal
        open={editQModal}
        onCancel={() => { setEditQModal(false); setEditingQ(null); resetQForm(); }}
        title={
          <span style={{ fontWeight: 700, color: "#4a3728" }}>
            <EditOutlined style={{ marginRight: 8, color: "#8f5c28" }} />
            Savolni tahrirlash
          </span>
        }
        centered
        onOk={() => submitQuestion(true)}
        okText="Saqlash"
        confirmLoading={updateQLoading}
        okButtonProps={{
          style: { background: "linear-gradient(135deg, #8f5c28, #b8782a)", border: "none" }
        }}
        width={560}
      >
        {QuestionForm}
      </Modal>

      {isEditable && (
        <>
          {/* Delete question */}
          <Modal
            confirmLoading={delQLoading}
            onOk={() => { if (deletingQId) DeleteQuestion(deletingQId); }}
            okText="O'chirish"
            okButtonProps={{ danger: true }}
            cancelText="Bekor qilish"
            open={delQModal}
            onCancel={() => { setDelQModal(false); setDeletingQId(null); }}
            title="Savolni o'chirmoqchimisiz?"
            centered
          >
            <p style={{ color: "#6b5742" }}>Bu savol va uning variantlari o'chiriladi.</p>
          </Modal>

          {/* Reset attempt */}
          <Modal
            open={resetModal}
            confirmLoading={resetLoading}
            onOk={() => { if (resetStudentId) ResetAttempt(resetStudentId); }}
            onCancel={() => { setResetModal(false); setResetStudentId(null); }}
            okText="Ruxsat berish"
            okButtonProps={{ style: { background: "#b45309", border: "none" } }}
            cancelText="Bekor qilish"
            title="Qayta ishlashga ruxsat berish"
            centered
          >
            <p style={{ color: "#6b5742" }}>
              Bu o'quvchining test natijasi o'chiriladi va u testni qayta ishlashi mumkin bo'ladi.
              Davom etishni tasdiqlaysizmi?
            </p>
          </Modal>
        </>
      )}
    </div>
  );
};

export default TestsMore;