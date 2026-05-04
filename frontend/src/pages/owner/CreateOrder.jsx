import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Select, Button, message, Row, Col, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ownerAPI, publicAPI } from '../../services/api';

const { TextArea } = Input;
const { Option } = Select;

const CreateOrder = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [houses, setHouses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setFetching(true);
    try {
      const [housesRes, categoriesRes] = await Promise.all([
        ownerAPI.getHouses(),
        publicAPI.getRepairCategories(),
      ]);
      setHouses(housesRes.data?.houses || []);
      setCategories(categoriesRes.data?.categories || []);
    } catch (error) {
      message.error('获取数据失败');
    } finally {
      setFetching(false);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await ownerAPI.createRepairOrder(values);
      message.success('报修单创建成功');
      navigate('/owner/repair-orders');
    } catch (error) {
      message.error('创建报修单失败');
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
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/owner/repair-orders')}>
          返回列表
        </Button>
      </div>

      <Card title="发起报修" className="card-container">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            urgency: 'normal',
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="house_id"
                label="选择房屋"
                rules={[{ required: true, message: '请选择房屋' }]}
              >
                <Select placeholder="请选择房屋" size="large">
                  {houses.map((house) => (
                    <Option key={house.id} value={house.id}>
                      {house.house_number} {house.building ? `(${house.building})` : ''}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="category_id"
                label="报修类别"
                rules={[{ required: true, message: '请选择报修类别' }]}
              >
                <Select placeholder="请选择报修类别" size="large">
                  {categories.map((category) => (
                    <Option key={category.id} value={category.id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="title"
            label="报修标题"
            rules={[{ required: true, message: '请输入报修标题' }]}
          >
            <Input placeholder="请简要描述报修问题" size="large" />
          </Form.Item>

          <Form.Item
            name="description"
            label="问题描述"
            rules={[{ required: true, message: '请输入问题描述' }]}
          >
            <TextArea
              placeholder="请详细描述房屋的问题情况"
              rows={4}
              size="large"
            />
          </Form.Item>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="contact_name"
                label="联系人"
                rules={[{ required: true, message: '请输入联系人' }]}
              >
                <Input placeholder="请输入联系人姓名" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="contact_phone"
                label="联系电话"
                rules={[
                  { required: true, message: '请输入联系电话' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
                ]}
              >
                <Input placeholder="请输入联系电话" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="维修地址"
          >
            <Input placeholder="请输入详细地址（可选）" size="large" />
          </Form.Item>

          <Form.Item
            name="urgency"
            label="紧急程度"
            rules={[{ required: true, message: '请选择紧急程度' }]}
          >
            <Select placeholder="请选择紧急程度" size="large">
              <Option value="low">低</Option>
              <Option value="normal">正常</Option>
              <Option value="high">紧急</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button size="large" onClick={() => navigate('/owner/repair-orders')}>
                取消
              </Button>
              <Button type="primary" size="large" htmlType="submit" loading={loading}>
                提交报修
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateOrder;
