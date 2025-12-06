// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
  
  // Clear all auth cookies
  response.cookies.delete('user_id');
  response.cookies.delete('farmer_id');
  response.cookies.delete('session');
  
  return response;
}