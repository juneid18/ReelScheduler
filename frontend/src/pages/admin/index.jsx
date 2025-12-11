import React, { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import Dashboard from "./Dashboard";
import Users from "./Users";
import Plans from "./Plans";
import Transactions from "./Transactions";
import ContentModeration from "./ContentModeration";
import Content from "./Content";
import Analytics from "./Analytics";
import Support from "./Support";
import Logs from "./Logs";
import Settings from "./Settings";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminPanelRoutes() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  useEffect(() => {
    if (currentUser?.role !== "developer" && currentUser?.role !== "admin") {
      navigate("/");
    }
  }, [currentUser, navigate]);

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="plans" element={<Plans />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="content" element={<ContentModeration />} />
        <Route path="content-management" element={<Content />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="support" element={<Support />} />
        <Route path="logs" element={<Logs />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}
