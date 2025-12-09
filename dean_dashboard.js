document.addEventListener('DOMContentLoaded', function() {
    initDeanDashboard();
});

function initDeanDashboard() {
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
            loadDeanSection(section);
        });
    });
    
    // Load default section (dashboard)
    loadDeanSection('dashboard');
}

function loadDeanSection(section) {
    const contentContainer = document.getElementById('dean-dashboard-content');
    
    switch(section) {
        case 'dashboard':
            contentContainer.innerHTML = `
                <div class="row">
                    <div class="col-md-4">
                        <div class="stats-card primary">
                            <i class="fas fa-user-graduate fa-2x"></i>
                            <div class="stats-value">1,250</div>
                            <div>Total Students</div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="stats-card success">
                            <i class="fas fa-chalkboard-teacher fa-2x"></i>
                            <div class="stats-value">85</div>
                            <div>Faculty Members</div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="stats-card warning">
                            <i class="fas fa-building fa-2x"></i>
                            <div class="stats-value">6</div>
                            <div>Departments</div>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-card mt-4">
                    <div class="card-header">College Overview</div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h5>Student Distribution by Department</h5>
                                <ul class="list-group">
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        Computer Science & Engineering
                                        <span class="badge bg-primary rounded-pill">240</span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        Electrical Engineering
                                        <span class="badge bg-primary rounded-pill">220</span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        Mechanical Engineering
                                        <span class="badge bg-primary rounded-pill">210</span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        Civil Engineering
                                        <span class="badge bg-primary rounded-pill">200</span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        Electronics & Communication
                                        <span class="badge bg-primary rounded-pill">190</span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        Information Technology
                                        <span class="badge bg-primary rounded-pill">190</span>
                                    </li>
                                </ul>
                            </div>
                            <div class="col-md-6">
                                <h5>Recent Activities</h5>
                                <ul class="list-group">
                                    <li class="list-group-item">
                                        <i class="fas fa-bullhorn text-primary me-2"></i>
                                        New college notice published
                                        <small class="text-muted d-block">Today</small>
                                    </li>
                                    <li class="list-group-item">
                                        <i class="fas fa-calendar-alt text-success me-2"></i>
                                        Academic calendar updated
                                        <small class="text-muted d-block">2 days ago</small>
                                    </li>
                                    <li class="list-group-item">
                                        <i class="fas fa-chart-line text-warning me-2"></i>
                                        Monthly academic report generated
                                        <small class="text-muted d-block">1 week ago</small>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'notices':
            contentContainer.innerHTML = `
                <div class="dashboard-card">
                    <div class="card-header">Upload & Manage Institutional Notices</div>
                    <div class="card-body">
                        <div class="mb-4">
                            <h5>Create New Institutional Notice</h5>
                            <form id="institutional-notice-form">
                                <div class="mb-3">
                                    <label for="institutional-notice-title" class="form-label">Title</label>
                                    <input type="text" class="form-control" id="institutional-notice-title" placeholder="Enter notice title">
                                </div>
                                <div class="mb-3">
                                    <label for="institutional-notice-content" class="form-label">Content</label>
                                    <textarea class="form-control" id="institutional-notice-content" rows="5" placeholder="Enter notice content"></textarea>
                                </div>
                                <div class="mb-3">
                                    <label for="institutional-notice-attachment" class="form-label">Attachment (Optional)</label>
                                    <input class="form-control" type="file" id="institutional-notice-attachment">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Visibility</label>
                                    <div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="visibility" id="visibility-all" value="all" checked>
                                            <label class="form-check-label" for="visibility-all">
                                                Entire College (All Departments)
                                            </label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="visibility" id="visibility-ug" value="ug">
                                            <label class="form-check-label" for="visibility-ug">
                                                UG Programs Only
                                            </label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="visibility" id="visibility-pg" value="pg">
                                            <label class="form-check-label" for="visibility-pg">
                                                PG Programs Only
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" class="btn btn-primary">Publish Notice</button>
                            </form>
                        </div>
                        
                        <div>
                            <h5>Published Institutional Notices</h5>
                            <div class="table-container">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Published Date</th>
                                            <th>Visibility</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>College Foundation Day Celebration</td>
                                            <td>Oct 15, 2023</td>
                                            <td>Entire College</td>
                                            <td><span class="badge bg-success">Active</span></td>
                                            <td>
                                                <button class="btn btn-sm btn-primary">Edit</button>
                                                <button class="btn btn-sm btn-danger">Archive</button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>UG Mid-term Examination Schedule</td>
                                            <td>Oct 10, 2023</td>
                                            <td>UG Programs</td>
                                            <td><span class="badge bg-success">Active</span></td>
                                            <td>
                                                <button class="btn btn-sm btn-primary">Edit</button>
                                                <button class="btn btn-sm btn-danger">Archive</button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>PG Research Symposium</td>
                                            <td>Oct 5, 2023</td>
                                            <td>PG Programs</td>
                                            <td><span class="badge bg-success">Active</span></td>
                                            <td>
                                                <button class="btn btn-sm btn-primary">Edit</button>
                                                <button class="btn btn-sm btn-danger">Archive</button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Add form submission handler
            document.getElementById('institutional-notice-form').addEventListener('submit', function(e) {
                e.preventDefault();
                alert('Institutional notice published successfully!');
                this.reset();
            });
            break;
    }
}