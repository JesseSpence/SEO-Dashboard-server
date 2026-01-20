// Mock Mode Configuration
// Set MOCK_MODE to true to use mock data instead of API calls
const MOCK_CONFIG = {
    enabled: true, // Change to false to use real API calls
    backendUrl: 'https://api.themetastack.com', // Backend URL (not used when mock mode is enabled)
    delay: 500 // Simulated API delay in milliseconds
};

// Export configuration
window.MOCK_CONFIG = MOCK_CONFIG;

