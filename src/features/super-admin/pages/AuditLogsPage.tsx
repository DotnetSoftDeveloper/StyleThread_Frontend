import React, { useState, useEffect } from "react";
import "./SuperAdminPages.css";
import { getAllAuditLogs } from "../../../Services/tenantService";
import { TenantAuditLogDto } from "../../../Types/Interface/ITenant";
import { useToast } from "../../../Utils/Helper/ToastNotifications";
import { FaSearch } from "react-icons/fa";

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<TenantAuditLogDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { showToast } = useToast();

  useEffect(() => {
    let mounted = true;
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const data = await getAllAuditLogs();
        if (mounted) {
          setLogs(Array.isArray(data) ? data : []);
        }
      } catch (err: any) {
        showToast("error", "Failed to retrieve platform audit trail.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchLogs();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (log.action && log.action.toLowerCase().includes(q)) ||
      (log.actorEmail && log.actorEmail.toLowerCase().includes(q)) ||
      (log.details && log.details.toLowerCase().includes(q)) ||
      (log.ipAddress && log.ipAddress.toLowerCase().includes(q))
    );
  });

  return (
    <div className="sa-page-container">
      {/* Header */}
      <div className="sa-page-header">
        <div className="sa-page-title-group">
          <h1>System Audit Trail</h1>
          <p>
            Immutable event log tracking privileged platform administrative operations,
            tenant approvals, role grants, and security events.
          </p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="sa-card">
        <div className="sa-card-header">
          <h2 className="sa-card-title">Event Records ({filteredLogs.length})</h2>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "#f8fafc",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              padding: "0.4rem 0.75rem",
              minWidth: "260px",
            }}
          >
            <FaSearch style={{ color: "#94a3b8" }} />
            <input
              type="text"
              placeholder="Search by action, operator, IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: "none",
                background: "transparent",
                outline: "none",
                fontSize: "0.85rem",
                width: "100%",
              }}
            />
          </div>
        </div>

        <div className="sa-table-responsive">
          <table className="sa-table">
            <thead>
              <tr>
                <th className="col-audit-id">Event ID</th>
                <th className="col-audit-action">Action Type</th>
                <th className="col-audit-actor">Operator</th>
                <th className="col-audit-details">Details</th>
                <th className="col-audit-ip">IP Address</th>
                <th className="col-audit-time">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.auditLogId}>
                  <td data-label="Event ID" className="col-audit-id">
                    <span style={{ fontFamily: "monospace", color: "#64748b" }}>
                      #{log.auditLogId}
                    </span>
                  </td>
                  <td data-label="Action Type" className="col-audit-action">
                    <strong style={{ color: "#0f766e" }}>{log.action}</strong>
                  </td>
                  <td data-label="Operator" className="col-audit-actor">
                    <div>{log.actorEmail || "System Automation"}</div>
                  </td>
                  <td data-label="Details" className="col-audit-details">
                    <span style={{ fontSize: "0.85rem", color: "#475569" }}>
                      {log.details || "—"}
                    </span>
                  </td>
                  <td data-label="IP Address" className="col-audit-ip">
                    <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#64748b" }}>
                      {log.ipAddress || "127.0.0.1"}
                    </span>
                  </td>
                  <td data-label="Timestamp" className="col-audit-time">
                    {log.createdAt
                      ? new Date(log.createdAt).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                    No audit records match your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPage;
