import React, { useEffect, useState } from "react";
import db from '../appwrite/databases';
import CalendarAbsenceView from "./CalenderAbsenceView";


const AdminAbsence = ({user, teamLeader}) => {
  
  const [absence, setAbsence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calendarView, setCalendarView] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        const response = await db["Leave of Absence Request Collection"].list();
        setAbsence(response.documents);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await db['Leave of Absence Request Collection'].update(id, {authorised: newStatus})
      setAbsence(prev =>
        prev.map(doc => doc.$id === id ? {
          ...doc, 
          authorised: newStatus
        } : doc)
      )
    } catch (error) {
      console.error('Failed to update status', error)
    }
  }

  if (loading) return <div>Loading...</div>;

  if (!user || teamLeader!=='Admin') return <div>Access Denied</div>;
  
  
  return (
    <div className="overflow-x-auto">
      <div className="mb-4">
  
    <button
     onClick={()=>setCalendarView(prev=>!prev)}
     className="bg-purple-300 text-black px-3 py-1 rounded hover:bg-purple-400 hover:text-white text-sm ">
      {calendarView ? 'View Table' : 'View Calendar'}
    </button>
{calendarView ? (<CalendarAbsenceView absence={absence} user={user} teamLeader={teamLeader} />) : (
  <div className="overflow-x-auto">
    <table className="min-w-full table-auto text-xs">
    <thead className="bg-gray-100 text-gray-700">
      <tr>
        <th className="text-left py-1 px-2">Name</th>
        <th className="text-left py-1 px-2">Dept</th>
        <th className="text-left py-1 px-2">Start</th>
        <th className="text-left py-1 px-2">End</th>
        <th className="text-left py-1 px-2">Cover</th>
        <th className="text-left py-1 px-2">Reason</th>
        <th className="text-left py-1 px-2">Break</th>
        <th className="text-left py-1 px-2">Break Staff</th>
        <th className="text-left py-1 px-2">Appt</th>
        <th className="text-left py-1 px-2">TOIL</th>
        <th className="text-left py-1 px-2">Auth?</th>
      </tr>
    </thead>
    <tbody>
      {absence.map((doc) => {
        const rowColor =
          doc.authorised === 'Pending' ? 'bg-orange-100' :
          doc.authorised === 'Rejected' ? 'bg-red-100' :
          doc.authorised === 'Authorised' ? 'bg-green-100' : ''

        return (
          <tr key={doc.$id} className={`border-t ${rowColor}`}>
            <td className="py-1 px-2">{doc.name}</td>
            <td className="py-1 px-2">{doc.department}</td>
            <td className="py-1 px-2">
              {Intl.DateTimeFormat('en-GB').format(new Date(doc.absence_start))} <br />
              {new Date(doc.absence_start).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}
            </td>
            <td className="py-1 px-2">
              {Intl.DateTimeFormat('en-GB').format(new Date(doc.absence_end))} <br />
              {new Date(doc.absence_end).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}
            </td>
            <td className="py-1 px-2">
              {[1,2,3,4,5,6].map(i => doc[`cover_p${i}`] ? `P${i}✓ ` : '').join(' ')}
            </td>
            <td className="py-1 px-2">{doc.reason}</td>
            <td className="py-1 px-2">{doc.break_cover}</td>
            <td className="py-1 px-2">{doc.staff_cover_break}</td>
            <td className="py-1 px-2">
              {doc.appointment_time && (
                <>
                  {Intl.DateTimeFormat('en-GB').format(new Date(doc.appointment_time))}<br />
                  {new Date(doc.appointment_time).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}
                </>
              )}
            </td>
            <td className="py-1 px-2">{doc.toil_details}</td>
            <td className="py-1 px-2">
                  <select
                    value={doc.authorised}
                    onChange={(e) => handleStatusChange(doc.$id, e.target.value)}
                    className="text-xs border rounded px-1 py-0.5"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Authorised">Authorised</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </td>
          </tr>
        )
      })}
    </tbody>
  </table>
  </div>
)}
</div>
  
</div>

  )
}

export default AdminAbsence