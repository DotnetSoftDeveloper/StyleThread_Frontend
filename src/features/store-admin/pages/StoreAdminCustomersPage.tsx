import React, { useEffect, useState } from "react";
import "./StoreAdminPages.css";
import { getSellerOrders } from "../../../Services/orderService";
import { FaSearch, FaEnvelope } from "react-icons/fa";

interface AggregatedCustomer {
  email: string;
  name: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string;
}

export const StoreAdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<AggregatedCustomer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    const fetchCustomersFromOrders = async () => {
      try {
        setLoading(true);
        const orders = await getSellerOrders();
        if (mounted && Array.isArray(orders)) {
          const map = new Map<string, AggregatedCustomer>();
          orders.forEach((ord: any) => {
            const email = ord.customerEmail || ord.userEmail || (ord.shippingAddress?.email) || "guest@storefront.com";
            const name = ord.customerName || ord.userName || (ord.shippingAddress?.fullName) || "Customer";
            const amount = Number(ord.totalAmount || ord.orderTotal || 0);
            const date = ord.orderDate || ord.createdAt || "";

            if (!map.has(email)) {
              map.set(email, {
                email,
                name,
                orderCount: 1,
                totalSpent: amount,
                lastOrderDate: date,
              });
            } else {
              const existing = map.get(email)!;
              existing.orderCount += 1;
              existing.totalSpent += amount;
              if (new Date(date) > new Date(existing.lastOrderDate)) {
                existing.lastOrderDate = date;
              }
            }
          });
          setCustomers(Array.from(map.values()));
        }
      } catch {
        // Silently catch if orders fail
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchCustomersFromOrders();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="store-admin-page-container">
      <div className="store-admin-page-header">
        <div className="store-admin-page-title-group">
          <h1>Store Customer Directory</h1>
          <p>
            View customer order histories, lifetime spend figures, and contact details
            strictly isolated to your storefront.
          </p>
        </div>
      </div>

      <div className="store-admin-card">
        <div className="store-admin-card-header">
          <h2 className="store-admin-card-title">Customers ({filtered.length})</h2>
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
              placeholder="Search by customer name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
                <th style={{ width: "25%" }}>Customer</th>
                <th style={{ width: "30%" }}>Email Address</th>
                <th style={{ width: "15%" }}>Total Orders</th>
                <th style={{ width: "15%" }}>Lifetime Spend</th>
                <th style={{ width: "15%" }}>Latest Order</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.email}>
                  <td data-label="Customer">
                    <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          backgroundColor: "#0d9488",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                        }}
                      >
                        {(c.name || c.email || "C")[0].toUpperCase()}
                      </div>
                      <strong>{c.name}</strong>
                    </div>
                  </td>
                  <td data-label="Email Address">
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <FaEnvelope style={{ color: "#94a3b8" }} size={12} />
                      <span>{c.email}</span>
                    </div>
                  </td>
                  <td data-label="Total Orders">
                    <span style={{ fontWeight: 700 }}>{c.orderCount}</span> orders
                  </td>
                  <td data-label="Lifetime Spend">
                    <strong style={{ color: "#0f766e" }}>₹{c.totalSpent.toFixed(2)}</strong>
                  </td>
                  <td data-label="Latest Order">
                    {c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                    No customers found. Once customers place orders on your storefront, they will appear here.
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

export default StoreAdminCustomersPage;
