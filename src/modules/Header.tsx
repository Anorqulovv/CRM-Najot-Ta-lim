import { useQueryClient } from "@tanstack/react-query";
import {
  BellOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { Badge, Button, List, Modal, Popover, Empty } from 'antd';
import { useContext, useState, useMemo } from 'react';
import { Context } from '../context/Context';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { PATH } from '../components';
import { useCookies } from 'react-cookie';
import { GetMe, GetAll } from '../service';
import { QueryPATH } from '../components';
import { instance } from '../hooks';

const HEADER_BG = 'linear-gradient(180deg, #1c1f27 0%, #1a1d24 100%)';
const BORDER = 'rgba(255,255,255,0.08)';
const BTN_BG = 'rgba(255,255,255,0.06)';
const BTN_BG_HOVER = 'rgba(255,255,255,0.12)';
const BTN_BORDER = 'rgba(255,255,255,0.12)';
const ACCENT = '#c8864a';
const ACCENT_DARK = '#8f5c28';

const Header = () => {
  const [cookies, , removeCookie] = useCookies(['accessToken']);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { setCollapse, collapse } = useContext(Context);

  const { data: userInfo = {}, isLoading } = GetMe(cookies.accessToken);

  const { data: siteNotifications = [] } = GetAll(
    QueryPATH.notifications,
    [],
    cookies.accessToken,
    '/notifications/my',
    {},
    undefined,
  );

  const notifications = useMemo(() => {
    return (siteNotifications ?? []).slice(0, 10).map((n: any) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      isRead: n.isRead,
      createdAt: n.createdAt,
      senderName: n.sender?.fullName ?? null,
    }));
  }, [siteNotifications]);

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const initials = userInfo?.fullName
    ? `${userInfo.fullName.split(' ')[0]?.[0] ?? ''}${userInfo.fullName.split(' ')[1]?.[0] ?? ''}`
    : null;

  function handleLogOut() {
    setLoading(true);
    setTimeout(() => {
      removeCookie('accessToken', { path: '/' });
      queryClient.clear();
      localStorage.clear();
      sessionStorage.clear();
      toast.success("Chiqib ketdingiz");
      setOpenModal(false);
      navigate(PATH.home);
    }, 700);
  }

  const typeLabel: Record<string, string> = {
    DAILY: 'Kunlik',
    WEEKLY: 'Haftalik',
    MONTHLY: 'Oylik',
  };

  /* ─── Notification popover content ─── */
  const NotifContent = (
    <div style={{ width: 340, maxHeight: 420, display: 'flex', flexDirection: 'column' }}>
      {/* Header row */}
      <div
        style={{
          padding: '12px 16px 10px',
          borderBottom: '1px solid #f0ebe5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 13.5, color: '#1a1a1a' }}>
          Bildirishnomalar
        </span>
        <Badge count={unreadCount} style={{ background: '#e8562a' }} />
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', maxHeight: 340 }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '32px 0' }}>
            <Empty description="Bildirishnomalar yo'q" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        ) : (
          <List
            dataSource={notifications}
            renderItem={(item: any) => (
              <List.Item
                style={{
                  padding: '11px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f5f5f5',
                  transition: 'background 0.12s',
                }}
                onClick={async () => {
                  try {
                    await instance(cookies.accessToken).patch(`/notifications/${item.id}/read`);
                    queryClient.invalidateQueries({ queryKey: [QueryPATH.notifications] });
                  } catch {}
                  setNotifOpen(false);
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background = '#faf7f4')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background = 'transparent')
                }
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, width: '100%' }}>
                  {/* Icon circle */}
                  <div
      className="crm-header"
      style={{
        height: 64,
        minHeight: 64,
        width: '100%',
        background: HEADER_BG,
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderBottom: `1px solid ${BORDER}`,
        boxShadow: '0 10px 28px rgba(0,0,0,0.24)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 18px',
        position: 'relative',
        zIndex: 50,
      }}
    >
                    <div
                      style={{
                        fontWeight: item.isRead ? 500 : 700,
                        fontSize: 12.5,
                        color: '#1a1a1a',
                        marginBottom: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.title || 'Xabar'}
                    </div>
                    <div
                      style={{
                        fontSize: 11.5,
                        color: '#6b7280',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.message}
                    </div>
                    {item.senderName && (
                      <div style={{ marginTop: 4, fontSize: 11, color: ACCENT_DARK }}>
                        Kimdan: {item.senderName}
                      </div>
                    )}
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </div>

      {/* Footer link */}
      {notifications.length > 0 && (
        <div
          style={{
            padding: '9px 16px',
            borderTop: '1px solid #f0ebe5',
            textAlign: 'center',
          }}
        >
          <span
            style={{ fontSize: 12.5, color: ACCENT_DARK, cursor: 'pointer', fontWeight: 500 }}
            onClick={() => {
              navigate(PATH.tests);
              setNotifOpen(false);
            }}
          >
            Barcha testlarni ko'rish →
          </span>
        </div>
      )}
    </div>
  );

  /* ─── User popover content ─── */
  const UserCard = (
    <div style={{ minWidth: 190, padding: '4px 0' }}>
      {/* Profile row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '11px 14px 12px',
          borderBottom: '1px solid #f0ebe5',
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7a4520, #c8864a)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: 13,
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          {userInfo?.avatar
            ? <img src={userInfo.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : (initials || <UserOutlined style={{ fontSize: 15 }} />)}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#1a1a1a', lineHeight: 1.3 }}>
            {userInfo?.username || 'Foydalanuvchi'}
          </div>
          {userInfo?.role && (
            <div
              style={{
                fontSize: 10,
                color: ACCENT_DARK,
                background: '#f5ece3',
                borderRadius: 4,
                padding: '1px 7px',
                display: 'inline-block',
                marginTop: 3,
                fontWeight: 600,
                letterSpacing: '0.3px',
              }}
            >
              {userInfo.role}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: '8px 10px 6px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Button
          onClick={() => navigate(PATH.profile)}
          block
          icon={<UserOutlined />}
          style={{
            background: '#f0f9f4',
            color: '#16a34a',
            border: '1px solid #bbf7d0',
            fontWeight: 500,
            fontSize: 12.5,
            height: 34,
            borderRadius: 8,
          }}
        >
          Mening profilim
        </Button>
        {userInfo?.role === 'SUPERADMIN' && (
          <Button
            onClick={() => navigate(PATH.users)}
            block
            icon={<TeamOutlined />}
            style={{
              background: '#f0f5ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
              fontWeight: 500,
              fontSize: 12.5,
              height: 34,
              borderRadius: 8,
            }}
          >
            Foydalanuvchilar
          </Button>
        )}
        <Button
          onClick={() => setOpenModal(true)}
          block
          icon={<LogoutOutlined />}
          style={{
            background: '#fff0e8',
            color: '#b84020',
            border: '1px solid #f5cfc4',
            fontWeight: 500,
            fontSize: 12.5,
            height: 34,
            borderRadius: 8,
          }}
        >
          Chiqish
        </Button>
      </div>
    </div>
  );

  /* ─── Shared button style helpers ─── */
  const iconBtn = (active = false): React.CSSProperties => ({
    width: 34,
    height: 34,
    borderRadius: 8,
    border: `1px solid ${active ? 'rgba(255,255,255,0.3)' : BTN_BORDER}`,
    background: active ? 'rgba(255,255,255,0.18)' : BTN_BG,
    color: 'rgba(255,255,255,0.82)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 15,
    transition: 'background 0.14s, border-color 0.14s',
  });

  return (
    <>
      <header
        className="crm-header"
        style={{
          background: HEADER_BG,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${BORDER}`,
          boxShadow: '0 10px 28px rgba(0,0,0,0.20)',
          padding: '0 20px',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          flexShrink: 0,
        }}
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapse(!collapse)}
          title={collapse ? 'Menyuni ochish' : 'Menyuni yopish'}
          style={iconBtn()}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = BTN_BG_HOVER)
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = BTN_BG)
          }
        >
          {collapse ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
        </button>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Notification bell */}
          <Popover
            content={NotifContent}
            trigger="click"
            open={notifOpen}
            onOpenChange={setNotifOpen}
            placement="bottomRight"
            overlayInnerStyle={{
              padding: 0,
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            }}
            arrow={false}
          >
            <Badge
              count={unreadCount}
              size="small"
              offset={[-2, 2]}
              styles={{ indicator: { background: '#e8562a', boxShadow: 'none' } }}
            >
              <button
                title="Bildirishnomalar"
                style={iconBtn(notifOpen)}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background = BTN_BG_HOVER)
                }
                onMouseLeave={(e) => {
                  if (!notifOpen)
                    (e.currentTarget as HTMLButtonElement).style.background = BTN_BG;
                }}
              >
                <BellOutlined />
              </button>
            </Badge>
          </Popover>

          {/* User chip */}
          <Popover
            content={UserCard}
            trigger="click"
            placement="bottomRight"
            overlayInnerStyle={{ padding: 0, borderRadius: 12, overflow: 'hidden' }}
            arrow={false}
          >
            <button
              title="Profil"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: BTN_BG,
                border: `1px solid ${BTN_BORDER}`,
                borderRadius: 8,
                padding: '0 10px 0 5px',
                height: 34,
                cursor: 'pointer',
                transition: 'background 0.14s',
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = BTN_BG_HOVER)
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = BTN_BG)
              }
            >
              {/* Avatar */}
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${ACCENT_DARK}, ${ACCENT})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#fff',
                  letterSpacing: '0.3px',
                  flexShrink: 0,
                  overflow: 'hidden',
                }}
              >
                {isLoading ? (
                  <UserOutlined style={{ fontSize: 11 }} />
                ) : userInfo?.avatar ? (
                  <img src={userInfo.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  initials || <UserOutlined style={{ fontSize: 11 }} />
                )}
              </div>

              {/* Name */}
              {userInfo?.fullName && (
                <span
                  className="crm-header-user-name"
                  style={{
                    color: 'rgba(255,255,255,0.85)',
                    fontSize: 13,
                    fontWeight: 500,
                    maxWidth: 120,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {userInfo.fullName.split(' ')[0]}
                </span>
              )}
            </button>
          </Popover>
        </div>
      </header>

      {/* Logout modal */}
      <Modal
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onOk={handleLogOut}
        confirmLoading={loading}
        okText="Ha, chiqish"
        cancelText="Bekor qilish"
        title={
          <span style={{ fontSize: 15, fontWeight: 600 }}>Tizimdan chiqish</span>
        }
        okButtonProps={{
          style: {
            background: 'linear-gradient(135deg, #7a4520, #c8864a)',
            border: 'none',
            borderRadius: 8,
            fontWeight: 500,
          },
        }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
        width={380}
        centered
      >
        <p style={{ color: '#555', margin: '12px 0 4px', fontSize: 14 }}>
          Tizimdan chiqmoqchimisiz? Saqlanmagan ma'lumotlar yo'qolishi mumkin.
        </p>
      </Modal>
    </>
  );
};

export default Header;