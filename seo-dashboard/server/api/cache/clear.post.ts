import { clearCache } from '../../lib/cache';
export default defineEventHandler(() => {
	clearCache();
	return { message: 'Cache cleared' };
});
