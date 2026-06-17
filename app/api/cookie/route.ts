import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getCookieStatus, updateCookieStatus } from '@/lib/db/queries';
import { insertSystemLog } from '@/lib/db/queries';

/**
 * GET /api/cookie
 * Get current cookie status
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

    const cookieStatus = await getCookieStatus();

    return NextResponse.json({
      success: true,
      data: cookieStatus,
    });
  } catch (error) {
    console.error('Get cookie status error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cookie
 * Update cookie manually
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { cookieString, token, lid } = body;

    // Parse cookie string if provided
    let parsedToken = token;
    let parsedLid = lid;

    if (cookieString && !token && !lid) {
      // TODO: Parse cookie string to extract token and lid
      // This would require calling the baiduchat2api service
      return NextResponse.json(
        {
          success: false,
          error: '请提供 token 和 lid，或确保 Cookie 字符串包含这些信息',
        },
        { status: 400 }
      );
    }

    if (!parsedToken || !parsedLid) {
      return NextResponse.json(
        { success: false, error: '请提供 token 和 lid' },
        { status: 400 }
      );
    }

    // Calculate expiration (7 days from now)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await updateCookieStatus({
      token: parsedToken,
      lid: parsedLid,
      expires_at: expiresAt,
      source: 'manual',
      is_valid: true,
    });

    // Log the update
    await insertSystemLog({
      level: 'INFO',
      message: `Cookie updated manually by ${session.user.name}`,
      module: 'cookie',
      metadata: null,
    });

    return NextResponse.json({
      success: true,
      message: 'Cookie 更新成功',
    });
  } catch (error) {
    console.error('Update cookie error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
