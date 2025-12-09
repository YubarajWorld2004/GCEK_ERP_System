// Quick test script
async function testAllEndpoints() {
    const endpoints = [
        '/api/hello',
        '/students/dashboard/1',
        '/students/attendance/1',
        '/faculty/dashboard/1',
        '/hod/dashboard/Computer%20Science%20and%20Engineering',
        '/principal/dashboard'
    ];
    
    for (const endpoint of endpoints) {
        try {
            const response = await fetch(`http://localhost:8080${endpoint}`);
            console.log(`✅ ${endpoint}:`, await response.json());
        } catch (error) {
            console.log(`❌ ${endpoint}:`, error.message);
        }
    }
}

// Run test
testAllEndpoints();