import React, { useMemo } from "react";
import { ArrowRight } from "lucide-react";

const MONTH_NAMES = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

function formatArchiveDate(dateStr) {
  if (!dateStr) return "—";
  const parts = dateStr.split("-").map(Number);
  if (parts.length < 3) return dateStr;
  const month = MONTH_NAMES[parts[1] - 1] || "SEP";
  return `${parts[2]} ${month}`;
}

function getCategoryText(item) {
  if (item.type === "monthly_event" || item.eventType === "monthly") {
    return "MONTHLY EVENT";
  }
  const t = (item.eventType || "").toLowerCase();
  if (t === "camp") return "CAMP";
  if (t === "outreach") return "OUTREACH";
  if (t.includes("visit") || t.includes("orphanage")) return "ORPHANAGE VISIT";
  return (item.eventType || "ACTIVITY").toUpperCase();
}

/**
 * ActivityArchive — Clean, understated historical activity record
 */
export default function ActivityArchive({ archiveItems = [], onSelectSession }) {
  // Group archive items by Year
  const yearGroups = useMemo(() => {
    const groups = {};
    archiveItems.forEach((item) => {
      const d = item.date || item.dateStr || "";
      const yr = d.split("-")[0] || "Past";
      if (!groups[yr]) groups[yr] = [];
      groups[yr].push(item);
    });
    // Sort years descending
    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map((year) => ({
        year,
        items: groups[year],
      }));
  }, [archiveItems]);

  if (archiveItems.length === 0) return null;

  return (
    <section className="activity-archive-section" aria-label="NSS Activity Archive">
      <div className="archive-header">
        <h2 className="archive-title font-editorial">ACTIVITY ARCHIVE</h2>
        <p className="archive-desc">Previous NSS activities and programmes.</p>
      </div>

      <div className="archive-groups-wrap">
        {yearGroups.map(({ year, items }) => (
          <div key={year} className="archive-year-group">
            <div className="archive-year-label font-editorial">{year}</div>

            <div className="archive-items-list">
              {items.map((item) => {
                const category = getCategoryText(item);
                const dateDisplay = formatArchiveDate(item.date || item.dateStr);

                return (
                  <div
                    key={item.id}
                    className="archive-row"
                    onClick={() => onSelectSession && onSelectSession(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectSession && onSelectSession(item);
                      }
                    }}
                  >
                    <div className="archive-row-main">
                      <span className="archive-item-title font-editorial">{item.title}</span>
                      <span className="archive-item-cat">{category}</span>
                    </div>

                    <div className="archive-row-side">
                      <span className="archive-item-date">{dateDisplay}</span>
                      <ArrowRight className="w-3.5 h-3.5 archive-arrow" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
