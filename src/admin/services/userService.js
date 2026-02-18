import { apiRequest } from './apiHelper';

/**
 * User Service
 * API Endpoints (for when real API is ready):
 *   GET    /users      - List all users
 *   GET    /users/:id  - Get user by ID
 *   POST   /users      - Create user
 *   PUT    /users/:id  - Update user
 *   DELETE /users/:id  - Delete user
 */

const MOCK_USERS = [
    {
        id: 1,
        employeeId: 1,
        fullName: 'John Doe',
        mobileNo: '9876543210',
        email: 'john.doe@bharatloan.com',
        status: 'Active'
    },
    {
        id: 2,
        employeeId: 2,
        fullName: 'Jane Smith',
        mobileNo: '9876543211',
        email: 'jane.smith@bharatloan.com',
        status: 'Active'
    },
    {
        id: 3,
        employeeId: 4,
        fullName: 'Emily Davis',
        mobileNo: '9876543213',
        email: 'emily.davis@bharatloan.com',
        status: 'Inactive'
    }
];

export const userService = {
    getUsers: () =>
        apiRequest('/users', 'GET', null, () => [...MOCK_USERS]),

    getUserById: (id) =>
        apiRequest(`/users/${id}`, 'GET', null, () => MOCK_USERS.find(u => u.id === id) || null),

    addUser: (userData) =>
        apiRequest('/users', 'POST', userData, () => ({
            ...userData,
            id: MOCK_USERS.length > 0 ? Math.max(...MOCK_USERS.map(u => u.id)) + 1 : 1
        })),

    updateUser: (id, userData) =>
        apiRequest(`/users/${id}`, 'PUT', userData, () => ({ ...userData, id })),

    deleteUser: (id) =>
        apiRequest(`/users/${id}`, 'DELETE', null, () => true)
};
