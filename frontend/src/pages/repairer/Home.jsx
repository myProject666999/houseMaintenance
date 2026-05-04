import React, { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, Button, message, List, Tag, Empty } from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  StarOutlined, 
  ToolOutlined,
  BellOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { repairerAPI } from '../../services/api';
import dayjs from 'dayjs';

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingRes, myRes] = await Promise.all([
        repairerAPI.getPendingOrders(),
        repairerAPI.getMyOrders(),
      ]);
      
      const pendingOrdersList = pendingRes.data?.orders || [];
      const myOrdersList = myRes.data?.orders || [];
      
      setPendingOrders(pendingOrdersList);
      setRecentOrders(myOrdersList.slice(0, 5));
      
      // 计算统计数据
      const pendingCount = pendingOrdersList.length;
      const completedCount = myOrdersList.filter(o => o.status === 'completed').length;
      const totalCount = myOrdersList.length;
      
      setStatistics({
        pendingCount,
        completedCount,
        totalCount,
        avgRating: 4.8, // 可以从后端获取
      });
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
    { title: '待接订单', count: statistics?.pendingCount || 0, path: '/repairer/pending-orders', icon: <ClockCircleOutlined />, color: '#fa8c16' },
    { title: '我的订单', count: statistics?.totalCount || 0, path: '/repairer/my-orders', icon: <FileTextOutlined />, color: '#1890ff' },
    { title: '已完成', count: statistics?.completedCount || 0, path: '/repairer/my-orders?status=completed', icon: <CheckCircleOutlined />, color: '#52c41a' },
    { title: '我的评价', count: 0, path: '/repairer/evaluations', icon: <StarOutlined />, color: '#eb2f96' },
  ];

  return (
    <div>
      <h2 className="page-title">工作台</h2>
      
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {quickActions.map((item, index) => (
          <Col xs={12} sm={12} md={6} key={index}>
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
                <div style={{ fontSize: 36, color: item.color, opacity: 0.5 }}>
                  {item.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {/* 待接订单 */}
        <Col xs={24} lg={12}>
          <Card 
            title="待接订单" 
            className="card-container"
            extra={
              <Button type="link" onClick={() => navigate('/repairer/pending-orders')}>
                查看全部
              </Button>
            }
          >
            {pendingOrders.length === 0 ? (
              <Empty description="暂无可接订单" />
            ) : (
              <List
                dataSource={pendingOrders.slice(0, 5)}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button 
                        type="primary" 
                        size="small"
                        onClick={() => navigate('/repairer/pending-orders')}
                      >
                        接单
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<ToolOutlined style={{ fontSize: 20, color: '#1890ff' }} />}
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {item.title}
                          {getStatusTag(item.status)}
                        </div>
                      }
                      description={
                        <div style={{ color: '#666', fontSize: 12 }}>
                          <span>联系人：{item.contact_name}</span>
                          <span style={{ marginLeft: 16 }}>
                            时间：{dayjs(item.created_at).format('MM-DD HH:mm')}
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

        {/* 最近订单 */}
        <Col xs={24} lg={12}>
          <Card 
            title="最近订单" 
            className="card-container"
            extra={
              <Button type="link" onClick={() => navigate('/repairer/my-orders')}>
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
                      avatar={<ToolOutlined style={{ fontSize: 20, color: '#52c41a' }} />}
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {item.title}
                          {getStatusTag(item.status)}
                        </div>
                      }
                      description={
                        <div style={{ color: '#666', fontSize: 12 }}>
                          <span>房屋：{item.house?.house_number || '-'}</span>
                          <span style={{ marginLeft: 16 }}>
                            时间：{dayjs(item.created_at).format('MM-DD HH:mm')}
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
      </Row>
    </div>
  );
};

export default Home;
