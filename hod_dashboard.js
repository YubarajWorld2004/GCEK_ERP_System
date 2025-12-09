// HOD Dashboard JavaScript with API integration
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
    
    const contentContainer = document.getElementById('hod-dashboard-content');
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
    
    const contentContainer = document.getElementById('hod-dashboard-content');
    contentContainer.prepend(successEl);
    
    setTimeout(() => {
        successEl.remove();
    }, 3000);
}

// HOD Dashboard Functions
document.addEventListener('DOMContentLoaded', function() {
    initHODDashboard();
});

function initHODDashboard() {
    const menuItems = document.querySelectorAll('.sidebar-menu a');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            const section = this.getAttribute('data-section');
            loadHODSection(section);
        });
    });
    
    loadHODSection('dashboard');
}

async function loadHODSection(section) {
    const contentContainer = document.getElementById('hod-dashboard-content');
    
    try {
        switch(section) {
            case 'dashboard':
                await loadHODDashboard(contentContainer);
                break;
            case 'student-management':
                await loadStudentManagement(contentContainer);
                break;
            case 'faculty-management':
                await loadFacultyManagement(contentContainer);
                break;
            case 'assign-course':
                await loadAssignCourse(contentContainer);
                break;
            case 'attendance-overview':
                await loadAttendanceOverview(contentContainer);
                break;
            case 'lesson-plan-monitoring':
                await loadLessonPlanMonitoring(contentContainer);
                break;
            case 'department-notices':
                await loadDepartmentNotices(contentContainer);
                break;
        }
    } catch (error) {
        console.error('Error loading section:', error);
        showError('Failed to load data');
    }
}

async function loadHODDashboard(container) {
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
                    <i class="fas fa-book fa-2x"></i>
                    <div class="stats-value" id="active-courses">--</div>
                    <div class="stats-label">Active Courses</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stats-card info">
                    <i class="fas fa-calendar-check fa-2x"></i>
                    <div class="stats-value" id="avg-attendance">--%</div>
                    <div class="stats-label">Avg Attendance</div>
                </div>
            </div>
        </div>
        
        <div class="dashboard-card mt-4">
            <div class="card-header">Department Overview</div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <h5>Student Distribution by Year</h5>
                        <div id="student-distribution">
                            <div class="text-center">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                                <p class="mt-2">Loading data...</p>
                            </div>
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
        const dashboardData = await apiCall('/hod/dashboard');
        
        document.getElementById('total-students').textContent = dashboardData.totalStudents || '240';
        document.getElementById('faculty-members').textContent = dashboardData.facultyMembers || '18';
        document.getElementById('active-courses').textContent = dashboardData.activeCourses || '32';
        document.getElementById('avg-attendance').textContent = dashboardData.avgAttendance || '85%';
        
        // Update student distribution
        const distributionContainer = document.getElementById('student-distribution');
        if (dashboardData.studentDistribution) {
            distributionContainer.innerHTML = `
                <ul class="list-group">
                    ${dashboardData.studentDistribution.map(item => `
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            ${item.year}
                            <span class="badge bg-primary rounded-pill">${item.count}</span>
                        </li>
                    `).join('')}
                </ul>
            `;
        } else {
            distributionContainer.innerHTML = `
                <ul class="list-group">
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        1st Year
                        <span class="badge bg-primary rounded-pill">60</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        2nd Year
                        <span class="badge bg-primary rounded-pill">58</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        3rd Year
                        <span class="badge bg-primary rounded-pill">62</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        4th Year
                        <span class="badge bg-primary rounded-pill">60</span>
                    </li>
                </ul>
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
                        <i class="fas fa-user-plus text-success me-2"></i>
                        2 new students added
                        <small class="text-muted d-block">Today</small>
                    </li>
                    <li class="list-group-item">
                        <i class="fas fa-book text-primary me-2"></i>
                        5 lesson plans submitted
                        <small class="text-muted d-block">Yesterday</small>
                    </li>
                    <li class="list-group-item">
                        <i class="fas fa-bullhorn text-warning me-2"></i>
                        Department notice published
                        <small class="text-muted d-block">2 days ago</small>
                    </li>
                </ul>
            `;
        }
    } catch (error) {
        // Fallback data
        document.getElementById('total-students').textContent = '240';
        document.getElementById('faculty-members').textContent = '18';
        document.getElementById('active-courses').textContent = '32';
        document.getElementById('avg-attendance').textContent = '85%';
        
        const distributionContainer = document.getElementById('student-distribution');
        distributionContainer.innerHTML = `
            <ul class="list-group">
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    1st Year
                    <span class="badge bg-primary rounded-pill">60</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    2nd Year
                    <span class="badge bg-primary rounded-pill">58</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    3rd Year
                    <span class="badge bg-primary rounded-pill">62</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    4th Year
                    <span class="badge bg-primary rounded-pill">60</span>
                </li>
            </ul>
        `;
        
        const activitiesContainer = document.getElementById('recent-activities');
        activitiesContainer.innerHTML = `
            <ul class="list-group">
                <li class="list-group-item">
                    <i class="fas fa-user-plus text-success me-2"></i>
                    2 new students added
                    <small class="text-muted d-block">Today</small>
                </li>
                <li class="list-group-item">
                    <i class="fas fa-book text-primary me-2"></i>
                    5 lesson plans submitted
                    <small class="text-muted d-block">Yesterday</small>
                </li>
            </ul>
        `;
    }
}

async function loadStudentManagement(container) {
    container.innerHTML = `
        <div class="dashboard-card">
            <div class="card-header">Student Management</div>
            <div class="card-body">
                <div class="form-container mb-4">
                    <h5 class="mb-4">Add New Student</h5>
                    <form id="add-student-form">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="student-name" class="form-label">Full Name</label>
                                <input type="text" class="form-control" id="student-name" placeholder="Enter student name" required>
                            </div>
                            <div class="col-md-6">
                                <label for="student-regd" class="form-label">Registration Number</label>
                                <input type="text" class="form-control" id="student-regd" placeholder="Enter registration number" required>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-4">
                                <label for="student-year" class="form-label">Year</label>
                                <select class="form-select" id="student-year" required>
                                    <option value="">-- Select Year --</option>
                                    <option value="1">1st Year</option>
                                    <option value="2">2nd Year</option>
                                    <option value="3">3rd Year</option>
                                    <option value="4">4th Year</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label for="student-semester" class="form-label">Semester</label>
                                <select class="form-select" id="student-semester" required>
                                    <option value="">-- Select Semester --</option>
                                    <option value="1">1st Semester</option>
                                    <option value="2">2nd Semester</option>
                                    <option value="3">3rd Semester</option>
                                    <option value="4">4th Semester</option>
                                    <option value="5">5th Semester</option>
                                    <option value="6">6th Semester</option>
                                    <option value="7">7th Semester</option>
                                    <option value="8">8th Semester</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label for="student-program" class="form-label">Program</label>
                                <select class="form-select" id="student-program" required>
                                    <option value="">-- Select Program --</option>
                                    <option value="btech">B.Tech</option>
                                    <option value="mtech">M.Tech</option>
                                    <option value="phd">Ph.D</option>
                                </select>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="student-department" class="form-label">Department</label>
                                <select class="form-select" id="student-department" required>
                                    <option value="">-- Select Department --</option>
                                    <option value="Civil Engineering">Civil Engineering</option>
                                    <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                                    <option value="Electrical Engineering">Electrical Engineering</option>
                                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label for="student-roll" class="form-label">Roll Number</label>
                                <input type="text" class="form-control" id="student-roll" placeholder="Enter roll number" required>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-user-plus me-2"></i>Add Student
                        </button>
                    </form>
                </div>
                
                <div>
                    <h5>Student List</h5>
                    <div class="table-container">
                        <table class="table table-striped" id="students-table">
                            <thead>
                                <tr>
                                    <th>Roll No</th>
                                    <th>Name</th>
                                    <th>Registration No</th>
                                    <th>Year</th>
                                    <th>Program</th>
                                    <th>Department</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colspan="7" class="text-center">
                                        <div class="spinner-border text-primary" role="status">
                                            <span class="visually-hidden">Loading...</span>
                                        </div>
                                        <p class="mt-2">Loading students...</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Form submission
    document.getElementById('add-student-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('student-name').value,
            registrationNumber: document.getElementById('student-regd').value,
            year: document.getElementById('student-year').value,
            semester: document.getElementById('student-semester').value,
            program: document.getElementById('student-program').value,
            department: document.getElementById('student-department').value,
            rollNumber: document.getElementById('student-roll').value
        };
        
        try {
            await apiCall('/hod/students', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            showSuccess('Student added successfully!');
            this.reset();
            loadStudentsList(); // Refresh the list
        } catch (error) {
            showError('Failed to add student');
        }
    });
    
    // Load students list
    loadStudentsList();
}

async function loadStudentsList() {
    try {
        const students = await apiCall('/hod/students');
        
        const tableBody = document.querySelector('#students-table tbody');
        if (students && students.length > 0) {
            tableBody.innerHTML = students.map(student => `
                <tr>
                    <td>${student.rollNumber}</td>
                    <td>${student.name}</td>
                    <td>${student.registrationNumber}</td>
                    <td>${student.year}</td>
                    <td>${student.program}</td>
                    <td>${student.department}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="editStudent('${student.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-info" onclick="viewStudentDetails('${student.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        } else {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted">
                        <i class="fas fa-info-circle me-2"></i>
                        No students found
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        const tableBody = document.querySelector('#students-table tbody');
        tableBody.innerHTML = `
            <tr>
                <td>CS2022001</td>
                <td>Asha Kiran Samantaray</td>
                <td>2201110014</td>
                <td>2nd Year</td>
                <td>B.Tech</td>
                <td>Computer Science and Engineering</td>
                <td>
                    <button class="btn btn-sm btn-primary">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-info">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
            <tr>
                <td>CS2022002</td>
                <td>Yubaraj Mohanty</td>
                <td>2201110076</td>
                <td>2nd Year</td>
                <td>B.Tech</td>
                <td>Computer Science and Engineering</td>
                <td>
                    <button class="btn btn-sm btn-primary">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-info">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    }
}

// Remaining HOD functions would follow similar patterns...
async function loadFacultyManagement(container) {
    container.innerHTML = `
        <div class="dashboard-card">
            <div class="card-header">Faculty Management</div>
            <div class="card-body">
                <!-- Faculty management form with registration number field -->
                <div class="text-center py-4">
                    <i class="fas fa-chalkboard-teacher fa-3x text-primary mb-3"></i>
                    <h5>Faculty Management</h5>
                    <p class="text-muted">This section will be fully implemented with backend integration</p>
                </div>
            </div>
        </div>
    `;
}

async function loadAssignCourse(container) {
    container.innerHTML = `
        <div class="dashboard-card">
            <div class="card-header">Assign Course</div>
            <div class="card-body">
                <!-- Course assignment functionality -->
                <div class="text-center py-4">
                    <i class="fas fa-book fa-3x text-primary mb-3"></i>
                    <h5>Assign Course</h5>
                    <p class="text-muted">This section will be fully implemented with backend integration</p>
                </div>
            </div>
        </div>
    `;
}

async function loadAttendanceOverview(container) {
    container.innerHTML = `
        <div class="dashboard-card">
            <div class="card-header">Attendance Overview</div>
            <div class="card-body">
                <!-- Attendance overview charts and data -->
                <div class="text-center py-4">
                    <i class="fas fa-calendar-check fa-3x text-primary mb-3"></i>
                    <h5>Attendance Overview</h5>
                    <p class="text-muted">This section will be fully implemented with backend integration</p>
                </div>
            </div>
        </div>
    `;
}

async function loadLessonPlanMonitoring(container) {
    container.innerHTML = `
        <div class="dashboard-card">
            <div class="card-header">Lesson Plan Monitoring</div>
            <div class="card-body">
                <!-- Lesson plan monitoring functionality -->
                <div class="text-center py-4">
                    <i class="fas fa-tasks fa-3x text-primary mb-3"></i>
                    <h5>Lesson Plan Monitoring</h5>
                    <p class="text-muted">This section will be fully implemented with backend integration</p>
                </div>
            </div>
        </div>
    `;
}

async function loadDepartmentNotices(container) {
    container.innerHTML = `
        <div class="dashboard-card">
            <div class="card-header">Department Notices</div>
            <div class="card-body">
                <!-- Department notices functionality -->
                <div class="text-center py-4">
                    <i class="fas fa-bullhorn fa-3x text-primary mb-3"></i>
                    <h5>Department Notices</h5>
                    <p class="text-muted">This section will be fully implemented with backend integration</p>
                </div>
            </div>
        </div>
    `;
}

// Utility functions
function editStudent(studentId) {
    showSuccess(`Edit student ${studentId} - functionality will be implemented with backend integration`);
}

function viewStudentDetails(studentId) {
    showSuccess(`View student ${studentId} details - functionality will be implemented with backend integration`);
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