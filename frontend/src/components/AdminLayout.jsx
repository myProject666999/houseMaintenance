import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Dropdown, Avatar, message } from 'antd';
import { 
  HomeOutlined, 
  DashboardOutlined,
  TeamOutlined, 
  ToolOutlined, 
  FileTextOutlined, 
  NotificationOutlined,
  BarChartOutlined,
  DatabaseOutlined,
  UserOutlined,
  LogoutOutlined,
  KeyOutlined,
  SettingOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      key: '/admin/home',
      icon: <HomeOutlined />,
      label: '系统首页',
      onClick: () => navigate('/admin/home'),
    },
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: '数据看板',
      onClick: () => navigate('/admin/dashboard'),
    },
    {
      key: 'user-management',
      icon: <TeamOutlined />,
      label: '用户管理',
      children: [
        {
          key: '/admin/owners',
          label: '业主管理',
          onClick: () => navigate('/admin/owners'),
        },
        {
          key: '/admin/repairers',
          label: '维修人员管理',
          onClick: () => navigate('/admin/repairers'),
        },
      ],
    },
    {
      key: '/admin/repair-categories',
      icon: <SettingOutlined />,
      label: '报修类别管理',
      onClick: () => navigate('/admin/repair-categories'),
    },
    {
      key: 'repair-management',
      icon: <ToolOutlined />,
      label: '维修管理',
      children: [
        {
          key: '/admin/repair-orders',
          label: '房屋维修管理',
          onClick: () => navigate('/admin/repair-orders'),
        },
        {
          key: '/admin/repair-records',
          label: '维修记录管理',
          onClick: () => navigate('/admin/repair-records'),
        },
      ],
    },
    {
      key: '/admin/evaluations',
      icon: <StarOutlined />,
      label: '维修评价管理',
      onClick: () => navigate('/admin/evaluations'),
    },
    {
      key: '/admin/notices',
      icon: <NotificationOutlined />,
      label: '公告管理',
      onClick: () => navigate('/admin/notices'),
    },
    {
      key: '/admin/statistics',
      icon: <BarChartOutlined />,
      label: '数据分析',
      onClick: () => navigate('/admin/statistics'),
    },
    {
      key: '/admin/backup',
      icon: <DatabaseOutlined />,
      label: '数据备份',
      onClick: () => navigate('/admin/backup'),
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => {
        message.info('个人中心功能开发中');
      },
    },
    {
      key: 'change-password',
      icon: <KeyOutlined />,
      label: '修改密码',
      onClick: () => {
        message.info('修改密码功能开发中');
      },
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
    return path;
  };

  const getOpenKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/admin/owners') || path.startsWith('/admin/repairers')) {
      return ['user-management'];
    }
    if (path.startsWith('/admin/repair-orders') || path.startsWith('/admin/repair-records')) {
      return ['repair-management'];
    }
    return [];
  };

  return (
    <Layout className="layout-container">
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        theme="dark"
        width={240}
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
          {collapsed ? '管理' : '管理后台'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: '#666' }}>管理员：{user?.real_name || user?.username}</span>
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

export default AdminLayout;
