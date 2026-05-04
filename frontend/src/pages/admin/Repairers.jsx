import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  message,
  Spin,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  Space,
} from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { adminAPI } from '../../services/api';
import dayjs from 'dayjs';

const { Option } = Select;

const Repairers = () => {
  const [loading, setLoading] = useState(true);
  const [repairers, setRepairers] = useState([]);
  const [detailVisible, setDetailVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchRepairers();
  }, []);

  const fetchRepairers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getRepairerUsers();
      setRepairers(res.data?.users || []);
    } catch (error) {
      message.error('获取维修人员列表失败');
    } finally {
      setLoading(false);
    }
  };

  const showDetail = (repairer) => {
    setEditingItem(repairer);
    setDetailVisible(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setFormVisible(true);
  };

  const handleEdit = (repairer) => {
    setEditingItem(repairer);
    form.setFieldsValue({
      username: repairer.username,
      real_name: repairer.real_name,
      phone: repairer.phone,
      email: repairer.email,
      status: repairer.status,
    });
    setFormVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await adminAPI.deleteUser(id);
      message.success('删除成功');
      fetchRepairers();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingItem) {
        await adminAPI.updateUser(editingItem.id, values);
        message.success('更新成功');
      } else {
        await adminAPI.createUser({ ...values, role: 'repairer' });
        message.success('创建成功');
      }
      setFormVisible(false);
      fetchRepairers();
    } catch (error) {
      message.error(editingItem ? '更新失败' : '创建失败');
    }
  };

  const getStatusTag = (status) => {
    return status === 1 ? (
      <Tag color="green">正常</Tag>
    ) : (
      <Tag color="red">禁用</Tag>
    );
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120,
    },
    {
      title: '真实姓名',
      dataIndex: 'real_name',
      key: 'real_name',
      width: 100,
      render: (text) => text || '-',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
      render: (text) => text || '-',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 180,
      render: (text) => text || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
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
      width: 200,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => showDetail(record)}>
            详情
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除该维修人员吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 className="page-title" style={{ margin: 0 }}>维修人员管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增维修人员
        </Button>
      </div>

      <Card className="card-container">
        <Table
          columns={columns}
          dataSource={repairers}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="维修人员详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {editingItem && (
          <div>
            <p><strong>ID：</strong>{editingItem.id}</p>
            <p><strong>用户名：</strong>{editingItem.username}</p>
            <p><strong>真实姓名：</strong>{editingItem.real_name || '-'}</p>
            <p><strong>手机号：</strong>{editingItem.phone || '-'}</p>
            <p><strong>邮箱：</strong>{editingItem.email || '-'}</p>
            <p><strong>状态：</strong>{editingItem.status === 1 ? '正常' : '禁用'}</p>
            <p><strong>创建时间：</strong>{editingItem.created_at ? dayjs(editingItem.created_at).format('YYYY-MM-DD HH:mm') : '-'}</p>
            <p><strong>更新时间：</strong>{editingItem.updated_at ? dayjs(editingItem.updated_at).format('YYYY-MM-DD HH:mm') : '-'}</p>
          </div>
        )}
      </Modal>

      {/* 表单弹窗 */}
      <Modal
        title={editingItem ? '编辑维修人员' : '新增维修人员'}
        open={formVisible}
        onCancel={() => setFormVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" disabled={!!editingItem} />
          </Form.Item>

          {!editingItem && (
            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' },
              ]}
            >
              <Input.Password placeholder="请输入密码（至少6个字符）" />
            </Form.Item>
          )}

          <Form.Item
            name="real_name"
            label="真实姓名"
          >
            <Input placeholder="请输入真实姓名" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
            ]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { type: 'email', message: '请输入正确的邮箱格式' },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value={1}>正常</Option>
              <Option value={0}>禁用</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setFormVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                确定
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Repairers;
