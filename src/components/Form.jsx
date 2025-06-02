import React, { useEffect, useRef, useState } from 'react';
import db from '../appwrite/databases';


const Form = ({user}) => {
  const formRef = useRef(null)
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setFormData(prev => ({
          ...prev,
          name: user.name,
          email: user.email,
          userId: user.$id,
          authorised: 'Pending' // default enum value
        }))
      } catch (err) {
        console.error('Error fetching user', err)
        setError('Unable to load user info. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccess(false)
    setError(null)

    try {
      const payload = {
        ...formData,
        authorised: 'Pending',
        absence_start: new Date(formData.absence_start).toISOString(),
        absence_end: new Date(formData.absence_end).toISOString(),
        appointment_time: formData.appointment_time
        ? new Date(formData.appointment_time).toISOString()
        : undefined,
      }
      await db['Leave of Absence Request Collection'].create(payload)
      setSuccess(true)
      setFormData({ 
        ...formData, 
        reason: '', 
        department: '', 
        absence_start: '', 
        absence_end: '', 
        break_cover: '',
        staff_cover_break: '', 
        toil_details: '', 
        appointment_time: '', 
        cover_p1: false, 
        cover_p2: false, 
        cover_p3: false, 
        cover_p4: false, 
        cover_p5: false, 
        cover_p6: false })
      formRef.current.scrollIntoView({behaviour: 'smooth'})
    } catch (err) {
      console.error(err)
      setError('Failed to submit form')
    }
  }

  if (loading) return <p className='p-6'>Loading user info ...</p>

  return (
    <div ref={formRef} className="max-w-3xl mx-auto mt-10 bg-white shadow-lg rounded-2xl p-8 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Absence Request Form</h2>
      {success && <p className="text-green-600">Form submitted successfully!</p>}
      {error && <p className="text-red-600">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">

        <input name="name" value={formData.name || ''} readOnly hidden />
        <input name="email" value={formData.email || ''} readOnly hidden />
        <input name="userId" value={formData.userId || ''} readOnly hidden />

        <div>
          <label className="block text-sm font-medium text-gray-700">Name: </label>
          <p>{formData.name ? formData.name : ''}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">email: </label>
          <p>{formData.email ? formData.email : ''}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Department</label>
          <input name="department" value={formData.department || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Absence Start</label>
          <input type="datetime-local" name="absence_start" value={formData.absence_start || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Absence End</label>
          <input type="datetime-local" name="absence_end" value={formData.absence_end || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Reason for Absence</label>
          <input name="reason" value={formData.reason || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" required />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="flex items-center space-x-2">
              <input
                type="checkbox"
                name={`cover_p${i}`}
                checked={formData[`cover_p${i}`] || false}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600"
              />
              <label className="text-sm text-gray-700">P{i} Cover Required?</label>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Break Duty</label>
          <select name="break_cover" value={formData.break_cover || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md">
            <option value="">Select...</option>
            <option value="Break 1">Break 1</option>
            <option value="Break 2">Break 2</option>
            <option value="Break 1 & 2">Break 1 & 2</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Staff Covering Break Duty</label>
          <input name="staff_cover_break" value={formData.staff_cover_break || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Appointment Time (if medical)</label>
          <input type="datetime-local" name="appointment_time" value={formData.appointment_time || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">How was TOIL acquired?</label>
          <input name="toil_details" value={formData.toil_details || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-700 transition">
          Submit Request
        </button>
      </form>
    </div>
  )
}

export default Form;
