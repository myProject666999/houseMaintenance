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
  Rate,
  Tag,
} from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { adminAPI } from '../../services/api';
import dayjs from 'dayjs';

const { TextArea } = Input;

const Evaluations = () => {
  const [loading, setLoading] = useState(true);
  const [evaluations, setEvaluations] = useState([]);
  const [detailVisible, setDetailVisible] = useState(false);
  const [replyVisible, setReplyVisible] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAllEvaluations();
      setEvaluations(res.data?.evaluations || []);
    } catch (error) {
      message.error('获取评价列表失败');
    } finally {
      setLoading(false);
    }
  };

  const showDetail = (evaluation) => {
    setCurrentEvaluation(evaluation);
    setDetailVisible(true);
  };

  const showReply = (evaluation) => {
    setCurrentEvaluation(evaluation);
    form.setFieldsValue({
      reply: evaluation.reply,
    });
    setReplyVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await adminAPI.deleteEvaluation(id);
      message.success('删除成功');
      fetchEvaluations();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleReplySubmit = async (values) => {
    try {
      await adminAPI.replyEvaluation(currentEvaluation.id, values.reply);
      message.success('回复成功');
      setReplyVisible(false);
      fetchEvaluations();
    } catch (error) {
      message.error('回复失败');
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
      title: '报修标题',
      dataIndex: ['order', 'title'],
      key: 'order_title',
      width: 180,
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
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      width: 120,
      render: (rating) => <Rate disabled value={rating} />,
    },
    {
      title: '评价内容',
      dataIndex: 'content',
      key: 'content',
      width: 200,
      render: (text) => text || '-',
      ellipsis: true,
    },
    {
      title: '是否回复',
      key: 'hasReply',
      width: 100,
      render: (_, record) => (
        record.reply ? (
          <Tag color="green">已回复</Tag>
        ) : (
          <Tag color="orange">未回复</Tag>
        )
      ),
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
          <Button type="link" icon={<EditOutlined />} onClick={() => showReply(record)}>
            回复
          </Button>
          <Popconfirm
            title="确定删除该评价吗？"
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
      <h2 className="page-title">维修评价管理</h2>

      <Card className="card-container">
        <Table
          columns={columns}
          dataSource={evaluations}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="评价详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {currentEvaluation && (
          <div>
            <p><strong>评价编号：</strong>{currentEvaluation.id}</p>
            <p><strong>报修标题：</strong>{currentEvaluation.order?.title || '-'}</p>
            <p><strong>业主：</strong>{currentEvaluation.owner?.real_name || currentEvaluation.owner?.username || '-'}</p>
            <p><strong>维修人员：</strong>{currentEvaluation.repairer?.real_name || currentEvaluation.repairer?.username || '-'}</p>
            <p><strong>评分：</strong><Rate disabled value={currentEvaluation.rating} /></p>
            <p><strong>评价内容：</strong>{currentEvaluation.content || '-'}</p>
            <p><strong>管理员回复：</strong>{currentEvaluation.reply || '暂无回复'}</p>
            <p><strong>创建时间：</strong>{currentEvaluation.created_at ? dayjs(currentEvaluation.created_at).format('YYYY-MM-DD HH:mm') : '-'}</p>
          </div>
        )}
      </Modal>

      {/* 回复弹窗 */}
      <Modal
        title="回复评价"
        open={replyVisible}
        onCancel={() => setReplyVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleReplySubmit}
        >
          <Form.Item
            name="reply"
            label="回复内容"
            rules={[{ required: true, message: '请输入回复内容' }]}
          >
            <TextArea
              placeholder="请输入回复内容"
              rows={4}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setReplyVisible(false)}>取消</Button>
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

export default Evaluations;
