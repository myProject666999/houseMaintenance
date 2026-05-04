import React, { useState } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { KeyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const ChangePassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await authAPI.changePassword(values.old_password, values.new_password);
      message.success('密码修改成功，请重新登录');
      // 清除登录状态并跳转到登录页
      logout();
    } catch (error) {
      message.error('密码修改失败，请检查原密码是否正确');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="page-title">修改密码</h2>
      
      <Card className="card-container" style={{ maxWidth: 500 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="old_password"
            label="原密码"
            rules={[
              { required: true, message: '请输入原密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
          >
            <Input.Password
              prefix={<KeyOutlined />}
              placeholder="请输入原密码"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="new_password"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6个字符' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('old_password') !== value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('新密码不能与原密码相同'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<KeyOutlined />}
              placeholder="请输入新密码（至少6个字符）"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirm_password"
            label="确认新密码"
            dependencies={['new_password']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<KeyOutlined />}
              placeholder="请再次输入新密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button size="large" onClick={() => navigate('/owner/profile')}>
                取消
              </Button>
              <Button type="primary" size="large" htmlType="submit" loading={loading}>
                确认修改
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>

      <Card className="card-container" style={{ maxWidth: 500, marginTop: 24 }}>
        <h4 style={{ marginBottom: 12 }}>密码安全提示</h4>
        <ul style={{ color: '#666', lineHeight: 2, paddingLeft: 20 }}>
          <li>密码长度至少为6个字符</li>
          <li>建议使用字母、数字和特殊字符的组合</li>
          <li>不要使用与其他网站相同的密码</li>
          <li>定期更换密码以保证账户安全</li>
        </ul>
      </Card>
    </div>
  );
};

export default ChangePassword;
