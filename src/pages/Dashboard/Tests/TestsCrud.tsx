import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate, useParams } from "react-router-dom";
import { GetAll, GetById, GetMe, Update } from "../../../service";
import { QueryPATH } from "../../../components";
import { Button, Input, Slider, Checkbox, Tooltip, Select } from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  FileTextOutlined,
  PlusOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  ApartmentOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { instance } from "../../../hooks";
import toast from "react-hot-toast";

const TEST_TYPES = [
  { value: "DAILY", label: "Kunlik", color: "#16a34a" },
  { value: "WEEKLY", label: "Haftalik", color: "#2563eb" },
  { value: "MONTHLY", label: "Oylik", color: "#7c3aed" },
];

interface Choice { text: string; isCorrect: boolean; }
interface Question { text: string; choices: Choice[]; }
const emptyChoice = (): Choice => ({ text: "", isCorrect: false });
const emptyQuestion = (): Question => ({
  text: "",
  choices: [emptyChoice(), emptyChoice(), emptyChoice(), emptyChoice()],
});

const TestsCrud = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  const { data: userInfo = {} } = GetMe(cookies.accessToken);
  const isTeacher = userInfo?.role === "TEACHER";

  const [title, setTitle] = useState("");
  const [type, setType] = useState("DAILY");
  const [minScore, setMinScore] = useState(60);
  const [directionId, setDirectionId] = useState<number | null>(null);
  const [groupId, setGroupId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([emptyQuestion()]);
  const [saving, setSaving] = useState(false);

  const { mutate: TestUpdate } = Update(
    cookies.accessToken, `/tests/${id}`, navigate, queryClient,
    QueryPATH.tests, ""
  );

  const { data: moreInfo = {} } = id
    ? GetById(id, cookies.accessToken, QueryPATH.tests, "/tests")
    : { data: {} };

  // Teacher uchun faqat o'z guruhlari, boshqalar uchun barcha guruhlar
  const { data: allGroups = [] } = GetAll(
    QueryPATH.groups, [directionId], cookies.accessToken, "/groups",
    directionId ? { directionId } : {}
  );
  const { data: myGroups = [] } = GetAll(
    "myGroups", [], cookies.accessToken, "/teachers/my-groups"
  );
  const groups = isTeacher ? myGroups : allGroups;

  // Teacher direction tanlay olmaydi
  const { data: directions = [] } = GetAll(
    QueryPATH.directions, [], cookies.accessToken, "/directions"
  );

  useEffect(() => {
    if (moreInfo && id) {
      setTitle(moreInfo.title ?? "");
      setType(moreInfo.type ?? "DAILY");
      setMinScore(moreInfo.minScore ?? 60);
      setDirectionId(moreInfo.directionId ?? null);
      setGroupId(moreInfo.groupId ?? null);
      if (moreInfo.questions?.length) {
        setQuestions(
          moreInfo.questions.map((q: any) => ({
            text: q.text,
            choices: q.choices?.map((c: any) => ({ text: c.text, isCorrect: c.isCorrect }))
              ?? [emptyChoice(), emptyChoice(), emptyChoice(), emptyChoice()],
          }))
        );
      }
    }
  }, [id, moreInfo]);

  async function handleSubmit() {
    if (!title.trim()) return toast.error("Test nomini kiriting");

    const validQuestions = questions.filter(
      (q) => q.text.trim() && q.choices.some((c) => c.text.trim() && c.isCorrect)
    );

    setSaving(true);
    try {
      const body: any = { title, type, minScore };
      if (directionId) body.directionId = directionId;
      if (groupId) body.groupId = groupId;

      if (id) {
        TestUpdate(body);
      } else {
        const res = await instance(cookies.accessToken).post("/tests", body);
        const newTestId: number = res.data?.data?.id;

        if (newTestId && validQuestions.length > 0) {
          await Promise.all(
            validQuestions.map((q) =>
              instance(cookies.accessToken).post("/questions", {
                text: q.text,
                testId: newTestId,
                choices: q.choices.filter((c) => c.text.trim()),
              })
            )
          );
        }

        toast.success("Test muvaffaqiyatli qo'shildi!");
        queryClient.invalidateQueries({ queryKey: [QueryPATH.tests] });
        navigate(-1);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message?.[0] ?? err?.message ?? "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  }

  const addQuestion = () => setQuestions((p) => [...p, emptyQuestion()]);
  const removeQuestion = (qi: number) => setQuestions((p) => p.filter((_, i) => i !== qi));
  const setQText = (qi: number, text: string) =>
    setQuestions((p) => p.map((q, i) => (i === qi ? { ...q, text } : q)));
  const setChoiceText = (qi: number, ci: number, text: string) =>
    setQuestions((p) =>
      p.map((q, i) => i === qi ? { ...q, choices: q.choices.map((c, j) => j === ci ? { ...c, text } : c) } : q)
    );
  const setCorrect = (qi: number, ci: number) =>
    setQuestions((p) =>
      p.map((q, i) => i === qi ? { ...q, choices: q.choices.map((c, j) => ({ ...c, isCorrect: j === ci })) } : q)
    );
  const addChoice = (qi: number) =>
    setQuestions((p) => p.map((q, i) => i === qi ? { ...q, choices: [...q.choices, emptyChoice()] } : q));
  const removeChoice = (qi: number, ci: number) =>
    setQuestions((p) =>
      p.map((q, i) => i === qi ? { ...q, choices: q.choices.filter((_, j) => j !== ci) } : q)
    );

  const selectedType = TEST_TYPES.find((t) => t.value === type);

  return (
    <div style={{ padding: "28px", background: "#f8f7f4", minHeight: "100vh" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}
          style={{ borderRadius: 10, border: "1.5px solid #e8ddd0", color: "#8f5c28", height: 40 }}>
          Orqaga
        </Button>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#1a1a1a", display: "flex", alignItems: "center", gap: 10 }}>
          <FileTextOutlined style={{ color: "#8f5c28" }} />
          Test {id ? "tahrirlash" : "qo'shish"}
        </h1>
        <Button loading={saving} onClick={handleSubmit} icon={<SaveOutlined />} size="large"
          style={{ background: "linear-gradient(135deg, #8f5c28, #b8782a)", border: "none", color: "#fff", borderRadius: 12, height: 46, paddingInline: 24, fontWeight: 600, boxShadow: "0 4px 15px rgba(143,92,40,0.3)" }}>
          Saqlash
        </Button>
      </div>

      {/* Test info card */}
      <div style={{ maxWidth: 760, margin: "0 auto 28px", background: "#fff", borderRadius: 20, padding: 32, boxShadow: "0 4px 24px rgba(0,0,0,0.07)", border: "1px solid #f0e8de" }}>
        <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 700, color: "#4a3728" }}>Test ma'lumotlari</h3>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontWeight: 600, color: "#4a3728", marginBottom: 8, fontSize: 14 }}>
            Test nomi <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} size="large"
            placeholder="Masalan: Matematika fanidan kunlik test" allowClear
            style={{ borderRadius: 12, border: "2px solid #e8ddd0", fontSize: 15 }} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontWeight: 600, color: "#4a3728", marginBottom: 8, fontSize: 14 }}>Test turi</label>
          <div style={{ display: "flex", gap: 12 }}>
            {TEST_TYPES.map((t) => (
              <div key={t.value} onClick={() => setType(t.value)}
                style={{ flex: 1, padding: "12px 16px", borderRadius: 12, border: `2px solid ${type === t.value ? t.color : "#e8ddd0"}`, background: type === t.value ? `${t.color}15` : "#fafaf9", cursor: "pointer", textAlign: "center", transition: "all 0.2s", color: type === t.value ? t.color : "#6b7280", fontWeight: type === t.value ? 700 : 400 }}>
                {t.label}
              </div>
            ))}
          </div>
        </div>

        {/* Direction and Group selection */}
        <div style={{ display: "grid", gridTemplateColumns: isTeacher ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 20 }}>
          {!isTeacher && (
            <div>
              <label style={{ display: "block", fontWeight: 600, color: "#4a3728", marginBottom: 8, fontSize: 14 }}>
                <ApartmentOutlined style={{ marginRight: 6, color: "#8f5c28" }} />
                Yo'nalish (ixtiyoriy)
              </label>
              <Select
                allowClear
                showSearch
                placeholder="Yo'nalish tanlang"
                style={{ width: "100%", borderRadius: 12 }}
                size="large"
                value={directionId}
                onChange={(val) => { setDirectionId(val ?? null); setGroupId(null); }}
                optionFilterProp="label"
                options={directions.map((d: any) => ({ value: d.id, label: d.name }))}
              />
              <p style={{ margin: "6px 0 0", fontSize: 11, color: "#9c8572" }}>
                Tanlansa — shu yo'nalishdagi barcha guruhlarga ko'rinadi
              </p>
            </div>
          )}
          <div>
            <label style={{ display: "block", fontWeight: 600, color: "#4a3728", marginBottom: 8, fontSize: 14 }}>
              <TeamOutlined style={{ marginRight: 6, color: "#8f5c28" }} />
              Guruh {isTeacher ? "(o'z guruhlaringizdan tanlang)" : "(ixtiyoriy)"}
            </label>
            <Select
              allowClear
              showSearch
              placeholder="Guruh tanlang"
              style={{ width: "100%", borderRadius: 12 }}
              size="large"
              value={groupId}
              onChange={(val) => setGroupId(val ?? null)}
              optionFilterProp="label"
              options={groups.map((g: any) => ({ value: g.id, label: g.name }))}
            />
            <p style={{ margin: "6px 0 0", fontSize: 11, color: "#9c8572" }}>
              {isTeacher
                ? "Faqat o'z guruhlaringiz ko'rinmoqda"
                : "Tanlansa — faqat shu guruh o'quvchilari ko'radi"}
            </p>
          </div>
        </div>

        {/* Scope info banner */}
        <div style={{ padding: "10px 14px", borderRadius: 10, background: groupId ? "#dbeafe" : directionId ? "#ede9fe" : "#f3f4f6", border: `1px solid ${groupId ? "#93c5fd" : directionId ? "#c4b5fd" : "#e5e7eb"}`, fontSize: 13, color: groupId ? "#1d4ed8" : directionId ? "#6d28d9" : "#6b7280", marginBottom: 20 }}>
          {isTeacher
            ? groupId
              ? "🎯 Bu test faqat tanlangan guruhingiz o'quvchilariga ko'rinadi"
              : "🌐 Bu test barcha o'quvchilarga ko'rinadi (umumiy test)"
            : groupId
            ? "🎯 Bu test faqat tanlangan guruh o'quvchilariga ko'rinadi"
            : directionId
            ? "📚 Bu test tanlangan yo'nalish barcha guruhlariga ko'rinadi"
            : "🌐 Bu test barcha o'quvchilarga ko'rinadi (umumiy test)"}
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontWeight: 600, color: "#4a3728", marginBottom: 8, fontSize: 14 }}>
            Minimal ball:{" "}
            <span style={{ color: minScore >= 70 ? "#16a34a" : minScore >= 50 ? "#d97706" : "#dc2626", fontWeight: 700, fontSize: 18 }}>
              {minScore}
            </span>
          </label>
          <Slider min={0} max={100} value={minScore} onChange={setMinScore}
            trackStyle={{ background: "#8f5c28" }} handleStyle={{ borderColor: "#8f5c28" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#9c8572", marginTop: 4 }}>
            <span>0 — Juda past</span><span>50 — O'rtacha</span><span>100 — A'lo</span>
          </div>
        </div>

        {/* Preview */}
        <div style={{ padding: 14, borderRadius: 12, background: "#f8f7f4", border: "1px solid #e8ddd0" }}>
          <p style={{ margin: "0 0 6px", fontWeight: 600, color: "#4a3728", fontSize: 12 }}>Ko'rinish:</p>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#1a1a1a" }}>
            <span style={{ padding: "3px 12px", borderRadius: 20, background: `${selectedType?.color}20`, color: selectedType?.color, fontSize: 12, fontWeight: 600 }}>
              {selectedType?.label}
            </span>
            <strong>{title || "Test nomi"}</strong>
            <span style={{ color: "#9c8572", fontSize: 13 }}>— min: {minScore} ball</span>
          </div>
        </div>
      </div>

      {/* Questions — only shown in CREATE mode */}
      {!id && (
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#1a1a1a" }}>
              <QuestionCircleOutlined style={{ color: "#8f5c28", marginRight: 8 }} />
              Savollar ({questions.length} ta)
            </h2>
            <Button onClick={addQuestion} icon={<PlusOutlined />}
              style={{ background: "linear-gradient(135deg, #8f5c28, #b8782a)", border: "none", color: "#fff", borderRadius: 10, fontWeight: 600 }}>
              Savol qo'shish
            </Button>
          </div>

          {questions.map((q, qi) => (
            <div key={qi} style={{ background: "#fff", borderRadius: 18, padding: 24, marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f0e8de" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #8f5c28, #b8782a)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                    {qi + 1}
                  </span>
                  <span style={{ fontWeight: 600, color: "#4a3728", fontSize: 14 }}>Savol</span>
                </div>
                {questions.length > 1 && (
                  <Tooltip title="Savolni o'chirish">
                    <Button icon={<DeleteOutlined />} danger size="small" style={{ borderRadius: 8 }} onClick={() => removeQuestion(qi)} />
                  </Tooltip>
                )}
              </div>

              <Input.TextArea value={q.text} onChange={(e) => setQText(qi, e.target.value)}
                placeholder={`${qi + 1}-savol matnini kiriting...`} autoSize={{ minRows: 2, maxRows: 4 }}
                style={{ borderRadius: 10, border: "2px solid #e8ddd0", fontSize: 14, marginBottom: 16 }} />

              <div style={{ background: "#faf8f5", borderRadius: 12, padding: 16, border: "1px solid #ede5da" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontWeight: 600, color: "#6b5742", fontSize: 13 }}>Variantlar (to'g'risini ✓ belgilang)</span>
                  <Button size="small" icon={<PlusOutlined />} onClick={() => addChoice(qi)}
                    style={{ borderRadius: 7, border: "1px solid #e8ddd0", color: "#8f5c28", fontSize: 12, height: 28 }}>
                    Variant
                  </Button>
                </div>

                {q.choices.map((choice, ci) => (
                  <div key={ci}
                    style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, padding: "8px 12px", borderRadius: 10, background: choice.isCorrect ? "#dcfce7" : "#fff", border: `1.5px solid ${choice.isCorrect ? "#16a34a" : "#e8ddd0"}`, transition: "all 0.15s" }}>
                    <span style={{ width: 24, height: 24, borderRadius: "50%", background: choice.isCorrect ? "#16a34a" : "#e8ddd0", color: choice.isCorrect ? "#fff" : "#8b7355", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                      {String.fromCharCode(65 + ci)}
                    </span>
                    <Input value={choice.text} onChange={(e) => setChoiceText(qi, ci, e.target.value)}
                      placeholder={`${String.fromCharCode(65 + ci)} variant`} size="small"
                      style={{ flex: 1, borderRadius: 8, border: "none", background: "transparent", fontSize: 13, padding: "0 4px" }} />
                    <Tooltip title="To'g'ri javob">
                      <Checkbox checked={choice.isCorrect} onChange={() => setCorrect(qi, ci)} />
                    </Tooltip>
                    {q.choices.length > 2 && (
                      <Tooltip title="O'chirish">
                        <Button icon={<DeleteOutlined />} size="small" type="text" danger
                          style={{ padding: 0, width: 22, height: 22, flexShrink: 0 }} onClick={() => removeChoice(qi, ci)} />
                      </Tooltip>
                    )}
                  </div>
                ))}

                {!q.choices.some((c) => c.isCorrect) && (
                  <div style={{ marginTop: 8, fontSize: 12, color: "#dc2626", background: "#fee2e2", padding: "6px 10px", borderRadius: 8 }}>
                    ⚠ Kamida bitta to'g'ri variant belgilang
                  </div>
                )}
              </div>
            </div>
          ))}

          <div
            style={{ border: "2px dashed #e8ddd0", borderRadius: 16, padding: "20px", textAlign: "center", cursor: "pointer", color: "#9c8572", transition: "all 0.2s", marginBottom: 8 }}
            onClick={addQuestion}
            onMouseEnter={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "#8f5c28"; el.style.color = "#8f5c28"; el.style.background = "#fdf6f0"; }}
            onMouseLeave={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "#e8ddd0"; el.style.color = "#9c8572"; el.style.background = "transparent"; }}>
            <PlusOutlined style={{ fontSize: 20, marginBottom: 4 }} />
            <div style={{ fontWeight: 500, fontSize: 14 }}>Yangi savol qo'shish</div>
          </div>
        </div>
      )}

      {id && (
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ padding: "16px 20px", background: "#fff", borderRadius: 14, border: "1px solid #f0e8de", color: "#6b5742", fontSize: 13, display: "flex", alignItems: "center", gap: 10 }}>
            <QuestionCircleOutlined style={{ color: "#8f5c28", fontSize: 16 }} />
            <span>Savollarni tahrirlash uchun test sahifasiga o'ting va u yerdan savollarni boshqaring.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestsCrud;