import React, { useState } from "react";
import { formatTimeDisplay } from "../../services/sessionService";
import SpotlightCard from "../reactbits/SpotlightCard";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * SessionCalendarView — Interactive Month Matrix View for NSS scheduled activities.
 */
export default function SessionCalendarView({
  year,
  month,
  calendarData,
  todayKey,
  onSelectSession,
  onPrevMonth,
  onNextMonth,
  monthName,
}) {
  const [activeDayKey, setActiveDayKey] = useState(todayKey);

  // Generate calendar days for the current month
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const dateKey = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    calendarDays.push({
      day,
      dateKey,
      isCurrentMonth: false,
      isPast: dateKey < todayKey,
      isToday: dateKey === todayKey,
      items: calendarData[dateKey] || [],
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    calendarDays.push({
      day,
      dateKey,
      isCurrentMonth: true,
      isPast: dateKey < todayKey,
      isToday: dateKey === todayKey,
      items: calendarData[dateKey] || [],
    });
  }

  // Next month leading days to complete 35 or 42 grid cells
  const remainingCells = 42 - calendarDays.length;
  if (remainingCells > 0 && remainingCells < 7) {
    for (let day = 1; day <= remainingCells; day++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateKey = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      calendarDays.push({
        day,
        dateKey,
        isCurrentMonth: false,
        isPast: dateKey < todayKey,
        isToday: dateKey === todayKey,
        items: calendarData[dateKey] || [],
      });
    }
  }

  const selectedDayActivities = calendarData[activeDayKey] || [];

  return (
    <div className="session-calendar-matrix-wrapper bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-7">
      
      {/* Calendar Matrix Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">
              {monthName} {year}
            </h3>
            <p className="text-xs text-slate-500 font-medium">Click any date to explore scheduled sessions</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrevMonth}
            className="w-9 h-9 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white text-slate-700 flex items-center justify-center transition-colors"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            className="w-9 h-9 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white text-slate-700 flex items-center justify-center transition-colors"
            aria-label="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Column Headers */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-xs font-bold text-slate-400 uppercase tracking-wider py-1.5">
            {w}
          </div>
        ))}
      </div>

      {/* Calendar 7x6 Day Cells Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-8">
        {calendarDays.map((cell) => {
          const isSelected = activeDayKey === cell.dateKey;

          return (
            <button
              key={cell.dateKey}
              type="button"
              onClick={() => setActiveDayKey(cell.dateKey)}
              className={`min-h-[64px] sm:min-h-[86px] p-1.5 sm:p-2.5 rounded-2xl flex flex-col justify-between text-left transition-all duration-200 relative border ${
                isSelected
                  ? "bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02] z-10"
                  : cell.isToday
                  ? "bg-red-50/70 border-red-200 text-red-900 font-bold"
                  : cell.isCurrentMonth
                  ? "bg-slate-50/60 hover:bg-slate-100/80 border-slate-200/60 text-slate-800"
                  : "bg-slate-50/20 text-slate-400 border-transparent hover:bg-slate-50/60"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-xs sm:text-sm font-bold ${cell.isToday && !isSelected ? "text-red-600" : ""}`}>
                  {cell.day}
                </span>

                {cell.isToday && (
                  <span className={`text-[9px] px-1 py-0.2 rounded font-extrabold ${isSelected ? "bg-red-500 text-white" : "bg-red-600 text-white"}`}>
                    TODAY
                  </span>
                )}
              </div>

              {/* Event Indicators */}
              <div className="mt-1 space-y-1 w-full">
                {cell.items.slice(0, 2).map((it) => (
                  <div
                    key={it.id}
                    className={`text-[10px] sm:text-[11px] font-semibold truncate px-1.5 py-0.5 rounded-md ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : it.type === "monthly_event"
                        ? "bg-amber-100 text-amber-900 border border-amber-200"
                        : "bg-red-100 text-red-900 border border-red-200"
                    }`}
                  >
                    {it.title}
                  </div>
                ))}
                {cell.items.length > 2 && (
                  <div className={`text-[9px] font-bold ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                    +{cell.items.length - 2} more
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Activity Drawer List */}
      <div className="pt-6 border-t border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-red-600" />
            <span>Activities for {activeDayKey}</span>
            <span className="text-xs text-slate-500 font-normal">({selectedDayActivities.length} scheduled)</span>
          </h4>
        </div>

        {selectedDayActivities.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/60 text-center text-xs text-slate-500">
            No NSS sessions or activities scheduled on this date. Select another day on the calendar grid.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedDayActivities.map((item) => (
              <SpotlightCard
                key={item.id}
                spotlightColor="rgba(217, 75, 75, 0.12)"
                borderColor="rgba(217, 75, 75, 0.3)"
                onClick={() => onSelectSession(item)}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {item.type === "monthly_event" ? "MONTHLY EVENT" : "SESSION"}
                  </span>
                  {item.startTime && (
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-red-500" />
                      {formatTimeDisplay(item.startTime)}
                    </span>
                  )}
                </div>

                <h5 className="text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors mb-2">
                  {item.title}
                </h5>

                <div className="flex items-center gap-3 text-xs text-slate-500 mb-3 flex-wrap">
                  {item.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-500" />
                      {item.location}
                    </span>
                  )}
                  {Array.isArray(item.units) && item.units.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-blue-500" />
                      Units: {item.units.join(", ")}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-red-600 pt-2 border-t border-slate-100">
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </SpotlightCard>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
