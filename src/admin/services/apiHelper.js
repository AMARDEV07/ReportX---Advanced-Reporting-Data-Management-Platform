/**
 * API Helper - Central request handler
 * 
 * Currently uses mock data. When real APIs are ready:
 * 1. Set USE_MOCK = false
 * 2. Set BASE_URL to your API server
 * 3. All services will automatically use real endpoints
 */

const USE_MOCK = true;
const BASE_URL = '/api'; // Change this to your real API base URL when ready

// Simulated network delay for mock responses (ms)
const MOCK_DELAY = 500;

/**
 * Makes an API request. In mock mode, returns mock data.
 * In real mode, calls the actual API endpoint.
 * 
 * @param {string} endpoint - API endpoint (e.g. '/users', '/roles/1')
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object} body - Request body for POST/PUT
 * @param {function} mockHandler - Function that returns mock data for this endpoint
 * @returns {Promise<any>} - Response data
 */
export const apiRequest = async (endpoint, method = 'GET', body = null, mockHandler = null) => {
    if (USE_MOCK && mockHandler) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
        return mockHandler();
    }

    // Real API call
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (body && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
};

export { USE_MOCK, BASE_URL, MOCK_DELAY };
