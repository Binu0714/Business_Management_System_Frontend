import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

const Login = lazy(() => import("../pages/Login"));
const Signup = lazy(() => import("../pages/Signup"));

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense 
        fallback={
          <div className="h-screen w-screen bg-[#fafafa] flex items-center justify-center">
             <div className="h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }
      >
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}