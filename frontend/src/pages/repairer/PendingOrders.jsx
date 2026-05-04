import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, message, Spin, Modal, Descriptions, Popconfirm } from 'antd';
import { EyeOutlined, CheckOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { repairerAPI } from '../../services/api';
import dayjs from 'dayjs';

const { confirm } = Modal;

const PendingOrders = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await repairerAPI.getPendingOrders();
      setOrders(res.data?.orders || []);
    } catch (error) {
      message.error('获取待接订单失败');
    } finally {
      setLoading(false);
    }
  };

  const showDetail = (order) => {
    setCurrentOrder(order);
    setDetailVisible(true);
  };

  const handleAccept = (orderId) => {
    confirm({
      title: '确认接单',
      icon: <ExclamationCircleOutlined />,
      content: '您确定要接受这个维修订单吗？',
      okText: '确认接单',
      okType: 'primary',
      cancelText: '取消',
      onOk: async () => {
        setAccepting(true);
        try {
          await repairerAPI.acceptOrder(orderId);
          message.success('接单成功');
          fetchOrders();
        } catch (error) {
          message.error('接单失败');
        } finally {
          setAccepting(false);
        }
      },
    });
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
      title: '联系电话',
      dataIndex: 'contact_phone',
      key: 'contact_phone',
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
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
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
          <Button 
            type="primary" 
            size="small" 
            icon={<CheckOutlined />}
            onClick={() => handleAccept(record.id)}
            loading={accepting}
          >
            接单
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h2 className="page-title">待接订单</h2>
      
      <Card className="card-container">
        <Table
          columns={columns}
          dataSource={orders}
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
          <Button 
            key="accept" 
            type="primary" 
            onClick={() => {
              setDetailVisible(false);
              handleAccept(currentOrder?.id);
            }}
            loading={accepting}
          >
            接单
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
            <Descriptions.Item label="房屋信息">
              {currentOrder.house?.house_number || '-'}
              {currentOrder.house?.building ? ` (${currentOrder.house.building})` : ''}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {currentOrder.created_at ? dayjs(currentOrder.created_at).format('YYYY-MM-DD HH:mm') : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default PendingOrders;
