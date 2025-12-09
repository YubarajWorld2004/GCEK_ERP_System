// Principal Dashboard JavaScript with API integration
const API_BASE_URL = 'http://localhost:8080/api';
let authToken = localStorage.getItem('authToken') || '';

// Utility Functions (similar to previous dashboards)
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
    const loadingEl = document.getElementById('loading-indicator') || createLoadingIndicator();
    loadingEl.style.display = 'block';
}

function hideLoading() {
    const loadingEl = document.getElementById('loading-indicator');
    if (loadingEl) {
        loadingEl.style.display = 'none';
    }
}

function showError(message) {
    const existingErrors = document.querySelectorAll('.alert-danger');
    existingErrors.forEach(error => error.remove());
    
    const errorEl = document.createElement('div');
    errorEl.className = 'alert alert-danger';
    errorEl.innerHTML = `
        <i class="fas fa-exclamation-triangle me-2"></i>
        ${message}
    `;
    
    const contentContainer = document.getElementById('principal-dashboard-content');
    contentContainer.prepend(errorEl);
    
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
    
    const contentContainer = document.getElementById('principal-dashboard-content');
    contentContainer.prepend(successEl);
    
    setTimeout(() => {
        successEl.remove();
    }, 3000);
}

// Principal Dashboard Functions
document.addEventListener('DOMContentLoaded', function() {
    initPrincipalDashboard();
});

function initPrincipalDashboard() {
    const menuItems = document.querySelectorAll('.sidebar-menu a');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            const section = this.getAttribute('data-section');
            loadPrincipalSection(section);
        });
    });
    
    loadPrincipalSection('dashboard');
}

async function loadPrincipalSection(section) {
    const contentContainer = document.getElementById('principal-dashboard-content');
    
    try {
        switch(section) {
            case 'dashboard':
                await loadPrincipalDashboard(contentContainer);
                break;
            case 'user-management':
                await loadUserManagement(contentContainer);
                break;
            case 'department-management':
                await loadDepartmentManagement(contentContainer);
                break;
            case 'global-data':
                await loadGlobalData(contentContainer);
                break;
            case 'notices':
                await loadPrincipalNotices(contentContainer);
                break;
        }
    } catch (error) {
        console.error('Error loading section:', error);
        showError('Failed to load data');
    }
}

async function loadPrincipalDashboard(container) {
    container.innerHTML = `
        <div class="row">
            <div class="col-md-3">
                <div class="stats-card primary">
                    <i class="fas fa-user-graduate fa-2x"></i>
                    <div class="stats-value" id="total-students">--</div>
                    <div class="stats-label">Total Students</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stats-card success">
                    <i class="fas fa-chalkboard-teacher fa-2x"></i>
                    <div class="stats-value" id="faculty-members">--</div>
                    <div class="stats-label">Faculty Members</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stats-card warning">
                    <i class="fas fa-building fa-2x"></i>
                    <div class="stats-value" id="departments">--</div>
                    <div class="stats-label">Departments</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stats-card info">
                    <i class="fas fa-calendar-check fa-2x"></i>
                    <div class="stats-value" id="college-attendance">--%</div>
                    <div class="stats-label">College Attendance</div>
                </div>
            </div>
        </div>
        
        <div class="dashboard-card mt-4">
            <div class="card-header">Institution Overview</div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <h5>Department Statistics</h5>
                        <div class="table-container">
                            <table class="table table-striped" id="department-stats">
                                <thead>
                                    <tr>
                                        <th>Department</th>
                                        <th>Students</th>
                                        <th>Faculty</th>
                                        <th>Avg Attendance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colspan="4" class="text-center">
                                            <div class="spinner-border text-primary" role="status">
                                                <span class="visually-hidden">Loading...</span>
                                            </div>
                                            <p class="mt-2">Loading department statistics...</p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <h5>Recent Activities</h5>
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
            </div>
        </div>
    `;
    
    try {
        const dashboardData = await apiCall('/principal/dashboard');
        
        document.getElementById('total-students').textContent = dashboardData.totalStudents || '1,250';
        document.getElementById('faculty-members').textContent = dashboardData.facultyMembers || '85';
        document.getElementById('departments').textContent = dashboardData.departments || '6';
        document.getElementById('college-attendance').textContent = dashboardData.collegeAttendance || '86%';
        
        // Update department statistics
        const statsTable = document.querySelector('#department-stats tbody');
        if (dashboardData.departmentStats && dashboardData.departmentStats.length > 0) {
            statsTable.innerHTML = dashboardData.departmentStats.map(dept => `
                <tr>
                    <td>${dept.name}</td>
                    <td>${dept.students}</td>
                    <td>${dept.faculty}</td>
                    <td>${dept.attendance}%</td>
                </tr>
            `).join('');
        } else {
            statsTable.innerHTML = `
                <tr>
                    <td>Computer Science</td>
                    <td>240</td>
                    <td>18</td>
                    <td>85%</td>
                </tr>
                <tr>
                    <td>Electrical</td>
                    <td>220</td>
                    <td>16</td>
                    <td>84%</td>
                </tr>
                <tr>
                    <td>Mechanical</td>
                    <td>210</td>
                    <td>15</td>
                    <td>86%</td>
                </tr>
            `;
        }
        
        // Update recent activities
        const activitiesContainer = document.getElementById('recent-activities');
        if (dashboardData.recentActivities) {
            activitiesContainer.innerHTML = `
                <ul class="list-group">
                    ${dashboardData.recentActivities.map(activity => `
                        <li class="list-group-item">
                            <i class="fas ${activity.icon} text-${activity.type} me-2"></i>
                            ${activity.description}
                            <small class="text-muted d-block">${activity.time}</small>
                        </li>
                    `).join('')}
                </ul>
            `;
        } else {
            activitiesContainer.innerHTML = `
                <ul class="list-group">
                    <li class="list-group-item">
                        <i class="fas fa-users-cog text-primary me-2"></i>
                        2 new faculty members added
                        <small class="text-muted d-block">Today</small>
                    </li>
                    <li class="list-group-item">
                        <i class="fas fa-bullhorn text-success me-2"></i>
                        Institutional notice published
                        <small class="text-muted d-block">Yesterday</small>
                    </li>
                    <li class="list-group-item">
                        <i class="fas fa-chart-pie text-warning me-2"></i>
                        Monthly report generated
                        <small class="text-muted d-block">3 days ago</small>
                    </li>
                </ul>
            `;
        }
    } catch (error) {
        // Fallback data
        document.getElementById('total-students').textContent = '1,250';
        document.getElementById('faculty-members').textContent = '85';
        document.getElementById('departments').textContent = '6';
        document.getElementById('college-attendance').textContent = '86%';
        
        const statsTable = document.querySelector('#department-stats tbody');
        statsTable.innerHTML = `
            <tr>
                <td>Computer Science</td>
                <td>240</td>
                <td>18</td>
                <td>85%</td>
            </tr>
            <tr>
                <td>Electrical</td>
                <td>220</td>
                <td>16</td>
                <td>84%</td>
            </tr>
        `;
        
        const activitiesContainer = document.getElementById('recent-activities');
        activitiesContainer.innerHTML = `
            <ul class="list-group">
                <li class="list-group-item">
                    <i class="fas fa-users-cog text-primary me-2"></i>
                    2 new faculty members added
                    <small class="text-muted d-block">Today</small>
                </li>
                <li class="list-group-item">
                    <i class="fas fa-bullhorn text-success me-2"></i>
                    Institutional notice published
                    <small class="text-muted d-block">Yesterday</small>
                </li>
            </ul>
        `;
    }
}

async function loadUserManagement(container) {
    container.innerHTML = `
        <div class="dashboard-card">
            <div class="card-header">User Management</div>
            <div class="card-body">
                <!-- User management form would go here -->
                <div class="text-center py-4">
                    <i class="fas fa-users-cog fa-3x text-primary mb-3"></i>
                    <h5>User Management</h5>
                    <p class="text-muted">This section will be fully implemented with backend integration</p>
                </div>
            </div>
        </div>
    `;
}

async function loadDepartmentManagement(container) {
    container.innerHTML = `
        <div class="dashboard-card">
            <div class="card-header">Department Management</div>
            <div class="card-body">
                <!-- Department management would go here -->
                <div class="text-center py-4">
                    <i class="fas fa-building fa-3x text-primary mb-3"></i>
                    <h5>Department Management</h5>
                    <p class="text-muted">This section will be fully implemented with backend integration</p>
                </div>
            </div>
        </div>
    `;
}

async function loadGlobalData(container) {
    container.innerHTML = `
        <div class="dashboard-card">
            <div class="card-header">Global Data Access</div>
            <div class="card-body">
                <!-- Global data access would go here -->
                <div class="text-center py-4">
                    <i class="fas fa-database fa-3x text-primary mb-3"></i>
                    <h5>Global Data Access</h5>
                    <p class="text-muted">This section will be fully implemented with backend integration</p>
                </div>
            </div>
        </div>
    `;
}

async function loadPrincipalNotices(container) {
    container.innerHTML = `
        <div class="dashboard-card">
            <div class="card-header">Notices & Announcements</div>
            <div class="card-body">
                <!-- Notices management would go here -->
                <div class="text-center py-4">
                    <i class="fas fa-bullhorn fa-3x text-primary mb-3"></i>
                    <h5>Notices & Announcements</h5>
                    <p class="text-muted">This section will be fully implemented with backend integration</p>
                </div>
            </div>
        </div>
    `;
}

// Add loading overlay CSS
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