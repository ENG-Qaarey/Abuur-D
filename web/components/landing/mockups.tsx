/**
 * Illustrative screenshot of the business owner's order dashboard,
 * drawn in HTML (example data, not live).
 */
import "./mockups.css";

const STATUS_COLORS: Record<string, string> = {
  NEW: "#0d6efd",
  CONFIRMED: "#7c3aed",
  PREPARING: "#d97706",
  DELIVERED: "#16a34a",
};

export function OrdersDashboardMock() {
  return (
    <div className="employer-dash" role="img" aria-label="Example of the ABUUR order dashboard">
      <div className="employer-dash__titlebar">
        <div className="employer-dash__dot employer-dash__dot--red" />
        <div className="employer-dash__dot employer-dash__dot--amber" />
        <div className="employer-dash__dot employer-dash__dot--green" />
        <span className="employer-dash__title">Order Dashboard · Hodan Fashion</span>
      </div>
      <div className="employer-dash__stats">
        {[
          { label: "New", value: "5" },
          { label: "Preparing", value: "3" },
          { label: "Delivered", value: "18" },
        ].map((stat) => (
          <div key={stat.label} className="employer-dash__stat">
            <p className="employer-dash__stat-label">{stat.label}</p>
            <p className="employer-dash__stat-value">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="employer-dash__section">
        <p className="employer-dash__section-title">Latest WhatsApp orders</p>
        {[
          { name: "Faadumo A.", detail: "#1042 · 2 items · $73", status: "NEW" },
          { name: "Yusuf M.", detail: "#1041 · 1 item · $28", status: "PREPARING" },
          { name: "Ayaan S.", detail: "#1040 · 3 items · $96", status: "DELIVERED" },
        ].map((row) => (
          <div key={row.name} className="employer-dash__row">
            <div className="employer-dash__row-left">
              <div className="employer-dash__avatar">
                {row.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <p className="employer-dash__name">{row.name}</p>
                <p className="employer-dash__role">{row.detail}</p>
              </div>
            </div>
            <span
              className="employer-dash__time"
              style={{ color: STATUS_COLORS[row.status], fontWeight: 600 }}
            >
              {row.status}
            </span>
          </div>
        ))}
      </div>
      <div className="employer-dash__section employer-dash__section--muted">
        <div className="employer-dash__perf-head">
          <p className="employer-dash__section-title" style={{ marginBottom: 0 }}>
            Orders this month
          </p>
          <span className="employer-dash__perf-meta">Example</span>
        </div>
        <div className="employer-dash__bars">
          {[40, 55, 35, 70, 50, 85, 60, 75, 90, 68].map((h, i) => (
            <div key={i} className="employer-dash__bar" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
