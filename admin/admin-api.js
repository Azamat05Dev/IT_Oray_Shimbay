/**
 * IT Center Admin Panel - API Client
 * MongoDB Backend bilan integratsiya
 */

const AdminAPI = (function () {
    'use strict';

    // API URL configuration
    const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3001/api'
        : window.location.origin + '/api';

    // Token management
    const TokenManager = {
        getAccessToken: () => localStorage.getItem('access_token'),
        getRefreshToken: () => localStorage.getItem('refresh_token'),
        setTokens: (access, refresh) => {
            localStorage.setItem('access_token', access);
            if (refresh) localStorage.setItem('refresh_token', refresh);
        },
        clearTokens: () => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        }
    };

    // Base request function
    async function request(endpoint, options = {}) {
        const token = TokenManager.getAccessToken();

        const config = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers
            }
        };

        if (options.body) {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, config);
            const data = await response.json();

            // Handle 401 - token expired
            if (response.status === 401 && data.message?.includes('Token')) {
                TokenManager.clearTokens();
                // Try to use localStorage fallback
                console.warn('Token expired, using localStorage fallback');
            }

            return {
                ok: response.ok,
                status: response.status,
                ...data
            };
        } catch (error) {
            console.error('API request failed:', error);
            return {
                ok: false,
                success: false,
                message: 'Server bilan aloqa yo\'q',
                offline: true
            };
        }
    }

    // ==========================================
    // AUTHENTICATION
    // ==========================================
    const auth = {
        async login(identifier, password) {
            const result = await request('/auth/admin/login', {
                method: 'POST',
                body: { identifier, password }
            });

            if (result.success && result.accessToken) {
                TokenManager.setTokens(result.accessToken, result.refreshToken);
            }

            return result;
        },

        async logout() {
            await request('/auth/logout', { method: 'POST' });
            TokenManager.clearTokens();
            localStorage.removeItem('admin_session');
        },

        async verifyToken() {
            return request('/auth/verify-token');
        },

        isLoggedIn() {
            return !!TokenManager.getAccessToken();
        }
    };

    // ==========================================
    // STUDENTS
    // ==========================================
    const students = {
        async getAll(filters = {}) {
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.status) params.append('status', filters.status);
            if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
            if (filters.courseId) params.append('courseId', filters.courseId);
            if (filters.groupId) params.append('groupId', filters.groupId);
            if (filters.page) params.append('page', filters.page);
            if (filters.limit) params.append('limit', filters.limit);

            const query = params.toString();
            return request(`/students${query ? '?' + query : ''}`);
        },

        async getById(id) {
            return request(`/students/${id}`);
        },

        async create(data) {
            return request('/students', {
                method: 'POST',
                body: data
            });
        },

        async update(id, data) {
            return request(`/students/${id}`, {
                method: 'PUT',
                body: data
            });
        },

        async delete(id) {
            return request(`/students/${id}`, {
                method: 'DELETE'
            });
        },

        async changeStatus(id, status) {
            return request(`/students/${id}/status`, {
                method: 'PATCH',
                body: { status }
            });
        },

        async changeGroup(id, groupId) {
            return request(`/students/${id}/group`, {
                method: 'PATCH',
                body: { groupId }
            });
        },

        async getStats() {
            return request('/students/stats/overview');
        },

        // Bulk operations
        bulkDelete(studentIds) {
            return request('/students/bulk-delete', {
                method: 'POST',
                body: { studentIds }
            });
        },

        bulkSendSMS(studentIds, message) {
            return request('/students/bulk-sms', {
                method: 'POST',
                body: { studentIds, message }
            });
        },

        bulkChangeStatus(studentIds, status) {
            return request('/students/bulk-status', {
                method: 'PATCH',
                body: { studentIds, status }
            });
        },

        bulkChangeGroup(studentIds, groupId) {
            return request('/students/bulk-group', {
                method: 'PATCH',
                body: { studentIds, groupId }
            });
        },

        // Sync from backend to localStorage
        sync() {
            return request('/students/sync', {
                method: 'POST'
            });
        }
    };

    // ==========================================
    // COURSES
    // ==========================================
    const courses = {
        async getAll() {
            return request('/courses');
        },

        async create(data) {
            return request('/courses', {
                method: 'POST',
                body: data
            });
        },

        async update(id, data) {
            return request(`/courses/${id}`, {
                method: 'PUT',
                body: data
            });
        },

        async delete(id) {
            return request(`/courses/${id}`, {
                method: 'DELETE'
            });
        }
    };

    // ==========================================
    // GROUPS
    // ==========================================
    const groups = {
        async getAll() {
            return request('/groups');
        },

        async getById(id) {
            return request(`/groups/${id}`);
        },

        async create(data) {
            return request('/groups', {
                method: 'POST',
                body: data
            });
        },

        async update(id, data) {
            return request(`/groups/${id}`, {
                method: 'PUT',
                body: data
            });
        },

        async delete(id) {
            return request(`/groups/${id}`, {
                method: 'DELETE'
            });
        }
    };

    // ==========================================
    // MENTORS
    // ==========================================
    const mentors = {
        async getAll() {
            return request('/mentors');
        },

        async create(data) {
            return request('/mentors', {
                method: 'POST',
                body: data
            });
        },

        async update(id, data) {
            return request(`/mentors/${id}`, {
                method: 'PUT',
                body: data
            });
        },

        async delete(id) {
            return request(`/mentors/${id}`, {
                method: 'DELETE'
            });
        }
    };

    // ==========================================
    // PAYMENTS
    // ==========================================
    const payments = {
        async getAll(filters = {}) {
            const params = new URLSearchParams();
            if (filters.studentId) params.append('studentId', filters.studentId);
            if (filters.status) params.append('status', filters.status);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.page) params.append('page', filters.page);
            if (filters.limit) params.append('limit', filters.limit);

            const query = params.toString();
            return request(`/payments${query ? '?' + query : ''}`);
        },

        async create(data) {
            return request('/payments', {
                method: 'POST',
                body: data
            });
        },

        async getStats() {
            return request('/payments/stats');
        }
    };

    // ==========================================
    // APPLICATIONS
    // ==========================================
    const applications = {
        async getAll(status = null) {
            const query = status ? `?status=${status}` : '';
            return request(`/applications${query}`);
        },

        async changeStatus(id, status, adminNote = '') {
            return request(`/applications/${id}/status`, {
                method: 'PATCH',
                body: { status, adminNote }
            });
        },

        async enrollStudent(id, courseId, groupId, password) {
            return request(`/applications/${id}/enroll`, {
                method: 'POST',
                body: { courseId, groupId, password }
            });
        }
    };

    // ==========================================
    // DASHBOARD
    // ==========================================
    const dashboard = {
        async getStats() {
            return request('/dashboard/stats');
        }
    };

    // ==========================================
    // VIDEOS
    // ==========================================
    const videos = {
        async getAll(courseId = null) {
            const query = courseId ? `?courseId=${courseId}` : '';
            return request(`/videos${query}`);
        },

        async create(data) {
            return request('/videos', {
                method: 'POST',
                body: data
            });
        },

        async delete(id) {
            return request(`/videos/${id}`, {
                method: 'DELETE'
            });
        }
    };

    // ==========================================
    // ACTIVITY LOGS
    // ==========================================
    const logs = {
        async getAll(page = 1, limit = 100) {
            return request(`/logs?page=${page}&limit=${limit}`);
        },

        async create(action, target, details) {
            return request('/logs', {
                method: 'POST',
                body: { action, target, details }
            });
        }
    };

    // ==========================================
    // HEALTH CHECK
    // ==========================================
    async function health() {
        return request('/health');
    }

    // ==========================================
    // FALLBACK TO LOCALSTORAGE
    // ==========================================
    // If API fails, use localStorage as fallback
    function useLocalStorageFallback() {
        return !navigator.onLine || !TokenManager.getAccessToken();
    }

    // Public API
    return {
        auth,
        students,
        courses,
        groups,
        mentors,
        payments,
        applications,
        dashboard,
        videos,
        logs,
        health,
        useLocalStorageFallback,
        request, // For custom endpoints
        API_BASE
    };

})();

// Export for global use
if (typeof window !== 'undefined') {
    window.AdminAPI = AdminAPI;
}


