import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { updateCookieStatus } from '@/lib/db/queries';
import { insertSystemLog } from '@/lib/db/queries';

/**
 * POST /api/cookie/fetch
 * Auto-fetch cookie from chat.baidu.com
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

    // Fetch from Baidu Chat
    const response = await fetch('https://chat.baidu.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Baidu Chat homepage');
    }

    const html = await response.text();
    const cookies = response.headers.get('set-cookie') || '';

    // Extract token and lid from HTML
    const tokenMatch = html.match(/"token":\s*"([^"]+)"/);
    const lidMatch = html.match(/"lid":\s*"([^"]+)"/);

    if (!tokenMatch || !lidMatch) {
      return NextResponse.json(
        {
          success: false,
          error: '无法从页面中提取 token 和 lid，可能需要登录',
        },
        { status: 400 }
      );
    }

    const token = tokenMatch[1];
    const lid = lidMatch[1];

    // Calculate expiration (7 days from now)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Save to database
    await updateCookieStatus({
      token,
      lid,
      expires_at: expiresAt,
      source: 'auto',
      is_valid: true,
    });

    // Log the fetch
    await insertSystemLog({
      level: 'INFO',
      message: `Cookie auto-fetched successfully by ${session.user.name}`,
      module: 'cookie_fetch',
      metadata: null,
    });

    return NextResponse.json({
      success: true,
      data: {
        token: token.substring(0, 20) + '...',
        lid,
        expires_at: expiresAt,
      },
      message: 'Cookie 自动获取成功',
    });
  } catch (error) {
    console.error('Auto-fetch cookie error:', error);

    // Log the error
    try {
      await insertSystemLog({
        level: 'ERROR',
        message: `Cookie auto-fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        module: 'cookie_fetch',
        metadata: null,
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return NextResponse.json(
      {
        success: false,
        error: '自动获取失败，请使用手动方式',
      },
      { status: 500 }
    );
  }
}
