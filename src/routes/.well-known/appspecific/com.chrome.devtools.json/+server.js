// src/routes/.well-known/appspecific/com.chrome.devtools.json/+server.js
export function GET() {
	return new Response(JSON.stringify({}), {
		headers: {
			'Content-Type': 'application/json'
		}
	});
}
