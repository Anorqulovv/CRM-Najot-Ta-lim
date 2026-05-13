import {
  AuditOutlined,
  BankOutlined,
  BarChartOutlined,
  BellOutlined,
  FileTextOutlined,
  PieChartOutlined,
  TeamOutlined,
  UsergroupDeleteOutlined,
  UserOutlined,
  CalendarOutlined,
  CustomerServiceOutlined,
} from '@ant-design/icons';
import { useContext, useMemo } from 'react';
import { Context } from '../context/Context';
import { Link, useLocation } from 'react-router-dom';
import { PATH } from '../components';
import { GetMe } from '../service';
import { useCookies } from 'react-cookie';
import { LogoIcon } from '../assets/icons';

type MenuItem = {
  key: string;
  icon: React.ReactNode;
  label: string;
  path: string;
  roles: string[];
};

const ALL_MENU_ITEMS: MenuItem[] = [
  { key: '0', icon: <PieChartOutlined />, label: "Yo'nalishlar", path: PATH.directions, roles: ['SUPERADMIN', 'ADMIN'] },
  { key: '1', icon: <BankOutlined />, label: 'Filiallar', path: PATH.branches, roles: ['SUPERADMIN', 'ADMIN'] },
  { key: '2', icon: <BarChartOutlined />, label: 'Guruhlar', path: PATH.groups, roles: ['SUPERADMIN', 'ADMIN', 'TEACHER', 'SUPPORT'] },
  { key: '3', icon: <UserOutlined />, label: 'Ustozlar', path: PATH.teachers, roles: ['SUPERADMIN', 'ADMIN'] },
  { key: '4', icon: <CustomerServiceOutlined />, label: 'Support', path: PATH.support, roles: ['SUPERADMIN', 'ADMIN'] },
  { key: '5', icon: <UsergroupDeleteOutlined />, label: "O'quvchilar", path: PATH.students, roles: ['SUPERADMIN', 'ADMIN', 'TEACHER', 'SUPPORT'] },
  { key: '6', icon: <TeamOutlined />, label: "Ota-onalar", path: PATH.studentsParents, roles: ['SUPERADMIN', 'ADMIN'] },
  { key: '7', icon: <FileTextOutlined />, label: 'Testlar', path: PATH.tests, roles: ['SUPERADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'SUPPORT'] },
  { key: '8', icon: <CalendarOutlined />, label: 'Davomat', path: '/attendance', roles: ['SUPERADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'SUPPORT'] },
  { key: '9', icon: <BellOutlined />, label: 'Bildirishnomalar', path: PATH.notifications, roles: ['SUPERADMIN', 'ADMIN'] },
  { key: '10', icon: <AuditOutlined />, label: 'Foydalanuvchilar', path: PATH.users, roles: ['SUPERADMIN'] },
  { key: '11', icon: <BarChartOutlined />, label: 'Farzand natijalari', path: PATH.parentResults, roles: ['PARENT'] },
  { key: '12', icon: <UserOutlined />, label: 'Profilim', path: PATH.profile, roles: ['SUPERADMIN', 'ADMIN', 'TEACHER', 'SUPPORT', 'STUDENT', 'PARENT'] },
];

const Sitebar: React.FC = () => {
  const [cookies] = useCookies(['accessToken']);
  const { collapse } = useContext(Context);
  const { data: userInfo = {} } = GetMe(cookies.accessToken);
  const location = useLocation();

  const items = useMemo(() => {
    if (!userInfo?.role) return [];
    return ALL_MENU_ITEMS.filter((item) => item.roles.includes(userInfo.role));
  }, [userInfo?.role]);

  return (
    <aside style={{
      width: collapse ? '64px' : '224px',
      height: '100vh',
      background: 'linear-gradient(180deg, #1c1f27 0%, #1a1d24 100%)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      borderRight: '1px solid rgba(255,255,255,0.05)',
    }}>
      {/* Subtle glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse at 50% 0%, rgba(200,134,74,0.07) 0%, transparent 60%)',
      }} />

      {/* Logo */}
      <Link to="/" style={{ textDecoration: 'none' }}>
        <div style={{
          padding: collapse ? '16px 0' : '16px 18px',
          display: 'flex', alignItems: 'center', gap: 10,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          justifyContent: collapse ? 'center' : 'flex-start',
          position: 'relative', zIndex: 1, flexShrink: 0,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #7a4520 0%, #c8864a 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, color: '#fff',
            boxShadow: '0 4px 14px rgba(200,134,74,0.3)',
          }}>
            <LogoIcon />
          </div>
          {!collapse && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                color: 'rgba(255,255,255,0.95)', fontWeight: 700, fontSize: 14,
                letterSpacing: '-0.2px', lineHeight: 1.3, whiteSpace: 'nowrap',
                fontFamily: "'Outfit', sans-serif",
              }}>Najot Ta'lim</div>
              <div style={{
                color: 'rgba(200,134,74,0.6)', fontSize: 9.5,
                marginTop: 1, letterSpacing: '0.8px',
                textTransform: 'uppercase', fontWeight: 600,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>Beta v1.1</div>
            </div>
          )}
        </div>
      </Link>

      {/* Menu label */}
      {!collapse && (
        <div style={{
          padding: '14px 18px 5px',
          color: 'rgba(255,255,255,0.2)',
          fontSize: 9, letterSpacing: '1.4px',
          textTransform: 'uppercase', fontWeight: 700,
          position: 'relative', zIndex: 1,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>Menyu</div>
      )}

      {/* Nav */}
      <nav style={{
        flex: 1, padding: collapse ? '8px 8px' : '4px 10px',
        display: 'flex', flexDirection: 'column', gap: 1,
        overflowY: 'auto', scrollbarWidth: 'none',
        position: 'relative', zIndex: 1,
      }}>
        {items.map((item) => {
          const isHome = item.path === '/';

          const isStudentsParents = item.path === PATH.studentsParents;
          const isStudents = item.path === PATH.students;

          const isActive = isHome
            ? location.pathname === '/'
            : isStudentsParents
              ? location.pathname === PATH.studentsParents || location.pathname.startsWith(PATH.studentsParents + '/')
              : isStudents
                ? location.pathname === PATH.students || (
                    location.pathname.startsWith(PATH.students + '/') &&
                    !location.pathname.startsWith(PATH.studentsParents)
                  )
                : location.pathname === item.path || location.pathname.startsWith(item.path + '/');

          return (
            <Link
              key={item.key}
              to={item.path}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: collapse ? '11px 0' : '9px 12px',
                borderRadius: 10,
                color: isActive ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.38)',
                textDecoration: 'none',
                background: isActive ? 'rgba(200,134,74,0.14)' : 'transparent',
                fontWeight: isActive ? 600 : 400,
                fontSize: 13,
                justifyContent: collapse ? 'center' : 'flex-start',
                position: 'relative',
                border: isActive ? '1px solid rgba(200,134,74,0.25)' : '1px solid transparent',
                boxSizing: 'border-box',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.background = 'rgba(255,255,255,0.04)';
                  el.style.color = 'rgba(255,255,255,0.65)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.background = 'transparent';
                  el.style.color = 'rgba(255,255,255,0.38)';
                }
              }}
            >
              {isActive && (
                <span style={{
                  position: 'absolute', left: 0, top: '20%', bottom: '20%',
                  width: 3, borderRadius: '0 4px 4px 0', background: '#c8864a',
                }} />
              )}
              <span style={{
                fontSize: 15, flexShrink: 0,
                opacity: isActive ? 1 : 0.6,
                width: 18, textAlign: 'center',
                color: isActive ? '#c8864a' : 'inherit',
              }}>{item.icon}</span>
              {!collapse && (
                <span style={{
                  whiteSpace: 'nowrap', overflow: 'hidden',
                  textOverflow: 'ellipsis', flex: 1, letterSpacing: '-0.1px',
                }}>
                  {item.label}
                </span>
              )}
              {isActive && !collapse && (
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'rgba(200,134,74,0.7)', flexShrink: 0,
                }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        color: 'rgba(255,255,255,0.18)', fontSize: 10.5,
        padding: collapse ? '12px 0' : '12px 18px',
        textAlign: collapse ? 'center' : 'left',
        position: 'relative', zIndex: 1,
        letterSpacing: '0.2px',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        {collapse ? '©' : "© 2026 Najot Ta'lim"}
      </div>
    </aside>
  );
};

export default Sitebar;
