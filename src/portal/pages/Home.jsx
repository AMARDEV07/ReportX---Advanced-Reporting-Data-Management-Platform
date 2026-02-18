import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, FileBarChart, ChevronRight } from "lucide-react";
import Navbar from "../layouts/Navbar";
import Loader from "../components/Loader";
import { API_BASE_URL } from "../../shared/config/api";

function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [entity, setEntity] = useState(null);

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState([]);
  const [apiError, setApiError] = useState("");

  // Fetch Dashboard from API
  const fetchDashboard = async (entityObj, userObj) => {
    try {
      setApiError("");
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("Token missing! Please login again.");

      const payload = {
        tenant_id: entityObj?.id,
        user_id: userObj?.user_id,
      };

      const res = await fetch(`${API_BASE_URL}dashboard`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      const rawText = await res.text();

      if (!res.ok) {
        console.error("Dashboard API failed:", res.status, rawText);
        throw new Error(
          rawText || `Dashboard API failed with status ${res.status}`,
        );
      }

      const data = JSON.parse(rawText);

      if (!data?.success || data?.status_id !== 1) {
        throw new Error(data?.message || "Dashboard fetch failed.");
      }

      const records = Array.isArray(data?.records) ? data.records : [];
      setDashboardData(records);
    } catch (err) {
      console.error("Dashboard API Error:", err);
      setDashboardData([]);
      setApiError(err?.message || "Failed to load dashboard");
    }
  };


  const handleChangeEntity = () => {
    sessionStorage.removeItem("selectedEntity");
    navigate("/entity-selection");
  };


  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const userData = sessionStorage.getItem("user");

    if (!token || !userData) {
      navigate("/Login");
      return;
    }

    const userObj = JSON.parse(userData);
    setUser(userObj);

    // Get entity from navigation state OR sessionStorage
    let entityFromState = location.state?.entity;

    // Fallback to sessionStorage if navigation state is missing
    if (!entityFromState) {
      const storedEntity = sessionStorage.getItem("selectedEntity");
      if (storedEntity) {
        entityFromState = JSON.parse(storedEntity);
        console.log("Entity loaded from sessionStorage:", entityFromState);
      }
    }

    if (!entityFromState) {
      navigate("/entity-selection");
      return;
    }

    setEntity(entityFromState);
    console.log("Using Entity for Dashboard:", entityFromState);

    fetchDashboard(entityFromState, userObj).finally(() => setLoading(false));
  }, [navigate, location]);

  if (loading) return <Loader fullScreen text="Loading dashboard..." />;

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Entity Header */}
        <div className="p-6 mb-8 text-black bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-black/10 rounded-lg flex items-center justify-center overflow-hidden">
                {entity?.logo ? (
                  <img
                    src={entity.logo}
                    alt={`${entity.name} logo`}
                    className="w-25 h-"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold">
                    {entity?.name?.charAt(0)?.toUpperCase() || "E"}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-black">
                  {entity?.name}
                </h2>
                <p className="text-black/70 text-sm mt-1">India • Gurugram</p>
              </div>
            </div>
            <button
              onClick={handleChangeEntity}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition"
            >
              <ArrowLeft size={16} />
              Change Entity
            </button>

          </div>
        </div>

        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.user_name}!
          </h2>
          <p className="text-gray-600">
            Select any report to view its sub reports.
          </p>
        </div>

        {/* API Error */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            <p className="font-semibold">Dashboard Load Failed</p>
            <p className="text-sm mt-1">{apiError}</p>
          </div>
        )}

        {/* Report Blocks */}
        {dashboardData.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-gray-600">No dashboard reports found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardData.map((report, index) => (
              <button
                key={`report-${report?.report_id || index}-${index}`}
                onClick={() => {
                  if (report?.web_url) {
                    window.open(report.web_url, "_blank");
                    return;
                  }
                  // Pass report via navigation state
                  navigate(`/dashboard/${report?.report_id}`, {
                    state: { report, entity },
                  });
                }}
                className="bg-white rounded-2xl shadow p-6 hover:shadow-xl transition text-left border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                      {report?.icon ? (
                        <img
                          src={report.icon}
                          alt="icon"
                          className="w-7 h-7 object-contain"
                        />
                      ) : (
                        <FileBarChart className="text-orange-600" size={22} />
                      )}
                    </div>

                    {/* Title */}
                    <div>
                      <p className="text-lg font-semibold text-gray-800">
                        {report?.title || "Untitled Report"}
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        {(report?.submenu || []).length} Sub Reports
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="text-gray-400" size={20} />
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;