import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, message, Spin, Select, Modal, Descriptions } from 'antd';
import { PlusOutlined, EyeOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ownerAPI } from '../../services/api';
import dayjs from 'dayjs';

const { Option } = Select;

const RepairOrders = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [detailModal, setDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await ownerAPI.getRepairOrders(statusFilter || undefined);
      setOrders(res.data?.orders || []);
    } catch (error) {
      message.error('获取维修订单失败');
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

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setDetailModal(true);
  };

  const handleCancelOrder = (order) => {
    Modal.confirm({
      title: '确认取消',
      content: '确定要取消这个报修订单吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await ownerAPI.cancelRepairOrder(order.id);
          message.success('订单已取消');
          fetchOrders();
        } catch (error) {
          message.error('取消订单失败');
        }
      },
    });
  };

  const handleEvaluate = (order) => {
    navigate(`/owner/evaluations/create/${order.id}`);
  };

  const columns = [
    {
      title: '订单编号',
      dataIndex: 'order_no',
      key: 'order_no',
      width: 180,
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
      width: 120,
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
      title: '维修人员',
      dataIndex: ['repairer', 'real_name'],
      key: 'repairer',
      width: 120,
      render: (name) => name || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          {record.status === 'pending' && (
            <Button 
              type="link" 
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => handleCancelOrder(record)}
            >
              取消
            </Button>
          )}
          {record.status === 'completed' && (
            <Button 
              type="link" 
              onClick={() => handleEvaluate(record)}
            >
              评价
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 className="page-title">我的报修单</h2>
      
      <Card className="card-container">
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Select
              placeholder="按状态筛选"
              style={{ width: 150 }}
              allowClear
              value={statusFilter || undefined}
              onChange={setStatusFilter}
            >
              <Option value="pending">待接单</Option>
              <Option value="accepted">已接单</Option>
              <Option value="processing">处理中</Option>
              <Option value="completed">已完成</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/owner/repair-orders/create')}
          >
            发起报修
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1200 }}
          locale={{ emptyText: '暂无报修订单' }}
        />
      </Card>

      <Modal
        title="订单详情"
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModal(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {selectedOrder && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="订单编号">{selectedOrder.order_no}</Descriptions.Item>
            <Descriptions.Item label="状态">{getStatusTag(selectedOrder.status)}</Descriptions.Item>
            <Descriptions.Item label="标题" span={2}>{selectedOrder.title}</Descriptions.Item>
            <Descriptions.Item label="报修类别">{selectedOrder.category?.name || '-'}</Descriptions.Item>
            <Descriptions.Item label="紧急程度">{getUrgencyTag(selectedOrder.urgency)}</Descriptions.Item>
            <Descriptions.Item label="联系人">{selectedOrder.contact_name || '-'}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{selectedOrder.contact_phone || '-'}</Descriptions.Item>
            <Descriptions.Item label="地址" span={2}>{selectedOrder.address || '-'}</Descriptions.Item>
            <Descriptions.Item label="问题描述" span={2}>{selectedOrder.description || '-'}</Descriptions.Item>
            <Descriptions.Item label="维修人员">{selectedOrder.repairer?.real_name || '-'}</Descriptions.Item>
            <Descriptions.Item label="维修金额">{selectedOrder.amount ? `¥${selectedOrder.amount}` : '-'}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{dayjs(selectedOrder.created_at).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
            <Descriptions.Item label="接单时间">{selectedOrder.accept_time ? dayjs(selectedOrder.accept_time).format('YYYY-MM-DD HH:mm') : '-'}</Descriptions.Item>
            <Descriptions.Item label="完成时间">{selectedOrder.complete_time ? dayjs(selectedOrder.complete_time).format('YYYY-MM-DD HH:mm') : '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default RepairOrders;
