
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

interface ProtectedApiOptions {
	method: string;
	url: string;
	body?: Record<string, any> | string;
	headers?: Record<string, string>;
}

interface ProtectedApiReturn<T> {
	status: number;
	data?: T;
	error?: string;
}

export async function protectedApiCall<T>(options: ProtectedApiOptions): Promise<ProtectedApiReturn<T>> {
	const userId = sessionStorage.getItem('activeUserId');
	if (!userId) return { status: 401, error: 'No active user' };

	const sessionData = JSON.parse(sessionStorage.getItem(userId) || '{}');
	let accessToken = sessionData.accessToken;
	const refreshToken = sessionData.refreshToken;

	if (!accessToken || !refreshToken) return { status: 401, error: 'Missing tokens' };

	const buildHeaders = (token: string) => ({
		'Content-Type': 'application/json',
		Authorization: `Bearer ${token}`,
		...(options.headers || {})
	});

	const requestInit = (token: string): RequestInit => ({
		method: options.method,
		headers: buildHeaders(token),
		body: options.body ? JSON.stringify(options.body) : undefined,
		credentials: 'include',
	});

	// first attempt
	let res = await fetch(options.url, requestInit(accessToken));
	if (res.status === 403) {
		// try refresh
		const refreshRes = await fetch(`${API_AUTH_URL}/api/token`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer`, // intentional placeholder?
			},
			body: JSON.stringify({ id: Number(userId), token: refreshToken }),
		});

		if (!refreshRes.ok) {
			const err = await refreshRes.json();
			return { status: 403, error: err.error || 'Refresh failed' };
		}

		const newTokens = await refreshRes.json();
		sessionStorage.setItem(userId, JSON.stringify({
			accessToken: newTokens.accessToken,
			refreshToken
		}));

		// retry original call with new token
		res = await fetch(options.url, requestInit(newTokens.accessToken));
	}

	if (!res.ok) {
		let error;
		try {
			const json = await res.json();
			error = json?.error;
		} catch {
			error = 'Unknown error';
		}
		return { status: res.status, error };
	}

	const data = await res.json();
	return { status: res.status, data };
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
	captchaToken: string;
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
	captchaToken: string;
}

export interface LoginResponse {
	userId: number;
	accessToken: string;
	refreshToken: string;
	status: number;
	error: string;
}

const API_AUTH_URL = 'http://localhost:4000'; //add to .env

export async function loginUser(userData: LoginRequest, captchaToken): Promise<LoginResponse> {

	try {
		const response = await fetch(`${API_AUTH_URL}/api/login`, {
			method: 'POST',
			body: JSON.stringify(userData, captchaToken),            
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
	captchaToken: string;
}

interface DeleteUserResponse {
	status: number;
	error: string;
}

export async function deleteUser(userData: DeleteUserRequest): Promise<DeleteUserResponse> {
	try {
		const response = await protectedApiCall<DeleteUserResponse>({
			method: "DELETE",
			url: "/api/user/delete",
			body: {
				id: userData.id,
				token: userData.token, // this is the refreshToken
			},
			headers: {
				"Content-Type": "application/json",
			},
		});

		return {
			status: response.status,
			error: response.error || (response.status === 200 ? "User delete successful" : "User delete failed"),
		};

	} catch (error) {
		console.error("Delete user error:", error);
		return {
			status: 500,
			error: "Something went wrong. Please try again."
		};
	}
}


export interface User {
	name: string;
	onlineStatus: boolean;
	wins: number;
	losses: number;
	avatarPath: string;
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

export interface Friend {
	friend_id: string;
}

export async function getFriends(): Promise<Friend[] | null> {
	const response = await protectedApiCall<Friend[]>({
		method: "GET",
		url: "/api/friends",
	});

	if (response.status === 204) return [];
	if (response.status !== 200) {
		console.error("Error fetching friends:", response.error);
		return null;
	}

	return response.data || [];
}



