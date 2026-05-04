import React, { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, Select, message, Spin } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { ownerAPI } from '../../services/api';
import dayjs from 'dayjs';

const { Option } = Select;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AmountStatistics = () => {
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
      const res = await ownerAPI.getAmountStatistics({ period, year });
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
      <h2 className="page-title">维修金额统计</h2>
      
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

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="总维修费用"
              value={statistics?.total_amount || 0}
              prefix="¥"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="维修次数"
              value={statistics?.total_count || 0}
              suffix="次"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="平均费用"
              value={statistics?.avg_amount || 0}
              prefix="¥"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="最高费用"
              value={statistics?.max_amount || 0}
              prefix="¥"
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="费用趋势" className="card-container">
            <div style={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={statistics?.trend_data || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `¥${value}`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#1890ff"
                    name="费用"
                    strokeWidth={2}
                    dot={{ fill: '#1890ff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="按类别分布" className="card-container">
            <div style={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statistics?.category_data || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {statistics?.category_data?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `¥${value}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="按月份统计" className="card-container" style={{ marginTop: 24 }}>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statistics?.monthly_data || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `¥${value}`} />
              <Legend />
              <Bar dataKey="amount" fill="#1890ff" name="费用" />
              <Bar dataKey="count" fill="#52c41a" name="次数" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default AmountStatistics;
