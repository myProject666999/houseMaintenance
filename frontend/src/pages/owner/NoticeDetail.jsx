import React, { useState, useEffect } from 'react';
import { Card, Button, message, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { ownerAPI } from '../../services/api';
import dayjs from 'dayjs';

const NoticeDetail = () => {
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchNotice();
  }, [id]);

  const fetchNotice = async () => {
    setLoading(true);
    try {
      const res = await ownerAPI.getNotice(id);
      setNotice(res.data?.notice);
    } catch (error) {
      message.error('获取公告详情失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  if (!notice) {
    return (
      <Card>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/owner/notices')}>
          返回列表
        </Button>
        <div style={{ marginTop: 24, textAlign: 'center', color: '#666' }}>
          公告不存在
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/owner/notices')}>
          返回列表
        </Button>
      </div>

      <Card>
        <div className="notice-detail">
          <h2 className="notice-title">{notice.title}</h2>
          <div className="notice-meta">
            <span>发布时间：{dayjs(notice.created_at).format('YYYY-MM-DD HH:mm')}</span>
            <span style={{ marginLeft: 24 }}>阅读量：{notice.view_count}</span>
            {notice.author && (
              <span style={{ marginLeft: 24 }}>发布者：{notice.author.real_name || notice.author.username}</span>
            )}
          </div>
          <div className="notice-content">
            {notice.content?.split('\n').map((paragraph, index) => (
              <p key={index} style={{ marginBottom: 12 }}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NoticeDetail;
