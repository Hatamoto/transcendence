interface ApiOptions {
	method: string;
	url: string;
	body?: Record<string, any>;
	headers?: Record<string, string>;
}

interface ApiReturn<T> {
	status: number,
	data?: T;
}

export interface LoginRequest {
	username: string;
	password: string;
}

export interface RegistrationRequest {
	name: string;
	email: string;
	password: string;
}

export interface User {
	name: string;
	onlineStatus: boolean;
	wins: number;
	losses: number;
	avatarPath: string;
}

const API_AUTH_URL = 'http://localhost:4000';

async function apiCall<T>(options: ApiOptions): Promise<ApiReturn<T>> {
	const { method, url, body, headers } = options;
  
	try {
		const response = await fetch(url, {
			method,
			headers,
			body: body ? JSON.stringify(body) : undefined,
			credentials: 'include',
		});
  
		const responseData = await response.json();
  
		if (!response.ok)
			return { status: response.status, data: undefined };

		return { status: response.status, data: responseData }
	
	} catch (error) {
		throw error; // idk what happens here :()()() saku mita helvettia
	}
}

export async function loginUser(user: LoginRequest): Promise<number> {
	const options : ApiOptions = {
		method: 'POST',
		url: `${API_AUTH_URL}/api/login`, //this changed ?!?
		body: user,            
		headers: {
		'Content-Type': 'application/json',
		},
	};
//	document.cookie = `accessToken=${data.accessToken}; path=/; SameSite=Lax`;
// needs to be changed to take data to save login tokens
	return ((await apiCall(options)).status);
}

export async function registerUser(user: RegistrationRequest): Promise<number> {
	const options : ApiOptions = {
		method: 'POST',
		url: '/api/user',
		body: user,            
		headers: {
		'Content-Type': 'application/json',
		},
	};
	return ((await apiCall(options)).status);
}

export async function getAllUsers(): Promise<User[] | number> {
	const options : ApiOptions = {
		method: 'GET',
		url: '/api/users',         
		headers: {
		'Content-Type': 'application/json',
		},
	};
	const response = await apiCall<User[]>(options);
	if (response.status !== 200)
		return (response.status);
	return (response.data as User[]);
}

export async function getUser(id: string): Promise<User | number> {
	const options : ApiOptions = {
		method: 'GET',
		url: `/api/user/${id}`, 
		headers: {
		'Content-Type': 'application/json',
		},
	};
	const response = await apiCall<User>(options);
	if (response.status !== 200)
		return (response.status); //maybe we could return the whole api struct or the json message also
	return (response.data as User);
}

export async function getDashboard() {
}

export async function uploadAvatar() {
}

export async function updateUser(id: string, user: RegistrationRequest) {
	const options : ApiOptions = {
		method: 'PUT',
		url: `/api/user/${id}`,
		body: user,            
		headers: {
		'Content-Type': 'application/json',
		},
	};
	return ((await apiCall(options)).status);
}

// do we pass passwrods as string before backend? IDK
export async function updatePassword(id: string, password: string) {
	const options : ApiOptions = {
		method: 'PUT',
		url: `/api/user/pwd/${id}`,
		body: { password: password },
		headers: {
		'Content-Type': 'application/json',
		},
	};
	return ((await apiCall(options)).status);
}

export async function deleteUser(id: string) {
	const options : ApiOptions = {
		method: 'DELETE',
		url: `/api/user/${id}`,
		headers: {
		'Content-Type': 'application/json',
		},
	};
	return ((await apiCall(options)).status);
} //i guess we doublecheck in front 

export async function friendRequest(id: string) {
	const options : ApiOptions = {
		method: 'POST',
		url: '/api/friend/request',
		body: { firendId: id },
		headers: {
		'Content-Type': 'application/json',
		},
	};
	return ((await apiCall(options)).status);
}
