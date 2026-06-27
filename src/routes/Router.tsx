import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import MainLayout from "../components/MainLayout";
import { ProtectedRoute } from "./ProtectedRoute";

const Login = lazy(() => import("../pages/Login"));
const Signup = lazy(() => import("../pages/Signup"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const InventoryManage = lazy(() => import("../pages/InventoryManage"));
const RepsManage = lazy(() => import("../pages/RepsManage"));
const SupplierManage = lazy(() => import("../pages/SupplierManage"));
const PurchaseManage = lazy(() => import("../pages/PurchaseManage"));
const ExpenseManage = lazy(() => import("../pages/ExpenseManage"));
const SalesManage = lazy(() => import("../pages/SalesManage"));
const Reports = lazy(() => import("../pages/Reports"));
const ShopManage = lazy(() => import("../pages/ShopManage"));

const Placeholder = ({ name }: { name: string }) => (
  <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 min-h-[400px] flex items-center justify-center">
    <h2 className="text-2xl font-bold text-slate-300 uppercase tracking-widest">{name} Module Coming Soon</h2>
  </div>
);

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center">Loading...</div>}>
        <Routes>
          
          {/* 1. AUTH ROUTES */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          {/* 2. PROTECTED BUSINESS ROUTES */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/suppliers" element={<SupplierManage />} />
            <Route path="/purchases" element={<PurchaseManage />} />
            <Route path="/inventory" element={<InventoryManage />} />
            <Route path="/sales" element={<SalesManage />} />
            <Route path="/sales-reps" element={<RepsManage />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/expenses" element={<ExpenseManage />} />
            <Route path="/shops" element={<ShopManage />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}