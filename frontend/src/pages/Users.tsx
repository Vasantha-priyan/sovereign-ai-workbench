import React from 'react';
import { Users as UsersIcon, Shield } from 'lucide-react';

export const UsersView: React.FC = () => {
  const usersList = [
    {
      id: '1',
      name: 'Rajesh Verma',
      email: 'admin@abc-industrial.in',
      role: 'Administrator',
      department: 'Plant Operations & Governance',
      status: 'Active'
    },
    {
      id: '2',
      name: 'Ananya Sharma',
      email: 'engineer@abc-industrial.in',
      role: 'Engineer',
      department: 'Refinery Unit 4B Safety',
      status: 'Active'
    },
    {
      id: '3',
      name: 'Vikramaditya Rao',
      email: 'auditor@abc-industrial.in',
      role: 'Auditor',
      department: 'PSU Compliance & Security Audit',
      status: 'Active'
    },
    {
      id: '4',
      name: 'Suresh Kumar',
      email: 'reviewer@abc-industrial.in',
      role: 'Reviewer',
      department: 'General Manager Engineering Review',
      status: 'Active'
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Administration</h2>
          <p className="text-xs text-slate-500">Enterprise role-based access control (RBAC), user accounts, and department permissions.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="p-3">User Name</th>
              <th className="p-3">Email Address</th>
              <th className="p-3">Role Scope</th>
              <th className="p-3">Department</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-700">
            {usersList.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">{user.name}</td>
                <td className="p-3 font-mono text-slate-600">{user.email}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-900 rounded font-semibold text-[10px]">
                    {user.role}
                  </span>
                </td>
                <td className="p-3 text-slate-600">{user.department}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold">
                    {user.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
