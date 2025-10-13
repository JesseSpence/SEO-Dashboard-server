import { config } from './env';

// Types for data transformation
interface DailyRow {
  date: string;
  [key: string]: any;
}

interface PageData {
  pagePath: string;
  sessions?: number;
  impressions?: number;
  clicks?: number;
  ctr?: number;
  position?: number;
}

interface UpdatePriorityScore {
  pagePath: string;
  priority: number;
  reasons: string[];
  metrics: {
    current: any;
    previous: any;
    delta: any;
  };
}

/**
 * Normalize URL to path format
 * Strips domain and returns path starting with /
 */
export function toPath(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname;
  } catch {
    // If URL parsing fails, assume it's already a path
    return url.startsWith('/') ? url : `/${url}`;
  }
}

/**
 * Normalize page path for comparison
 * Ensures consistent format for matching GSC and GA4 data
 */
export function normalizePagePath(pagePath: string): string {
  // Remove trailing slash unless it's root
  let normalized = pagePath === '/' ? '/' : pagePath.replace(/\/$/, '');
  
  // Ensure it starts with /
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }
  
  return normalized;
}

/**
 * Compute rolling 28-day sums for daily data
 */
export function computeRollingSums(
  dailyRows: DailyRow[],
  metricName: string,
  windowDays: number = 28
): Array<{ date: string; current: number; previous: number }> {
  if (dailyRows.length === 0) return [];

  // Sort by date
  const sortedRows = [...dailyRows].sort((a, b) => a.date.localeCompare(b.date));
  
  const result: Array<{ date: string; current: number; previous: number }> = [];
  
  for (let i = windowDays; i < sortedRows.length; i++) {
    const currentDate = sortedRows[i].date;
    
    // Current 28-day window
    const currentWindow = sortedRows.slice(i - windowDays + 1, i + 1);
    const currentSum = currentWindow.reduce((sum, row) => sum + (row[metricName] || 0), 0);
    
    // Previous 28-day window
    const previousWindow = sortedRows.slice(i - (windowDays * 2) + 1, i - windowDays + 1);
    const previousSum = previousWindow.reduce((sum, row) => sum + (row[metricName] || 0), 0);
    
    result.push({
      date: currentDate,
      current: currentSum,
      previous: previousSum
    });
  }
  
  return result;
}

/**
 * Compute update priority score for pages
 * Higher score = higher priority for updates
 */
export function computeUpdatePriority(
  gscData: PageData[],
  ga4Data: PageData[],
  currentPeriod: Array<{ date: string; current: number; previous: number }>,
  previousPeriod: Array<{ date: string; current: number; previous: number }>
): UpdatePriorityScore[] {
  const results: UpdatePriorityScore[] = [];
  
  // Create lookup maps for efficient matching
  const gscMap = new Map<string, PageData>();
  const ga4Map = new Map<string, PageData>();
  
  gscData.forEach(page => {
    const normalizedPath = normalizePagePath(page.pagePath);
    gscMap.set(normalizedPath, page);
  });
  
  ga4Data.forEach(page => {
    const normalizedPath = normalizePagePath(page.pagePath);
    ga4Map.set(normalizedPath, page);
  });
  
  // Get all unique pages
  const allPages = new Set([...gscMap.keys(), ...ga4Map.keys()]);
  
  for (const pagePath of allPages) {
    const gscPage = gscMap.get(pagePath);
    const ga4Page = ga4Map.get(pagePath);
    
    let priority = 0;
    const reasons: string[] = [];
    
    // GSC-based scoring
    if (gscPage) {
      const { impressions, clicks, ctr, position } = gscPage;
      
      // High impressions, low CTR (meta description issue)
      if (impressions && impressions > 1000 && ctr && ctr < 0.02) {
        priority += 30;
        reasons.push('High impressions, low CTR - optimize meta description');
      }
      
      // High impressions, poor position (SEO issue)
      if (impressions && impressions > 500 && position && position > 10) {
        priority += 25;
        reasons.push('High impressions, poor position - improve SEO');
      }
      
      // Low CTR, good position (content relevance issue)
      if (position && position <= 5 && ctr && ctr < 0.03) {
        priority += 20;
        reasons.push('Good position, low CTR - improve content relevance');
      }
    }
    
    // GA4-based scoring
    if (ga4Page) {
      const { sessions, averageSessionDuration } = ga4Page;
      
      // High traffic, low engagement (content quality issue)
      if (sessions && sessions > 100 && averageSessionDuration && averageSessionDuration < 30) {
        priority += 25;
        reasons.push('High traffic, low engagement - improve content quality');
      }
      
      // High bounce rate (user experience issue)
      if (sessions && sessions > 50) {
        priority += 15;
        reasons.push('High traffic page - monitor for bounce rate issues');
      }
    }
    
    // Trend-based scoring
    const currentTrend = currentPeriod.find(p => p.date === pagePath);
    const previousTrend = previousPeriod.find(p => p.date === pagePath);
    
    if (currentTrend && previousTrend) {
      const currentSum = currentTrend.current;
      const previousSum = previousTrend.previous;
      const delta = currentSum - previousSum;
      const deltaPercent = previousSum > 0 ? (delta / previousSum) * 100 : 0;
      
      // Declining performance
      if (deltaPercent < -20) {
        priority += 35;
        reasons.push(`Declining performance: ${deltaPercent.toFixed(1)}% decrease`);
      }
      
      // Stagnant performance
      if (Math.abs(deltaPercent) < 5 && currentSum > 100) {
        priority += 10;
        reasons.push('Stagnant performance - needs optimization');
      }
    }
    
    // Only include pages with some priority
    if (priority > 0) {
      results.push({
        pagePath,
        priority,
        reasons,
        metrics: {
          current: currentTrend?.current || 0,
          previous: previousTrend?.previous || 0,
          delta: (currentTrend?.current || 0) - (previousTrend?.previous || 0)
        }
      });
    }
  }
  
  // Sort by priority (highest first)
  return results.sort((a, b) => b.priority - a.priority);
}

/**
 * Format date for API calls
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get date range for specified number of days
 */
export function getDateRange(days: number): { startDate: string; endDate: string } {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  };
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Format number with appropriate suffix (K, M, etc.)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  } else {
    return num.toString();
  }
}

/**
 * Calculate engagement score based on GA4 metrics
 */
export function calculateEngagementScore(
  sessions: number,
  engagedSessions: number,
  averageSessionDuration: number
): number {
  if (sessions === 0) return 0;
  
  const engagementRate = engagedSessions / sessions;
  const durationScore = Math.min(averageSessionDuration / 60, 1); // Normalize to 0-1
  
  return (engagementRate * 0.7 + durationScore * 0.3) * 100;
}

