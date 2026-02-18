import { apiRequest } from './apiHelper';

/**
 * User Role Service
 * API Endpoints (for when real API is ready):
 *   GET    /user-roles      - List all user-role assignments
 *   POST   /user-roles      - Assign role to user
 *   PUT    /user-roles/:id  - Update assignment
 *   DELETE /user-roles/:id  - Remove assignment
 */

const MOCK_USER_ROLES = [
    { id: 1, userId: 1, roleId: 1, status: 'Active' },
    { id: 2, userId: 2, roleId: 2, status: 'Active' },
    { id: 3, userId: 3, roleId: 3, status: 'Inactive' }
];

export const userRoleService = {
    getUserRoles: () =>
        apiRequest('/user-roles', 'GET', null, () => [...MOCK_USER_ROLES]),

    assignRole: (assignmentData) =>
        apiRequest('/user-roles', 'POST', assignmentData, () => ({
            ...assignmentData,
            id: MOCK_USER_ROLES.length > 0 ? Math.max(...MOCK_USER_ROLES.map(ur => ur.id)) + 1 : 1
        })),

    updateAssignment: (id, assignmentData) =>
        apiRequest(`/user-roles/${id}`, 'PUT', assignmentData, () => ({ ...assignmentData, id })),

    deleteAssignment: (id) =>
        apiRequest(`/user-roles/${id}`, 'DELETE', null, () => true)
};
