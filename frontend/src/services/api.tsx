
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
		const response = await fetch(`/api/user/delete`, {
			method: 'DELETE',
			body: JSON.stringify({id: userData.id, token: userData.token}),
			headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${userData.accToken}`
			}
		});

		
		const responseData = await response.json();
		console.log(response);

		if (!response.ok)
			return {
				status: response.status,
				error: responseData.error || 'User delete failed'
			}
		return {
			status: response.status,
			error: responseData.error || 'User delete successful'
		};

	} catch (error) {
		console.error("Delete user:", error);
		return {
			status: 500,
			error: 'Something went wrong. Please try again.'
		};
	}
}

export interface User {
	name: string;
	onlineStatus: boolean;
	wins: number;
	losses: number;
	avatarPath: string;
	email: string;
	error: string;
}

export async function getUser(id: string): Promise<User> {

	try {
		const response = await fetch(`/api/user/${id}`, {
			method: 'GET',
			headers: {
			'Content-Type': 'application/json',
			}
		});

		const responseData = await response.json();

		if (!response.ok)
			return { name: '',
				onlineStatus: false,
				wins: 0,
				losses: 0,
				avatarPath: '',
				email: '',
				error: responseData.error
		}
		return { name: responseData.name,
			onlineStatus: responseData.status,
			wins: responseData.wins,
			losses: responseData.losses,
			avatarPath: responseData.avatarPath,
			email: responseData.email,
			error: responseData.error
		}
		
	} catch (error) {
		error.console.log();
		console.error("Login error:", error);
		return { name: '',
			onlineStatus: false,
			wins: 0,
			losses: 0,
			avatarPath: '',
			email: '',
			error: 'Something went wrong. Please try again.'
		};
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
