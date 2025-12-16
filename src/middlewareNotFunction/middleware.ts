import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../lib/jwt';
import { checkAccess } from '../lib/auth/accessControl';

export async function middleware(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  try {
    const payload = await verifyToken(token);
    const path = req.nextUrl.pathname;
    
    const access = checkAccess(path, payload);

    if (!access.allowed) {
      return NextResponse.json({ error: access.error }, { status: 403 });
    }

    return NextResponse.next();
  } catch {
    return NextResponse.json({ message: 'Token inválido o expirado' }, { status: 401 });
  }
}

export const config = {
  matcher: ['/backend/api/protected/:path*'],
};