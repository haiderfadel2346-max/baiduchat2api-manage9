import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getApiLogStats } from '@/lib/db/queries';
import { getCookieStatus } from '@/lib/db/queries';

/**
 * GET /api/monitor
 * Get system monitoring data
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get stats for the last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const now = new Date();

    const [stats, cookieStatus] = await Promise.all([
      getApiLogStats(yesterday, now),
      getCookieStatus(),
    ]);

    // Check if cookie is still valid
    const cookieValid = cookieStatus
      ? cookieStatus.is_valid &&
        (!cookieStatus.expires_at ||
          new Date(cookieStatus.expires_at) > now)
      : false;

    const data = {
      stats: {
        totalRequests: stats.totalRequests,
        successRate: stats.successRate,
        avgResponseTime: stats.avgResponseTime,
        errorCount: stats.errorCount,
      },
      cookie: {
        status: cookieValid ? 'valid' : 'expired',
        lastUpdated: cookieStatus?.updated_at || null,
        expiresAt: cookieStatus?.expires_at || null,
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Get monitor data error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
