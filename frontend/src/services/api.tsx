
interface AuthFetchOptions {
	method: string;
	body: string;
	headers: {
	  'Content-Type': string;
	  'Authorization': string;
	};
}

interface AuthFetchResponse {
	status: number;
	error: string;
	newToken?: string;
}

async function authFetch(url: string, options: AuthFetchOptions): Promise<AuthFetchResponse> {

	console.log("in authfetch before fetch", url, options);
	const response = await fetch(url, options);
	console.log("in authfetch after fetch", response);

	const responseData = await response.json();

	if (response.status === 401) {
		return {
			status: response.status,
			error: responseData.error || 'Unauthorized'
		}
	}

	if (response.status === 403) {

		console.log("403, getting new token");

		const userId = sessionStorage.getItem('activeUserId');
		const sessionData = JSON.parse(sessionStorage.getItem(userId) || '{}')
		const refreshToken = sessionData.refreshToken

		const response = await fetch(`${API_AUTH_URL}/api/token`, {
			method: 'POST',
			body: JSON.stringify({id: Number(userId), token: sessionData.refreshToken}),
			headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer`
			}
		});
		
		console.log("hello after fetch ",response);
		const newResponse = await response.json();
		console.log("with new accessToken ",newResponse);

		if (response.ok) {
			console.log("ok response");
			sessionStorage.removeItem(userId);
			sessionStorage.setItem('activeUserId', userId.toString());
			sessionStorage.setItem(userId.toString(), JSON.stringify({accessToken: newResponse.accessToken, refreshToken: refreshToken}));
			return {
				status: 1,
				error: 'accessToken refreshed',
				newToken: newResponse.accessToken
			}
		}

		if (!response.status) {
			return {
				status: response.status,
				error: newResponse.error
			}
		}
	}
	return {
		status: response.status,
		error: responseData.error
	};
}

export interface RegistrationRequest {
	name: string;
	email: string;
	password: string;
}

export interface RegistrationResponse {
	userId: number;
	email: string;
	avatarPath: string;
	status: number;
	error: string;
}

export async function registerUser(userData: RegistrationRequest): Promise<RegistrationResponse> {
	
	try {
		const response = await fetch('/api/user', {
			method: 'POST',
			body: JSON.stringify(userData),
			headers: {
			'Content-Type': 'application/json',
			}
		});

		const responseData = await response.json();

		if (!response.ok)
			return { userId: 0,
				email: '',
				avatarPath: '',
				status: response.status,
				error: responseData.error
		}
		return { userId: responseData.userId,
			email: responseData.email,
			avatarPath: responseData.avatarPath,
			status: response.status,
			error: 'Registration successfull'
		}
		
	} catch (error) {
		console.error("Login error:", error);
		return {
			userId: 0,
			email: '',
			avatarPath: '',
			status: 500,
			error: 'Something went wrong. Please try again.'
		};
	}
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface LoginResponse {
	userId: number;
	accessToken: string;
	refreshToken: string;
	status: number;
	error: string;
}

const API_AUTH_URL = 'http://localhost:4000'; //add to .env

export async function loginUser(userData: LoginRequest): Promise<LoginResponse> {

	try {
		const response = await fetch(`${API_AUTH_URL}/api/login`, {
			method: 'POST',
			body: JSON.stringify(userData),            
			headers: {
			'Content-Type': 'application/json',
			}
		});

		const responseData = await response.json();

		if (!response.ok)
			return { userId: 0,
				accessToken: '',
				refreshToken: '',
				status: response.status,
				error: responseData.error || 'Login failed'
			}
		return {
			userId: responseData.userId,
			accessToken: responseData.accessToken,
			refreshToken: responseData.refreshToken,
			status: response.status,
			error: responseData.error || 'Login successful'
		};

	} catch (error) {
		console.error("Login error:", error);
		return {
			userId: 0,
			accessToken: '',
			refreshToken: '',
			status: 500,
			error: 'Something went wrong. Please try again.'
		};
	}
}

export interface LogoutRequest {
	token: string;
}

interface LogoutResponse {
	status: number;
	error: string;
}

export async function logoutUser(userData: LogoutRequest): Promise<LogoutResponse> {

	try {
		const response = await fetch(`${API_AUTH_URL}/api/logout`, {
			method: 'DELETE',
			body: JSON.stringify(userData), 
			headers: {
			'Content-Type': 'application/json',
			}
		});

		if (!response.ok)
			return {
				status: response.status,
				error: 'Logout failed'
			}
		return {
			status: response.status,
			error: 'Logout successful'
		};

	} catch (error) {
		console.error("Logout error:", error);
		return {
			status: 500,
			error: 'Something went wrong. Please try again.'
		};
	}
}

export interface DeleteUserRequest {
	id: number;
	accToken: string;
	token: string; // refreshtoken, name: token to match backend
}

interface DeleteUserResponse {
	status: number;
	error: string;
}

export async function deleteUser(userData: DeleteUserRequest): Promise<DeleteUserResponse> {

	try {
			const options = {
				method: 'DELETE',
				body: JSON.stringify({id: userData.id, token: userData.token}),
				headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${userData.accToken}`
				}
			}

		const response = await authFetch(`/api/user/delete` , options);

		if (response.status == 1) {
			console.log(userData.accToken);
			const retryResponse = await fetch(`/api/user/delete`, {
				method: 'DELETE',
				body: JSON.stringify({id: userData.id, token: userData.token}),
				headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${response.newToken}`
				}
			});
			
			
			const responseData = await retryResponse.json();
			console.log(retryResponse);
			
			if (!retryResponse.ok)
				return {
				status: retryResponse.status,
				error: responseData.error || 'User delete failed'
				}
			return {
				status: retryResponse.status,
				error: responseData.error || 'User delete successful'
			};
		}

		if (response.status >= 300)
			return {
			status: response.status,
			error: response.error || 'User delete failed'
			}
		return {
			status: response.status,
			error: response.error || 'User delete successful'
		};

	} catch (error) {
		console.error("Delete user:", error);
		return {
			status: 500,
			error: 'Something went wrong. Please try again.'
		};
	}
} //force logaout/delete if refreshToken has expired?












interface ApiOptions {
	method: string;
	url: string;
	body?: Record<string, any>;
	headers?: Record<string, string>;
}

interface ApiReturn<T> {
	status: number;
	data?: T;
}

// interface ApiReturn {
// 	status: number;
// 	data?: string;
// }

export interface User {
	name: string;
	onlineStatus: boolean;
	wins: number;
	losses: number;
	avatarPath: string;
}

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

// export async function getDashboard() {
// }

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

// export async function deleteUser(id: string) {
// 	const options : ApiOptions = {
// 		method: 'DELETE',
// 		url: `/api/user/${id}`,
// 		headers: {
// 		'Content-Type': 'application/json',
// 		},
// 	};
// 	return ((await apiCall(options)).status);
// } //i guess we doublecheck in front 

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
