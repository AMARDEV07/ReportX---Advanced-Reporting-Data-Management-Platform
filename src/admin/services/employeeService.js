import { apiRequest } from './apiHelper';

/**
 * Employee Service
 * API Endpoints (for when real API is ready):
 *   GET    /employees      - List all employees
 *   GET    /employees/:id  - Get employee by ID
 */

const MOCK_EMPLOYEES = [
    { id: 1, fullName: 'John Doe', email: 'john.doe@bharatloan.com', mobileNo: '9876543210', designation: 'Loan Officer', status: 'Active' },
    { id: 2, fullName: 'Jane Smith', email: 'jane.smith@bharatloan.com', mobileNo: '9876543211', designation: 'Branch Manager', status: 'Active' },
    { id: 3, fullName: 'Robert Brown', email: 'robert.brown@bharatloan.com', mobileNo: '9876543212', designation: 'Auditor', status: 'Inactive' },
    { id: 4, fullName: 'Emily Davis', email: 'emily.davis@bharatloan.com', mobileNo: '9876543213', designation: 'Sales Exec', status: 'Active' }
];

export const employeeService = {
    getEmployees: () =>
        apiRequest('/employees', 'GET', null, () => [...MOCK_EMPLOYEES]),

    getEmployeeById: (id) =>
        apiRequest(`/employees/${id}`, 'GET', null, () => MOCK_EMPLOYEES.find(e => e.id === id) || null)
};
