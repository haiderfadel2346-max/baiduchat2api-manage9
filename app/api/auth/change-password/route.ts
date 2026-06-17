import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { hashPassword, validatePassword } from '@/lib/auth';
import { getUserById, updateUserPassword } from '@/lib/db/queries';

/**
 * POST /api/auth/change-password
 * Change user password
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
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: '请提供当前密码和新密码' },
        { status: 400 }
      );
    }

    // Validate new password
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Get user
    const userId = parseInt(session.user.id, 10);
    const user = await getUserById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    // Verify current password
    const { verifyPassword } = await import('@/lib/auth');
    const isValid = await verifyPassword(currentPassword, user.password_hash);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: '当前密码错误' },
        { status: 400 }
      );
    }

    // Hash and update new password
    const passwordHash = await hashPassword(newPassword);
    await updateUserPassword(userId, passwordHash);

    return NextResponse.json({
      success: true,
      message: '密码修改成功',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
