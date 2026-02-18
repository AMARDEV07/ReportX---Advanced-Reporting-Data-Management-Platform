import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Calendar, BarChart3, TrendingUp } from "lucide-react";
import { toast } from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./ReportResult.css";
import { API_BASE_URL } from "../../../shared/config/api";

const ReportView = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedQuickReport, setSelectedQuickReport] = useState(null);

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const today = new Date();

  useEffect(() => {
    let data = location.state;
    if (!data || !data.endPoint) {
      toast.error("Report data missing!");
      navigate("/dashboard");
      return;
    }

    // If entity is missing in data, get from sessionStorage
    if (!data.entity) {
      const storedEntity = sessionStorage.getItem("selectedEntity");
      if (storedEntity) {
        data = { ...data, entity: JSON.parse(storedEntity) };
        console.log(
          "ReportView - Entity loaded from sessionStorage:",
          data.entity,
        );
      }
    }

    console.log("ReportView - Using Entity:", data?.entity);
    setReportData(data);
  }, [location, navigate]);

  const getDateRange = (type) => {
    const today = new Date();
    let from, to;
    switch (type) {
      case "today":
        from = to = new Date();
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        from = to = yesterday;
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case "current_month":
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        to = new Date();
        break;
      case "previous_month":
        from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        to = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      default:
        return null;
    }
    return { from, to };
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleQuickReport = (type) => {
    setSelectedQuickReport(type);
    const dateRange = getDateRange(type);
    if (dateRange) {
      setFromDate(dateRange.from);
      setToDate(dateRange.to);
      generateReport(formatDate(dateRange.from), formatDate(dateRange.to));
    }
  };

  const handleCustomDateRange = () => {
    if (reportData?.date_filter === 1) {
      if (!fromDate) {
        toast.error("Please select a date");
        return;
      }
      setSelectedQuickReport(null);
      generateReport(formatDate(fromDate), formatDate(fromDate));
    } else {
      if (!fromDate || !toDate) {
        toast.error("Please select both dates");
        return;
      }
      if (fromDate > toDate) {
        toast.error("From date cannot be after To date!");
        return;
      }
      setSelectedQuickReport(null);
      generateReport(formatDate(fromDate), formatDate(toDate));
    }
  };

  const generateReport = async (from, to) => {
    try {
      setLoading(true);

      const token = sessionStorage.getItem("token");
      const userData = sessionStorage.getItem("user");

      if (!token || !userData) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      const tenantId = reportData?.entity?.id;
      const baseUrl = reportData?.endPoint?.startsWith("http")
        ? ""
        : API_BASE_URL;
      const fullEndpoint = `${baseUrl}${reportData?.endPoint}?startDate=${from}&endDate=${to}&tenant_id=${tenantId}`;

      console.log("========== DEBUG TENANT ID ==========");
      console.log("Selected Entity:", reportData?.entity);
      console.log("Tenant ID:", tenantId);
      console.log("Full Report Data:", reportData);
      console.log("=====================================");

      console.log("-------------------->API Request:", {
        endpoint: reportData?.endPoint,
        fullURL: fullEndpoint,
        startDate: from,
        endDate: to,
        tenant_id: tenantId,
      });

      const res = await fetch(fullEndpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Tenant-ID": tenantId,
          tenant_id: tenantId,
        },
      });

      const data = await res.json();
      console.log("API Response:", data);

      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Session expired. Please login again.");
          navigate("/login");
          return;
        }
        if (res.status === 404) {
          toast.error("Report not found");
          return;
        }
        throw new Error(data?.message || `Error: ${res.status}`);
      }

      if (!data?.success) {
        throw new Error(data?.message || "Failed to generate report");
      }

      // Navigate to result page with data
      navigate("/dashboard/report-result", {
        state: {
          reportResponse: data,
          reportData: reportData,
          dateRange: { from, to },
        },
      });

      toast.success("Report generated successfully!");
    } catch (err) {
      console.error("Error:", err);
      toast.error(err?.message || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  if (!reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-8 px-5 py-2 bg-white/40 backdrop-blur-md border border-white/30 rounded-xl shadow-sm hover:bg-white/80 transition-all text-gray-700"
        >
          <ArrowLeft size={18} />
          <span className="font-semibold">Back to Reports</span>
        </button>

        <div className="mb-10 p-8 rounded-3xl bg-orange-100/40 backdrop-blur-lg border border-orange-200/20 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-orange-100 shadow-sm">
              <TrendingUp size={28} className="text-orange-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {reportData?.sub_report_title || "Report"}
              </h1>
              <p className="text-orange-700 font-medium">
                {reportData?.type} • {reportData?.report_title}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white/30 backdrop-blur-xl border border-white/20 rounded-3xl shadow-sm p-6 sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center border border-orange-100">
                  <BarChart3 className="text-orange-500" size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  Quick Reports
                </h2>
              </div>

              <div className="space-y-3">
                {reportData?.date_filter === 1 ? (
                  <>
                    <button
                      onClick={() => handleQuickReport("today")}
                      className={`w-full px-5 py-3.5 rounded-2xl font-bold transition-all text-left border ${selectedQuickReport === "today"
                          ? "bg-orange-500 text-white border-orange-500 shadow-md"
                          : "bg-white/40 text-gray-700 border-gray-50 hover:bg-orange-50/50"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Calendar size={18} />
                        <span>Today</span>
                      </div>
                    </button>
                    <button
                      onClick={() => handleQuickReport("yesterday")}
                      className={`w-full px-5 py-3.5 rounded-2xl font-bold transition-all text-left border ${selectedQuickReport === "yesterday"
                          ? "bg-orange-500 text-white border-orange-500 shadow-md"
                          : "bg-white/40 text-gray-700 border-gray-50 hover:bg-orange-50/50"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Calendar size={18} />
                        <span>Yesterday</span>
                      </div>
                    </button>
                  </>
                ) : (
                  <>
                    {[
                      "today",
                      "yesterday",
                      "current_month",
                      "previous_month",
                    ].map((item) => (
                      <button
                        key={item}
                        onClick={() => handleQuickReport(item)}
                        className={`w-full px-5 py-3.5 rounded-2xl font-bold transition-all text-left border ${selectedQuickReport === item
                            ? "bg-orange-500 text-white border-orange-500 shadow-md"
                            : "bg-white/40 text-gray-700 border-gray-50 hover:bg-orange-50/50"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <Calendar size={18} />
                          <span className="capitalize">
                            {item.replace(/_/g, " ")}
                          </span>
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/30 backdrop-blur-xl border border-white/20 rounded-3xl shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center border border-orange-100">
                  <Calendar className="text-orange-500" size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  Custom Date Range
                </h2>
              </div>

              {reportData?.date_filter === 1 ? (
                <div className="mb-8">
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                    Date
                  </label>
                  <DatePicker
                    selected={fromDate}
                    onChange={(date) => setFromDate(date)}
                    maxDate={today}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Select date"
                    className="w-full px-5 py-3.5 rounded-2xl border border-gray-100 bg-white/50 backdrop-blur-sm focus:border-orange-300 focus:outline-none transition-all shadow-sm"
                  />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                      From Date
                    </label>
                    <DatePicker
                      selected={fromDate}
                      onChange={(date) => setFromDate(date)}
                      maxDate={today}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Select start date"
                      className="w-full px-5 py-3.5 rounded-2xl border border-gray-100 bg-white/50 backdrop-blur-sm focus:border-orange-300 focus:outline-none transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                      To Date
                    </label>
                    <DatePicker
                      selected={toDate}
                      onChange={(date) => setToDate(date)}
                      minDate={fromDate}
                      maxDate={today}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Select end date"
                      className="w-full px-5 py-3.5 rounded-2xl border border-gray-100 bg-white/50 backdrop-blur-sm focus:border-orange-300 focus:outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleCustomDateRange}
                disabled={
                  loading ||
                  (reportData?.date_filter === 1 && !fromDate) ||
                  (reportData?.date_filter === 2 && (!fromDate || !toDate))
                }
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${loading ||
                    (reportData?.date_filter === 1 && !fromDate) ||
                    (reportData?.date_filter === 2 && (!fromDate || !toDate))
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-orange-500 text-white hover:bg-orange-600 shadow-md"
                  }`}
              >
                {loading ? "Generating..." : "Generate Report"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportView;
