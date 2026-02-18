import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { validateUserForm } from '../../shared/utils/validation';
import { showToast } from '../../shared/utils/toast';
import { userService } from '../services/userService';
import ConfirmModal from '../components/common/ConfirmModal';
import { employeeService } from '../services/employeeService';

const Users = () => {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        mobileNo: '',
        email: '',
        status: 'Active',
        employeeId: ''
    });

    const [errors, setErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [isViewing, setIsViewing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const [users, setUsers] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);

    // Search, Sort, Pagination state
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState('id');
    const [sortDirection, setSortDirection] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [usersData, employeesData] = await Promise.all([
                userService.getUsers(),
                employeeService.getEmployees()
            ]);
            setUsers(usersData);
            setEmployees(employeesData);
        } catch (error) {
            showToast('error', 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEmployeeSelect = (e) => {
        const empId = parseInt(e.target.value);
        const selectedEmployee = employees.find(emp => emp.id === empId);

        if (selectedEmployee) {
            setFormData(prev => ({
                ...prev,
                employeeId: empId,
                fullName: selectedEmployee.fullName,
                email: selectedEmployee.email,
                mobileNo: selectedEmployee.mobileNo,
                status: selectedEmployee.status
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                employeeId: '',
                fullName: '',
                email: '',
                mobileNo: '',
                status: 'Active'
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateUserForm(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        try {
            if (isEditing) {
                await userService.updateUser(editId, formData);
                setUsers(users.map(user => user.id === editId ? { ...formData, id: editId } : user));
                showToast('success', 'User updated successfully!');
            } else {
                const newUser = await userService.addUser(formData);
                setUsers([...users, newUser]);
                showToast('success', 'User added successfully!');
            }
            resetForm();
        } catch (error) {
            showToast('error', `Failed to ${isEditing ? 'update' : 'add'} user`);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            fullName: '',
            mobileNo: '',
            email: '',
            status: 'Active',
            employeeId: ''
        });
        setErrors({});
        setIsEditing(false);
        setIsViewing(false);
        setEditId(null);
        setShowForm(false);
    };

    const handleEdit = (user) => {
        setFormData({ ...user });
        setIsEditing(true);
        setIsViewing(false);
        setEditId(user.id);
        setShowForm(true);
        setErrors({});
    };

    const handleView = (user) => {
        setFormData({ ...user });
        setIsViewing(true);
        setIsEditing(false);
        setEditId(user.id);
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
            await userService.deleteUser(deleteId);
            setUsers(users.filter(user => user.id !== deleteId));
            showToast('success', 'User deleted successfully!');
        } catch (error) {
            showToast('error', 'Failed to delete user');
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
        let filtered = users;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = users.filter(user =>
                user.fullName.toLowerCase().includes(q) ||
                user.email.toLowerCase().includes(q) ||
                user.mobileNo.toLowerCase().includes(q) ||
                user.status.toLowerCase().includes(q)
            );
        }

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
    }, [users, searchQuery, sortField, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(processedData.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = processedData.slice(indexOfFirstItem, indexOfLastItem);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    return (
        <DashboardLayout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Users Management</h4>
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
                    {showForm && !(isEditing || isViewing) ? "Cancel" : "Add User"}
                </button>
            </div>

            {showForm && (
                <div className="card mb-4 shadow-sm border-0 animate__animated animate__fadeInDown">
                    <div className="card-header d-flex justify-content-between align-items-center bg-transparent border-bottom">
                        <h5 className="mb-0">
                            {isViewing ? 'View User' : isEditing ? 'Edit User' : 'Add New User'}
                        </h5>
                        <button type="button" className="btn-close" onClick={resetForm}></button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row g-4">
                                {/* Employee Dropdown */}
                                <div className="col-md-12">
                                    <label className="form-label">Select Employee</label>
                                    <select
                                        className="form-select"
                                        name="employeeId"
                                        value={formData.employeeId || ''}
                                        onChange={handleEmployeeSelect}
                                        disabled={isViewing || isEditing}
                                    >
                                        <option value="">-- Select Employee --</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.fullName} ({emp.designation})
                                            </option>
                                        ))}
                                    </select>
                                    <div className="form-text mt-2 text-muted">
                                        <i className="ri-information-line me-1"></i>
                                        Selecting an employee will auto-fill the details below.
                                    </div>
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">Full Name</label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        placeholder="Enter Full Name"
                                        disabled={isViewing || !!formData.employeeId}
                                    />
                                    {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Mobile No</label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.mobileNo ? 'is-invalid' : ''}`}
                                        name="mobileNo"
                                        value={formData.mobileNo}
                                        onChange={handleInputChange}
                                        placeholder="Enter Mobile No"
                                        disabled={isViewing || !!formData.employeeId}
                                    />
                                    {errors.mobileNo && <div className="invalid-feedback">{errors.mobileNo}</div>}
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Email Address</label>
                                    <input
                                        type="email"
                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Enter Email"
                                        disabled={isViewing || !!formData.employeeId}
                                    />
                                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">User Status</label>
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
                                <div className="col-12 text-end">
                                    <hr className="my-2" />
                                    {!isViewing ? (
                                        <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                                            {loading ? (
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                            ) : (
                                                <i className={isEditing ? "ri-save-line me-1" : "ri-add-line me-1"}></i>
                                            )}
                                            {isEditing ? 'Update User' : 'Add User'}
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
                        Showing {processedData.length > 0 ? indexOfFirstItem + 1 : 0}-{Math.min(indexOfLastItem, processedData.length)} of {processedData.length} users
                    </small>
                    <div className="d-flex align-items-center">
                        <div className="position-relative">
                            <i className="ri-search-line position-absolute text-secondary" style={{ left: '10px', top: '50%', transform: 'translateY(-50%)' }}></i>
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Search users..."
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
                                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('fullName')}>
                                        Full Name {getSortIcon('fullName')}
                                    </th>
                                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('mobileNo')}>
                                        Mobile No {getSortIcon('mobileNo')}
                                    </th>
                                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('email')}>
                                        Email {getSortIcon('email')}
                                    </th>
                                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('status')}>
                                        Status {getSortIcon('status')}
                                    </th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="table-border-bottom-0">
                                {loading && users.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : currentUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5 text-muted">
                                            {searchQuery ? 'No users match your search.' : 'No users found.'}
                                        </td>
                                    </tr>
                                ) : (
                                    currentUsers.map((user, index) => (
                                        <tr key={user.id}>
                                            <td className="px-4 text-muted">{indexOfFirstItem + index + 1}</td>
                                            <td><strong>{user.fullName}</strong></td>
                                            <td>{user.mobileNo}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span className={`badge rounded-pill ${user.status === 'Active' ? 'bg-label-success' : 'bg-label-secondary'}`}>
                                                    {user.status}
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
                                                            <button className="dropdown-item d-flex align-items-center" onClick={() => handleView(user)}>
                                                                <i className="ri-eye-line me-2 text-secondary"></i> View
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button className="dropdown-item d-flex align-items-center" onClick={() => handleEdit(user)}>
                                                                <i className="ri-edit-line me-2 text-secondary"></i> Edit
                                                            </button>
                                                        </li>
                                                        <li><hr className="dropdown-divider" /></li>
                                                        <li>
                                                            <button className="dropdown-item d-flex align-items-center" onClick={() => handleDeleteClick(user.id)}>
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
                title="Confirm User Deletion"
                message="Are you sure you want to delete this user? This action cannot be undone."
                onConfirm={handleDeleteConfirm}
                onCancel={() => setShowDeleteModal(false) || setDeleteId(null)}
                loading={loading}
            />
        </DashboardLayout>
    );
};

export default Users;
