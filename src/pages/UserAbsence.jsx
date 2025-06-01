import React, { useEffect, useState } from 'react'
import db from '../appwrite/databases'

const UserAbsence = () => {
  const [absence, setAbsence] = useState([])

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    try {
      const response = await db["Leave of Absence Request Collection"].list()
      setAbsence(response.documents)
    } catch (err) {
      console.error("Failed to fetch absences", err)
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Your Leave of Absence Requests</h2>

      {absence.length === 0 ? (
        <p className="text-gray-500">No absence records found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-xl overflow-hidden">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Reason</th>
              </tr>
            </thead>
            <tbody>
              {absence.map((doc) => (
                <tr key={doc.$id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">{doc.name}</td>
                  <td className="py-3 px-4">{doc.date}</td>
                  <td className="py-3 px-4">{doc.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default UserAbsence
