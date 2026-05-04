import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, message, Spin, Table, Tag, Button } from 'antd';
import { 
  HomeOutlined, 
  ToolOutlined, 
  FileTextOutlined, 
  NotificationOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ownerAPI } from '../../services/api';
import dayjs from 'dayjs';

const OwnerHome = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    houses: 0,
    pendingOrders: 0,
    completedOrders: 0,
    notices: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [housesRes, ordersRes, noticesRes] = await Promise.all([
        ownerAPI.getHouses(),
        ownerAPI.getRepairOrders(),
        ownerAPI.getNotices(),
      ]);

      const orders = ordersRes.data?.orders || [];
      const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'accepted' || o.status === 'processing').length;
      const completedOrders = orders.filter(o => o.status === 'completed').length;

      setStats({
        houses: housesRes.data?.houses?.length || 0,
        pendingOrders,
        completedOrders,
        notices: noticesRes.data?.notices?.length || 0,
      });

      setRecentOrders(orders.slice(0, 5));
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
      processing: { text: '处理中', color: 'processing' },
      completed: { text: '已完成', color: 'success' },
      cancelled: { text: '已取消', color: 'default' },
    };
    const info = statusMap[status] || { text: status, color: 'default' };
    return <Tag color={info.color}>{info.text}</Tag>;
  };

  const getUrgencyTag = (urgency) => {
    const urgencyMap = {
      high: { text: '紧急', color: 'red' },
      normal: { text: '正常', color: 'blue' },
      low: { text: '低', color: 'green' },
    };
    const info = urgencyMap[urgency] || { text: urgency, color: 'default' };
    return <Tag color={info.color}>{info.text}</Tag>;
  };

  const columns = [
    {
      title: '订单编号',
      dataIndex: 'order_no',
      key: 'order_no',
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '报修类别',
      dataIndex: ['category', 'name'],
      key: 'category',
    },
    {
      title: '紧急程度',
      dataIndex: 'urgency',
      key: 'urgency',
      render: (urgency) => getUrgencyTag(urgency),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
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
      <h2 className="page-title">业主首页</h2>
      
      <Row gutter={[16, 16]} className="dashboard-grid">
        <Col xs={24} sm={12} md={6}>
          <Card className="dashboard-stat">
            <HomeOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 12 }} />
            <div style={{ fontSize: 32, fontWeight: 700, color: '#1890ff' }}>{stats.houses}</div>
            <div style={{ fontSize: 14, color: '#666', marginTop: 8 }}>我的房屋</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="dashboard-stat">
            <ToolOutlined style={{ fontSize: 48, color: '#fa8c16', marginBottom: 12 }} />
            <div style={{ fontSize: 32, fontWeight: 700, color: '#fa8c16' }}>{stats.pendingOrders}</div>
            <div style={{ fontSize: 14, color: '#666', marginTop: 8 }}>待处理订单</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="dashboard-stat">
            <FileTextOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 12 }} />
            <div style={{ fontSize: 32, fontWeight: 700, color: '#52c41a' }}>{stats.completedOrders}</div>
            <div style={{ fontSize: 14, color: '#666', marginTop: 8 }}>已完成订单</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="dashboard-stat">
            <NotificationOutlined style={{ fontSize: 48, color: '#722ed1', marginBottom: 12 }} />
            <div style={{ fontSize: 32, fontWeight: 700, color: '#722ed1' }}>{stats.notices}</div>
            <div style={{ fontSize: 14, color: '#666', marginTop: 8 }}>通知公告</div>
          </Card>
        </Col>
      </Row>

      <Card 
        title="最近报修订单" 
        className="card-container"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/owner/repair-orders/create')}
          >
            发起报修
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={recentOrders}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: '暂无报修订单' }}
        />
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card 
            title="快捷操作" 
            className="card-container"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Button 
                type="primary" 
                size="large" 
                icon={<PlusOutlined />}
                onClick={() => navigate('/owner/repair-orders/create')}
                block
              >
                发起报修
              </Button>
              <Button 
                size="large" 
                icon={<ToolOutlined />}
                onClick={() => navigate('/owner/repair-orders')}
                block
              >
                查看我的报修单
              </Button>
              <Button 
                size="large" 
                icon={<FileTextOutlined />}
                onClick={() => navigate('/owner/repair-records')}
                block
              >
                查看维修记录
              </Button>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card 
            title="系统提示" 
            className="card-container"
          >
            <div style={{ lineHeight: 2 }}>
              <p>• 您可以通过"发起报修"提交房屋维修申请</p>
              <p>• 维修人员接单后会尽快与您联系</p>
              <p>• 维修完成后，请及时对维修服务进行评价</p>
              <p>• 如有疑问，请查看通知公告或联系管理员</p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OwnerHome;
