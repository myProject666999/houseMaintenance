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
  Select,
  Switch,
  Tag,
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { adminAPI, publicAPI } from '../../services/api';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

const Notices = () => {
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState([]);
  const [detailVisible, setDetailVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [currentNotice, setCurrentNotice] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await publicAPI.getNotices();
      setNotices(res.data?.notices || []);
    } catch (error) {
      message.error('获取公告列表失败');
    } finally {
      setLoading(false);
    }
  };

  const showDetail = (notice) => {
    setCurrentNotice(notice);
    setDetailVisible(true);
  };

  const handleAdd = () => {
    setCurrentNotice(null);
    form.resetFields();
    setFormVisible(true);
  };

  const handleEdit = (notice) => {
    setCurrentNotice(notice);
    form.setFieldsValue({
      title: notice.title,
      content: notice.content,
      target: notice.target,
      is_top: notice.is_top,
    });
    setFormVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await adminAPI.deleteNotice(id);
      message.success('删除成功');
      fetchNotices();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (currentNotice) {
        await adminAPI.updateNotice(currentNotice.id, values);
        message.success('更新成功');
      } else {
        await adminAPI.createNotice(values);
        message.success('创建成功');
      }
      setFormVisible(false);
      fetchNotices();
    } catch (error) {
      message.error(currentNotice ? '更新失败' : '创建失败');
    }
  };

  const getTargetTag = (target) => {
    const targetMap = {
      all: { text: '全部', color: 'blue' },
      owner: { text: '业主', color: 'green' },
      repairer: { text: '维修人员', color: 'orange' },
    };
    const info = targetMap[target] || { text: target, color: 'default' };
    return <Tag color={info.color}>{info.text}</Tag>;
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {record.is_top && <Tag color="red">置顶</Tag>}
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      render: (text) => (
        <span style={{ color: '#666' }}>
          {text?.substring(0, 50)}...
        </span>
      ),
    },
    {
      title: '发布对象',
      dataIndex: 'target',
      key: 'target',
      width: 120,
      render: (target) => getTargetTag(target),
    },
    {
      title: '阅读量',
      dataIndex: 'view_count',
      key: 'view_count',
      width: 100,
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
            title="确定删除该公告吗？"
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
        <h2 className="page-title" style={{ margin: 0 }}>公告管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增公告
        </Button>
      </div>

      <Card className="card-container">
        <Table
          columns={columns}
          dataSource={notices}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="公告详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {currentNotice && (
          <div>
            <h3 style={{ marginBottom: 16 }}>{currentNotice.title}</h3>
            <div style={{ marginBottom: 16, color: '#666', fontSize: 13 }}>
              <span>发布对象：{getTargetTag(currentNotice.target)}</span>
              <span style={{ marginLeft: 16 }}>
                {currentNotice.is_top && <Tag color="red">置顶</Tag>}
              </span>
              <span style={{ marginLeft: 16 }}>阅读量：{currentNotice.view_count}</span>
              <span style={{ marginLeft: 16 }}>
                创建时间：{currentNotice.created_at ? dayjs(currentNotice.created_at).format('YYYY-MM-DD HH:mm') : '-'}
              </span>
            </div>
            <div style={{ lineHeight: 1.8 }}>
              {currentNotice.content?.split('\n').map((p, i) => (
                <p key={i} style={{ marginBottom: 12 }}>{p}</p>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* 表单弹窗 */}
      <Modal
        title={currentNotice ? '编辑公告' : '新增公告'}
        open={formVisible}
        onCancel={() => setFormVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            target: 'all',
            is_top: false,
          }}
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入公告标题" />
          </Form.Item>

          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <TextArea
              placeholder="请输入公告内容"
              rows={8}
            />
          </Form.Item>

          <Form.Item
            name="target"
            label="发布对象"
            rules={[{ required: true, message: '请选择发布对象' }]}
          >
            <Select placeholder="请选择发布对象">
              <Option value="all">全部</Option>
              <Option value="owner">业主</Option>
              <Option value="repairer">维修人员</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="is_top"
            label="是否置顶"
            valuePropName="checked"
          >
            <Switch checkedChildren="是" unCheckedChildren="否" />
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

export default Notices;
