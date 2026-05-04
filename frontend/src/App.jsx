import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Spin } from 'antd';

import Login from './pages/Login';
import Register from './pages/Register';

import OwnerLayout from './components/OwnerLayout';
import RepairerLayout from './components/RepairerLayout';
import AdminLayout from './components/AdminLayout';

import OwnerHome from './pages/owner/Home';
import OwnerNotices from './pages/owner/Notices';
import OwnerNoticeDetail from './pages/owner/NoticeDetail';
import OwnerRepairOrders from './pages/owner/RepairOrders';
import OwnerCreateOrder from './pages/owner/CreateOrder';
import OwnerRepairRecords from './pages/owner/RepairRecords';
import OwnerAmountStatistics from './pages/owner/AmountStatistics';
import OwnerEvaluations from './pages/owner/Evaluations';
import OwnerCreateEvaluation from './pages/owner/CreateEvaluation';
import OwnerProfile from './pages/owner/Profile';
import OwnerChangePassword from './pages/owner/ChangePassword';

import RepairerHome from './pages/repairer/Home';
import RepairerPendingOrders from './pages/repairer/PendingOrders';
import RepairerMyOrders from './pages/repairer/MyOrders';
import RepairerRepairRecords from './pages/repairer/RepairRecords';
import RepairerEvaluations from './pages/repairer/Evaluations';
import RepairerNotices from './pages/repairer/Notices';
import RepairerNoticeDetail from './pages/repairer/NoticeDetail';

import AdminHome from './pages/admin/Home';
import AdminDashboard from './pages/admin/Dashboard';
import AdminOwners from './pages/admin/Owners';
import AdminRepairers from './pages/admin/Repairers';
import AdminRepairCategories from './pages/admin/RepairCategories';
import AdminRepairOrders from './pages/admin/RepairOrders';
import AdminRepairRecords from './pages/admin/RepairRecords';
import AdminEvaluations from './pages/admin/Evaluations';
import AdminNotices from './pages/admin/Notices';
import AdminStatistics from './pages/admin/Statistics';
import AdminBackup from './pages/admin/Backup';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route
        path="/owner/*"
        element={
          <ProtectedRoute allowedRoles={['owner']}>
            <OwnerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<OwnerHome />} />
        <Route path="notices" element={<OwnerNotices />} />
        <Route path="notices/:id" element={<OwnerNoticeDetail />} />
        <Route path="repair-orders" element={<OwnerRepairOrders />} />
        <Route path="repair-orders/create" element={<OwnerCreateOrder />} />
        <Route path="repair-records" element={<OwnerRepairRecords />} />
        <Route path="statistics" element={<OwnerAmountStatistics />} />
        <Route path="evaluations" element={<OwnerEvaluations />} />
        <Route path="evaluations/create/:orderId" element={<OwnerCreateEvaluation />} />
        <Route path="profile" element={<OwnerProfile />} />
        <Route path="change-password" element={<OwnerChangePassword />} />
      </Route>

      <Route
        path="/repairer/*"
        element={
          <ProtectedRoute allowedRoles={['repairer']}>
            <RepairerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<RepairerHome />} />
        <Route path="pending-orders" element={<RepairerPendingOrders />} />
        <Route path="my-orders" element={<RepairerMyOrders />} />
        <Route path="repair-records" element={<RepairerRepairRecords />} />
        <Route path="evaluations" element={<RepairerEvaluations />} />
        <Route path="notices" element={<RepairerNotices />} />
        <Route path="notices/:id" element={<RepairerNoticeDetail />} />
      </Route>

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<AdminHome />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="owners" element={<AdminOwners />} />
        <Route path="repairers" element={<AdminRepairers />} />
        <Route path="repair-categories" element={<AdminRepairCategories />} />
        <Route path="repair-orders" element={<AdminRepairOrders />} />
        <Route path="repair-records" element={<AdminRepairRecords />} />
        <Route path="evaluations" element={<AdminEvaluations />} />
        <Route path="notices" element={<AdminNotices />} />
        <Route path="statistics" element={<AdminStatistics />} />
        <Route path="backup" element={<AdminBackup />} />
      </Route>

      <Route
        path="/"
        element={
          user ? (
            user.role === 'owner' ? (
              <Navigate to="/owner/home" replace />
            ) : user.role === 'repairer' ? (
              <Navigate to="/repairer/home" replace />
            ) : (
              <Navigate to="/admin/home" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

export default App;
