import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Card, Radio, Typography, Space, Spin, Progress, Tag } from "antd";
import { GetById } from "../../../service";
import toast from "react-hot-toast";
import { QueryPATH } from "../../../components";
import { instance } from "../../../hooks";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  TrophyOutlined,
  ArrowLeftOutlined,
  SendOutlined,
  FileTextOutlined,
  LockOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const TestsTake = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  const { data: test, isLoading } = GetById(
    testId!,
    cookies.accessToken,
    QueryPATH.tests,
    "/tests"
  );

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
  } | null>(null);

  const handleAnswerChange = (questionId: number, choiceId: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: choiceId }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length === 0) {
      toast.error("Hech bo'lmaganda bitta savolga javob bering!");
      return;
    }
    setSubmitting(true);
    try {
      const res = await instance(cookies.accessToken).post("/tests/submit", {
        testId: Number(testId),
        answers,
      });
      const data = res.data?.data;
      setResult({ score: data.score, passed: data.passed });
      queryClient.invalidateQueries({ queryKey: [QueryPATH.tests] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "center", minHeight: "80vh"
      }}>
        <Spin size="large" tip="Test yuklanmoqda..." />
      </div>
    );
  }

  if (!test) {
    return (
      <div style={{ padding: 32, textAlign: "center", color: "#dc2626" }}>
        Test topilmadi
      </div>
    );
  }

  // ✅ ASOSIY TO'G'IRLASH:
  // Avvalgi kod: test.results && test.results.length > 0
  // Bu reset qilingan (isCurrent: false) natijalarni ham bloklardi.
  // Endi faqat isCurrent === true bo'lgan faol natija bo'lsa bloklash kerak.
  const activeResult = test.results?.find((r: any) => r.isCurrent === true) ?? null;
  const alreadyDone = !!activeResult && !result;

  if (alreadyDone) {
    const passed = activeResult.score >= (test.minScore ?? 60);
    return (
      <div style={{ padding: "40px 24px", maxWidth: 520, margin: "0 auto" }}>
        <div style={{
          borderRadius: 20, padding: 36, textAlign: "center",
          background: "#fffbeb", border: "2px solid #f59e0b",
          boxShadow: "0 8px 32px rgba(245,158,11,0.15)", marginBottom: 24,
        }}>
          <LockOutlined style={{ fontSize: 64, color: "#b45309", marginBottom: 16 }} />
          <Title level={3} style={{ margin: "0 0 8px", color: "#92400e" }}>
            Test allaqachon ishlangan
          </Title>
          <Text style={{
            fontSize: 14, color: "#92400e",
            display: "block", marginBottom: 20
          }}>
            Siz bu testni avval ishlagansiz. Qayta ishlash uchun ustozdan ruxsat so'rang.
          </Text>
          <div style={{
            padding: "12px 20px", borderRadius: 14,
            background: "rgba(255,255,255,0.7)",
            display: "inline-block", marginBottom: 20
          }}>
            <span style={{
              fontSize: 32, fontWeight: 800,
              color: passed ? "#16a34a" : "#dc2626"
            }}>
              {activeResult.score}
            </span>
            <span style={{ fontSize: 16, color: "#6b5742" }}>/100</span>
            <div style={{
              fontSize: 13,
              color: passed ? "#16a34a" : "#dc2626",
              fontWeight: 600, marginTop: 4
            }}>
              {passed ? "✅ O'tdingiz" : "❌ O'tmadingiz"}
            </div>
          </div>
        </div>
        <Button
          onClick={() => navigate("/tests")}
          icon={<ArrowLeftOutlined />}
          size="large"
          style={{
            width: "100%", borderRadius: 12,
            border: "1.5px solid #e8ddd0", color: "#8f5c28",
            height: 48, fontWeight: 600
          }}
        >
          Testlarga qaytish
        </Button>
      </div>
    );
  }

  // ==================== NATIJA EKRANI ====================
  if (result) {
    const passed = result.passed;
    const minScore = test.minScore ?? 60;

    return (
      <div style={{ padding: "40px 24px", maxWidth: 560, margin: "0 auto" }}>
        <div style={{
          borderRadius: 24, padding: 40, textAlign: "center",
          background: passed
            ? "linear-gradient(135deg, #dcfce7, #bbf7d0)"
            : "linear-gradient(135deg, #fee2e2, #fecaca)",
          border: `2px solid ${passed ? "#16a34a" : "#dc2626"}`,
          boxShadow: `0 8px 32px ${passed ? "rgba(22,163,74,0.18)" : "rgba(220,38,38,0.18)"}`,
          marginBottom: 24,
        }}>
          <div style={{ marginBottom: 20 }}>
            {passed
              ? <CheckCircleFilled style={{ fontSize: 72, color: "#16a34a" }} />
              : <CloseCircleFilled style={{ fontSize: 72, color: "#dc2626" }} />
            }
          </div>
          <Title level={2} style={{
            margin: "0 0 8px",
            color: passed ? "#15803d" : "#b91c1c",
            fontWeight: 800
          }}>
            {passed ? "🎉 Tabriklaymiz!" : "Afsus..."}
          </Title>
          <Text style={{
            fontSize: 15,
            color: passed ? "#166534" : "#991b1b",
            display: "block", marginBottom: 28
          }}>
            {passed ? "Testdan muvaffaqiyatli o'tdingiz!" : "Testdan o'ta olmadingiz"}
          </Text>

          <div style={{ display: "inline-block", marginBottom: 20 }}>
            <Progress
              type="circle"
              percent={result.score}
              size={120}
              strokeColor={passed ? "#16a34a" : "#dc2626"}
              trailColor={passed ? "rgba(22,163,74,0.15)" : "rgba(220,38,38,0.15)"}
              format={(p) => (
                <span style={{
                  fontSize: 22, fontWeight: 800,
                  color: passed ? "#16a34a" : "#dc2626"
                }}>
                  {p}
                </span>
              )}
            />
          </div>

          <div style={{
            display: "flex", justifyContent: "center",
            gap: 14, flexWrap: "wrap"
          }}>
            <div style={{
              padding: "8px 18px", borderRadius: 50,
              background: "rgba(255,255,255,0.7)", fontSize: 13,
              fontWeight: 600, color: passed ? "#15803d" : "#b91c1c"
            }}>
              <TrophyOutlined style={{ marginRight: 6 }} />
              Ballingiz: <strong>{result.score}</strong> / 100
            </div>
            <div style={{
              padding: "8px 18px", borderRadius: 50,
              background: "rgba(255,255,255,0.7)",
              fontSize: 13, fontWeight: 600, color: "#4b5563"
            }}>
              Minimal ball: <strong>{minScore}</strong>
            </div>
          </div>
        </div>

        <div style={{
          padding: "14px 18px", borderRadius: 14,
          background: "#dbeafe", border: "1px solid #93c5fd",
          color: "#1d4ed8", fontSize: 13, textAlign: "center", marginBottom: 20
        }}>
          📲 Natija sizga va ota-onangizga Telegram orqali yuborildi
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <Button
            onClick={() => navigate("/tests")}
            icon={<ArrowLeftOutlined />}
            size="large"
            style={{
              flex: 1, borderRadius: 12,
              border: "1.5px solid #e8ddd0", color: "#8f5c28",
              height: 48, fontWeight: 600
            }}
          >
            Testlarga qaytish
          </Button>
          <Button
            onClick={() => navigate(`/tests/${testId}`)}
            icon={<FileTextOutlined />}
            size="large"
            style={{
              flex: 1,
              background: "linear-gradient(135deg, #8f5c28, #b8782a)",
              border: "none", color: "#fff",
              borderRadius: 12, height: 48, fontWeight: 600
            }}
          >
            Test ma'lumotlari
          </Button>
        </div>
      </div>
    );
  }

  // ==================== TEST ISHLASH EKRANI ====================
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = test.questions?.length ?? 0;
  const progressPercent = totalQuestions > 0
    ? Math.round((answeredCount / totalQuestions) * 100)
    : 0;

  return (
    <div style={{ padding: "24px", maxWidth: 760, margin: "0 auto" }}>

      {/* Header */}
      <div style={{
        background: "#fff", borderRadius: 20, padding: "24px 28px",
        marginBottom: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        border: "1px solid #f0e8de"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "linear-gradient(135deg, #8f5c28, #b8782a)",
            display: "flex", alignItems: "center",
            justifyContent: "center", flexShrink: 0
          }}>
            <FileTextOutlined style={{ color: "#fff", fontSize: 22 }} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1a1a1a" }}>
              {test.title}
            </h2>
            <Tag style={{
              marginTop: 4, borderRadius: 20, fontSize: 12,
              fontWeight: 600, border: "none",
              background: test.type === "DAILY" ? "#dcfce7"
                : test.type === "WEEKLY" ? "#dbeafe" : "#ede9fe",
              color: test.type === "DAILY" ? "#16a34a"
                : test.type === "WEEKLY" ? "#2563eb" : "#7c3aed"
            }}>
              {test.type === "DAILY" ? "Kunlik"
                : test.type === "WEEKLY" ? "Haftalik" : "Oylik"}
            </Tag>
          </div>
        </div>
        <div>
          <div style={{
            display: "flex", justifyContent: "space-between",
            fontSize: 13, color: "#6b5742", marginBottom: 6, fontWeight: 500
          }}>
            <span>Javob berilgan: {answeredCount} / {totalQuestions}</span>
            <span style={{
              color: progressPercent === 100 ? "#16a34a" : "#8f5c28",
              fontWeight: 600
            }}>
              {progressPercent}%
            </span>
          </div>
          <Progress
            percent={progressPercent}
            showInfo={false}
            strokeColor="#8f5c28"
            trailColor="#f0e8de"
            strokeWidth={8}
            style={{ margin: 0 }}
          />
        </div>
      </div>

      {/* Questions */}
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        {test.questions?.map((q: any, qi: number) => {
          const isAnswered = answers[q.id] !== undefined;
          return (
            <Card
              key={q.id}
              style={{
                borderRadius: 18,
                border: `1.5px solid ${isAnswered ? "#8f5c28" : "#f0e8de"}`,
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                overflow: "hidden"
              }}
              bodyStyle={{ padding: "20px 24px" }}
            >
              <div style={{
                display: "flex", gap: 12,
                marginBottom: 16, alignItems: "flex-start"
              }}>
                <span style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: isAnswered
                    ? "linear-gradient(135deg, #8f5c28, #b8782a)"
                    : "#f0e8de",
                  color: isAnswered ? "#fff" : "#8b7355",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", fontWeight: 700,
                  fontSize: 14, flexShrink: 0
                }}>
                  {qi + 1}
                </span>
                <Text strong style={{
                  fontSize: 15, color: "#1a1a1a",
                  lineHeight: 1.5, flex: 1
                }}>
                  {q.text}
                </Text>
              </div>

              <Radio.Group
                onChange={(e) => handleAnswerChange(q.id, Number(e.target.value))}
                value={answers[q.id]}
                style={{ width: "100%" }}
              >
                <Space direction="vertical" style={{ width: "100%" }} size={8}>
                  {q.choices.map((c: any, ci: number) => {
                    const selected = answers[q.id] === c.id;
                    return (
                      <label key={c.id} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 16px", borderRadius: 12,
                        background: selected ? "#fdf6f0" : "#fafaf9",
                        border: `1.5px solid ${selected ? "#8f5c28" : "#e8e0d5"}`,
                        cursor: "pointer", transition: "all 0.15s", userSelect: "none"
                      }}>
                        <Radio value={c.id} style={{ margin: 0 }} />
                        <span style={{
                          width: 22, height: 22, borderRadius: "50%",
                          background: selected ? "#8f5c28" : "#e8ddd0",
                          color: selected ? "#fff" : "#8b7355",
                          display: "flex", alignItems: "center",
                          justifyContent: "center", fontSize: 10,
                          fontWeight: 700, flexShrink: 0
                        }}>
                          {String.fromCharCode(65 + ci)}
                        </span>
                        <span style={{ fontSize: 14, color: "#1a1a1a", flex: 1 }}>
                          {c.text}
                        </span>
                      </label>
                    );
                  })}
                </Space>
              </Radio.Group>
            </Card>
          );
        })}
      </Space>

      {/* Submit */}
      <div style={{ marginTop: 32, textAlign: "center" }}>
        {answeredCount < totalQuestions && (
          <p style={{ color: "#9c8572", fontSize: 13, marginBottom: 12 }}>
            ⚠ Hali {totalQuestions - answeredCount} ta savolga javob berilmagan
          </p>
        )}
        <Button
          size="large"
          onClick={handleSubmit}
          loading={submitting}
          disabled={submitting}
          icon={<SendOutlined />}
          style={{
            background: "linear-gradient(135deg, #8f5c28, #c8864a)",
            border: "none", height: 52, paddingInline: 48,
            fontSize: 16, fontWeight: 600, color: "#fff",
            borderRadius: 14, boxShadow: "0 4px 16px rgba(143,92,40,0.3)"
          }}
        >
          {submitting ? "Yuborilmoqda..." : "Testni yakunlash va natijani ko'rish"}
        </Button>
        <p style={{ color: "#9c8572", fontSize: 12, marginTop: 10 }}>
          Testni yakunlaganingizdan so'ng natija Telegram orqali yuboriladi
        </p>
      </div>
    </div>
  );
};

export default TestsTake;