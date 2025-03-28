export async function loginUser(username: string, password: string): Promise<boolean> {
	try {
		const response = await fetch('/api/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password }),
			credentials: 'include'
		});

		const data = await response.json();

		if (response.ok) {
			document.cookie = `accessToken=${data.accessToken}; path=/; SameSite=Lax`;
			return true;
		} else {
			alert(`Login failed: ${data.error || 'Unknown error'}`);
			return false;
		}
	} catch (error) {
		alert("Network error or server not responding.");
		console.error("Login Error:", error);
		return false;
	}
}

/*export async function registerUser(username: string, email: string, password: string): Promise<boolean> {	
	try {
		const response = await fetch('/api/users', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: username, email: email, password: password }),
			credentials: 'include'
		});

		const data = await response.json();

		if (response.ok) {
			return true;
		} else {
			alert(`Registration failed: ${data.error || 'Unknown error'}`);
			return false;
		}
	} catch (error) {
		alert("Network error or server not responding.");
		console.error("Registration Error:", error);
		return false;
	}
}*/

interface ApiOptions {
	method: string;
	url: string;
	body?: Record<string, any>;
	headers?: Record<string, string>;
}
  
async function apiCall<T>(options: ApiOptions): Promise<T> {
	const { method, url, body, headers } = options;
  
	try {
		const response = await fetch(url, {
			method,
			headers,
			body: body ? JSON.stringify(body) : undefined,
			credentials: 'include',
		});
  
		const data = await response.json();
  
		if (!response.ok) 
			throw new Error(`API call failed: ${data.error || 'Unknown error'}`);
  
		return data;
	
	} catch (error) {
		throw error;
	}
}
  
export interface RegisterRequest {
	name: string;
	email: string;
	password: string;
}

export async function registerUser(user: RegisterRequest): Promise<boolean> {
	const options = {
		method: 'POST',
		url: '/api/users',
		body: user,            
		headers: {
		'Content-Type': 'application/json',
		},
	};
  	return apiCall<boolean>(options);
} //find out what our api calls respond this works but not correct