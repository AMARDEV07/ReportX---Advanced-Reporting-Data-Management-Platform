import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { showToast } from '../../shared/utils/toast';
import { userService } from '../services/userService';
import { roleService } from '../services/roleService';
import { userRoleService } from '../services/userRoleService';
import ConfirmModal from '../components/common/ConfirmModal';

const UserRoles = () => {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        userId: '',
        roleId: '',
        status: 'Active'
    });

    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [userRoles, setUserRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isViewing, setIsViewing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    // Selected details for display
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);

    // Search, Sort, Pagination state
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState('id');
    const [sortDirection, setSortDirection] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [usersData, rolesData, userRolesData] = await Promise.all([
                userService.getUsers(),
                roleService.getRoles(),
                userRoleService.getUserRoles()
            ]);
            setUsers(usersData);
            setRoles(rolesData);
            setUserRoles(userRolesData);
        } catch (error) {
            showToast('error', 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Resolve userName and roleName from IDs
    const getUserName = (userId) => {
        const user = users.find(u => u.id === parseInt(userId));
        return user ? user.fullName : 'Unknown User';
    };

    const getUserEmail = (userId) => {
        const user = users.find(u => u.id === parseInt(userId));
        return user ? user.email : '-';
    };

    const getRoleName = (roleId) => {
        const role = roles.find(r => r.id === parseInt(roleId));
        return role ? role.name : 'Unknown Role';
    };

    // Handle user selection - show details
    const handleUserChange = (e) => {
        const userId = e.target.value;
        setFormData(prev => ({ ...prev, userId }));

        if (userId) {
            const user = users.find(u => u.id === parseInt(userId));
            setSelectedUser(user || null);
        } else {
            setSelectedUser(null);
        }
    };

    // Handle role selection - show details
    const handleRoleChange = (e) => {
        const roleId = e.target.value;
        setFormData(prev => ({ ...prev, roleId }));

        if (roleId) {
            const role = roles.find(r => r.id === parseInt(roleId));
            setSelectedRole(role || null);
        } else {
            setSelectedRole(null);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.userId || !formData.roleId) {
            showToast('error', 'Please select both User and Role');
            return;
        }

        setLoading(true);
        try {
            const assignmentData = {
                userId: parseInt(formData.userId),
                roleId: parseInt(formData.roleId),
                status: formData.status
            };

            if (isEditing) {
                await userRoleService.updateAssignment(editId, assignmentData);
                setUserRoles(userRoles.map(ur => ur.id === editId ? { ...assignmentData, id: editId } : ur));
                showToast('success', 'Role assignment updated!');
            } else {
                const newAssignment = await userRoleService.assignRole(assignmentData);
                setUserRoles([...userRoles, newAssignment]);
                showToast('success', 'Role assigned successfully!');
            }
            resetForm();
        } catch (error) {
            showToast('error', 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ userId: '', roleId: '', status: 'Active' });
        setSelectedUser(null);
        setSelectedRole(null);
        setIsEditing(false);
        setIsViewing(false);
        setEditId(null);
        setShowForm(false);
    };

    const handleEdit = (ur) => {
        setFormData({
            userId: ur.userId,
            roleId: ur.roleId,
            status: ur.status
        });
        setSelectedUser(users.find(u => u.id === parseInt(ur.userId)) || null);
        setSelectedRole(roles.find(r => r.id === parseInt(ur.roleId)) || null);
        setIsEditing(true);
        setIsViewing(false);
        setEditId(ur.id);
        setShowForm(true);
    };

    const handleView = (ur) => {
        setFormData({
            userId: ur.userId,
            roleId: ur.roleId,
            status: ur.status
        });
        setSelectedUser(users.find(u => u.id === parseInt(ur.userId)) || null);
        setSelectedRole(roles.find(r => r.id === parseInt(ur.roleId)) || null);
        setIsViewing(true);
        setIsEditing(false);
        setEditId(ur.id);
        setShowForm(true);
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        setLoading(true);
        try {
            await userRoleService.deleteAssignment(deleteId);
            setUserRoles(userRoles.filter(ur => ur.id !== deleteId));
            showToast('success', 'Role assignment removed!');
        } catch (error) {
            showToast('error', 'Deletion failed');
        } finally {
            setLoading(false);
            setShowDeleteModal(false);
            setDeleteId(null);
        }
    };

    // Sort handler
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    // Sort icon
    const getSortIcon = (field) => {
        if (sortField !== field) return <i className="ri-arrow-up-down-line ms-1 text-muted opacity-50"></i>;
        return sortDirection === 'asc'
            ? <i className="ri-arrow-up-s-line ms-1 text-primary"></i>
            : <i className="ri-arrow-down-s-line ms-1 text-primary"></i>;
    };

    // Filtered + Sorted data
    const processedData = useMemo(() => {
        let filtered = userRoles;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = userRoles.filter(ur =>
                getUserName(ur.userId).toLowerCase().includes(q) ||
                getUserEmail(ur.userId).toLowerCase().includes(q) ||
                getRoleName(ur.roleId).toLowerCase().includes(q) ||
                ur.status.toLowerCase().includes(q)
            );
        }

        const sorted = [...filtered].sort((a, b) => {
            let valA, valB;
            if (sortField === 'userName') {
                valA = getUserName(a.userId).toLowerCase();
                valB = getUserName(b.userId).toLowerCase();
            } else if (sortField === 'email') {
                valA = getUserEmail(a.userId).toLowerCase();
                valB = getUserEmail(b.userId).toLowerCase();
            } else if (sortField === 'roleName') {
                valA = getRoleName(a.roleId).toLowerCase();
                valB = getRoleName(b.roleId).toLowerCase();
            } else if (sortField === 'status') {
                valA = a.status.toLowerCase();
                valB = b.status.toLowerCase();
            } else {
                valA = a[sortField];
                valB = b[sortField];
            }
            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userRoles, users, roles, searchQuery, sortField, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(processedData.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUserRoles = processedData.slice(indexOfFirstItem, indexOfLastItem);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    return (
        <DashboardLayout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">User Roles Assignment</h4>
                <button
                    className="btn btn-primary d-flex align-items-center"
                    onClick={() => {
                        if (showForm && (isEditing || isViewing)) {
                            resetForm();
                        } else {
                            setShowForm(!showForm);
                            setIsEditing(false);
                            setIsViewing(false);
                        }
                    }}
                >
                    <i className={showForm && !(isEditing || isViewing) ? "ri-close-line me-1" : "ri-add-line me-1"}></i>
                    {showForm && !(isEditing || isViewing) ? "Cancel" : "Assign Role"}
                </button>
            </div>

            {showForm && (
                <div className="card mb-4 shadow-sm border-0 animate__animated animate__fadeInDown">
                    <div className="card-header d-flex justify-content-between align-items-center bg-transparent border-bottom">
                        <h5 className="mb-0">
                            {isViewing ? 'View Assignment' : isEditing ? 'Edit Assignment' : 'New Role Assignment'}
                        </h5>
                        <button type="button" className="btn-close" onClick={resetForm}></button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row g-4">
                                {/* User Dropdown */}
                                <div className="col-md-4">
                                    <label className="form-label">Select User</label>
                                    <select
                                        className="form-select"
                                        name="userId"
                                        value={formData.userId}
                                        onChange={handleUserChange}
                                        disabled={isViewing}
                                    >
                                        <option value="">-- Select User --</option>
                                        {users.map(user => (
                                            <option key={user.id} value={user.id}>{user.fullName}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Role Dropdown */}
                                <div className="col-md-4">
                                    <label className="form-label">Select Role</label>
                                    <select
                                        className="form-select"
                                        name="roleId"
                                        value={formData.roleId}
                                        onChange={handleRoleChange}
                                        disabled={isViewing}
                                    >
                                        <option value="">-- Select Role --</option>
                                        {roles.map(role => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status */}
                                <div className="col-md-4">
                                    <label className="form-label">Status</label>
                                    <select
                                        className="form-select"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        disabled={isViewing}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            {/* Auto-populated Details Section */}
                            {(selectedUser || selectedRole) && (
                                <div className="row g-4 mt-1">
                                    {selectedUser && (
                                        <div className="col-md-6">
                                            <div className="card h-100 bg-label-primary border-0 shadow-none">
                                                <div className="card-body py-3 px-4">
                                                    <div className="d-flex align-items-center mb-2">
                                                        <i className="ri-user-settings-line me-2 ri-xl"></i>
                                                        <small className="text-uppercase fw-bold letter-spacing-05">User Details</small>
                                                    </div>
                                                    <div className="d-flex flex-column gap-2 ms-1">
                                                        <span className="fw-semibold"><i className="ri-user-line me-1 text-primary"></i> {selectedUser.fullName}</span>
                                                        <span className="text-muted small"><i className="ri-mail-line me-1 text-primary"></i> {selectedUser.email}</span>
                                                        <span className="text-muted small"><i className="ri-phone-line me-1 text-primary"></i> {selectedUser.mobileNo}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {selectedRole && (
                                        <div className="col-md-6">
                                            <div className="card h-100 bg-label-info border-0 shadow-none">
                                                <div className="card-body py-3 px-4">
                                                    <div className="d-flex align-items-center mb-2">
                                                        <i className="ri-shield-user-line me-2 ri-xl"></i>
                                                        <small className="text-uppercase fw-bold letter-spacing-05">Role Details</small>
                                                    </div>
                                                    <div className="d-flex flex-column gap-2 ms-1">
                                                        <span className="fw-semibold"><i className="ri-shield-line me-1 text-info"></i> {selectedRole.name}</span>
                                                        <span className="text-muted small"><i className="ri-code-line me-1 text-info"></i> Code: {selectedRole.code}</span>
                                                        <span className="text-muted small"><i className="ri-building-line me-1 text-info"></i> Tenant: {selectedRole.tenant}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="row g-3">
                                <div className="col-12 text-end mt-4">
                                    <hr className="my-2" />
                                    {!isViewing ? (
                                        <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                                            {loading ? (
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                            ) : (
                                                <i className={isEditing ? "ri-save-line me-1" : "ri-add-line me-1"}></i>
                                            )}
                                            {isEditing ? 'Update Assignment' : 'Assign Role'}
                                        </button>
                                    ) : (
                                        <button type="button" className="btn btn-label-primary px-4" onClick={() => { setIsViewing(false); setIsEditing(true); }}>
                                            <i className="ri-edit-line me-1"></i> Edit Mode
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="card shadow-sm border-0">
                {/* Search Bar */}
                <div className="card-header border-bottom d-flex justify-content-between align-items-center py-3" style={{ backgroundColor: '#f5f5f9' }}>
                    <small className="text-muted">
                        Showing {processedData.length > 0 ? indexOfFirstItem + 1 : 0}-{Math.min(indexOfLastItem, processedData.length)} of {processedData.length} assignments
                    </small>
                    <div className="d-flex align-items-center">
                        <div className="position-relative">
                            <i className="ri-search-line position-absolute text-secondary" style={{ left: '10px', top: '50%', transform: 'translateY(-50%)' }}></i>
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Search assignments..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ width: '220px', paddingLeft: '32px' }}
                            />
                        </div>
                    </div>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="px-4" style={{ cursor: 'pointer', width: '90px' }} onClick={() => handleSort('id')}>
                                        <div className="d-flex align-items-center gap-1">
                                            S.No {getSortIcon('id')}
                                        </div>
                                    </th>
                                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('userName')}>
                                        <div className="d-flex align-items-center gap-1">
                                            User Name {getSortIcon('userName')}
                                        </div>
                                    </th>
                                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('email')}>
                                        <div className="d-flex align-items-center gap-1">
                                            Email {getSortIcon('email')}
                                        </div>
                                    </th>
                                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('roleName')}>
                                        <div className="d-flex align-items-center gap-1">
                                            Role Name {getSortIcon('roleName')}
                                        </div>
                                    </th>
                                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('status')}>
                                        <div className="d-flex align-items-center gap-1">
                                            Status {getSortIcon('status')}
                                        </div>
                                    </th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && userRoles.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status"></div>
                                        </td>
                                    </tr>
                                ) : currentUserRoles.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5 text-muted">
                                            {searchQuery ? 'No assignments match your search.' : 'No assignments found.'}
                                        </td>
                                    </tr>
                                ) : (
                                    currentUserRoles.map((ur, index) => (
                                        <tr key={ur.id}>
                                            <td className="px-4 text-muted">{indexOfFirstItem + index + 1}</td>
                                            <td><strong>{getUserName(ur.userId)}</strong></td>
                                            <td>{getUserEmail(ur.userId)}</td>
                                            <td><span className="badge bg-label-info">{getRoleName(ur.roleId)}</span></td>
                                            <td>
                                                <span className={`badge rounded-pill ${ur.status === 'Active' ? 'bg-label-success' : 'bg-label-secondary'}`}>
                                                    {ur.status}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <div className="dropdown">
                                                    <button
                                                        type="button"
                                                        className="btn btn-icon btn-text-secondary rounded-pill dropdown-toggle hide-arrow"
                                                        data-bs-toggle="dropdown"
                                                        aria-expanded="false"
                                                    >
                                                        <i className="icon-base ri ri-more-2-fill icon-lg"></i>
                                                    </button>
                                                    <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0">
                                                        <li>
                                                            <button className="dropdown-item d-flex align-items-center" onClick={() => handleView(ur)}>
                                                                <i className="ri-eye-line me-2 text-secondary"></i> View
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button className="dropdown-item d-flex align-items-center" onClick={() => handleEdit(ur)}>
                                                                <i className="ri-edit-line me-2 text-secondary"></i> Edit
                                                            </button>
                                                        </li>
                                                        <li><hr className="dropdown-divider" /></li>
                                                        <li>
                                                            <button className="dropdown-item d-flex align-items-center" onClick={() => handleDeleteClick(ur.id)}>
                                                                <i className="ri-delete-bin-line me-2 text-secondary"></i> Delete
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="card-footer border-top bg-transparent py-3">
                        <nav aria-label="Page navigation">
                            <ul className="pagination justify-content-center mb-0">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(prev => prev - 1)}>Previous</button>
                                </li>
                                {[...Array(totalPages)].map((_, i) => (
                                    <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                        <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                                    </li>
                                ))}
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>

            <ConfirmModal
                show={showDeleteModal}
                title="Remove Assignment"
                message="Are you sure you want to remove this role assignment?"
                onConfirm={handleDeleteConfirm}
                onCancel={() => { setShowDeleteModal(false); setDeleteId(null); }}
                loading={loading}
                confirmText="Remove"
            />
        </DashboardLayout>
    );
};

export default UserRoles;
