import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, message, Spin, Modal, Descriptions } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { ownerAPI } from '../../services/api';
import dayjs from 'dayjs';

const RepairRecords = () => {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await ownerAPI.getRepairRecords();
      setRecords(res.data?.records || []);
    } catch (error) {
      message.error('获取维修记录失败');
    } finally {
      setLoading(false);
    }
  };

  const showDetail = (record) => {
    setCurrentRecord(record);
    setDetailVisible(true);
  };

  const columns = [
    {
      title: '记录编号',
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
      title: '维修时间',
      dataIndex: 'repair_time',
      key: 'repair_time',
      width: 180,
      render: (time) => (time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '维修时长',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (duration) => (duration ? `${duration}分钟` : '-'),
    },
    {
      title: '维修费用',
      dataIndex: 'cost',
      key: 'cost',
      width: 100,
      render: (cost) => (cost !== null && cost !== undefined ? `¥${cost}` : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => showDetail(record)}>
          详情
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h2 className="page-title">维修记录</h2>
      
      <Card className="card-container">
        <Table
          columns={columns}
          dataSource={records}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title="维修记录详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {currentRecord && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="记录编号">{currentRecord.id}</Descriptions.Item>
            <Descriptions.Item label="报修标题">
              {currentRecord.order?.title || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="维修人员">
              {currentRecord.repairer?.real_name || currentRecord.repairer?.username || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="维修时间">
              {currentRecord.repair_time ? dayjs(currentRecord.repair_time).format('YYYY-MM-DD HH:mm') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="维修时长">
              {currentRecord.duration ? `${currentRecord.duration}分钟` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="维修费用">
              {currentRecord.cost !== null && currentRecord.cost !== undefined 
                ? `¥${currentRecord.cost}` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="维修内容">
              {currentRecord.content || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="维修备注">
              {currentRecord.notes || '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default RepairRecords;
