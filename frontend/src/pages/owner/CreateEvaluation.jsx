import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Rate, Descriptions, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { ownerAPI } from '../../services/api';

const { TextArea } = Input;

const CreateEvaluation = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [order, setOrder] = useState(null);
  const navigate = useNavigate();
  const { orderId } = useParams();

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    setFetching(true);
    try {
      const res = await ownerAPI.getRepairOrder(orderId);
      setOrder(res.data?.order);
    } catch (error) {
      message.error('获取报修单信息失败');
    } finally {
      setFetching(false);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await ownerAPI.createEvaluation({
        order_id: parseInt(orderId),
        rating: values.rating,
        content: values.content,
      });
      message.success('评价提交成功');
      navigate('/owner/evaluations');
    } catch (error) {
      message.error('提交评价失败');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/owner/evaluations')}>
          返回列表
        </Button>
      </div>

      <Card title="填写评价" className="card-container">
        {order && (
          <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #f0f0f0' }}>
            <h4 style={{ marginBottom: 12 }}>报修单信息</h4>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="报修标题">{order.title}</Descriptions.Item>
              <Descriptions.Item label="报修类别">
                {order.category?.name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="维修人员">
                {order.repairer?.real_name || order.repairer?.username || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="完成时间">
                {order.complete_time || '-'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            rating: 5,
          }}
        >
          <Form.Item
            name="rating"
            label="服务评分"
            rules={[{ required: true, message: '请选择评分' }]}
          >
            <Rate style={{ fontSize: 24 }} />
          </Form.Item>

          <Form.Item
            name="content"
            label="评价内容"
            rules={[{ required: true, message: '请输入评价内容' }]}
          >
            <TextArea
              placeholder="请输入您对本次维修服务的评价..."
              rows={4}
              size="large"
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button size="large" onClick={() => navigate('/owner/evaluations')}>
                取消
              </Button>
              <Button type="primary" size="large" htmlType="submit" loading={loading}>
                提交评价
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateEvaluation;
