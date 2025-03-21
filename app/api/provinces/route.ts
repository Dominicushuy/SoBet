// app/api/provinces/route.ts
import { NextRequest, NextResponse } from 'next/server';

import { getProvincesForDay } from '@/lib/supabase/queries';
import createServerClient from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const day = searchParams.get('day');
    const region = searchParams.get('region');

    if (!day) {
      return NextResponse.json({ error: 'Missing day parameter' }, { status: 400 });
    }

    const dayOfWeek = parseInt(day);
    if (isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
      return NextResponse.json({ error: 'Invalid day parameter' }, { status: 400 });
    }

    const supabase = await createServerClient();
    let regionFilter: 'M1' | 'M2' | 'BOTH' = 'BOTH';

    if (region && (region === 'M1' || region === 'M2')) {
      regionFilter = region as 'M1' | 'M2';
    } else if (region && region.includes(',')) {
      // Chọn 'BOTH' nếu có cả M1 và M2
      const regions = region.split(',');
      if (regions.includes('M1') && regions.includes('M2')) {
        regionFilter = 'BOTH';
      } else if (regions.includes('M1')) {
        regionFilter = 'M1';
      } else if (regions.includes('M2')) {
        regionFilter = 'M2';
      }
    }

    const provinces = await getProvincesForDay(supabase, dayOfWeek, regionFilter);

    return NextResponse.json(provinces);
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return NextResponse.json({ error: 'Failed to fetch provinces' }, { status: 500 });
  }
}
