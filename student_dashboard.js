// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';
let authToken = localStorage.getItem('authToken') || '';

// Utility Functions
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        ...options
    };
    
    try {
        showLoading();
        const response = await fetch(url, config);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        hideLoading();
        return data;
    } catch (error) {
        hideLoading();
        console.error('API call failed:', error);
        showError('Failed to fetch data. Please try again.');
        throw error;
    }
}

function showLoading() {
    // Implement loading indicator
    const loadingEl = document.getElementById('loading-indicator') || createLoadingIndicator();
    loadingEl.style.display = 'block';
}

function hideLoading() {
    const loadingEl = document.getElementById('loading-indicator');
    if (loadingEl) {
        loadingEl.style.display = 'none';
    }
}

function createLoadingIndicator() {
    const loadingEl = document.createElement('div');
    loadingEl.id = 'loading-indicator';
    loadingEl.className = 'loading-overlay';
    loadingEl.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Loading...</p>
        </div>
    `;
    document.body.appendChild(loadingEl);
    return loadingEl;
}

function showError(message) {
    // Remove existing error messages
    const existingErrors = document.querySelectorAll('.alert-danger');
    existingErrors.forEach(error => error.remove());
    
    const errorEl = document.createElement('div');
    errorEl.className = 'alert alert-danger';
    errorEl.innerHTML = `
        <i class="fas fa-exclamation-triangle me-2"></i>
        ${message}
    `;
    
    const contentContainer = document.getElementById('student-dashboard-content');
    contentContainer.prepend(errorEl);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        errorEl.remove();
    }, 5000);
}

function showSuccess(message) {
    const successEl = document.createElement('div');
    successEl.className = 'alert alert-success';
    successEl.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>
        ${message}
    `;
    
    const contentContainer = document.getElementById('student-dashboard-content');
    contentContainer.prepend(successEl);
    
    setTimeout(() => {
        successEl.remove();
    }, 3000);
}

// Form Validation
function validateForm(formData, rules) {
    const errors = {};
    
    Object.keys(rules).forEach(field => {
        const value = formData[field];
        const rule = rules[field];
        
        if (rule.required && (!value || value.trim() === '')) {
            errors[field] = `${field} is required`;
        }
        
        if (rule.minLength && value && value.length < rule.minLength) {
            errors[field] = `${field} must be at least ${rule.minLength} characters`;
        }
        
        if (rule.pattern && value && !rule.pattern.test(value)) {
            errors[field] = rule.message || `${field} format is invalid`;
        }
        
        if (rule.custom && value) {
            const customError = rule.custom(value);
            if (customError) {
                errors[field] = customError;
            }
        }
    });
    
    return errors;
}

// Data Export
function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        showError('No data to export');
        return;
    }
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => 
                `"${String(row[header] || '').replace(/"/g, '""')}"`
            ).join(',')
        )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Student Dashboard Functions
document.addEventListener('DOMContentLoaded', function() {
    initStudentDashboard();
});

function initStudentDashboard() {
    // Set up event listeners for sidebar menu
    const menuItems = document.querySelectorAll('.sidebar-menu a');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all menu items
            menuItems.forEach(i => i.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Load the corresponding section
            const section = this.getAttribute('data-section');
            loadStudentSection(section);
        });
    });
    
    // Load default section (dashboard)
    loadStudentSection('dashboard');
}

async function loadStudentSection(section) {
    const contentContainer = document.getElementById('student-dashboard-content');
    
    try {
        switch(section) {
            case 'dashboard':
                await loadStudentDashboard(contentContainer);
                break;
            case 'attendance':
                await loadStudentAttendance(contentContainer);
                break;
            case 'results':
                await loadStudentResults(contentContainer);
                break;
            case 'notices':
                await loadStudentNotices(contentContainer);
                break;
            case 'profile':
                await loadStudentProfile(contentContainer);
                break;
        }
    } catch (error) {
        console.error('Error loading section:', error);
        showError('Failed to load data');
    }
}

async function loadStudentDashboard(container) {
    container.innerHTML = `
        <div class="row">
            <div class="col-md-4">
                <div class="stats-card primary" onclick="loadStudentSection('attendance')" style="cursor: pointer;">
                    <i class="fas fa-calendar-check fa-2x"></i>
                    <div class="stats-value" id="attendance-percentage">--%</div>
                    <div class="stats-label">Attendance</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stats-card success" onclick="loadStudentSection('results')" style="cursor: pointer;">
                    <i class="fas fa-book fa-2x"></i>
                    <div class="stats-value" id="current-courses">--</div>
                    <div class="stats-label">Current Courses</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stats-card info" onclick="loadStudentSection('notices')" style="cursor: pointer;">
                    <i class="fas fa-bullhorn fa-2x"></i>
                    <div class="stats-value" id="new-notices">--</div>
                    <div class="stats-label">New Notices</div>
                </div>
            </div>
        </div>
        
        <div class="dashboard-card mt-4">
            <div class="card-header">Recent Activities</div>
            <div class="card-body">
                <div id="recent-activities">
                    <div class="text-center">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-2">Loading activities...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Load dashboard data from API
    try {
        // Simulate API calls - replace with actual API endpoints
        const dashboardData = await apiCall('/students/dashboard');
        
        // Update stats
        document.getElementById('attendance-percentage').textContent = `${dashboardData.attendancePercentage}%`;
        document.getElementById('current-courses').textContent = dashboardData.currentCourses;
        document.getElementById('new-notices').textContent = dashboardData.newNotices;
        
        // Update recent activities
        const activitiesContainer = document.getElementById('recent-activities');
        if (dashboardData.recentActivities && dashboardData.recentActivities.length > 0) {
            activitiesContainer.innerHTML = `
                <ul class="list-group">
                    ${dashboardData.recentActivities.map(activity => `
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                                <i class="fas ${activity.icon} text-${activity.type} me-2"></i>
                                ${activity.description}
                            </div>
                            <span class="text-muted small">${activity.time}</span>
                        </li>
                    `).join('')}
                </ul>
            `;
        } else {
            activitiesContainer.innerHTML = '<p class="text-muted">No recent activities</p>';
        }
    } catch (error) {
        // Fallback to static data if API fails
        document.getElementById('attendance-percentage').textContent = '87%';
        document.getElementById('current-courses').textContent = '5';
        document.getElementById('new-notices').textContent = '3';
        
        const activitiesContainer = document.getElementById('recent-activities');
        activitiesContainer.innerHTML = `
            <ul class="list-group">
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <i class="fas fa-check-circle text-success me-2"></i>
                        Attendance marked for Data Structures
                    </div>
                    <span class="text-muted small">Today, 10:30 AM</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <i class="fas fa-file-alt text-primary me-2"></i>
                        New assignment uploaded for Algorithms
                    </div>
                    <span class="text-muted small">Yesterday, 3:45 PM</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <i class="fas fa-bullhorn text-warning me-2"></i>
                        New notice: Mid-term exam schedule
                    </div>
                    <span class="text-muted small">2 days ago</span>
                </li>
            </ul>
        `;
    }
}

async function loadStudentAttendance(container) {
    container.innerHTML = `
        <div class="dashboard-card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <span>Attendance Records</span>
                <button class="btn btn-outline-primary btn-sm" onclick="exportAttendance()">
                    <i class="fas fa-download me-1"></i>Export
                </button>
            </div>
            <div class="card-body">
                <div class="table-container">
                    <table class="table table-striped" id="attendance-table">
                        <thead>
                            <tr>
                                <th>Course</th>
                                <th>Total Classes</th>
                                <th>Present</th>
                                <th>Absent</th>
                                <th>Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colspan="5" class="text-center">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                    <p class="mt-2">Loading attendance data...</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    try {
        const attendanceData = await apiCall('/students/attendance');
        
        const tableBody = document.querySelector('#attendance-table tbody');
        if (attendanceData && attendanceData.length > 0) {
            tableBody.innerHTML = attendanceData.map(course => `
                <tr>
                    <td>${course.name}</td>
                    <td>${course.totalClasses}</td>
                    <td>${course.present}</td>
                    <td>${course.absent}</td>
                    <td>
                        <span class="badge ${course.percentage >= 75 ? 'bg-success' : 'bg-warning'}">
                            ${course.percentage}%
                        </span>
                    </td>
                </tr>
            `).join('');
        } else {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted">
                        <i class="fas fa-info-circle me-2"></i>
                        No attendance records found
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        const tableBody = document.querySelector('#attendance-table tbody');
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Failed to load attendance data
                </td>
            </tr>
        `;
    }
}

async function loadStudentResults(container) {
    container.innerHTML = `
        <div class="dashboard-card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <span>Academic Results</span>
                <button class="btn btn-outline-primary btn-sm" onclick="exportResults()">
                    <i class="fas fa-download me-1"></i>Export
                </button>
            </div>
            <div class="card-body">
                <div class="table-container">
                    <table class="table table-striped" id="results-table">
                        <thead>
                            <tr>
                                <th>Course</th>
                                <th>Internal 1</th>
                                <th>Internal 2</th>
                                <th>Assignment</th>
                                <th>Lab</th>
                                <th>Final Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colspan="6" class="text-center">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                    <p class="mt-2">Loading results...</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    try {
        const resultsData = await apiCall('/students/results');
        
        const tableBody = document.querySelector('#results-table tbody');
        if (resultsData && resultsData.length > 0) {
            tableBody.innerHTML = resultsData.map(course => `
                <tr>
                    <td>${course.name}</td>
                    <td>${course.internal1 || '-'}</td>
                    <td>${course.internal2 || '-'}</td>
                    <td>${course.assignment || '-'}</td>
                    <td>${course.lab || '-'}</td>
                    <td>
                        <span class="badge bg-primary">${course.finalGrade || '-'}</span>
                    </td>
                </tr>
            `).join('');
        } else {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted">
                        <i class="fas fa-info-circle me-2"></i>
                        No results available
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        const tableBody = document.querySelector('#results-table tbody');
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Failed to load results
                </td>
            </tr>
        `;
    }
}

async function loadStudentNotices(container) {
    container.innerHTML = `
        <div class="dashboard-card">
            <div class="card-header">Notices & Events</div>
            <div class="card-body">
                <div id="notices-list">
                    <div class="text-center">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-2">Loading notices...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    try {
        const noticesData = await apiCall('/students/notices');
        
        const noticesContainer = document.getElementById('notices-list');
        if (noticesData && noticesData.length > 0) {
            noticesContainer.innerHTML = `
                <div class="list-group">
                    ${noticesData.map(notice => `
                        <div class="list-group-item">
                            <div class="d-flex w-100 justify-content-between">
                                <h5 class="mb-1">${notice.title}</h5>
                                <small class="text-muted">${new Date(notice.date).toLocaleDateString()}</small>
                            </div>
                            <p class="mb-1">${notice.content}</p>
                            <small class="text-muted">Posted by: ${notice.publisher}</small>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            noticesContainer.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="fas fa-info-circle fa-2x mb-3"></i>
                    <p>No notices available</p>
                </div>
            `;
        }
    } catch (error) {
        const noticesContainer = document.getElementById('notices-list');
        noticesContainer.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                <p>Failed to load notices</p>
            </div>
        `;
    }
}

async function loadStudentProfile(container) {
    container.innerHTML = `
        <div class="dashboard-card">
            <div class="card-header">Student Profile</div>
            <div class="card-body">
                <div id="profile-content">
                    <div class="text-center">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-2">Loading profile...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    try {
        const profileData = await apiCall('/students/profile');
        
        const profileContainer = document.getElementById('profile-content');
        profileContainer.innerHTML = `
            <div class="row">
                <div class="col-md-4 text-center">
                    <div class="mb-3">
                        <div class="user-avatar mx-auto" style="width: 100px; height: 100px;">
                            <i class="fas fa-user fa-3x"></i>
                        </div>
                    </div>
                    <h4>${profileData.fullName}</h4>
                    <p class="text-muted">${profileData.department}</p>
                </div>
                <div class="col-md-8">
                    <div class="row mb-3">
                        <div class="col-sm-4 fw-bold">Registration No:</div>
                        <div class="col-sm-8">${profileData.registrationNumber}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-sm-4 fw-bold">Roll No:</div>
                        <div class="col-sm-8">${profileData.rollNumber}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-sm-4 fw-bold">Academic Year:</div>
                        <div class="col-sm-8">${profileData.academicYear}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-sm-4 fw-bold">Semester:</div>
                        <div class="col-sm-8">${profileData.semester}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-sm-4 fw-bold">Program:</div>
                        <div class="col-sm-8">${profileData.program}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-sm-4 fw-bold">Email:</div>
                        <div class="col-sm-8">${profileData.email}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-sm-4 fw-bold">Phone:</div>
                        <div class="col-sm-8">${profileData.phone || 'Not provided'}</div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        const profileContainer = document.getElementById('profile-content');
        profileContainer.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                <p>Failed to load profile</p>
            </div>
        `;
    }
}

// Export functions
function exportAttendance() {
    // Implement attendance export
    showSuccess('Export feature will be implemented with backend integration');
}

function exportResults() {
    // Implement results export
    showSuccess('Export feature will be implemented with backend integration');
}

// Add CSS for loading overlay
const style = document.createElement('style');
style.textContent = `
    .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.8);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    }
    
    .loading-spinner {
        text-align: center;
        background: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .loading-spinner .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 15px;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);