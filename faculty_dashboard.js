// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';
let authToken = localStorage.getItem('authToken') || '';

// Utility Functions (same as student dashboard)
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
    
    const contentContainer = document.getElementById('faculty-dashboard-content');
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
    
    const contentContainer = document.getElementById('faculty-dashboard-content');
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
        
        if (rule.min && value && parseFloat(value) < rule.min) {
            errors[field] = `${field} must be at least ${rule.min}`;
        }
        
        if (rule.max && value && parseFloat(value) > rule.max) {
            errors[field] = `${field} cannot exceed ${rule.max}`;
        }
    });
    
    return errors;
}

// Faculty Dashboard Functions
document.addEventListener('DOMContentLoaded', function() {
    initFacultyDashboard();
});

function initFacultyDashboard() {
    const menuItems = document.querySelectorAll('.sidebar-menu a');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            const section = this.getAttribute('data-section');
            loadFacultySection(section);
        });
    });
    
    loadFacultySection('dashboard');
}

async function loadFacultySection(section) {
    const contentContainer = document.getElementById('faculty-dashboard-content');
    
    try {
        switch(section) {
            case 'dashboard':
                await loadFacultyDashboard(contentContainer);
                break;
            case 'attendance':
                await loadAttendanceManagement(contentContainer);
                break;
            case 'marks':
                await loadMarksUpload(contentContainer);
                break;
            case 'assignments':
                await loadAssignments(contentContainer);
                break;
            case 'notices':
                await loadFacultyNotices(contentContainer);
                break;
            case 'lesson-plans':
                await loadLessonPlans(contentContainer);
                break;
        }
    } catch (error) {
        console.error('Error loading section:', error);
        showError('Failed to load data');
    }
}

async function loadFacultyDashboard(container) {
    container.innerHTML = `
        <div class="row">
            <div class="col-md-4">
                <div class="stats-card primary" onclick="loadFacultySection('lesson-plans')" style="cursor: pointer;">
                    <i class="fas fa-chalkboard-teacher fa-2x"></i>
                    <div class="stats-value" id="courses-assigned">--</div>
                    <div class="stats-label">Courses Assigned</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stats-card success" onclick="loadFacultySection('attendance')" style="cursor: pointer;">
                    <i class="fas fa-users fa-2x"></i>
                    <div class="stats-value" id="total-students">--</div>
                    <div class="stats-label">Total Students</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stats-card info" onclick="loadFacultySection('notices')" style="cursor: pointer;">
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
    
    try {
        const dashboardData = await apiCall('/faculty/dashboard');
        
        document.getElementById('courses-assigned').textContent = dashboardData.coursesAssigned || '4';
        document.getElementById('total-students').textContent = dashboardData.totalStudents || '120';
        document.getElementById('new-notices').textContent = dashboardData.newNotices || '2';
        
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
            activitiesContainer.innerHTML = `
                <ul class="list-group">
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <i class="fas fa-check-circle text-success me-2"></i>
                            Attendance marked for Data Structures (3rd Year)
                        </div>
                        <span class="text-muted small">Today, 10:30 AM</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <i class="fas fa-file-alt text-primary me-2"></i>
                            New assignment created for Algorithms
                        </div>
                        <span class="text-muted small">Yesterday, 3:45 PM</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <i class="fas fa-upload text-warning me-2"></i>
                            Internal marks uploaded for Database Systems
                        </div>
                        <span class="text-muted small">2 days ago</span>
                    </li>
                </ul>
            `;
        }
    } catch (error) {
        document.getElementById('courses-assigned').textContent = '4';
        document.getElementById('total-students').textContent = '120';
        document.getElementById('new-notices').textContent = '2';
        
        const activitiesContainer = document.getElementById('recent-activities');
        activitiesContainer.innerHTML = `
            <ul class="list-group">
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <i class="fas fa-check-circle text-success me-2"></i>
                        Attendance marked for Data Structures (3rd Year)
                    </div>
                    <span class="text-muted small">Today, 10:30 AM</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <i class="fas fa-file-alt text-primary me-2"></i>
                        New assignment created for Algorithms
                    </div>
                    <span class="text-muted small">Yesterday, 3:45 PM</span>
                </li>
            </ul>
        `;
    }
}

async function loadAttendanceManagement(container) {
    container.innerHTML = `
        <div class="dashboard-card">
            <div class="card-header">Attendance Management</div>
            <div class="card-body">
                <div class="form-container">
                    <h5 class="mb-4">Mark Attendance</h5>
                    <form id="attendance-form">
                        <div class="row mb-3">
                            <div class="col-md-4">
                                <label for="semester" class="form-label">Select Semester</label>
                                <select class="form-select" id="semester" required>
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
                                <label for="attendance-date" class="form-label">Select Date</label>
                                <input type="date" class="form-control" id="attendance-date" required>
                            </div>
                            <div class="col-md-4">
                                <label for="subject" class="form-label">Select Subject</label>
                                <select class="form-select" id="subject" required>
                                    <option value="">-- Select Subject --</option>
                                    <option value="ds">Data Structures</option>
                                    <option value="algo">Algorithms</option>
                                    <option value="db">Database Systems</option>
                                    <option value="cn">Computer Networks</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="table-container mt-4">
                            <table class="table table-striped" id="attendance-table">
                                <thead>
                                    <tr>
                                        <th>Student ID</th>
                                        <th>Student Name</th>
                                        <th>Attendance Status</th>
                                        <th>Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colspan="4" class="text-center">
                                            <div class="spinner-border text-primary" role="status">
                                                <span class="visually-hidden">Loading...</span>
                                            </div>
                                            <p class="mt-2">Loading student list...</p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="mt-4">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save me-2"></i>Submit Attendance
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="updateExistingRecords()">
                                <i class="fas fa-sync me-2"></i>Update Existing Records
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Set default date to today
    document.getElementById('attendance-date').valueAsDate = new Date();
    
    // Add event listeners for form changes
    document.getElementById('semester').addEventListener('change', loadStudentList);
    document.getElementById('subject').addEventListener('change', loadStudentList);
    
    // Form submission
    document.getElementById('attendance-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            semester: document.getElementById('semester').value,
            date: document.getElementById('attendance-date').value,
            subject: document.getElementById('subject').value,
            attendance: []
        };
        
        // Validate form
        const errors = validateForm(formData, {
            semester: { required: true },
            date: { required: true },
            subject: { required: true }
        });
        
        if (Object.keys(errors).length > 0) {
            showError('Please fill all required fields');
            return;
        }
        
        // Collect attendance data
        const rows = document.querySelectorAll('#attendance-table tbody tr');
        rows.forEach(row => {
            const studentId = row.querySelector('.student-id').textContent;
            const status = row.querySelector('select').value;
            const remarks = row.querySelector('input[type="text"]').value;
            
            formData.attendance.push({
                studentId,
                status,
                remarks
            });
        });
        
        try {
            await apiCall('/faculty/attendance', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            showSuccess('Attendance submitted successfully!');
        } catch (error) {
            showError('Failed to submit attendance');
        }
    });
}

async function loadStudentList() {
    const semester = document.getElementById('semester').value;
    const subject = document.getElementById('subject').value;
    
    if (!semester || !subject) return;
    
    try {
        const students = await apiCall(`/faculty/students?semester=${semester}&subject=${subject}`);
        
        const tableBody = document.querySelector('#attendance-table tbody');
        if (students && students.length > 0) {
            tableBody.innerHTML = students.map(student => `
                <tr>
                    <td class="student-id">${student.id}</td>
                    <td>${student.name}</td>
                    <td>
                        <select class="form-select form-select-sm">
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                            <option value="leave">Leave</option>
                        </select>
                    </td>
                    <td>
                        <input type="text" class="form-control form-control-sm" placeholder="Remarks">
                    </td>
                </tr>
            `).join('');
        } else {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted">
                        <i class="fas fa-info-circle me-2"></i>
                        No students found for selected criteria
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        const tableBody = document.querySelector('#attendance-table tbody');
        tableBody.innerHTML = `
            <tr>
                <td>2201110014</td>
                <td>Asha Kiran Samantaray</td>
                <td>
                    <select class="form-select form-select-sm">
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="leave">Leave</option>
                    </select>
                </td>
                <td>
                    <input type="text" class="form-control form-control-sm" placeholder="Remarks">
                </td>
            </tr>
            <tr>
                <td>2201110076</td>
                <td>Yubaraj Mohanty</td>
                <td>
                    <select class="form-select form-select-sm">
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="leave">Leave</option>
                    </select>
                </td>
                <td>
                    <input type="text" class="form-control form-control-sm" placeholder="Remarks">
                </td>
            </tr>
        `;
    }
}

async function loadMarksUpload(container) {
    container.innerHTML = `
        <div class="dashboard-card">
            <div class="card-header">Internal Marks Upload</div>
            <div class="card-body">
                <div class="form-container">
                    <h5 class="mb-4">Upload Marks</h5>
                    <form id="marks-form">
                        <div class="row mb-4">
                            <div class="col-md-3">
                                <label for="marks-semester" class="form-label">Select Semester</label>
                                <select class="form-select" id="marks-semester" required>
                                    <option value="">-- Select Semester --</option>
                                    <option value="1">1st Semester</option>
                                    <option value="2">2nd Semester</option>
                                    <option value="3">3rd Semester</option>
                                    <option value="4">4th Semester</option>
                                </select>
                            </div>
                            <div class="col-md-3">
                                <label for="marks-date" class="form-label">Select Date</label>
                                <input type="date" class="form-control" id="marks-date" required>
                            </div>
                            <div class="col-md-3">
                                <label for="marks-subject" class="form-label">Select Subject</label>
                                <select class="form-select" id="marks-subject" required>
                                    <option value="">-- Select Subject --</option>
                                    <option value="ds">Data Structures</option>
                                    <option value="algo">Algorithms</option>
                                    <option value="db">Database Systems</option>
                                </select>
                            </div>
                            <div class="col-md-3">
                                <label for="assessment-type" class="form-label">Assessment Type</label>
                                <select class="form-select" id="assessment-type" required>
                                    <option value="">-- Select Type --</option>
                                    <option value="internal1">Internal 1</option>
                                    <option value="internal2">Internal 2</option>
                                    <option value="assignment">Assignment</option>
                                    <option value="lab">Lab</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <label class="form-label">Upload Method</label>
                            <div>
                                <div class="form-check form-check-inline">
                                    <input class="form-check-input" type="radio" name="uploadMethod" id="manual" value="manual" checked>
                                    <label class="form-check-label" for="manual">Manual Entry</label>
                                </div>
                                <div class="form-check form-check-inline">
                                    <input class="form-check-input" type="radio" name="uploadMethod" id="excel" value="excel">
                                    <label class="form-check-label" for="excel">Excel/CSV</label>
                                </div>
                            </div>
                        </div>
                        
                        <div id="manual-entry">
                            <div class="table-container">
                                <table class="table table-striped" id="marks-table">
                                    <thead>
                                        <tr>
                                            <th>Student ID</th>
                                            <th>Student Name</th>
                                            <th>Marks Obtained</th>
                                            <th>Out Of Marks</th>
                                            <th>Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td colspan="5" class="text-center">
                                                <div class="spinner-border text-primary" role="status">
                                                    <span class="visually-hidden">Loading...</span>
                                                </div>
                                                <p class="mt-2">Loading student list...</p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div class="mt-3">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save me-2"></i>Save Marks
                                </button>
                                <button type="button" class="btn btn-warning" onclick="updateMarks()">
                                    <i class="fas fa-sync me-2"></i>Update/Re-upload
                                </button>
                            </div>
                        </div>
                        
                        <div id="excel-upload" class="d-none">
                            <div class="mb-3">
                                <label for="file-upload" class="form-label">Upload Excel/CSV File</label>
                                <input class="form-control" type="file" id="file-upload" accept=".xlsx,.xls,.csv">
                            </div>
                            <button type="button" class="btn btn-primary" onclick="uploadFile()">
                                <i class="fas fa-upload me-2"></i>Upload File
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Set default date
    document.getElementById('marks-date').valueAsDate = new Date();
    
    // Upload method toggle
    document.querySelectorAll('input[name="uploadMethod"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'manual') {
                document.getElementById('manual-entry').classList.remove('d-none');
                document.getElementById('excel-upload').classList.add('d-none');
                loadMarksStudentList();
            } else {
                document.getElementById('manual-entry').classList.add('d-none');
                document.getElementById('excel-upload').classList.remove('d-none');
            }
        });
    });
    
    // Load student list when criteria change
    document.getElementById('marks-semester').addEventListener('change', loadMarksStudentList);
    document.getElementById('marks-subject').addEventListener('change', loadMarksStudentList);
    
    // Form submission
    document.getElementById('marks-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            semester: document.getElementById('marks-semester').value,
            date: document.getElementById('marks-date').value,
            subject: document.getElementById('marks-subject').value,
            assessmentType: document.getElementById('assessment-type').value,
            marks: []
        };
        
        const errors = validateForm(formData, {
            semester: { required: true },
            date: { required: true },
            subject: { required: true },
            assessmentType: { required: true }
        });
        
        if (Object.keys(errors).length > 0) {
            showError('Please fill all required fields');
            return;
        }
        
        // Collect marks data
        const rows = document.querySelectorAll('#marks-table tbody tr');
        let hasErrors = false;
        
        rows.forEach(row => {
            const studentId = row.querySelector('.student-id').textContent;
            const marksObtained = parseFloat(row.querySelector('.marks-obtained').value);
            const totalMarks = parseFloat(row.querySelector('.total-marks').value);
            const remarks = row.querySelector('input[type="text"]').value;
            
            if (marksObtained > totalMarks) {
                showError(`Marks obtained cannot exceed total marks for student ${studentId}`);
                hasErrors = true;
                return;
            }
            
            formData.marks.push({
                studentId,
                marksObtained,
                totalMarks,
                remarks
            });
        });
        
        if (hasErrors) return;
        
        try {
            await apiCall('/faculty/marks', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            showSuccess('Marks saved successfully!');
        } catch (error) {
            showError('Failed to save marks');
        }
    });
    
    // Load initial student list
    loadMarksStudentList();
}

async function loadMarksStudentList() {
    const semester = document.getElementById('marks-semester').value;
    const subject = document.getElementById('marks-subject').value;
    
    if (!semester || !subject) return;
    
    try {
        const students = await apiCall(`/faculty/students?semester=${semester}&subject=${subject}`);
        
        const tableBody = document.querySelector('#marks-table tbody');
        if (students && students.length > 0) {
            tableBody.innerHTML = students.map(student => `
                <tr>
                    <td class="student-id">${student.id}</td>
                    <td>${student.name}</td>
                    <td>
                        <input type="number" class="form-control form-control-sm marks-obtained" 
                               value="${student.marks || ''}" min="0" step="0.5">
                    </td>
                    <td>
                        <input type="number" class="form-control form-control-sm total-marks" 
                               value="30" min="1" step="0.5">
                    </td>
                    <td>
                        <input type="text" class="form-control form-control-sm" placeholder="Remarks">
                    </td>
                </tr>
            `).join('');
        } else {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted">
                        <i class="fas fa-info-circle me-2"></i>
                        No students found for selected criteria
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        const tableBody = document.querySelector('#marks-table tbody');
        tableBody.innerHTML = `
            <tr>
                <td class="student-id">2201110014</td>
                <td>Asha Kiran Samantaray</td>
                <td>
                    <input type="number" class="form-control form-control-sm marks-obtained" value="28" min="0" step="0.5">
                </td>
                <td>
                    <input type="number" class="form-control form-control-sm total-marks" value="30" min="1" step="0.5">
                </td>
                <td>
                    <input type="text" class="form-control form-control-sm" placeholder="Remarks">
                </td>
            </tr>
            <tr>
                <td class="student-id">2201110076</td>
                <td>Yubaraj Mohanty</td>
                <td>
                    <input type="number" class="form-control form-control-sm marks-obtained" value="26" min="0" step="0.5">
                </td>
                <td>
                    <input type="number" class="form-control form-control-sm total-marks" value="30" min="1" step="0.5">
                </td>
                <td>
                    <input type="text" class="form-control form-control-sm" placeholder="Remarks">
                </td>
            </tr>
        `;
    }
}

function updateExistingRecords() {
    showSuccess('Update functionality will be implemented with backend integration');
}

function updateMarks() {
    showSuccess('Update functionality will be implemented with backend integration');
}

function uploadFile() {
    const fileInput = document.getElementById('file-upload');
    if (!fileInput.files.length) {
        showError('Please select a file to upload');
        return;
    }
    showSuccess('File upload functionality will be implemented with backend integration');
}

// Remaining functions for assignments, notices, and lesson plans would follow similar patterns...

async function loadAssignments(container) {
    container.innerHTML = `
        <div class="dashboard-card">
            <div class="card-header">Assignments & Announcements</div>
            <div class="card-body">
                <!-- Assignment form would go here -->
                <div class="text-center py-4">
                    <i class="fas fa-tasks fa-3x text-primary mb-3"></i>
                    <h5>Assignments & Announcements</h5>
                    <p class="text-muted">This section will be fully implemented with backend integration</p>
                </div>
            </div>
        </div>
    `;
}

async function loadFacultyNotices(container) {
    container.innerHTML = `
        <div class="dashboard-card">
            <div class="card-header">Institutional Notices</div>
            <div class="card-body">
                <!-- Notices content would go here -->
                <div class="text-center py-4">
                    <i class="fas fa-bullhorn fa-3x text-primary mb-3"></i>
                    <h5>Institutional Notices</h5>
                    <p class="text-muted">This section will be fully implemented with backend integration</p>
                </div>
            </div>
        </div>
    `;
}

async function loadLessonPlans(container) {
    container.innerHTML = `
        <div class="dashboard-card">
            <div class="card-header">Lesson Plans</div>
            <div class="card-body">
                <!-- Lesson plans content would go here -->
                <div class="text-center py-4">
                    <i class="fas fa-book fa-3x text-primary mb-3"></i>
                    <h5>Lesson Plans</h5>
                    <p class="text-muted">This section will be fully implemented with backend integration</p>
                </div>
            </div>
        </div>
    `;
}

// Add loading overlay CSS (same as student dashboard)
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