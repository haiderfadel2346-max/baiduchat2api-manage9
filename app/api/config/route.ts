import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import {
  getAllConfigSettings,
  updateConfigSetting,
  getConfigHistory,
} from '@/lib/db/queries';

/**
 * GET /api/config
 * Get all configuration settings
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
    const history = searchParams.get('history') === 'true';

    if (history) {
      const key = searchParams.get('key') || undefined;
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '20', 10);

      const result = await getConfigHistory(key, { page, limit });

      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    const settings = await getAllConfigSettings();

    // Convert to key-value object
    const config: Record<string, any> = {};
    settings.forEach((setting) => {
      if (setting.value_type === 'boolean') {
        config[setting.key] = setting.value === 'true';
      } else if (setting.value_type === 'number') {
        config[setting.key] = parseFloat(setting.value || '0');
      } else {
        config[setting.key] = setting.value;
      }
    });

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('Get config error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/config
 * Update configuration settings
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { success: false, error: '请提供配置键和值' },
        { status: 400 }
      );
    }

    await updateConfigSetting(
      key,
      typeof value === 'object' ? JSON.stringify(value) : String(value),
      session.user.name || 'admin'
    );

    return NextResponse.json({
      success: true,
      message: '配置更新成功',
    });
  } catch (error) {
    console.error('Update config error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
