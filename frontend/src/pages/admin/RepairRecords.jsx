import React, { useState, useEffect } from 'react';
import { Card, Table, Button, message, Spin, Modal, Tag } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { adminAPI } from '../../services/api';
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
      const res = await adminAPI.getAllRepairRecords();
      setRecords(res.data?.records || []);
    } catch (error) {
      message.error('获取维修记录列表失败');
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
      dataIndex: ['order', 'owner', 'real_name'],
      key: 'owner',
      width: 100,
      render: (text, record) => text || record.order?.owner?.username || '-',
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
      width: 160,
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
      <h2 className="page-title">维修记录管理</h2>

      <Card className="card-container">
        <Table
          columns={columns}
          dataSource={records}
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
          <div>
            <p><strong>记录编号：</strong>{currentRecord.id}</p>
            <p><strong>报修标题：</strong>{currentRecord.order?.title || '-'}</p>
            <p><strong>业主：</strong>{currentRecord.order?.owner?.real_name || currentRecord.order?.owner?.username || '-'}</p>
            <p><strong>维修人员：</strong>{currentRecord.repairer?.real_name || currentRecord.repairer?.username || '-'}</p>
            <p><strong>维修时间：</strong>{currentRecord.repair_time ? dayjs(currentRecord.repair_time).format('YYYY-MM-DD HH:mm') : '-'}</p>
            <p><strong>维修时长：</strong>{currentRecord.duration ? `${currentRecord.duration}分钟` : '-'}</p>
            <p><strong>维修费用：</strong>{currentRecord.cost !== null && currentRecord.cost !== undefined ? `¥${currentRecord.cost}` : '-'}</p>
            <p><strong>维修内容：</strong>{currentRecord.content || '-'}</p>
            <p><strong>维修备注：</strong>{currentRecord.notes || '-'}</p>
            <p><strong>创建时间：</strong>{currentRecord.created_at ? dayjs(currentRecord.created_at).format('YYYY-MM-DD HH:mm') : '-'}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RepairRecords;
