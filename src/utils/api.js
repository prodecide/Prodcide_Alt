export async function apiFetch(url, options = {}) {
    const token = localStorage.getItem('prodecide_jwt');
    const headers = {
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return fetch(url, { ...options, headers });
}
