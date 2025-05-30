import React from 'react';

const Form = () => {
  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white shadow-lg rounded-2xl p-8 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Absence Request Form</h2>
      <form className="space-y-4">

        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input placeholder="Name" className="w-full mt-1 p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Department</label>
          <input placeholder="Department" className="w-full mt-1 p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Absence Start</label>
          <input type="datetime-local" className="w-full mt-1 p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Absence End</label>
          <input type="datetime-local" className="w-full mt-1 p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Reason for Absence</label>
          <input placeholder="Reason" className="w-full mt-1 p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {['P1', 'P2', 'P3', 'P4', 'P5', 'P6'].map(period => (
            <div key={period} className="flex items-center space-x-2">
              <input type="checkbox" name={period.toLowerCase()} value={period.toLowerCase()} className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
              <label className="text-sm text-gray-700">{period} Cover Required?</label>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Break Duty</label>
          <select name="Break" className="w-full mt-1 p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select...</option>
            <option value="Break 1">Break 1</option>
            <option value="Break 2">Break 2</option>
            <option value="Break 1 & 2">Break 1 & 2</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Staff covering break duty</label>
          <input className="w-full mt-1 p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Appointment Time (if medical)</label>
          <input type="datetime-local" className="w-full mt-1 p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">How was TOIL acquired?</label>
          <input className="w-full mt-1 p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-700 transition"
        >
          Submit Request
        </button>
      </form>
    </div>
  );
};

export default Form;
