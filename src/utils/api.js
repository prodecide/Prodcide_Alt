export async function apiFetch(url, options = {}) {
    const token = localStorage.getItem('prodecide_jwt');
    const headers = {
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(url, { ...options, headers });
        // If the Vite proxy fails to connect to the backend, it returns 502 or 504
        if (response.status === 502 || response.status === 504) {
            throw new Error('Backend not reachable');
        }
        return response;
    } catch (error) {
        console.warn(`[Mock Fallback] API server unreachable for ${url}. Returning mock response.`);
        
        // Mock responses for the Consultant Onboarding Flow
        if (url.includes('action=send-otp') || url.includes('action=verify-otp') || url.includes('/api/consultants')) {
            return new Response(JSON.stringify({ success: true, message: "Mock success" }), { 
                status: 200, 
                headers: { 'Content-Type': 'application/json' }
            });
        }
        if (url.includes('action=google-link')) {
            return new Response(JSON.stringify({ 
                consultant: { email: 'mock@example.com', role: 'consultant' }, 
                token: 'mock_jwt_token' 
            }), { 
                status: 200, 
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        throw error;
    }
}
