import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import bcrypt from 'bcrypt';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const requiredFields = ['email', 'phone', 'password', 'fullName', 'role'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${body.email},phone.eq.${body.phone}`)
      .single();
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email or phone already exists' },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);
    
    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email: body.email,
        phone: body.phone,
        password_hash: hashedPassword,
        role: body.role,
        full_name: body.fullName,
        is_verified: false,
      })
      .select()
      .single();
    
    if (userError) throw userError;
    
    // Create role-specific profile
    if (body.role === 'farmer') {
      await supabase.from('farmers').insert({
        user_id: user.id,
        farm_name: body.farmName || '',
        region: body.region || '',
        residence: body.residence || '',
        certifications: [],
      });
    } else if (body.role === 'buyer') {
      await supabase.from('buyers').insert({
        user_id: user.id,
        company_name: body.companyName || '',
        business_type: body.businessType || '',
        location: '',
        preferred_regions: [],
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      userId: user.id,
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}