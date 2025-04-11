import https from 'https';

export function getExternalIP() {
	return new Promise((resolve, reject) => {
		https.get('https://api.ipify.org?format=json', (res) => {
			let data = '';
			res.on('data', chunk => data += chunk);
			res.on('end', () => {
				try {
					const { ip } = JSON.parse(data);
					resolve(ip);
				} catch (err) {
					reject(err);
				}
			});
		}).on('error', reject);
	});
}
