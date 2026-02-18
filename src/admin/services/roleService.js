import { apiRequest } from './apiHelper';


/**
 * Role Service
 * API Endpoints (for when real API is ready):
 *   GET    /roles      - List all roles
 *   GET    /roles/:id  - Get role by ID
 *   POST   /roles      - Create role
 *   PUT    /roles/:id  - Update role
 *   DELETE /roles/:id  - Delete role
 */



const MOCK_ROLES = [
    { id: 1, name: 'Super Admin', code: 'SA', tenant: 'BharatLoan', status: 'Active' },
    { id: 2, name: 'Admin', code: 'ADM', tenant: 'BharatLoan', status: 'Active' },
    { id: 3, name: 'User', code: 'USR', tenant: 'BharatLoan', status: 'Inactive' },
    { id: 4, name: 'Audit', code: 'AUD', tenant: 'BharatLoan', status: 'Active' },
    { id: 5, name: 'Admin', code: 'ADM', tenant: 'Rupee112', status: 'Active' },
    { id: 6, name: 'User', code: 'USR', tenant: 'Rupee112', status: 'Active' },
    { id: 7, name: 'Manager', code: 'MGR', tenant: 'Rupee112', status: 'Inactive' },
    { id: 8, name: 'Super Admin', code: 'SA', tenant: 'VimanoTech', status: 'Active' },
    { id: 9, name: 'User', code: 'USR', tenant: 'VimanoTech', status: 'Active' },
    { id: 10, name: 'Admin', code: 'ADM', tenant: 'FinServe', status: 'Inactive' },
    { id: 11, name: 'Super Admin', code: 'SA', tenant: 'BharatLoan', status: 'Active' },
    { id: 12, name: 'Admin', code: 'ADM', tenant: 'BharatLoan', status: 'Active' },
    { id: 13, name: 'User', code: 'USR', tenant: 'BharatLoan', status: 'Inactive' },
    { id: 14, name: 'Audit', code: 'AUD', tenant: 'BharatLoan', status: 'Active' },
    { id: 15, name: 'Admin', code: 'ADM', tenant: 'Rupee112', status: 'Active' },
    { id: 16, name: 'User', code: 'USR', tenant: 'Rupee112', status: 'Active' },
    { id: 17, name: 'Manager', code: 'MGR', tenant: 'Rupee112', status: 'Inactive' },
    { id: 18, name: 'Super Admin', code: 'SA', tenant: 'VimanoTech', status: 'Active' },
    { id: 19, name: 'User', code: 'USR', tenant: 'VimanoTech', status: 'Active' },
    { id: 20, name: 'Admin', code: 'ADM', tenant: 'FinServe', status: 'Inactive' },
    { id: 21, name: 'Super Admin', code: 'SA', tenant: 'BharatLoan', status: 'Active' },
    { id: 22, name: 'Admin', code: 'ADM', tenant: 'BharatLoan', status: 'Active' },
    { id: 23, name: 'User', code: 'USR', tenant: 'BharatLoan', status: 'Inactive' },
    { id: 24, name: 'Audit', code: 'AUD', tenant: 'BharatLoan', status: 'Active' },
    { id: 25, name: 'Admin', code: 'ADM', tenant: 'Rupee112', status: 'Active' },
    { id: 26, name: 'User', code: 'USR', tenant: 'Rupee112', status: 'Active' },
    { id: 27, name: 'Manager', code: 'MGR', tenant: 'Rupee112', status: 'Inactive' },
    { id: 28, name: 'Super Admin', code: 'SA', tenant: 'VimanoTech', status: 'Active' },
    { id: 29, name: 'User', code: 'USR', tenant: 'VimanoTech', status: 'Active' },
    { id: 30, name: 'Admin', code: 'ADM', tenant: 'FinServe', status: 'Inactive' }
];

export const roleService = {
    getRoles: () =>
        apiRequest('/roles', 'GET', null, () => [...MOCK_ROLES]),

    getRoleById: (id) =>
        apiRequest(`/roles/${id}`, 'GET', null, () => MOCK_ROLES.find(r => r.id === id) || null),

    addRole: (roleData) =>
        apiRequest('/roles', 'POST', roleData, () => ({
            ...roleData,
            id: MOCK_ROLES.length > 0 ? Math.max(...MOCK_ROLES.map(r => r.id)) + 1 : 1
        })),

    updateRole: (id, roleData) =>
        apiRequest(`/roles/${id}`, 'PUT', roleData, () => ({ ...roleData, id })),

    deleteRole: (id) =>
        apiRequest(`/roles/${id}`, 'DELETE', null, () => true)
};
