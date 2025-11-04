import { appendHeader, setHeader } from 'h3';

// Allow list of origins
const allowOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:5500', 'http://127.0.0.1:3000', 'https://fundyboard.netlify.app'];

export default defineEventHandler((event) => {
	// Only apply to API routes
	if (!event.path.startsWith('/api/')) return;
	const reqOrigin = getRequestHeader(event, 'origin');
	if (reqOrigin && allowOrigins.includes(reqOrigin)) {
		setHeader(event, 'Access-Control-Allow-Origin', reqOrigin);
	} else {
		// Optionally set a default for non-whitelisted origins (omit to block)
		// setHeader(event, 'Access-Control-Allow-Origin', '');
	}
	appendHeader(event, 'Vary', 'Origin');
	setHeader(event, 'Access-Control-Allow-Credentials', 'true');
	setHeader(event, 'Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
	setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization');

	if (event.method === 'OPTIONS') {
		// Preflight response
		event.node.res.statusCode = 204;
		event.node.res.end();
	}
});
