import React, { useState, useEffect } from 'react';
import { Card, List, Tag, Button, message, Spin, Empty } from 'antd';
import { EyeOutlined, BellOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { repairerAPI } from '../../services/api';
import dayjs from 'dayjs';

const Notices = () => {
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await repairerAPI.getNotices();
      setNotices(res.data?.notices || []);
    } catch (error) {
      message.error('获取公告失败');
    } finally {
      setLoading(false);
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

  return (
    <div>
      <h2 className="page-title">通知公告</h2>
      
      <Card className="card-container">
        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : notices.length === 0 ? (
          <Empty description="暂无公告" />
        ) : (
          <List
            dataSource={notices}
            renderItem={(item) => (
              <List.Item
                className="notice-list-item"
                actions={[
                  <Button 
                    type="link" 
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/repairer/notices/${item.id}`)}
                  >
                    查看详情
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={<BellOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {item.is_top && <Tag color="red">置顶</Tag>}
                      <span style={{ fontWeight: 500 }}>{item.title}</span>
                    </div>
                  }
                  description={
                    <div style={{ color: '#666', fontSize: 13 }}>
                      <div style={{ marginBottom: 4 }}>
                        {item.content?.substring(0, 100)}...
                      </div>
                      <div style={{ display: 'flex', gap: 16 }}>
                        <span>发布时间：{dayjs(item.created_at).format('YYYY-MM-DD HH:mm')}</span>
                        <span>阅读量：{item.view_count}</span>
                        {getTargetTag(item.target)}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default Notices;
