import React, { useEffect, useState, useRef } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  addMonths,
  subMonths
} from "date-fns";

const CalendarAbsenceView = ({ user, teamLeader, absence }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [alignRight, setAlignRight] = useState(true)
  const circleRef = useRef()

  const checkOverflow = () => {
    const tooltipWidth = 240
    const buffer = 20
    const rect = circleRef.current?.getBoundClinetReact()

    if (!rect) return

    const spaceRight = window.innerWidth - rect.right
    const spaceLeft = rect.left

    setAlignRight(spaceRight => tooltipWidth + buffer || spaceLeft < tooltip)
  }

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

      <div className="grid grid-cols-7 gap-2 relative overflow-visible">
        {calendarDays.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const absentees = dayMap[dateKey] || [];

          return (
            <div
              key={dateKey}
              className="border p-2 rounded shadow-sm min-h-28 relative bg-white"
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
                <div ref={circleRef} className="absolute bottom-2 right-2 group z-30">
                  <div
                    className="bg-purple-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs cursor-pointer relative z-30">
                  {absentees.length}
                  

                  <div className="absolute top-full mt-2 right-0 group-hover:flex hidden flex-col bg-white border border-gray-300 rounded-md shadow-xl p-2 text-xs w-60 z-50">
                    <ul className="space-y-1 max-h-64 overflow-y-auto">
                      {absentees.map((doc, index)=>{
                        const statusColor = 
                        doc.authorised === 'Authorised'
                        ? 'text-green-600'
                        : doc.authorised === 'Rejected'
                        ? 'text-red-600'
                        : 'text-orange-600'

                        return (
                          <li 
                            key={index}
                            className={`font-medium ${statusColor}`}
                          >
                            {doc.name}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>
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
