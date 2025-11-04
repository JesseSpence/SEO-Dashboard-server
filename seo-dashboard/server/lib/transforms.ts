export function normalizePagePath(pagePath: string): string {
	let normalized = pagePath === '/' ? '/' : pagePath.replace(/\/$/, '');
	if (!normalized.startsWith('/')) normalized = '/' + normalized;
	return normalized;
}

export function getDateRange(days: number) {
	const endDate = new Date();
	const startDate = new Date();
	startDate.setDate(startDate.getDate() - days);
	return { startDate: formatDate(startDate), endDate: formatDate(endDate) };
}

export function formatDate(date: Date) {
	return date.toISOString().split('T')[0];
}

export function computeUpdatePriority(gscCurrent: any[], ga4Current: any[]) {
	const priorities: any[] = [];
	const gscMap = new Map<string, any>();
	const ga4Map = new Map<string, any>();
	gscCurrent.forEach((p) => gscMap.set(normalizePagePath(p.page), p));
	ga4Current.forEach((p) => ga4Map.set(normalizePagePath(p.pagePath), p));
	const all = new Set([...gscMap.keys(), ...ga4Map.keys()]);
	for (const pagePath of all) {
		const gsc = gscMap.get(pagePath);
		const ga4 = ga4Map.get(pagePath);
		let priority = 0;
		const reasons: string[] = [];
		if (gsc) {
			if (gsc.impressions > 1000 && gsc.ctr < 0.02) {
				priority += 30;
				reasons.push('High impressions, low CTR');
			}
			if (gsc.impressions > 500 && gsc.position > 10) {
				priority += 25;
				reasons.push('High impressions, poor position');
			}
			if (gsc.position <= 5 && gsc.ctr < 0.03) {
				priority += 20;
				reasons.push('Good position, low CTR');
			}
		}
		if (ga4) {
			if (ga4.sessions > 100 && ga4.averageSessionDuration < 30) {
				priority += 25;
				reasons.push('High traffic, low engagement');
			}
			if (ga4.sessions > 50) {
				priority += 15;
				reasons.push('High traffic page');
			}
		}
		if (priority > 0) {
			priorities.push({ pagePath, priority, reasons, metrics: { current: gsc?.impressions || 0, previous: 0, delta: gsc?.impressions || 0 } });
		}
	}
	return priorities.sort((a, b) => b.priority - a.priority).slice(0, 100);
}
