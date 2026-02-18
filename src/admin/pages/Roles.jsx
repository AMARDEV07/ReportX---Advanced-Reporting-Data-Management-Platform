import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { validateRoleForm } from '../../shared/utils/validation';
import { showToast } from '../../shared/utils/toast';
import { roleService } from '../services/roleService';
import ConfirmModal from '../components/common/ConfirmModal';

const Roles = () => {

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        roleName: '',
        shortCode: '',
        tenantId: 'BharatLoan',
        status: 'active'
    });

    const [errors, setErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [isViewing, setIsViewing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);

    // Search, Sort, Pagination state
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState('id');
    const [sortDirection, setSortDirection] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const fetchRoles = useCallback(async () => {
        setLoading(true);
        try {
            const data = await roleService.getRoles();
            setRoles(data);
        } catch (error) {
            showToast('error', 'Failed to fetch roles');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const validationErrors = validateRoleForm(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        if (isEditing) {
            const updatedRoles = roles.map(role =>
                role.id === editId
                    ? {
                        ...role,
                        name: formData.roleName,
                        code: formData.shortCode,
                        tenant: formData.tenantId,
                        status: formData.status.charAt(0).toUpperCase() + formData.status.slice(1)
                    }
                    : role
            );
            setRoles(updatedRoles);
            showToast('success', 'Role updated successfully!');
        } else {
            const newRole = {
                id: roles.length > 0 ? Math.max(...roles.map(r => r.id)) + 1 : 1,
                name: formData.roleName,
                code: formData.shortCode,
                tenant: formData.tenantId,
                status: formData.status.charAt(0).toUpperCase() + formData.status.slice(1)
            };
            setRoles([...roles, newRole]);
            showToast('success', 'Role added successfully!');
        }

        setFormData({ roleName: '', shortCode: '', tenantId: 'BharatLoan', status: 'active' });
        setErrors({});
        setIsEditing(false);
        setEditId(null);
        setShowForm(false);
    };

    const handleEdit = (role) => {
        setFormData({
            roleName: role.name,
            shortCode: role.code,
            tenantId: role.tenant,
            status: role.status.toLowerCase()
        });
        setIsEditing(true);
        setIsViewing(false);
        setEditId(role.id);
        setShowForm(true);
        setErrors({});
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        setLoading(true);
        try {
            await roleService.deleteRole(deleteId);
            setRoles(roles.filter(role => role.id !== deleteId));
            showToast('success', 'Role deleted successfully!');
        } catch (error) {
            showToast('error', 'Failed to delete role');
        } finally {
            setLoading(false);
            setShowDeleteModal(false);
            setDeleteId(null);
        }
    };

    // Toggle active/inactive status directly from table
    const handleToggleStatus = (role) => {
        const newStatus = role.status === 'Active' ? 'Inactive' : 'Active';
        const updatedRoles = roles.map(r =>
            r.id === role.id ? { ...r, status: newStatus } : r
        );
        setRoles(updatedRoles);
        showToast('success', `${role.name} status changed to ${newStatus}`);
    };

    const handleView = (role) => {
        setFormData({
            roleName: role.name,
            shortCode: role.code,
            tenantId: role.tenant,
            status: role.status.toLowerCase()
        });
        setIsViewing(true);
        setIsEditing(false);
        setEditId(role.id);
        setShowForm(true);
        setErrors({});
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

    // Filtered + Sorted + Paginated data
    const processedData = useMemo(() => {
        // Filter
        let filtered = roles;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = roles.filter(role =>
                role.name.toLowerCase().includes(q) ||
                role.code.toLowerCase().includes(q) ||
                role.tenant.toLowerCase().includes(q) ||
                role.status.toLowerCase().includes(q)
            );
        }

        // Sort
        const sorted = [...filtered].sort((a, b) => {
            let valA = a[sortField];
            let valB = b[sortField];
            if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }
            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [roles, searchQuery, sortField, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(processedData.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentRoles = processedData.slice(indexOfFirstItem, indexOfLastItem);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    return (
        <DashboardLayout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Roles Management</h4>
                <button
                    className="btn btn-primary d-flex align-items-center"
                    onClick={() => {
                        if (showForm && (isEditing || isViewing)) {
                            setFormData({ roleName: '', shortCode: '', tenantId: 'BharatLoan', status: 'active' });
                            setIsEditing(false);
                            setIsViewing(false);
                            setEditId(null);
                        } else {
                            setShowForm(!showForm);
                            setIsEditing(false);
                            setIsViewing(false);
                        }
                    }}
                >
                    <i className={showForm && !(isEditing || isViewing) ? "ri-close-line me-1" : "ri-add-line me-1"}></i>
                    {showForm && !(isEditing || isViewing) ? "Cancel" : "Add Role"}
                </button>
            </div>

            {showForm && (
                <div className="card mb-4 shadow-sm border-0 animate__animated animate__fadeInDown">
                    <div className="card-header d-flex justify-content-between align-items-center bg-transparent border-bottom">
                        <h5 className="mb-0">
                            {isViewing ? 'View Role' : isEditing ? 'Edit Role' : 'Add New Role'}
                        </h5>
                        <button type="button" className="btn-close" onClick={() => {
                            setShowForm(false);
                            setIsEditing(false);
                            setIsViewing(false);
                            setFormData({ roleName: '', shortCode: '', tenantId: 'BharatLoan', status: 'active' });
                        }}></button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row g-4">
                                <div className="col-md-4">
                                    <label className="form-label">Role Name</label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.roleName ? 'is-invalid' : ''}`}
                                        name="roleName"
                                        value={formData.roleName}
                                        onChange={handleInputChange}
                                        placeholder="Enter Role Name"
                                        disabled={isViewing}
                                    />
                                    {errors.roleName && <div className="invalid-feedback">{errors.roleName}</div>}
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label">Short Code</label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.shortCode ? 'is-invalid' : ''}`}
                                        name="shortCode"
                                        value={formData.shortCode}
                                        onChange={handleInputChange}
                                        placeholder="Short Code"
                                        disabled={isViewing}
                                    />
                                    {errors.shortCode && <div className="invalid-feedback">{errors.shortCode}</div>}
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Tenant ID</label>
                                    <select
                                        className="form-select"
                                        name="tenantId"
                                        value={formData.tenantId}
                                        onChange={handleInputChange}
                                        disabled={isViewing}
                                    >
                                        <option value="BharatLoan">BharatLoan</option>
                                        <option value="Rupee112">Rupee112</option>
                                        <option value="VimanoTech">VimanoTech</option>
                                        <option value="FinServe">FinServe</option>
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Status</label>
                                    <select
                                        className="form-select"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        disabled={isViewing}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div className="col-12 text-end">
                                    <hr className="my-2" />
                                    {!isViewing ? (
                                        <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                                            {loading ? (
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            ) : (
                                                <i className={isEditing ? "ri-save-line me-1" : "ri-add-line me-1"}></i>
                                            )}
                                            {isEditing ? 'Update Role' : 'Add Role'}
                                        </button>
                                    ) : (
                                        <button type="button" className="btn btn-label-primary px-4" onClick={() => setIsViewing(false) || setIsEditing(true)}>
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
                        Showing {processedData.length > 0 ? indexOfFirstItem + 1 : 0}-{Math.min(indexOfLastItem, processedData.length)} of {processedData.length} roles
                    </small>
                    <div className="d-flex align-items-center">
                        <div className="position-relative">
                            <i className="ri-search-line position-absolute text-secondary" style={{ left: '10px', top: '50%', transform: 'translateY(-50%)' }}></i>
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Search roles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ width: '220px', paddingLeft: '32px' }}
                            />
                        </div>
                    </div>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive text-nowrap">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="px-4" style={{ cursor: 'pointer', width: '70px' }} onClick={() => handleSort('id')}>
                                        S.No {getSortIcon('id')}
                                    </th>
                                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>
                                        Role Name {getSortIcon('name')}
                                    </th>
                                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('code')}>
                                        Short Code {getSortIcon('code')}
                                    </th>
                                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('tenant')}>
                                        Tenant {getSortIcon('tenant')}
                                    </th>
                                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('status')}>
                                        Status {getSortIcon('status')}
                                    </th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="table-border-bottom-0">
                                {loading && roles.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : currentRoles.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5 text-muted">
                                            {searchQuery ? 'No roles match your search.' : 'No roles found.'}
                                        </td>
                                    </tr>
                                ) : (
                                    currentRoles.map((role, index) => (
                                        <tr key={role.id}>
                                            <td className="px-4 text-muted">{indexOfFirstItem + index + 1}</td>
                                            <td><strong>{role.name}</strong></td>
                                            <td>{role.code}</td>
                                            <td>{role.tenant}</td>
                                            <td>
                                                <button
                                                    className={`btn btn-sm ${role.status === 'Active' ? 'btn-label-primary' : 'btn-label-warning'} border-0 rounded-pill px-3`}
                                                    onClick={() => handleToggleStatus(role)}
                                                    title={`Click to ${role.status === 'Active' ? 'deactivate' : 'activate'}`}
                                                >
                                                    <i className={`ri-${role.status === 'Active' ? 'check-line' : 'close-line'} me-1`}></i>
                                                    {role.status}
                                                </button>
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
                                                            <button className="dropdown-item d-flex align-items-center" onClick={() => handleView(role)}>
                                                                <i className="ri-eye-line me-2 text-secondary"></i> View
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button className="dropdown-item d-flex align-items-center" onClick={() => handleEdit(role)}>
                                                                <i className="ri-edit-line me-2 text-secondary"></i> Edit
                                                            </button>
                                                        </li>
                                                        <li><hr className="dropdown-divider" /></li>
                                                        <li>
                                                            <button className="dropdown-item d-flex align-items-center" onClick={() => handleDeleteClick(role.id)}>
                                                                <i className="ri-delete-bin-line me-2 text-secondary"></i> Delete
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </td>
                                        </tr>
                                    )))}
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
                title="Confirm Role Deletion"
                message="Are you sure you want to delete this role? This will remove all associated permissions and cannot be undone."
                onConfirm={handleDeleteConfirm}
                onCancel={() => {
                    setShowDeleteModal(false);
                    setDeleteId(null);
                }}
                loading={loading}
            />
        </DashboardLayout>
    );
};

export default Roles;
