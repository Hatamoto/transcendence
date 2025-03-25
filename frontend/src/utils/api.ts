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

export async function registerUser(username: string, email: string, password: string): Promise<boolean> {
	try {
		const response = await fetch('/api/users', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, email, password }),
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
}

