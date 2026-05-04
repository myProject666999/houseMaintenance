import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  message,
  Spin,
  Modal,
  Form,
  Input,
  Popconfirm,
  Space,
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { adminAPI, publicAPI } from '../../services/api';
import dayjs from 'dayjs';

const RepairCategories = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await publicAPI.getRepairCategories();
      setCategories(res.data?.categories || []);
    } catch (error) {
      message.error('获取报修类别列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setFormVisible(true);
  };

  const handleEdit = (category) => {
    setEditingItem(category);
    form.setFieldsValue({
      name: category.name,
      description: category.description,
    });
    setFormVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await adminAPI.deleteRepairCategory(id);
      message.success('删除成功');
      fetchCategories();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingItem) {
        await adminAPI.updateRepairCategory(editingItem.id, values);
        message.success('更新成功');
      } else {
        await adminAPI.createRepairCategory(values);
        message.success('创建成功');
      }
      setFormVisible(false);
      fetchCategories();
    } catch (error) {
      message.error(editingItem ? '更新失败' : '创建失败');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '类别名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (text) => text || '-',
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
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除该类别吗？"
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
        <h2 className="page-title" style={{ margin: 0 }}>报修类别管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增类别
        </Button>
      </div>

      <Card className="card-container">
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 表单弹窗 */}
      <Modal
        title={editingItem ? '编辑报修类别' : '新增报修类别'}
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
            name="name"
            label="类别名称"
            rules={[{ required: true, message: '请输入类别名称' }]}
          >
            <Input placeholder="请输入类别名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea
              placeholder="请输入类别描述（可选）"
              rows={4}
            />
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

export default RepairCategories;
