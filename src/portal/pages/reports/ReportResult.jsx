import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Download, Eye } from "lucide-react";
import { toast } from "react-hot-toast";
import ExcelJS from "exceljs";
import "./ReportResult.css";

const ReportResult = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [reportData, setReportData] = useState(null);
  const [reportResponse, setReportResponse] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const {
      reportResponse: response,
      reportData: data,
      dateRange: range,
    } = location.state || {};

    if (!response || !data) {
      toast.error("No report data found!");
      navigate("/dashboard");
      return;
    }

    setReportResponse(response);
    setReportData(data);
    setDateRange(range);
  }, [location, navigate]);

  const convertColor = (colorCode) => {
    if (!colorCode || typeof colorCode !== "string") return null;

    const hex = colorCode.replace("0x", "");
    if (hex.length !== 8) return null;

    const a = parseInt(hex.slice(0, 2), 16);
    const r = parseInt(hex.slice(2, 4), 16);
    const g = parseInt(hex.slice(4, 6), 16);
    const b = parseInt(hex.slice(6, 8), 16);

    return a < 255
      ? `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`
      : `#${hex.slice(2)}`;
  };

  const buildTableGrid = (cells) => {
    if (!Array.isArray(cells) || cells.length === 0) return { rows: [] };

    let maxRow = 0;
    let maxCol = 0;

    cells.forEach((cell) => {
      const endRow = cell.row + (cell.rowspan || 1);
      const endCol = cell.col + (cell.colspan || 1);
      maxRow = Math.max(maxRow, endRow);
      maxCol = Math.max(maxCol, endCol);
    });

    const grid = Array.from({ length: maxRow }, () => Array(maxCol).fill(null));

    cells.forEach((cell) => {
      let rs = cell.rowspan || 1;
      let cs = cell.colspan || 1;

      // Adjust expansion if it hits an already occupied cell
      // This handles cases where headers might overlap with records
      let actualRs = 0;
      for (let r = 0; r < rs; r++) {
        let hasConflict = false;
        for (let c = 0; c < cs; c++) {
          const rr = cell.row + r;
          const cc = cell.col + c;
          if (!grid[rr] || grid[rr][cc] !== null) {
            hasConflict = true;
            break;
          }
        }
        if (hasConflict) break;
        actualRs++;
      }
      rs = Math.max(1, actualRs);

      for (let r = 0; r < rs; r++) {
        for (let c = 0; c < cs; c++) {
          const rr = cell.row + r;
          const cc = cell.col + c;

          if (grid[rr] && grid[rr][cc] === null) {
            grid[rr][cc] = {
              ...cell,
              rowspan: rs,
              colspan: cs,
              skip: !(r === 0 && c === 0),
            };
          }
        }
      }
    });

    return { rows: grid };
  };

  const collectCells = (source, bucket) => {
    if (!source) return;

    if (Array.isArray(source)) {
      source.forEach((item) => {
        if (Array.isArray(item)) {
          item.forEach((cell) => cell && bucket.push(cell));
        } else if (typeof item === "object") {
          bucket.push(item);
        }
      });
    } else if (typeof source === "object") {
      bucket.push(source);
    }
  };

  const handleExcelDownload = async () => {
    setIsDownloading(true);

    try {
      if (!rows || rows.length === 0) {
        toast.error("No data to download");
        return;
      }

      // Debug: Check what data we have
      console.log("Total rows:", rows.length);
      console.log("First few rows:", rows.slice(0, 5));

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(
        reportData?.sub_report_title || "Report",
      );

      // Add title and date range
      const maxCol = rows.length > 0 ? rows[0].length : 5;

      worksheet.mergeCells(1, 1, 1, maxCol);
      const titleCell = worksheet.getCell(1, 1);
      titleCell.value = reportData?.sub_report_title || "Report";
      titleCell.font = { bold: true, size: 16 };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };
      titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFA500" },
      };

      worksheet.mergeCells(2, 1, 2, maxCol);
      const dateCell = worksheet.getCell(2, 1);
      dateCell.value = `${dateRange?.from} to ${dateRange?.to}`;
      dateCell.font = { size: 12 };
      dateCell.alignment = { horizontal: "center", vertical: "middle" };

      let currentExcelRow = 4;

      // Process each row
      rows.forEach((row, rIdx) => {
        // Create the row explicitly if it doesn't exist
        const excelRow = worksheet.getRow(currentExcelRow);

        row.forEach((cell, cIdx) => {
          const excelCell = excelRow.getCell(cIdx + 1);

          // Skip if this spot is covered by a merge from above or left
          if (cell?.skip) return;

          // Basic value and common border
          excelCell.value =
            cell?.value !== null && cell?.value !== undefined ? cell.value : "";

          excelCell.border = {
            top: { style: "thin", color: { argb: "FFE5E7EB" } },
            left: { style: "thin", color: { argb: "FFE5E7EB" } },
            bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
            right: { style: "thin", color: { argb: "FFE5E7EB" } },
          };

          // If it's a real cell object, apply specific styling
          if (cell) {
            // Background color
            const bg = convertColor(cell.bgColor);
            if (bg) {
              let argbColor = null;
              if (bg.startsWith("#")) {
                argbColor = "FF" + bg.replace("#", "");
              } else if (bg.startsWith("rgba") || bg.startsWith("rgb")) {
                const rgbaMatch = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                if (rgbaMatch) {
                  const r = parseInt(rgbaMatch[1])
                    .toString(16)
                    .padStart(2, "0");
                  const g = parseInt(rgbaMatch[2])
                    .toString(16)
                    .padStart(2, "0");
                  const b = parseInt(rgbaMatch[3])
                    .toString(16)
                    .padStart(2, "0");
                  argbColor = "FF" + r + g + b;
                }
              }
              if (argbColor) {
                excelCell.fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: { argb: argbColor },
                };
              }
            }

            // Font color + bold
            const fontColor = convertColor(cell.fontColor);
            let fontColorArgb = undefined;
            if (fontColor) {
              if (fontColor.startsWith("#")) {
                fontColorArgb = { argb: "FF" + fontColor.replace("#", "") };
              } else if (
                fontColor.startsWith("rgba") ||
                fontColor.startsWith("rgb")
              ) {
                const rgbaMatch = fontColor.match(
                  /rgba?\((\d+),\s*(\d+),\s*(\d+)/,
                );
                if (rgbaMatch) {
                  const r = parseInt(rgbaMatch[1])
                    .toString(16)
                    .padStart(2, "0");
                  const g = parseInt(rgbaMatch[2])
                    .toString(16)
                    .padStart(2, "0");
                  const b = parseInt(rgbaMatch[3])
                    .toString(16)
                    .padStart(2, "0");
                  fontColorArgb = { argb: "FF" + r + g + b };
                }
              }
            }

            excelCell.font = {
              bold: cell.fontStyle === "bold",
              size: 11,
              color: fontColorArgb,
            };

            // Alignment
            excelCell.alignment = {
              horizontal: "center",
              vertical: "middle",
              wrapText: true,
            };

            // Merge cells (rowspan / colspan)
            if (cell.rowspan > 1 || cell.colspan > 1) {
              const endRow = currentExcelRow + (cell.rowspan || 1) - 1;
              const endCol = cIdx + 1 + (cell.colspan || 1) - 1;

              try {
                worksheet.mergeCells(currentExcelRow, cIdx + 1, endRow, endCol);
              } catch (error) {
                console.warn(
                  `Merge attempted at [${currentExcelRow}, ${cIdx + 1}] but failed:`,
                  error.message,
                );
              }
            }
          }
        });
        // Set fixed row height
        excelRow.height = 18;
        currentExcelRow++;
      });

      // Finalize formatting - tighter column widths
      worksheet.columns.forEach((col) => {
        let maxLength = 0;
        col.eachCell({ includeEmpty: false }, (cell) => {
          const cellValue = cell.value ? cell.value.toString().trim() : "";
          // Limit character count for width calculation
          maxLength = Math.max(maxLength, Math.min(cellValue.length, 15));
        });
        // Tighter column widths: min 6, max 20
        col.width = Math.min(Math.max(maxLength + 1, 6), 20);
      });

      const buffer = await workbook.xlsx.writeBuffer();

      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const fileName =
        (reportData?.sub_report_title || "report")
          .replace(/\s+/g, "_")
          .toLowerCase() + ".xlsx";

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success("Excel downloaded successfully!");
    } catch (error) {
      console.error("Excel Download Error:", error);
      toast.error("Failed to download Excel");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!reportResponse || !reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const { records } = reportResponse;

  const allCells = [];

  // Important: process records first so they own their spots
  // This prevents header merges from swallowing data cells
  collectCells(records?.records, allCells);
  collectCells(records?.headers, allCells);
  collectCells(records?.footer, allCells);

  const { rows } = buildTableGrid(allCells);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-[1600px] mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-2 bg-white border shadow-sm hover:bg-gray-50"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <button
            onClick={handleExcelDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 px-5 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} />
            {isDownloading ? "Downloading..." : "Download Excel"}
          </button>
        </div>

        <div className="mb-8 p-6 rounded-2xl bg-orange-50 border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <Eye className="text-orange-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {reportData?.sub_report_title || "Report Result"}
              </h1>
              <p className="text-orange-700 font-medium">
                {reportData?.type} • {dateRange?.from} to {dateRange?.to}
              </p>
            </div>
          </div>
        </div>

        {rows.length > 0 ? (
          <div id="report-pdf" className="overflow-x-auto bg-white  border">
            <div className="pdf-header" style={{ display: "none" }}>
              <h1
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  marginBottom: "5px",
                  textAlign: "center",
                }}
              >
                {reportData?.sub_report_title || "Report Result"}
              </h1>
              <p
                style={{
                  fontSize: "12px",
                  marginBottom: "10px",
                  textAlign: "center",
                  color: "#666",
                }}
              >
                {reportData?.type} • {dateRange?.from} to {dateRange?.to}
              </p>
            </div>

            <table className="w-full border-collapse report-table">
              <tbody>
                {rows.map((row, rIdx) => (
                  <tr key={rIdx} className="page-break-avoid">
                    {row.map((cell, cIdx) => {
                      if (cell?.skip) return null;

                      return (
                        <td
                          key={cIdx}
                          rowSpan={cell?.rowspan || 1}
                          colSpan={cell?.colspan || 1}
                          style={{
                            backgroundColor:
                              convertColor(cell?.bgColor) || "#fff",
                            color: convertColor(cell?.fontColor) || "#000",
                            fontWeight:
                              cell?.fontStyle === "bold" ? "bold" : "normal",
                            textAlign: "center",
                            padding: "12px 14px",
                            border: "1px solid #e5e7eb",
                            fontSize: "15px",
                            whiteSpace: "nowrap", // UI ke liye
                          }}
                        >
                          {cell?.value ?? ""}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            No records found
          </div>
        )}
      </main>
    </div>
  );
};

export default ReportResult;
