import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  message,
  Spin,
  Modal,
  Select,
  Space,
  Input,
} from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { adminAPI } from '../../services/api';
import dayjs from 'dayjs';

const { Option } = Select;
const { Search } = Input;

const RepairOrders = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAllRepairOrders(statusFilter);
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
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '报修标题',
      dataIndex: 'title',
      key: 'title',
      width: 180,
    },
    {
      title: '报修类别',
      dataIndex: ['category', 'name'],
      key: 'category',
      width: 100,
      render: (text) => text || '-',
    },
    {
      title: '业主',
      dataIndex: ['owner', 'real_name'],
      key: 'owner',
      width: 100,
      render: (text, record) => text || record.owner?.username || '-',
    },
    {
      title: '维修人员',
      dataIndex: ['repairer', 'real_name'],
      key: 'repairer',
      width: 100,
      render: (text, record) => text || record.repairer?.username || '-',
    },
    {
      title: '联系人',
      dataIndex: 'contact_name',
      key: 'contact_name',
      width: 100,
      render: (text) => text || '-',
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
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (time) => (time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => showDetail(record)}>
          详情
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h2 className="page-title">房屋维修管理</h2>

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
              <Option value="pending">待接单</Option>
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
          scroll={{ x: 1400 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="订单详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {currentOrder && (
          <div>
            <p><strong>订单编号：</strong>{currentOrder.id}</p>
            <p><strong>报修标题：</strong>{currentOrder.title}</p>
            <p><strong>报修类别：</strong>{currentOrder.category?.name || '-'}</p>
            <p><strong>问题描述：</strong>{currentOrder.description || '-'}</p>
            <p><strong>业主：</strong>{currentOrder.owner?.real_name || currentOrder.owner?.username || '-'}</p>
            <p><strong>维修人员：</strong>{currentOrder.repairer?.real_name || currentOrder.repairer?.username || '-'}</p>
            <p><strong>联系人：</strong>{currentOrder.contact_name || '-'}</p>
            <p><strong>联系电话：</strong>{currentOrder.contact_phone || '-'}</p>
            <p><strong>维修地址：</strong>{currentOrder.address || '-'}</p>
            <p><strong>紧急程度：</strong>{currentOrder.urgency === 'high' ? '紧急' : currentOrder.urgency === 'low' ? '低' : '正常'}</p>
            <p><strong>状态：</strong>{getStatusTag(currentOrder.status)}</p>
            <p><strong>房屋编号：</strong>{currentOrder.house?.house_number || '-'}</p>
            <p><strong>创建时间：</strong>{currentOrder.created_at ? dayjs(currentOrder.created_at).format('YYYY-MM-DD HH:mm') : '-'}</p>
            <p><strong>接单时间：</strong>{currentOrder.accept_time ? dayjs(currentOrder.accept_time).format('YYYY-MM-DD HH:mm') : '-'}</p>
            <p><strong>完成时间：</strong>{currentOrder.complete_time ? dayjs(currentOrder.complete_time).format('YYYY-MM-DD HH:mm') : '-'}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RepairOrders;
