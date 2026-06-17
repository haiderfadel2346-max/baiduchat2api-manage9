import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import {
  getCookiePool,
  addCookieToPool,
  updateCookiePoolItem,
  deleteCookieFromPool,
  getCookiePoolStats,
} from '@/lib/db/cookie-pool-queries';
import { insertSystemLog } from '@/lib/db/queries';

/**
 * GET /api/cookie/pool
 * Get cookie pool list
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const stats = searchParams.get('stats') === 'true';

    if (stats) {
      const poolStats = await getCookiePoolStats();
      return NextResponse.json({
        success: true,
        data: poolStats,
      });
    }

    const result = await getCookiePool({ page, limit, activeOnly });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get cookie pool error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cookie/pool
 * Add new cookie to pool
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

    if (!cookieString) {
      return NextResponse.json(
        { success: false, error: '请提供 Cookie 字符串' },
        { status: 400 }
      );
    }

    const newCookie = await addCookieToPool(cookieString, token, lid);

    // Log the addition
    await insertSystemLog({
      level: 'INFO',
      message: `Cookie added to pool by ${session.user.name} (ID: ${newCookie.id})`,
      module: 'cookie_pool',
      metadata: null,
    });

    return NextResponse.json({
      success: true,
      data: newCookie,
      message: 'Cookie 添加成功',
    });
  } catch (error) {
    console.error('Add cookie to pool error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/cookie/pool
 * Update cookie pool item
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: '请提供 Cookie ID' },
        { status: 400 }
      );
    }

    await updateCookiePoolItem(id, updateData);

    // Log the update
    await insertSystemLog({
      level: 'INFO',
      message: `Cookie pool item updated by ${session.user.name} (ID: ${id})`,
      module: 'cookie_pool',
      metadata: { updateData },
    });

    return NextResponse.json({
      success: true,
      message: 'Cookie 更新成功',
    });
  } catch (error) {
    console.error('Update cookie pool error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cookie/pool
 * Delete cookie from pool
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: '请提供 Cookie ID' },
        { status: 400 }
      );
    }

    await deleteCookieFromPool(parseInt(id, 10));

    // Log the deletion
    await insertSystemLog({
      level: 'INFO',
      message: `Cookie deleted from pool by ${session.user.name} (ID: ${id})`,
      module: 'cookie_pool',
      metadata: null,
    });

    return NextResponse.json({
      success: true,
      message: 'Cookie 删除成功',
    });
  } catch (error) {
    console.error('Delete cookie from pool error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
