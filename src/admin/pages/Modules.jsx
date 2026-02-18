import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { moduleService } from '../services/modulesService';
import { userService } from '../services/userService';
import { showToast } from '../../shared/utils/toast';

const Modules = () => {
    const { id } = useParams(); // Optional: if coming from /view-module/:id route
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(id || '');
    const [moduleGroups, setModuleGroups] = useState([]);
    const [permissions, setPermissions] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const permissionTypes = moduleService.getPermissionTypes();

    // Fetch users and module groups
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [usersData, modulesData] = await Promise.all([
                userService.getUsers(),
                moduleService.getModuleGroups()
            ]);
            setUsers(usersData);
            setModuleGroups(modulesData);

            // If user ID from URL, auto-load their permissions
            if (id) {
                const perms = await moduleService.getUserPermissions(parseInt(id));
                setPermissions(perms);
            }
        } catch (error) {
            showToast('error', 'Failed to load data');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Handle user selection change
    const handleUserChange = async (e) => {
        const userId = e.target.value;
        setSelectedUserId(userId);

        if (userId) {
            setLoading(true);
            try {
                const perms = await moduleService.getUserPermissions(parseInt(userId));
                setPermissions(perms);
            } catch (error) {
                showToast('error', 'Failed to load user permissions');
            } finally {
                setLoading(false);
            }
        } else {
            setPermissions({});
        }
    };

    // Toggle individual permission
    const togglePermission = (subModuleId, permType) => {
        setPermissions(prev => {
            const current = prev[subModuleId] || {};
            return {
                ...prev,
                [subModuleId]: {
                    ...current,
                    [permType]: !current[permType]
                }
            };
        });
    };

    // Toggle all permissions for a sub-module
    const toggleSubModule = (subModuleId) => {
        const current = permissions[subModuleId] || {};
        const allChecked = permissionTypes.every(p => current[p]);

        setPermissions(prev => ({
            ...prev,
            [subModuleId]: permissionTypes.reduce((acc, p) => {
                acc[p] = !allChecked;
                return acc;
            }, {})
        }));
    };

    // Check if all permissions are checked for a sub-module
    const isSubModuleChecked = (subModuleId) => {
        const current = permissions[subModuleId] || {};
        return permissionTypes.every(p => current[p]);
    };

    // Check if some permissions are checked for a sub-module
    const isSubModuleIndeterminate = (subModuleId) => {
        const current = permissions[subModuleId] || {};
        const checkedCount = permissionTypes.filter(p => current[p]).length;
        return checkedCount > 0 && checkedCount < permissionTypes.length;
    };

    // Toggle all sub-modules in a group
    const toggleGroup = (group) => {
        const allSubModulesChecked = group.subModules.every(sm => isSubModuleChecked(sm.id));

        setPermissions(prev => {
            const newPerms = { ...prev };
            group.subModules.forEach(sm => {
                newPerms[sm.id] = permissionTypes.reduce((acc, p) => {
                    acc[p] = !allSubModulesChecked;
                    return acc;
                }, {});
            });
            return newPerms;
        });
    };

    // Check if all sub-modules in a group are fully checked
    const isGroupChecked = (group) => {
        return group.subModules.every(sm => isSubModuleChecked(sm.id));
    };

    // Check if group is indeterminate
    const isGroupIndeterminate = (group) => {
        const checkedCount = group.subModules.filter(sm => isSubModuleChecked(sm.id)).length;
        const somePartial = group.subModules.some(sm => isSubModuleIndeterminate(sm.id));
        return (checkedCount > 0 && checkedCount < group.subModules.length) || somePartial;
    };



    // ... (existing state variables)

    // Save permissions
    const handleSave = async () => {
        if (!selectedUserId) {
            showToast('error', 'Please select a user first');
            return;
        }

        setSaving(true);
        try {
            await moduleService.saveUserPermissions(parseInt(selectedUserId), permissions);
            showToast('success', 'Module access saved successfully!');

            // Redirect to Module List after short delay to let toast show
            setTimeout(() => {
                navigate('/Login/admin/module-list');
            }, 1000);

        } catch (error) {
            showToast('error', 'Failed to save permissions');
        } finally {
            setSaving(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Module Access Management</h4>
            </div>

            {/* Main Card */}
            <div className="card shadow-sm border-0">
                <div className="card-header border-bottom py-3" style={{ backgroundColor: '#f5f5f9' }}>
                    <h5 className="mb-0 text-primary">
                        <i className="ri-shield-keyhole-line me-2"></i>
                        Manage User Permissions
                    </h5>
                </div>

                <div className="card-body">
                    {/* Username Dropdown */}
                    <div className="row mb-4">
                        <div className="col-md-5">
                            <label className="form-label fw-semibold">
                                User<span className="text-danger">*</span>
                            </label>
                            <select
                                className="form-select"
                                value={selectedUserId}
                                onChange={handleUserChange}
                            >
                                <option value="">-- Select User --</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.email.split('@')[0]} ({user.fullName})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {loading && (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    )}

                    {!loading && selectedUserId && moduleGroups.map(group => (
                        <div key={group.id} className="mb-4">
                            {/* Module Group Header */}
                            <div className="d-flex align-items-center py-2 px-3 rounded-top table-light border">
                                <div className="form-check mb-0">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={`group-${group.id}`}
                                        checked={isGroupChecked(group)}
                                        ref={el => {
                                            if (el) el.indeterminate = isGroupIndeterminate(group);
                                        }}
                                        onChange={() => toggleGroup(group)}
                                    />
                                    <label
                                        className="form-check-label fw-semibold ms-2"
                                        htmlFor={`group-${group.id}`}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {group.name}
                                    </label>
                                </div>
                            </div>

                            {/* Sub-Modules */}
                            <div className="border border-top-0 rounded-bottom">
                                {group.subModules.map((subModule, smIdx) => (
                                    <div
                                        key={subModule.id}
                                        className={`px-3 py-3 ${smIdx < group.subModules.length - 1 ? 'border-bottom' : ''}`}
                                    >
                                        {/* Sub-module name with master checkbox */}
                                        <div className="form-check mb-2">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id={`sub-${subModule.id}`}
                                                checked={isSubModuleChecked(subModule.id)}
                                                ref={el => {
                                                    if (el) el.indeterminate = isSubModuleIndeterminate(subModule.id);
                                                }}
                                                onChange={() => toggleSubModule(subModule.id)}
                                            />
                                            <label
                                                className="form-check-label fw-semibold"
                                                htmlFor={`sub-${subModule.id}`}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {subModule.name}
                                            </label>
                                        </div>

                                        {/* Permission checkboxes in a row */}
                                        <div className="row ms-4">
                                            {permissionTypes.map(permType => {
                                                const permId = `perm-${subModule.id}-${permType.replace(/\s/g, '')}`;
                                                const isChecked = permissions[subModule.id]?.[permType] || false;

                                                return (
                                                    <div key={permType} className="col-md-3 col-sm-6">
                                                        <div className="form-check">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id={permId}
                                                                checked={isChecked}
                                                                onChange={() => togglePermission(subModule.id, permType)}
                                                            />
                                                            <label
                                                                className="form-check-label"
                                                                htmlFor={permId}
                                                                style={{ cursor: 'pointer' }}
                                                            >
                                                                {subModule.name} {permType}
                                                            </label>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Save Button */}
                    {!loading && selectedUserId && (
                        <div className="text-end mt-4 mb-2">
                            <hr className="my-4" />
                            <button
                                className="btn btn-primary px-5 shadow-sm"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? (
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                ) : (
                                    <i className="ri-save-line me-1"></i>
                                )}
                                Save Module Access
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Modules;