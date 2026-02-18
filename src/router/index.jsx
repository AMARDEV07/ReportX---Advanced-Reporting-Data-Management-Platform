import { createBrowserRouter, Navigate, Outlet, useNavigation } from "react-router-dom";
import Login from "../portal/pages/Auth/Login";
import EntitySelection from "../portal/pages/Entity";
import Home from "../portal/pages/Home";
import MainLayout from "../portal/layouts/MainLayout";
import SubReports from "../portal/pages/reports/SubReports";
import ReportView from "../portal/pages/reports/ReportView";
import ReportResult from "../portal/pages/reports/ReportResult";
import { AuthProvider } from "../admin/context/AuthContext";
import { useAuth } from "../admin/context/AuthContext";
import AdminLogin from "../admin/pages/Login";
import AdminDashboard from "../admin/pages/Dashboard";
import AdminUsers from "../admin/pages/Users";
import AdminRoles from "../admin/pages/Roles";
import AdminUserRoles from "../admin/pages/UserRoles";
import AdminModules from "../admin/pages/Modules";
import AdminModuleList from "../admin/pages/ModuleList";
import AdminViewModule from "../admin/pages/ViewModule";
import AdminError404 from "../admin/pages/Error404";
import AdminProtectedRoute from "../admin/components/common/ProtectedRoute";
import AdminLoader from "../admin/components/common/Loader";



const AdminAuthRedirect = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/Login/admin/dashboard" replace /> : <AdminLogin />;
};

const AdminLoginRedirect = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/Login/admin/dashboard" replace /> : <AdminLogin />;
};

const AdminRoot = () => {
  const navigation = useNavigation();
  return (
    <>
      {navigation.state === "loading" && <AdminLoader fullScreen text="Loading Page..." />}
      <Outlet />
    </>
  );
};

// Wrapper to provide AuthContext to admin routes
const AdminLayout = () => {
  return (
    <AuthProvider>
      <AdminRoot />
    </AuthProvider>
  );
};

const router = createBrowserRouter([
  // ============ ReportX Routes (unchanged) ============
  {
    path: "/",
    element: <Navigate to="/Login" replace />,
  },

  {
    path: "/Login",
    element: <Login />,
  },

  {
    path: "/entity-selection",
    element: <EntitySelection />,
  },

  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "dashboard",
        element: <Home />,
      },
      {
        path: "dashboard/:reportId",
        element: <SubReports />,
      },
      {
        path: "dashboard/chart",
        element: <ReportView />,
      },
      {
        path: "dashboard/summary",
        element: <ReportView />,
      },
      {
        path: "dashboard/report-result",
        element: <ReportResult />,
      },
    ],
  },

  // ============ Admin Routes ============
  {
    path: "/Login/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminAuthRedirect />,
      },
      {
        path: "dashboard",
        element: <AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>,
      },
      {
        path: "users",
        element: <AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>,
      },
      {
        path: "roles",
        element: <AdminProtectedRoute><AdminRoles /></AdminProtectedRoute>,
      },
      {
        path: "user-roles",
        element: <AdminProtectedRoute><AdminUserRoles /></AdminProtectedRoute>,
      },
      {
        path: "modules",
        element: <AdminProtectedRoute><AdminModules /></AdminProtectedRoute>,
      },
      {
        path: "module-list",
        element: <AdminProtectedRoute><AdminModuleList /></AdminProtectedRoute>,
      },
      {
        path: "view-module/:id",
        element: <AdminProtectedRoute><AdminViewModule /></AdminProtectedRoute>,
      },
      {
        path: "*",
        element: <AdminError404 />,
      },
    ],
  },
]);

export default router;
