import React, { useEffect, useState } from "react";
import db from '../appwrite/databases';
import { Query } from "appwrite";

const TeamAbsenceRequest = ({user, teamLeader}) => {
  const [absence, setAbsence] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbsences = async () => {
      try {
        const response = await db["Leave of Absence Request Collection"].list([
          Query.orderAsc("absence_start"),
          Query.limit(1000),
        ]);
        setAbsence(response.documents);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAbsences();
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!teamLeader) return <div>Access Denied</div>;

  const filteredTeamAbsence = absence.filter((doc) => doc.department.toLowerCase() === teamLeader);
  
  
  return (
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
      {filteredTeamAbsence.map((doc) => {
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
            <td className="py-1 px-2">{doc.authorised}</td>
          </tr>
        )
      })}
    </tbody>
  </table>
</div>

  )
}

export default TeamAbsenceRequest