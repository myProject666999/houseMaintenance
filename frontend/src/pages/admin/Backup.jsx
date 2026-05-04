import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  message,
  Spin,
  Modal,
  Popconfirm,
  Space,
  Descriptions,
  Tag,
  Empty,
} from 'antd';
import { CloudUploadOutlined, DeleteOutlined, DownloadOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { adminAPI } from '../../services/api';
import dayjs from 'dayjs';

const Backup = () => {
  const [loading, setLoading] = useState(true);
  const [backups, setBackups] = useState([]);
  const [creating, setCreating] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentBackup, setCurrentBackup] = useState(null);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getBackups();
      setBackups(res.data?.backups || []);
    } catch (error) {
      message.error('获取备份列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      const res = await adminAPI.createBackup();
      message.success('备份创建成功');
      fetchBackups();
    } catch (error) {
      message.error('备份创建失败');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (name) => {
    try {
      await adminAPI.deleteBackup(name);
      message.success('删除成功');
      fetchBackups();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const showDetail = (backup) => {
    setCurrentBackup(backup);
    setDetailVisible(true);
  };

  const getStatusTag = (status) => {
    return status === 'success' ? (
      <Tag color="green">成功</Tag>
    ) : (
      <Tag color="red">失败</Tag>
    );
  };

  const columns = [
    {
      title: '备份名称',
      dataIndex: 'name',
      key: 'name',
      width: 250,
    },
    {
      title: '文件大小',
      dataIndex: 'size',
      key: 'size',
      width: 120,
      render: (size) => {
        if (size === null || size === undefined) return '-';
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
        if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
        return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (time) => (time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'),
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
          <Button type="link" icon={<DownloadOutlined />}>
            下载
          </Button>
          <Popconfirm
            title="确定删除该备份吗？"
            onConfirm={() => handleDelete(record.name)}
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 className="page-title" style={{ margin: 0 }}>数据备份</h2>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchBackups}>
            刷新
          </Button>
          <Button
            type="primary"
            icon={<CloudUploadOutlined />}
            onClick={handleCreateBackup}
            loading={creating}
          >
            创建备份
          </Button>
        </Space>
      </div>

      {/* 备份说明 */}
      <Card className="card-container" style={{ marginBottom: 24 }}>
        <h4 style={{ marginBottom: 12 }}>数据备份说明</h4>
        <ul style={{ color: '#666', lineHeight: 2, paddingLeft: 20 }}>
          <li>系统备份功能可以帮助您备份所有重要数据，包括用户信息、报修订单、维修记录等</li>
          <li>建议定期进行数据备份，以防止数据丢失</li>
          <li>备份文件将保存在服务器指定目录，您可以下载到本地进行存档</li>
          <li>删除备份文件将无法恢复，请谨慎操作</li>
        </ul>
      </Card>

      {/* 备份列表 */}
      <Card className="card-container">
        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : backups.length === 0 ? (
          <Empty description="暂无备份记录" />
        ) : (
          <Table
            columns={columns}
            dataSource={backups}
            rowKey="name"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条备份记录`,
            }}
          />
        )}
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="备份详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {currentBackup && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="备份名称">{currentBackup.name}</Descriptions.Item>
            <Descriptions.Item label="文件大小">
              {currentBackup.size ? (
                currentBackup.size < 1024
                  ? `${currentBackup.size} B`
                  : currentBackup.size < 1024 * 1024
                  ? `${(currentBackup.size / 1024).toFixed(2)} KB`
                  : `${(currentBackup.size / (1024 * 1024)).toFixed(2)} MB`
              ) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="状态">{getStatusTag(currentBackup.status)}</Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {currentBackup.created_at ? dayjs(currentBackup.created_at).format('YYYY-MM-DD HH:mm:ss') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="文件路径">{currentBackup.path || '-'}</Descriptions.Item>
            <Descriptions.Item label="备注">{currentBackup.remark || '暂无备注'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default Backup;
