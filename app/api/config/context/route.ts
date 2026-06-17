import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import {
  getConfigSetting,
  updateConfigSetting,
} from '@/lib/db/queries';

/**
 * GET /api/config/context
 * Get context configuration
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

    const [
      freshConv,
      maxChars,
      maxMessages,
      maxMessageChars,
      poolEnabled,
    ] = await Promise.all([
      getConfigSetting('fresh_conversation'),
      getConfigSetting('context_max_chars'),
      getConfigSetting('context_max_messages'),
      getConfigSetting('context_max_message_chars'),
      getConfigSetting('cookie_pool_enabled'),
    ]);

    const config = {
      fresh_conversation: freshConv?.value === 'true',
      context_max_chars: parseInt(maxChars?.value || '12000', 10),
      context_max_messages: parseInt(maxMessages?.value || '16', 10),
      context_max_message_chars: parseInt(maxMessageChars?.value || '2000', 10),
      cookie_pool_enabled: poolEnabled?.value === 'true',
    };

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('Get context config error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/config/context
 * Update context configuration
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
    const {
      fresh_conversation,
      context_max_chars,
      context_max_messages,
      context_max_message_chars,
      cookie_pool_enabled,
    } = body;

    const username = session.user.name || 'admin';

    // Update all provided fields
    const updates: Promise<void>[] = [];

    if (fresh_conversation !== undefined) {
      updates.push(
        updateConfigSetting(
          'fresh_conversation',
          String(fresh_conversation),
          username
        )
      );
    }

    if (context_max_chars !== undefined) {
      updates.push(
        updateConfigSetting(
          'context_max_chars',
          String(context_max_chars),
          username
        )
      );
    }

    if (context_max_messages !== undefined) {
      updates.push(
        updateConfigSetting(
          'context_max_messages',
          String(context_max_messages),
          username
        )
      );
    }

    if (context_max_message_chars !== undefined) {
      updates.push(
        updateConfigSetting(
          'context_max_message_chars',
          String(context_max_message_chars),
          username
        )
      );
    }

    if (cookie_pool_enabled !== undefined) {
      updates.push(
        updateConfigSetting(
          'cookie_pool_enabled',
          String(cookie_pool_enabled),
          username
        )
      );
    }

    await Promise.all(updates);

    return NextResponse.json({
      success: true,
      message: '上下文配置更新成功',
    });
  } catch (error) {
    console.error('Update context config error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
