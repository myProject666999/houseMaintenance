import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, message, Spin, Modal, Descriptions, Select, Space, Input } from 'antd';
import { EyeOutlined, CheckCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { repairerAPI } from '../../services/api';
import dayjs from 'dayjs';

const { Option } = Select;
const { Search } = Input;

const MyOrders = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchText, setSearchText] = useState('');
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const res = await repairerAPI.getMyOrders(params);
      setOrders(res.data?.orders || []);
    } catch (error) {
      message.error('获取订单列表失败');
    } finally {
      setLoading(false);
    }
  };

  const showDetail = (order) => {
    setCurrentOrder(order);
    setDetailVisible(true);
  };

  const handleComplete = async (orderId) => {
    try {
      await repairerAPI.completeOrder(orderId);
      message.success('订单已标记为完成');
      fetchOrders();
    } catch (error) {
      message.error('操作失败');
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

  const getUrgencyTag = (urgency) => {
    const urgencyMap = {
      low: { text: '低', color: 'default' },
      normal: { text: '正常', color: 'blue' },
      high: { text: '紧急', color: 'red' },
    };
    const info = urgencyMap[urgency] || { text: urgency, color: 'default' };
    return <Tag color={info.color}>{info.text}</Tag>;
  };

  const filteredOrders = orders.filter(order => {
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      return (
        order.title?.toLowerCase().includes(searchLower) ||
        order.contact_name?.toLowerCase().includes(searchLower) ||
        order.id.toString().includes(searchText)
      );
    }
    return true;
  });

  const columns = [
    {
      title: '订单编号',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '报修标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: '报修类别',
      dataIndex: ['category', 'name'],
      key: 'category',
      width: 120,
      render: (text) => text || '-',
    },
    {
      title: '联系人',
      dataIndex: 'contact_name',
      key: 'contact_name',
      width: 100,
    },
    {
      title: '紧急程度',
      dataIndex: 'urgency',
      key: 'urgency',
      width: 100,
      render: (urgency) => getUrgencyTag(urgency),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status),
    },
    {
      title: '接单时间',
      dataIndex: 'accept_time',
      key: 'accept_time',
      width: 180,
      render: (time) => (time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="link" icon={<EyeOutlined />} onClick={() => showDetail(record)}>
            详情
          </Button>
          {(record.status === 'accepted' || record.status === 'processing') && (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleComplete(record.id)}
            >
              完成
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <h2 className="page-title">我的订单</h2>
      
      <Card className="card-container">
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="全部状态"
              allowClear
              style={{ width: 150 }}
            >
              <Option value="accepted">已接单</Option>
              <Option value="processing">处理中</Option>
              <Option value="completed">已完成</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
          </Space>
          <Search
            placeholder="搜索订单标题/联系人"
            onSearch={(value) => setSearchText(value)}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            enterButton
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条订单`,
          }}
        />
      </Card>

      <Modal
        title="订单详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {currentOrder && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="订单编号">{currentOrder.id}</Descriptions.Item>
            <Descriptions.Item label="报修标题">{currentOrder.title}</Descriptions.Item>
            <Descriptions.Item label="报修类别">
              {currentOrder.category?.name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="问题描述">{currentOrder.description || '-'}</Descriptions.Item>
            <Descriptions.Item label="联系人">{currentOrder.contact_name || '-'}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{currentOrder.contact_phone || '-'}</Descriptions.Item>
            <Descriptions.Item label="维修地址">{currentOrder.address || '-'}</Descriptions.Item>
            <Descriptions.Item label="紧急程度">{getUrgencyTag(currentOrder.urgency)}</Descriptions.Item>
            <Descriptions.Item label="状态">{getStatusTag(currentOrder.status)}</Descriptions.Item>
            <Descriptions.Item label="接单时间">
              {currentOrder.accept_time ? dayjs(currentOrder.accept_time).format('YYYY-MM-DD HH:mm') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="完成时间">
              {currentOrder.complete_time ? dayjs(currentOrder.complete_time).format('YYYY-MM-DD HH:mm') : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default MyOrders;
