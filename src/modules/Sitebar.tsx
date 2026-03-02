import { AuditOutlined, BarChartOutlined, DropboxOutlined, PieChartOutlined, UsergroupDeleteOutlined, UserOutlined } from '@ant-design/icons';
import { Menu, type MenuProps } from 'antd';
import { LogoIcon } from '../assets/icons';
import { useContext, useEffect, useState } from 'react';
import { Context } from '../context/Context';
import { Link } from 'react-router-dom';
import { PATH } from '../components';
import { GetMe } from '../service';
import { useCookies } from 'react-cookie';

type MenuItem = Required<MenuProps>['items'][number];
const Sitebar: React.FC = () => {
  const [cookies] = useCookies(['token'])
  const { collapse } = useContext(Context)
  const {data:userInfo = {}} = GetMe(cookies.token)
  
  const [items, setItems] = useState<MenuItem[]>([
    { key: '1', icon: <PieChartOutlined />, label: <Link to={PATH.stacks}>Yo'nalishlar</Link> },
    { key: '2', icon: <BarChartOutlined />, label: <Link to={PATH.groups}>Guruxlar</Link> },
    { key: '3', icon: <UserOutlined />, label: <Link to={PATH.teachers}>Ustozlar</Link> },
    { key: '4', icon: <UsergroupDeleteOutlined />, label: <Link to={PATH.students}>O'quvchilar</Link> },
    { key: '5', icon: <DropboxOutlined />, label: <Link to={PATH.rooms}>Xonalar</Link> },
  ]);
  
  useEffect(() => {
    if(userInfo.role == "super_admin"){
      const usersData = {key:'6', icon:<AuditOutlined />, label: <Link to={PATH.users}>Foydalanuvchilar</Link>}
      setItems(last => [...last, usersData])
    }
  },[userInfo])
  
  return (
    <div className={`bg-[#8f5c28]! duration-300 h-screen ${collapse ? "w-[5.5%]" : "w-[20%]"}`}>
      <div className='p-5 flex items-center text-white gap-5 border-b border-white'>
        <LogoIcon />
        {!collapse && <strong className='text-[22px]'>Najot Ta'lim</strong>}
      </div>
      <Menu
        className='bg-[#8f5c28]!'
        defaultSelectedKeys={['1']}
        defaultOpenKeys={['sub1']}
        mode="inline"
        theme="dark"
        inlineCollapsed={collapse}
        items={items}
      />
    </div>
  );
};

export default Sitebar;