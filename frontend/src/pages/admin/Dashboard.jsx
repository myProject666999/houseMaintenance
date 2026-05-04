import React, { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, Select, message, Spin } from 'antd';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { adminAPI } from '../../services/api';
import dayjs from 'dayjs';

const { Option } = Select;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [period, setPeriod] = useState('month');
  const [year, setYear] = useState(dayjs().year());

  const years = Array.from({ length: 5 }, (_, i) => dayjs().year() - i);

  useEffect(() => {
    fetchStatistics();
  }, [period, year]);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getDashboardStatistics();
      setStatistics(res.data);
    } catch (error) {
      message.error('获取统计数据失败');
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

  return (
    <div>
      <h2 className="page-title">数据看板</h2>
      
      <div style={{ marginBottom: 24, display: 'flex', gap: 12 }}>
        <Select
          value={period}
          onChange={setPeriod}
          size="large"
          style={{ width: 120 }}
        >
          <Option value="month">按月份</Option>
          <Option value="quarter">按季度</Option>
          <Option value="year">按年份</Option>
        </Select>
        <Select
          value={year}
          onChange={setYear}
          size="large"
          style={{ width: 120 }}
        >
          {years.map((y) => (
            <Option key={y} value={y}>
              {y}年
            </Option>
          ))}
        </Select>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6} md={4}>
          <Card className="stat-card">
            <Statistic
              title="业主总数"
              value={statistics?.ownerCount || 0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Card className="stat-card">
            <Statistic
              title="维修人员"
              value={statistics?.repairerCount || 0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Card className="stat-card">
            <Statistic
              title="报修订单"
              value={statistics?.orderCount || 0}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Card className="stat-card">
            <Statistic
              title="已完成"
              value={statistics?.completedCount || 0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Card className="stat-card">
            <Statistic
              title="维修记录"
              value={statistics?.recordCount || 0}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Card className="stat-card">
            <Statistic
              title="用户评价"
              value={statistics?.evaluationCount || 0}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 订单趋势 */}
        <Col xs={24} lg={16}>
          <Card title="订单趋势分析" className="card-container">
            <div style={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={statistics?.orderTrendData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#1890ff"
                    fill="#1890ff"
                    fillOpacity={0.3}
                    name="总订单"
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="#52c41a"
                    fill="#52c41a"
                    fillOpacity={0.3}
                    name="已完成"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* 订单状态分布 */}
        <Col xs={24} lg={8}>
          <Card title="订单状态分布" className="card-container">
            <div style={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statistics?.orderStatusData || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statistics?.orderStatusData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {/* 报修类别统计 */}
        <Col xs={24} lg={12}>
          <Card title="报修类别统计" className="card-container">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statistics?.categoryData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#1890ff" name="订单数" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* 维修业绩统计 */}
        <Col xs={24} lg={12}>
          <Card title="维修业绩统计" className="card-container">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={statistics?.performanceData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => {
                    if (name === 'amount') return `¥${value}`;
                    return value;
                  }} />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#1890ff" name="订单数" strokeWidth={2} />
                  <Line type="monotone" dataKey="amount" stroke="#52c41a" name="金额" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
