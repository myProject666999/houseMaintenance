import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Dropdown, Avatar, message } from 'antd';
import { 
  HomeOutlined, 
  NotificationOutlined, 
  ToolOutlined, 
  FileTextOutlined, 
  StarOutlined,
  UserOutlined,
  LogoutOutlined,
  KeyOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = Layout;

const RepairerLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      key: '/repairer/home',
      icon: <HomeOutlined />,
      label: '首页',
      onClick: () => navigate('/repairer/home'),
    },
    {
      key: '/repairer/pending-orders',
      icon: <ClockCircleOutlined />,
      label: '待接订单',
      onClick: () => navigate('/repairer/pending-orders'),
    },
    {
      key: '/repairer/my-orders',
      icon: <ToolOutlined />,
      label: '我的订单',
      onClick: () => navigate('/repairer/my-orders'),
    },
    {
      key: '/repairer/repair-records',
      icon: <FileTextOutlined />,
      label: '维修记录',
      onClick: () => navigate('/repairer/repair-records'),
    },
    {
      key: '/repairer/evaluations',
      icon: <StarOutlined />,
      label: '我的评价',
      onClick: () => navigate('/repairer/evaluations'),
    },
    {
      key: '/repairer/notices',
      icon: <NotificationOutlined />,
      label: '通知公告',
      onClick: () => navigate('/repairer/notices'),
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
    if (path.startsWith('/repairer/notices')) return '/repairer/notices';
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
          {collapsed ? '维修' : '维修人员端'}
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

export default RepairerLayout;
