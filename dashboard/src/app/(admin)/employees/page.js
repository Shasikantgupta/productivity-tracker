'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../../components/Sidebar';
import Header from '../../../components/Header';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Demo data
    setEmployees([
      { id: '1', employee_code: 'EMP001', first_name: 'Sarah', last_name: 'Chen', designation: 'Senior Developer', department: 'Engineering', status: 'active', productivity: 87, online: true },
      { id: '2', employee_code: 'EMP002', first_name: 'Mike', last_name: 'Johnson', designation: 'UI/UX Designer', department: 'Design', status: 'active', productivity: 79, online: true },
      { id: '3', employee_code: 'EMP003', first_name: 'Priya', last_name: 'Sharma', designation: 'Backend Engineer', department: 'Engineering', status: 'active', productivity: 92, online: false },
      { id: '4', employee_code: 'EMP004', first_name: 'James', last_name: 'Wilson', designation: 'Marketing Manager', department: 'Marketing', status: 'active', productivity: 71, online: true },
      { id: '5', employee_code: 'EMP005', first_name: 'Anna', last_name: 'Park', designation: 'DevOps Engineer', department: 'Engineering', status: 'active', productivity: 88, online: true },
      { id: '6', employee_code: 'EMP006', first_name: 'David', last_name: 'Lee', designation: 'Product Manager', department: 'Product', status: 'on_leave', productivity: 0, online: false },
      { id: '7', employee_code: 'EMP007', first_name: 'Maria', last_name: 'Garcia', designation: 'QA Lead', department: 'Engineering', status: 'active', productivity: 84, online: true },
      { id: '8', employee_code: 'EMP008', first_name: 'Alex', last_name: 'Turner', designation: 'Data Analyst', department: 'Analytics', status: 'active', productivity: 76, online: false },
    ]);
    setLoading(false);
  }, []);

  const filtered = employees.filter((e) =>
    `${e.first_name} ${e.last_name} ${e.employee_code} ${e.department}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const getProductivityColor = (score) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    if (score > 0) return 'var(--danger)';
    return 'var(--text-muted)';
  };

  return (
    <div className="app-layout">
      <Sidebar activePage="employees" />
      <div className="main-content">
        <Header title="Employees" subtitle={`${employees.length} total employees`} />

        {/* Search & Actions */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '24px',
        }}>
          <input
            type="text"
            placeholder="🔍 Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '12px 18px', borderRadius: '12px',
              border: '1px solid var(--border)',
              background: 'var(--bg-input)', color: 'var(--text-primary)',
              fontSize: '14px', width: '320px', outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-outline" style={{ fontSize: '13px', padding: '10px 16px' }}>
              📥 Export CSV
            </button>
            <button className="btn btn-primary" style={{ fontSize: '13px', padding: '10px 16px' }}>
              + Add Employee
            </button>
          </div>
        </div>

        {/* Employee Table */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Code</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Status</th>
                <th>Productivity</th>
                <th>Online</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => (
                <tr key={emp.id} style={{ cursor: 'pointer' }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: 700, color: 'white',
                      }}>
                        {emp.first_name[0]}{emp.last_name[0]}
                      </div>
                      <span style={{ fontWeight: 600 }}>
                        {emp.first_name} {emp.last_name}
                      </span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{emp.employee_code}</td>
                  <td>{emp.department}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{emp.designation}</td>
                  <td>
                    <span className={`badge ${emp.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                      {emp.status === 'active' ? '● Active' : '○ On Leave'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '60px', height: '6px', borderRadius: '3px',
                        background: 'rgba(99, 102, 241, 0.1)',
                      }}>
                        <div style={{
                          height: '100%', borderRadius: '3px',
                          width: `${emp.productivity}%`,
                          background: getProductivityColor(emp.productivity),
                          transition: 'width 0.8s ease',
                        }} />
                      </div>
                      <span style={{
                        fontSize: '13px', fontWeight: 700,
                        color: getProductivityColor(emp.productivity),
                      }}>
                        {emp.productivity > 0 ? `${emp.productivity}%` : '-'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`online-dot ${emp.online ? 'active' : 'offline'}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
