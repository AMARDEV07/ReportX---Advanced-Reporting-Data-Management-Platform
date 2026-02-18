import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  ChevronRight,
  ChevronDown,
  BarChart3,
  FileText as SummaryIcon,
} from "lucide-react";

import Navbar from "../../layouts/Navbar";

const SubReports = () => {
  const navigate = useNavigate();
  const { reportId } = useParams();
  const location = useLocation();
  const [report, setReport] = useState(null);
  const [entity, setEntity] = useState(null);
  // Dropdown state (which subreport is open)
  const [openSubIndex, setOpenSubIndex] = useState(null);




  useEffect(() => {
    // Get report and entity from navigation state
    const reportFromState = location.state?.report;
    let entityFromState = location.state?.entity;



    // Fallback to sessionStorage if entity is missing
    if (!entityFromState) {
      const storedEntity = sessionStorage.getItem("selectedEntity");
      if (storedEntity) {
        entityFromState = JSON.parse(storedEntity);
        console.log(
          "SubReports - Entity loaded from sessionStorage:",
          entityFromState,
        );
      }
    }



    if (!reportFromState || !entityFromState) {
      navigate("/dashboard");
      return;
    }



    // Ensure correct report opened
    if (String(reportFromState?.report_id) === String(reportId)) {
      setReport(reportFromState);
      setEntity(entityFromState);
      console.log("SubReports - Using Entity:", entityFromState);
    } else {
      navigate("/dashboard");
    }
  }, [reportId, location, navigate]);


  const submenuList = Array.isArray(report?.submenu) ? report.submenu : [];

  const handleSelectOption = ({ submenu, item }) => {
    if (!item?.endPoint) {
      alert("No endpoint found for this option!");
      return;
    }

    // If it's a full URL, open it in a new tab
    if (item.endPoint.startsWith("http")) {
      window.open(item.endPoint, "_blank");
      return;
    }
    

    
    // Pass data via navigation state
    const reportData = {
      report_id: report?.report_id,
      report_title: report?.title,
      sub_report_id: submenu?.sub_report_id,
      sub_report_title: submenu?.title,
      type: item?.title, // Chart / Summary
      endPoint: item?.endPoint,
      date_filter: item?.date_filter,
      entity: entity,
    };

    if (item?.title?.toLowerCase() === "chart") {
      navigate("/dashboard/chart", { state: reportData });
    } else {
      navigate("/dashboard/summary", { state: reportData });
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <button
          onClick={() => navigate("/dashboard", { state: { entity } })}
          className="flex items-center gap-2 mb-6 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition"
        >
          <ArrowLeft size={16} />
          Back to Reports
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {report?.title || "Sub Reports"}
        </h2>

        {submenuList.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600">No sub reports found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submenuList.map((submenu, idx) => {
              // backend key: chart_saummary (double a)
              const options = Array.isArray(submenu?.chart_saummary)
                ? submenu.chart_saummary
                : [];

              const isOpen = openSubIndex === idx;

              return (
                <div
                  key={`${submenu?.sub_report_id}-${idx}`}
                  className="bg-white rounded-xl shadow overflow-hidden"
                >
                  {/*  SubReport Card (Clickable) */}
                  <button
                    onClick={() => {
                      const externalOption = options.find((opt) =>
                        opt.endPoint?.startsWith("http"),
                      );
                      if (externalOption) {
                        window.open(externalOption.endPoint, "_blank");
                      } else {
                        setOpenSubIndex((prev) => (prev === idx ? null : idx));
                      }
                    }}
                    className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <FileText className="text-blue-600" size={18} />
                      </div>

                      <div>
                        <p className="font-semibold text-gray-800">
                          {submenu?.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          Click to open options
                        </p>
                      </div>
                    </div>

                    <ChevronDown
                      size={20}
                      className={`text-gray-500 transition ${
                        isOpen ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </button>

                  {/* Dropdown Options (Chart / Summary) */}
                  {isOpen && (
                    <div className="border-t border-gray-200 bg-gray-50 p-4">
                      {options.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          No Chart/Summary options available.
                        </p>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {options.map((item, i) => (
                            <button
                              key={i}
                              onClick={() =>
                                handleSelectOption({ submenu, item })
                              }
                              className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition"
                            >
                              <span className="flex items-center gap-2 font-medium text-gray-700">
                                {item?.title?.toLowerCase() === "chart" ? (
                                  <BarChart3 size={18} />
                                ) : (
                                  <SummaryIcon size={18} />
                                )}
                                {item?.title}
                              </span>

                              <ChevronRight
                                size={18}
                                className="text-gray-400"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default SubReports;
