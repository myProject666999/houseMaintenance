import React, { useState } from 'react';
import { Routes, Route, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Avatar, message } from 'antd';
import { 
  HomeOutlined, 
  NotificationOutlined, 
  ToolOutlined, 
  FileTextOutlined, 
  BarChartOutlined,
  StarOutlined,
  UserOutlined,
  LogoutOutlined,
  KeyOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = Layout;

const OwnerLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      key: '/owner/home',
      icon: <HomeOutlined />,
      label: '首页',
      onClick: () => navigate('/owner/home'),
    },
    {
      key: '/owner/notices',
      icon: <NotificationOutlined />,
      label: '通知公告',
      onClick: () => navigate('/owner/notices'),
    },
    {
      key: '/owner/repair-orders',
      icon: <ToolOutlined />,
      label: '房屋报修',
      onClick: () => navigate('/owner/repair-orders'),
    },
    {
      key: '/owner/repair-records',
      icon: <FileTextOutlined />,
      label: '维修记录',
      onClick: () => navigate('/owner/repair-records'),
    },
    {
      key: '/owner/statistics',
      icon: <BarChartOutlined />,
      label: '维修金额统计',
      onClick: () => navigate('/owner/statistics'),
    },
    {
      key: '/owner/evaluations',
      icon: <StarOutlined />,
      label: '维修评价',
      onClick: () => navigate('/owner/evaluations'),
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/owner/profile'),
    },
    {
      key: 'change-password',
      icon: <KeyOutlined />,
      label: '修改密码',
      onClick: () => navigate('/owner/change-password'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        logout();
        message.success('已退出登录');
      },
    },
  ];

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.startsWith('/owner/repair-orders')) return '/owner/repair-orders';
    if (path.startsWith('/owner/notices')) return '/owner/notices';
    return path;
  };

  return (
    <Layout className="layout-container">
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        theme="dark"
      >
        <div style={{ 
          height: 64, 
          margin: 16, 
          background: 'rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: collapsed ? 14 : 18,
          fontWeight: 'bold'
        }}>
          {collapsed ? '维修' : '房屋维修系统'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: '#666' }}>欢迎，{user?.real_name || user?.username}</span>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="user-avatar">
                <Avatar icon={<UserOutlined />} />
                <span style={{ marginLeft: 8 }}>{user?.real_name || user?.username}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default OwnerLayout;
