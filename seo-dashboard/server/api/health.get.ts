import { getServiceConfig } from '../lib/auth';

export default defineEventHandler((event) => {
	const { mode, siteUrl, ga4PropertyId } = getServiceConfig();
	return {
		ok: true,
		mode,
		siteUrlConfigured: !!siteUrl,
		ga4PropertyConfigured: !!ga4PropertyId,
		timestamp: new Date().toISOString(),
		uptimeSeconds: process.uptime(),
	};
});
