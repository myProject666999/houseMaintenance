import React, { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, Select, message, Spin, Tabs } from 'antd';
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
const { TabPane } = Tabs;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const Statistics = () => {
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
      const [ownerRes, orderRes, categoryRes, performanceRes, recordRes] = await Promise.all([
        adminAPI.getOwnerStatistics(),
        adminAPI.getOrderStatistics(),
        adminAPI.getCategoryStatistics(),
        adminAPI.getPerformanceStatistics(),
        adminAPI.getRecordStatistics(),
      ]);
      
      setStatistics({
        owner: ownerRes.data,
        order: orderRes.data,
        category: categoryRes.data,
        performance: performanceRes.data,
        record: recordRes.data,
      });
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
      <h2 className="page-title">数据统计</h2>
      
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

      <Tabs defaultActiveKey="1">
        {/* 业主统计 */}
        <TabPane tab="业主数量统计" key="1">
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={8} md={4}>
              <Card className="stat-card">
                <Statistic
                  title="业主总数"
                  value={statistics?.owner?.totalCount || 0}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card className="stat-card">
                <Statistic
                  title="活跃业主"
                  value={statistics?.owner?.activeCount || 0}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card className="stat-card">
                <Statistic
                  title="新增业主"
                  value={statistics?.owner?.newCount || 0}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
          </Row>

          <Card title="业主增长趋势" className="card-container">
            <div style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={statistics?.owner?.trendData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#1890ff"
                    fill="#1890ff"
                    fillOpacity={0.3}
                    name="新增数量"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabPane>

        {/* 订单统计 */}
        <TabPane tab="报修单统计" key="2">
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={8} md={4}>
              <Card className="stat-card">
                <Statistic
                  title="总订单数"
                  value={statistics?.order?.totalCount || 0}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card className="stat-card">
                <Statistic
                  title="已完成"
                  value={statistics?.order?.completedCount || 0}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card className="stat-card">
                <Statistic
                  title="进行中"
                  value={statistics?.order?.processingCount || 0}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card title="订单趋势" className="card-container">
                <div style={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={statistics?.order?.trendData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="total" stroke="#1890ff" name="总订单" strokeWidth={2} />
                      <Line type="monotone" dataKey="completed" stroke="#52c41a" name="已完成" strokeWidth={2} />
                      <Line type="monotone" dataKey="cancelled" stroke="#f5222d" name="已取消" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="订单状态分布" className="card-container">
                <div style={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statistics?.order?.statusData || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statistics?.order?.statusData?.map((entry, index) => (
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
        </TabPane>

        {/* 类别统计 */}
        <TabPane tab="报修类别统计" key="3">
          <Card title="报修类别分布" className="card-container">
            <div style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statistics?.category?.data || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#1890ff" name="订单数量" />
                  <Bar dataKey="amount" fill="#52c41a" name="总金额" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabPane>

        {/* 维修业绩统计 */}
        <TabPane tab="维修业绩统计" key="4">
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={8} md={4}>
              <Card className="stat-card">
                <Statistic
                  title="总业绩金额"
                  value={statistics?.performance?.totalAmount || 0}
                  prefix="¥"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card className="stat-card">
                <Statistic
                  title="平均订单金额"
                  value={statistics?.performance?.avgAmount || 0}
                  prefix="¥"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card className="stat-card">
                <Statistic
                  title="最高订单金额"
                  value={statistics?.performance?.maxAmount || 0}
                  prefix="¥"
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
          </Row>

          <Card title="维修业绩趋势" className="card-container">
            <div style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={statistics?.performance?.trendData || []}>
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

          <Card title="维修人员业绩排名" className="card-container" style={{ marginTop: 24 }}>
            <div style={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statistics?.performance?.topRepairers || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip formatter={(value) => `¥${value}`} />
                  <Legend />
                  <Bar dataKey="amount" fill="#1890ff" name="业绩金额" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabPane>

        {/* 维修记录统计 */}
        <TabPane tab="维修记录统计" key="5">
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={8} md={4}>
              <Card className="stat-card">
                <Statistic
                  title="总维修记录"
                  value={statistics?.record?.totalCount || 0}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card className="stat-card">
                <Statistic
                  title="总维修费用"
                  value={statistics?.record?.totalCost || 0}
                  prefix="¥"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card className="stat-card">
                <Statistic
                  title="平均维修时长"
                  value={statistics?.record?.avgDuration || 0}
                  suffix="分钟"
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
          </Row>

          <Card title="维修记录趋势" className="card-container">
            <div style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statistics?.record?.trendData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#1890ff" name="数量" />
                  <Bar dataKey="cost" fill="#52c41a" name="费用" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Statistics;
