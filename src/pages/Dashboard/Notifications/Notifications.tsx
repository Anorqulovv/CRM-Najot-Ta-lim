import { useState } from "react";
import { useCookies } from "react-cookie";
import { Button, Input, Card, Space, Divider } from "antd";
import { instance } from "../../../hooks";
import toast from "react-hot-toast";
import {
  SendOutlined,
  UserOutlined,
  TeamOutlined,
  BellOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;

type RecipientType = "all" | "specific";

const Notifications = () => {
  const [cookies] = useCookies(["accessToken"]);

  const [message, setMessage] = useState("");
  const [recipientType, setRecipientType] = useState<RecipientType>("all");
  const [telegramId, setTelegramId] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Xabar matnini kiriting!");
      return;
    }
    if (recipientType === "specific" && !telegramId.trim()) {
      toast.error("Telefon raqamni kiriting!");
      return;
    }

    setSending(true);
    try {
      if (recipientType === "all") {
        await instance(cookies.accessToken).post("/telegram/notify-all", { message });
        toast.success("Xabar barcha foydalanuvchilarga yuborildi!");
      } else {
        // 1. Telefon bo'yicha userni topamiz
        const { data } = await instance(cookies.accessToken).get("/users", {
          params: { phone: telegramId.trim() }
        });

        console.log("Users response:", data); // strukturani tekshirish uchun

        // Response array yoki object bo'lishi mumkin
        const usersList = Array.isArray(data) ? data : data?.data ?? [];
        const foundUser = usersList.find((u: any) =>
          u.phone === telegramId.trim() ||
          u.phone?.replace(/\s/g, "") === telegramId.trim().replace(/\s/g, "")
        );

        if (!foundUser) {
          toast.error("Bu telefon raqamli foydalanuvchi topilmadi!");
          return;
        }

        if (!foundUser.telegramId) {
          toast.error(`${foundUser.fullName} Telegram botini ulamagani!`);
          return;
        }

        // 2. Topilgan telegramId ga xabar yuboramiz
        await instance(cookies.accessToken).post("/telegram/notify", {
          telegramId: foundUser.telegramId,
          message,
        });
        toast.success(`Xabar ${foundUser.fullName} ga yuborildi!`);
      }

      setMessage("");
      if (recipientType === "specific") setTelegramId("");
    } catch (err: any) {
      const errMsg = err?.response?.data?.message;
      if (Array.isArray(errMsg)) toast.error(errMsg[0]);
      else toast.error(errMsg || "Xatolik yuz berdi");
    } finally {
      setSending(false);
    }
  };
  return (
    <div style={{ padding: "28px", maxWidth: 680, margin: "0 auto" }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: "linear-gradient(135deg, #8f5c28, #b8782a)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 15px rgba(143,92,40,0.3)",
        }}>
          <BellOutlined style={{ color: "#fff", fontSize: 22 }} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#1a1a1a" }}>Bildirishnomalar</h1>
          <span style={{ color: "#8b7355", fontSize: 13 }}>Foydalanuvchilarga Telegram xabar yuborish</span>
        </div>
      </div>

      <Card
        style={{
          borderRadius: 20,
          boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
          border: "1px solid #f0e8de",
          overflow: "hidden",
        }}
        bodyStyle={{ padding: 32 }}
      >
        <Space direction="vertical" size={24} style={{ width: "100%" }}>

          {/* Recipient type */}
          <div>
            <label style={{ display: "block", fontWeight: 600, color: "#4a3728", marginBottom: 10, fontSize: 14 }}>
              Kimga yuborish?
            </label>
            <div style={{ display: "flex", gap: 12 }}>
              <div
                onClick={() => setRecipientType("all")}
                style={{
                  flex: 1, padding: "14px 16px", borderRadius: 14,
                  border: `2px solid ${recipientType === "all" ? "#8f5c28" : "#e8ddd0"}`,
                  background: recipientType === "all" ? "#fdf6f0" : "#fafaf9",
                  cursor: "pointer", transition: "all 0.2s", textAlign: "center",
                }}
              >
                <TeamOutlined style={{ fontSize: 22, color: recipientType === "all" ? "#8f5c28" : "#9c8572", marginBottom: 6, display: "block" }} />
                <div style={{ fontWeight: 600, color: recipientType === "all" ? "#8f5c28" : "#4b5563", fontSize: 13 }}>Barcha</div>
                <div style={{ fontSize: 11, color: "#9c8572", marginTop: 2 }}>Telegram bog'langan</div>
              </div>
              <div
                onClick={() => setRecipientType("specific")}
                style={{
                  flex: 1, padding: "14px 16px", borderRadius: 14,
                  border: `2px solid ${recipientType === "specific" ? "#8f5c28" : "#e8ddd0"}`,
                  background: recipientType === "specific" ? "#fdf6f0" : "#fafaf9",
                  cursor: "pointer", transition: "all 0.2s", textAlign: "center",
                }}
              >
                <UserOutlined style={{ fontSize: 22, color: recipientType === "specific" ? "#8f5c28" : "#9c8572", marginBottom: 6, display: "block" }} />
                <div style={{ fontWeight: 600, color: recipientType === "specific" ? "#8f5c28" : "#4b5563", fontSize: 13 }}>Aniq foydalanuvchi</div>
                <div style={{ fontSize: 11, color: "#9c8572", marginTop: 2 }}>Telegram ID orqali</div>
              </div>
            </div>
          </div>

          {/* Telegram ID input (only specific) */}
          {recipientType === "specific" && (
            <div>
              <label style={{ display: "block", fontWeight: 600, color: "#4a3728", marginBottom: 8, fontSize: 14 }}>
                Telefon raqam
              </label>
              <Input
                value={telegramId}
                onChange={(e) => setTelegramId(e.target.value)}
                placeholder="+998901234567"
                size="large"
                style={{ borderRadius: 12, border: "2px solid #e8ddd0" }}
                prefix={<UserOutlined style={{ color: "#9c8572" }} />}
              />
              <p style={{ fontSize: 12, color: "#9c8572", margin: "6px 0 0" }}>
                Foydalanuvchining telefon raqamini kiriting
              </p>
            </div>
          )}

          {/* Info banner */}
          {recipientType === "all" && (
            <div style={{
              padding: "12px 16px", borderRadius: 12,
              background: "#dbeafe", border: "1px solid #93c5fd",
              color: "#1d4ed8", fontSize: 13, display: "flex", alignItems: "center", gap: 8,
            }}>
              <TeamOutlined />
              <span>Xabar Telegram botini bog'lagan <strong>barcha foydalanuvchilarga</strong> yuboriladi</span>
            </div>
          )}

          <Divider style={{ margin: "0" }} />

          {/* Message */}
          <div>
            <label style={{ display: "block", fontWeight: 600, color: "#4a3728", marginBottom: 8, fontSize: 14 }}>
              Xabar matni <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <TextArea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Foydalanuvchilarga yubormoqchi bo'lgan xabarni yozing..."
              rows={6}
              size="large"
              style={{ borderRadius: 12, border: "2px solid #e8ddd0", fontSize: 14 }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <p style={{ fontSize: 12, color: "#9c8572", margin: 0 }}>
                HTML formatlash ishlatiladi (qalin — &lt;b&gt;, kursiv — &lt;i&gt;)
              </p>
              <span style={{ fontSize: 12, color: message.length > 3000 ? "#dc2626" : "#9c8572" }}>
                {message.length}/4096
              </span>
            </div>
          </div>

          {/* Send button */}
          <Button
            type="primary"
            size="large"
            block
            loading={sending}
            onClick={handleSend}
            icon={<SendOutlined />}
            style={{
              background: "linear-gradient(135deg, #8f5c28, #c8864a)",
              border: "none",
              height: 52,
              fontSize: 16,
              fontWeight: 600,
              borderRadius: 12,
              boxShadow: "0 4px 14px rgba(143,92,40,0.3)",
            }}
          >
            {sending ? "Yuborilmoqda..." : recipientType === "all" ? "Barcha foydalanuvchilarga yuborish" : "Yuborish"}
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default Notifications;
