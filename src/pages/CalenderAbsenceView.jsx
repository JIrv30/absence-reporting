import React, { useEffect, useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  addMonths,
  subMonths
} from "date-fns";
import db from '../appwrite/databases';

const CalendarAbsenceView = ({ user, teamLeader, absence }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);

  useEffect(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    setCalendarDays(eachDayOfInterval({ start, end }));
  }, [currentMonth]);

  const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

  if (!user || teamLeader !== 'Admin') return <div>Access Denied</div>;

  // Group absences by date
  const dayMap = {};
  absence.forEach(doc => {
    const start = new Date(doc.absence_start);
    const end = new Date(doc.absence_end);

    for (
      let day = new Date(start);
      day <= end;
      day.setDate(day.getDate() + 1)
    ) {
      const key = format(day, 'yyyy-MM-dd');
      if (!dayMap[key]) dayMap[key] = [];
      dayMap[key].push(doc);
    }
  });

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
        >
          ← Previous
        </button>
        <h2 className="text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          onClick={handleNextMonth}
          className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
        >
          Next →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const absentees = dayMap[dateKey] || [];

          return (
            <div
              key={dateKey}
              className="border p-2 rounded shadow-sm h-28 overflow-hidden relative bg-white"
            >
              <div className="text-xs font-semibold text-gray-700">
                {format(day, 'd MMM')}
              </div>

              {absentees.length === 0 && (
                <div className="text-gray-400 text-xs mt-2">No absences</div>
              )}

              {absentees.length > 0 && absentees.length <= 5 && (
                <ul className="text-xs mt-1 space-y-0.5">
                  {absentees.map((doc, index) => {
                    const statusColor =
                      doc.authorised === 'Authorised'
                        ? 'text-green-600'
                        : doc.authorised === 'Rejected'
                        ? 'text-red-600'
                        : 'text-orange-600';

                    const tooltip = `${doc.name} (${format(new Date(doc.absence_start), 'd MMM')} → ${format(new Date(doc.absence_end), 'd MMM')})`;

                    return (
                      <li
                        key={index}
                        className={`truncate font-medium ${statusColor}`}
                        title={tooltip}
                      >
                        {doc.name}
                      </li>
                    );
                  })}
                </ul>
              )}

              {absentees.length > 5 && (
                <div className="absolute bottom-2 right-2 bg-purple-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  {absentees.length}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarAbsenceView;
