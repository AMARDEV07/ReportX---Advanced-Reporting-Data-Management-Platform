import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { moduleService } from '../services/modulesService';
import { userService } from '../services/userService';
import { showToast } from '../../shared/utils/toast';

const ModuleList = () => {
    const navigate = useNavigate();

    const [userModuleData, setUserModuleData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(25);

    // Fetch data
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [users, moduleList] = await Promise.all([
                userService.getUsers(),
                moduleService.getUserModuleList()
            ]);

            // Merge user info with module names
            const merged = moduleList.map(item => {
                const user = users.find(u => u.id === item.userId);
                return {
                    ...item,
                    userName: user ? user.fullName : `User #${item.userId}`,
                    userEmail: user ? user.email : ''
                };
            });

            setUserModuleData(merged);
        } catch (error) {
            showToast('error', 'Failed to load module list');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Search filter
    const filteredData = userModuleData.filter(item => {
        const term = searchTerm.toLowerCase();
        return (
            item.userName.toLowerCase().includes(term) ||
            item.moduleNames.some(m => m.toLowerCase().includes(term))
        );
    });

    // Pagination logic
    const indexOfLastItem = currentPage * entriesPerPage;
    const indexOfFirstItem = indexOfLastItem - entriesPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / entriesPerPage);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Navigate to edit modules for a user
    const handleEditModules = (userId) => {
        navigate(`/Login/admin/view-module/${userId}`);
    };

    return (
        <DashboardLayout>
            {/* Page Title */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-1">
                        User Module List{' '}
                        <small className="text-muted fw-normal fs-6">Manage User Module List</small>
                    </h4>
                </div>
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb mb-0">
                        <li className="breadcrumb-item"><a href="#" className="text-decoration-none">Home</a></li>
                        <li className="breadcrumb-item active" aria-current="page">User Module List</li>
                    </ol>
                </nav>
            </div>

            {/* Main Card */}
            <div className="card shadow-sm border-0">
                <div className="card-header d-flex justify-content-between align-items-center bg-transparent border-bottom">
                    <h5 className="mb-0">User Module List</h5>
                </div>

                <div className="card-body">
                    {/* Search Bar */}
                    <div className="card-header border-bottom d-flex justify-content-between align-items-center py-3" style={{ backgroundColor: '#f5f5f9' }}>
                        <small className="text-muted">
                            Showing {filteredData.length > 0 ? indexOfFirstItem + 1 : 0}-{Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} records
                        </small>
                        <div className="d-flex align-items-center">
                            <div className="position-relative">
                                <i className="ri-search-line position-absolute text-secondary" style={{ left: '10px', top: '50%', transform: 'translateY(-50%)' }}></i>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    placeholder="Search modules..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ width: '220px', paddingLeft: '32px' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="table-responsive text-nowrap">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th style={{ width: '60px' }} className="px-4 text-muted">S.No</th>
                                    <th style={{ width: '200px' }}>User Name</th>
                                    <th>Assigned Modules</th>
                                    <th style={{ width: '80px' }} className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="table-border-bottom-0">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : currentItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-5 text-muted">
                                            {searchTerm ? 'No matching records found.' : 'No data available.'}
                                        </td>
                                    </tr>
                                ) : (
                                    currentItems.map((item, index) => (
                                        <tr key={item.userId}>
                                            <td className="px-4 text-muted">{indexOfFirstItem + index + 1}</td>
                                            <td><strong>{item.userName}</strong></td>
                                            <td style={{ whiteSpace: 'normal', maxWidth: '600px' }}>
                                                {item.moduleNames.map((name, i) => (
                                                    <span key={i} className="badge bg-label-primary me-1 mb-1">{name}</span>
                                                ))}
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
                                                            <button className="dropdown-item d-flex align-items-center" onClick={() => handleEditModules(item.userId)}>
                                                                <i className="ri-edit-line me-2 text-secondary"></i> Manage Access
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

                    {/* Bottom: Pagination */}
                    {totalPages > 1 && (
                        <div className="card-footer border-top bg-transparent py-3">
                            <nav aria-label="Page navigation">
                                <ul className="pagination justify-content-center mb-0">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => setCurrentPage(prev => prev - 1)}>
                                            Previous
                                        </button>
                                    </li>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                            <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                                                {i + 1}
                                            </button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => setCurrentPage(prev => prev + 1)}>
                                            Next
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ModuleList;