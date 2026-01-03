import { NextRequest } from 'next/server';
import prisma from './prisma';

export async function verifyFarmerSession(request: NextRequest) {
  try {
    // Get session from Authorization header
    const authHeader = request.headers.get('authorization');
    const sessionId = request.cookies.get('session_id')?.value;
    
    let token: string | null = null;
    
    if (authHeader?.startsWith('Session ')) {
      token = authHeader.substring(8);
    } else if (sessionId) {
      token = sessionId;
    }
    
    if (!token) {
      return { isValid: false, error: 'No session found', farmerId: null };
    }
    
    // In a real app, you'd validate the session in a sessions table
    // For now, we'll just check if there's a farmer with matching data
    
    // Get user from token (simplified - in production use JWT or session DB)
    // This is a simplified version - you should implement proper session validation
    
    // For now, we'll accept any valid session and get farmer from user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          // In a real app, you'd have a sessions table
          { phone: { contains: 'farmer' } } // Simplified check
        ]
      },
      include: { farmer: true }
    });
    
    if (!user || !user.farmer) {
      return { isValid: false, error: 'Invalid session', farmerId: null };
    }
    
    return { 
      isValid: true, 
      farmerId: user.farmer.id,
      userId: user.id,
      userRole: user.role
    };
    
  } catch (error) {
    console.error('Session verification error:', error);
    return { isValid: false, error: 'Session verification failed', farmerId: null };
  }
}