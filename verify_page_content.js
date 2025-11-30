const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const EMAIL = 'admin@sdherbs.com';
const PASSWORD = 'Admin@123';

async function verifyPageContent() {
    try {
        console.log('1. Logging in...');
        const loginRes = await axios.post(`${API_URL}/admin/login`, {
            email: EMAIL,
            password: PASSWORD
        });
        console.log('   Login Response Data:', loginRes.data);
        const token = loginRes.data.token;
        console.log('   Token:', token);

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        console.log('\n2. Updating Activity Page Content...');
        const updateRes = await axios.put(`${API_URL}/page-content/activity`, {
            title: 'API Dynamic Title',
            description: 'API Dynamic Description'
        }, config);
        console.log('   Update Response:', updateRes.data);

        console.log('\n3. Fetching Activity Page Content...');
        const getRes = await axios.get(`${API_URL}/page-content/activity`);
        console.log('   Fetch Response:', getRes.data);

        if (getRes.data.title === 'API Dynamic Title') {
            console.log('\n✅ VERIFICATION COMPLETE: Page Content API working.');
        } else {
            console.error('\n❌ VERIFICATION FAILED: Content mismatch.');
        }

    } catch (error) {
        console.error('\n❌ VERIFICATION FAILED:', error.response ? error.response.data : error.message);
    }
}

verifyPageContent();
