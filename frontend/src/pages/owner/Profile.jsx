import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Avatar, Spin, Descriptions } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Profile = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setFetching(true);
    try {
      const res = await authAPI.getCurrentUser();
      form.setFieldsValue({
        real_name: res.data.real_name,
        phone: res.data.phone,
        email: res.data.email,
      });
    } catch (error) {
      message.error('获取个人信息失败');
    } finally {
      setFetching(false);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await authAPI.updateProfile(values);
      message.success('个人信息更新成功');
      // 刷新页面以获取最新信息
      fetchProfile();
    } catch (error) {
      message.error('更新个人信息失败');
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
      <h2 className="page-title">个人中心</h2>
      
      <Card className="card-container">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #f0f0f0' }}>
          <Avatar size={80} icon={<UserOutlined />} style={{ marginRight: 24 }} />
          <div>
            <h3 style={{ marginBottom: 8 }}>{user?.real_name || user?.username}</h3>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="用户名">{user?.username}</Descriptions.Item>
              <Descriptions.Item label="角色">
                {user?.role === 'owner' ? '业主' : user?.role === 'repairer' ? '维修人员' : '管理员'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="real_name"
            label="真实姓名"
            rules={[{ required: true, message: '请输入真实姓名' }]}
          >
            <Input placeholder="请输入真实姓名" size="large" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
            ]}
          >
            <Input placeholder="请输入手机号" size="large" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱格式' },
            ]}
          >
            <Input placeholder="请输入邮箱" size="large" />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button type="primary" size="large" htmlType="submit" loading={loading}>
                保存修改
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Profile;
