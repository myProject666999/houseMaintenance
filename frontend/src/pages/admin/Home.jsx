import React, { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, Button, message, List, Tag, Empty, Spin } from 'antd';
import { 
  UserOutlined, 
  ToolOutlined, 
  FileTextOutlined, 
  StarOutlined,
  BellOutlined,
  DashboardOutlined,
  BarChartOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import dayjs from 'dayjs';

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentNotices, setRecentNotices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashboardRes, ordersRes, noticesRes] = await Promise.all([
        adminAPI.getDashboardStatistics(),
        adminAPI.getAllRepairOrders(),
        adminAPI.getAllNotices(),
      ]);
      
      setStatistics(dashboardRes.data);
      setRecentOrders((ordersRes.data?.orders || []).slice(0, 5));
      setRecentNotices((noticesRes.data?.notices || []).slice(0, 5));
    } catch (error) {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    const statusMap = {
      pending: { text: '待接单', color: 'orange' },
      accepted: { text: '已接单', color: 'blue' },
      processing: { text: '处理中', color: 'cyan' },
      completed: { text: '已完成', color: 'green' },
      cancelled: { text: '已取消', color: 'red' },
    };
    const info = statusMap[status] || { text: status, color: 'default' };
    return <Tag color={info.color}>{info.text}</Tag>;
  };

  const quickActions = [
    { title: '业主管理', count: statistics?.ownerCount || 0, path: '/admin/owners', icon: <UserOutlined />, color: '#1890ff' },
    { title: '维修人员', count: statistics?.repairerCount || 0, path: '/admin/repairers', icon: <ToolOutlined />, color: '#52c41a' },
    { title: '报修订单', count: statistics?.orderCount || 0, path: '/admin/repair-orders', icon: <FileTextOutlined />, color: '#fa8c16' },
    { title: '维修记录', count: statistics?.recordCount || 0, path: '/admin/repair-records', icon: <DashboardOutlined />, color: '#722ed1' },
    { title: '用户评价', count: statistics?.evaluationCount || 0, path: '/admin/evaluations', icon: <StarOutlined />, color: '#eb2f96' },
    { title: '系统公告', count: statistics?.noticeCount || 0, path: '/admin/notices', icon: <BellOutlined />, color: '#13c2c2' },
    { title: '数据统计', count: null, path: '/admin/statistics', icon: <BarChartOutlined />, color: '#faad14' },
    { title: '数据备份', count: null, path: '/admin/backup', icon: <DatabaseOutlined />, color: '#f5222d' },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="page-title">系统首页</h2>
      
      {/* 快捷入口 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {quickActions.map((item, index) => (
          <Col xs={12} sm={8} md={6} key={index}>
            <Card
              className="stat-card"
              hoverable
              onClick={() => navigate(item.path)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Statistic
                    title={item.title}
                    value={item.count}
                    valueStyle={{ color: item.color }}
                  />
                </div>
                <div style={{ fontSize: 32, color: item.color, opacity: 0.5 }}>
                  {item.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {/* 最近订单 */}
        <Col xs={24} lg={12}>
          <Card 
            title="最近报修订单" 
            className="card-container"
            extra={
              <Button type="link" onClick={() => navigate('/admin/repair-orders')}>
                查看全部
              </Button>
            }
          >
            {recentOrders.length === 0 ? (
              <Empty description="暂无订单" />
            ) : (
              <List
                dataSource={recentOrders}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<FileTextOutlined style={{ fontSize: 20, color: '#1890ff' }} />}
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {item.title}
                          {getStatusTag(item.status)}
                        </div>
                      }
                      description={
                        <div style={{ color: '#666', fontSize: 12 }}>
                          <span>业主：{item.owner?.real_name || item.owner?.username || '-'}</span>
                          <span style={{ marginLeft: 16 }}>
                            创建时间：{dayjs(item.created_at).format('MM-DD HH:mm')}
                          </span>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        {/* 最近公告 */}
        <Col xs={24} lg={12}>
          <Card 
            title="最近系统公告" 
            className="card-container"
            extra={
              <Button type="link" onClick={() => navigate('/admin/notices')}>
                查看全部
              </Button>
            }
          >
            {recentNotices.length === 0 ? (
              <Empty description="暂无公告" />
            ) : (
              <List
                dataSource={recentNotices}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<BellOutlined style={{ fontSize: 20, color: '#13c2c2' }} />}
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {item.is_top && <Tag color="red">置顶</Tag>}
                          <span>{item.title}</span>
                        </div>
                      }
                      description={
                        <div style={{ color: '#666', fontSize: 12 }}>
                          <span>发布时间：{dayjs(item.created_at).format('MM-DD HH:mm')}</span>
                          <span style={{ marginLeft: 16 }}>阅读量：{item.view_count}</span>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
