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

// SPLITTAA TÄÄ!!!!

async function apiCall<T>(options: ApiOptions): Promise<ApiReturn<T>> {
	const { method, url, body, headers } = options;

	try {
		const response = await fetch(url, {
			method,
			headers,
			body: body ? JSON.stringify(body) : undefined,
			credentials: 'include',
		});

		let responseData: any = null;
		try {
			const text = await response.text();
			responseData = text ? JSON.parse(text) : null;
		} catch (err) {
			console.warn("Failed to parse JSON response", err);
		}

		if (!response.ok) {
			return { status: response.status, data: undefined };
		}

		return { status: response.status, data: responseData };

	} catch (error) {
		throw error;
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
	const accessToken = sessionData.accessToken;
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

	let res = await fetch(options.url, requestInit(accessToken));

	if (res.status === 403) {
		const refreshRes = await fetch(`${API_AUTH_URL}/api/token`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer`, // placeholder
			},
			body: JSON.stringify({ id: Number(userId), token: refreshToken }),
		});

		if (!refreshRes.ok) {
			let errMsg = 'Refresh failed';
			try {
				const text = await refreshRes.text();
				errMsg = text ? JSON.parse(text).error : errMsg;
			} catch (_) {}

			return { status: 403, error: errMsg };
		}

		const newTokens = await refreshRes.json();
		sessionStorage.setItem(userId, JSON.stringify({
			accessToken: newTokens.accessToken,
			refreshToken
		}));

		res = await fetch(options.url, requestInit(newTokens.accessToken));
	}

	let data: any = null;
	try {
		const text = await res.text();
		data = text ? JSON.parse(text) : null;
	} catch (err) {
		console.warn("Failed to parse JSON in protectedApiCall", err);
	}

	if (!res.ok) {
		return { status: res.status, error: data?.error || 'Unknown error' };
	}

	return { status: res.status, data };
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

		let responseData;
		try {
			responseData = await response.json();
		} catch {
			responseData = {};
		}

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

		let responseData;
		try {
			responseData = await response.json();
		} catch {
			responseData = {};
		}

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
	const response = await protectedApiCall<User[]>({
		method: 'GET',
		url: '/api/users',
		headers: {
			'Content-Type': 'application/json',
		},
	});

	if (response.status !== 200)
		return response.status;

	return response.data as User[];
}

export async function getUser(id: string): Promise<User | number> {
	const response = await protectedApiCall<User>({
		method: 'GET',
		url: `/api/user/${id}`,
		headers: {
			'Content-Type': 'application/json',
		},
	});

	if (response.status !== 200)
		return response.status;

	return response.data as User;
}


// export async function getDashboard() {
// }

export async function uploadAvatar(file: File): Promise<ProtectedApiReturn<null>> {
	const formData = new FormData();
	formData.append('avatar', file);

	const userId = sessionStorage.getItem('activeUserId');
	const sessionData = JSON.parse(sessionStorage.getItem(userId) || '{}');
	const accessToken = sessionData.accessToken;

	const response = await fetch('/api/user/avatar', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
		body: formData,
	});

	if (!response.ok) {
		return { status: response.status, error: 'Upload failed' };
	}

	return { status: response.status, data: null };
}


export async function updateUser(id: string, user: RegistrationRequest): Promise<number> {
	const response = await protectedApiCall<null>({
		method: 'PUT',
		url: `/api/user/${id}`,
		body: user,
		headers: {
			'Content-Type': 'application/json',
		},
	});

	return response.status;
}


// do we pass passwrods as string before backend? IDK
export async function updatePassword(id: string, password: string): Promise<number> {
	const response = await protectedApiCall<null>({
		method: 'PUT',
		url: `/api/user/pwd/${id}`,
		body: { password },
		headers: {
			'Content-Type': 'application/json',
		},
	});

	return response.status;
}


export async function friendRequest(friendId: number): Promise<ProtectedApiReturn<null>> {
	return await protectedApiCall<null>({
		method: 'POST',
		url: '/api/friend/request',
		body: { friendId },
	});
}

export async function acceptRequest(friendId: number): Promise<ProtectedApiReturn<null>> {
	return await protectedApiCall<null>({
		method: 'POST',
		url: '/api/friend/accept',
		body: { friendId },
	});
}

export async function blockRequest(friendId: number): Promise<ProtectedApiReturn<null>> {
	return await protectedApiCall<null>({
		method: 'POST',
		url: '/api/friend/block',
		body: { friendId },
	});
}

export async function checkPending(): Promise<ProtectedApiReturn<boolean>> {
	return await protectedApiCall<boolean>({
		method: 'POST',
		url: '/api/friend/check',
	});
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



