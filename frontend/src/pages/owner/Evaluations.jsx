import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, message, Spin, Rate, Modal, Descriptions } from 'antd';
import { EyeOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ownerAPI } from '../../services/api';
import dayjs from 'dayjs';

const Evaluations = () => {
  const [loading, setLoading] = useState(true);
  const [evaluations, setEvaluations] = useState([]);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    setLoading(true);
    try {
      const res = await ownerAPI.getEvaluations();
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

  const goToCreateEvaluation = (orderId) => {
    navigate(`/owner/evaluations/create/${orderId}`);
  };

  const columns = [
    {
      title: '评价编号',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '报修标题',
      dataIndex: ['order', 'title'],
      key: 'order_title',
      width: 200,
      render: (text) => text || '-',
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
      width: 150,
      render: (rating) => <Rate disabled value={rating} />,
    },
    {
      title: '评价时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (time) => (time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => showDetail(record)}>
          详情
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h2 className="page-title">我的评价</h2>
      
      <Card className="card-container">
        <Table
          columns={columns}
          dataSource={evaluations}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条评价`,
          }}
        />
      </Card>

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
          <Descriptions column={1} bordered>
            <Descriptions.Item label="评价编号">{currentEvaluation.id}</Descriptions.Item>
            <Descriptions.Item label="报修标题">
              {currentEvaluation.order?.title || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="维修人员">
              {currentEvaluation.repairer?.real_name || currentEvaluation.repairer?.username || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="评分">
              <Rate disabled value={currentEvaluation.rating} />
            </Descriptions.Item>
            <Descriptions.Item label="评价内容">
              {currentEvaluation.content || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="评价时间">
              {currentEvaluation.created_at 
                ? dayjs(currentEvaluation.created_at).format('YYYY-MM-DD HH:mm') 
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="管理员回复">
              {currentEvaluation.reply || '暂无回复'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default Evaluations;
