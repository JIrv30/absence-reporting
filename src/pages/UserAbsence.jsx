import React, { useEffect, useState } from "react";
import db from '../appwrite/databases';
import { getUser } from '../appwrite/auth';

function AbsenceRequestTable({user}) {
  const [absence, setAbsence] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div>Loading...</div>;

  if (!user) return <div>No user logged in.</div>;

  // NOTE: Your user object from Appwrite's account.get() returns an 'id' property
  const filteredAbsence = absence.filter((doc) => doc.userId === user.$id);

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
          {filteredAbsence.length === 0 ? (
            <tr>
              <td colSpan="11" className="text-center py-4">
                No absence records found.
              </td>
            </tr>
          ) : (
            filteredAbsence.map((doc) => {
              const rowColor =
                doc.authorised === "Pending"
                  ? "bg-orange-100"
                  : doc.authorised === "Rejected"
                  ? "bg-red-100"
                  : doc.authorised === "Authorised"
                  ? "bg-green-100"
                  : "";

              return (
                <tr
                  key={doc.$id}
                  className={`border-t ${rowColor}`}
                >
                  <td className="py-1 px-2">{doc.name}</td>
                  <td className="py-1 px-2">{doc.department}</td>
                  <td className="py-1 px-2">
                    {Intl.DateTimeFormat("en-GB").format(
                      new Date(doc.absence_start)
                    )}{" "}
                    <br />
                    {new Date(doc.absence_start).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-1 px-2">
                    {Intl.DateTimeFormat("en-GB").format(
                      new Date(doc.absence_end)
                    )}{" "}
                    <br />
                    {new Date(doc.absence_end).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-1 px-2">
                    {[1, 2, 3, 4, 5, 6]
                      .map((i) => (doc[`cover_p${i}`] ? `P${i}✓ ` : ""))
                      .join(" ")}
                  </td>
                  <td className="py-1 px-2">{doc.reason}</td>
                  <td className="py-1 px-2">{doc.break_cover}</td>
                  <td className="py-1 px-2">{doc.staff_cover_break}</td>
                  <td className="py-1 px-2">
                    {doc.appointment_time && (
                      <>
                        {Intl.DateTimeFormat("en-GB").format(
                          new Date(doc.appointment_time)
                        )}
                        <br />
                        {new Date(doc.appointment_time).toLocaleTimeString(
                          "en-GB",
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </>
                    )}
                  </td>
                  <td className="py-1 px-2">{doc.toil_details}</td>
                  <td className="py-1 px-2">{doc.authorised}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AbsenceRequestTable;
