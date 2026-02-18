import { apiRequest } from './apiHelper';

/**
 * Module Service
 * Provides module groups and sub-modules with permissions data
 * API Endpoints (for when real API is ready):
 *   GET    /modules              - List all module groups with sub-modules
 *   GET    /user-modules/:userId - Get module permissions for a user
 *   POST   /user-modules         - Save module permissions for a user
 */

const MOCK_MODULE_GROUPS = [
    {
        id: 1,
        name: 'ReportX Hub',
        subModules: [
            { id: 101, name: 'Dashboard' },
            { id: 102, name: 'Reports' },
            { id: 103, name: 'Charts' }
        ]
    },
    {
        id: 2,
        name: 'Master Data',
        subModules: [
            { id: 201, name: 'Company' },
            { id: 202, name: 'Third Party Company' },
            { id: 203, name: 'Designation' },
            { id: 204, name: 'Department' },
            { id: 205, name: 'Process' },
            { id: 206, name: 'Holiday' }
        ]
    },
    {
        id: 3,
        name: 'Access Control',
        subModules: [
            { id: 301, name: 'Users' },
            { id: 302, name: 'Roles' },
            { id: 303, name: 'User Roles' },
            { id: 304, name: 'Modules' }
        ]
    }
];

// Permissions: Add, Edit, Delete, Change Status
const PERMISSION_TYPES = ['Add', 'Edit', 'Delete', 'Change Status'];

// Mock saved permissions for all users
// Mock saved permissions for all users
// Try to load from localStorage first for persistence
const STORAGE_KEY = 'reportx_mock_user_permissions';
let MOCK_USER_PERMISSIONS = {};

try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        MOCK_USER_PERMISSIONS = JSON.parse(stored);
    } else {
        // Default mock data if nothing in storage
        MOCK_USER_PERMISSIONS = {
            1: {
                101: { Add: true, Edit: true, Delete: true, 'Change Status': true },
                102: { Add: true, Edit: true, Delete: true, 'Change Status': true },
                103: { Add: true, Edit: true, Delete: true, 'Change Status': true },
                201: { Add: true, Edit: true, Delete: true, 'Change Status': true },
                202: { Add: true, Edit: true, Delete: true, 'Change Status': true },
                203: { Add: true, Edit: true, Delete: true, 'Change Status': true },
                204: { Add: true, Edit: true, Delete: true, 'Change Status': true },
                205: { Add: true, Edit: true, Delete: true, 'Change Status': true },
                206: { Add: true, Edit: true, Delete: true, 'Change Status': true },
                301: { Add: true, Edit: true, Delete: true, 'Change Status': true },
                302: { Add: true, Edit: true, Delete: true, 'Change Status': true },
                303: { Add: true, Edit: true, Delete: true, 'Change Status': true },
                304: { Add: true, Edit: true, Delete: true, 'Change Status': true },
            },
            2: {
                101: { Add: true, Edit: true, Delete: false, 'Change Status': false },
                102: { Add: true, Edit: true, Delete: false, 'Change Status': false },
                201: { Add: true, Edit: true, Delete: true, 'Change Status': true },
                202: { Add: true, Edit: true, Delete: true, 'Change Status': true },
                203: { Add: true, Edit: true, Delete: true, 'Change Status': true },
            },
            3: {
                101: { Add: true, Edit: false, Delete: false, 'Change Status': false },
                102: { Add: true, Edit: false, Delete: false, 'Change Status': false },
                103: { Add: true, Edit: false, Delete: false, 'Change Status': false },
            }
        };
        // Save initial default to storage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_USER_PERMISSIONS));
    }
} catch (e) {
    console.error('Failed to access localStorage', e);
}

// Helper: get all sub-module names map for quick lookup
const SUB_MODULE_MAP = {};
MOCK_MODULE_GROUPS.forEach(group => {
    group.subModules.forEach(sm => {
        SUB_MODULE_MAP[sm.id] = sm.name;
    });
});

export const moduleService = {
    getModuleGroups: () =>
        apiRequest('/modules', 'GET', null, () => JSON.parse(JSON.stringify(MOCK_MODULE_GROUPS))),

    getPermissionTypes: () => PERMISSION_TYPES,

    getUserPermissions: (userId) =>
        apiRequest(`/user-modules/${userId}`, 'GET', null, () => {
            const perms = MOCK_USER_PERMISSIONS[userId];
            return perms ? JSON.parse(JSON.stringify(perms)) : {};
        }),

    saveUserPermissions: (userId, permissions) =>
        apiRequest('/user-modules', 'POST', { userId, permissions }, () => {
            // Update mock data in memory and localStorage
            MOCK_USER_PERMISSIONS[userId] = JSON.parse(JSON.stringify(permissions));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_USER_PERMISSIONS));

            return { success: true, message: 'Permissions saved successfully' };
        }),

    /**
     * Get user-wise module list for ModuleList page
     * Returns array of { userId, moduleNames: string[] }
     * API Endpoint: GET /user-modules/list
     */
    getUserModuleList: () =>
        apiRequest('/user-modules/list', 'GET', null, () => {
            return Object.entries(MOCK_USER_PERMISSIONS).map(([userId, perms]) => {
                const moduleNames = Object.entries(perms)
                    .filter(([_, permObj]) => Object.values(permObj).some(val => val === true)) // Only include if at least one permission is true
                    .map(([subModId, _]) => SUB_MODULE_MAP[parseInt(subModId)])
                    .filter(Boolean);

                // Remove duplicates and return
                return {
                    userId: parseInt(userId),
                    moduleNames: [...new Set(moduleNames)]
                };
            }).filter(item => item.moduleNames.length > 0); // Only return users who have at least one module
        })
};