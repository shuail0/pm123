import { NextRequest } from 'next/server';
import { PolymarketGammaClient } from '@/lib/polymarket';

const MIN_LIQUIDITY = 1000;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 🔍 打印所有接收到的参数
    console.log('📥 API 接收到的参数:', Object.fromEntries(searchParams));

    const client = new PolymarketGammaClient();
    const processForCountdown = searchParams.get('processForCountdown') === 'true';

    const events = await client.listEvents({
      closed: searchParams.get('closed') === 'true',
      active: searchParams.get('active') === 'true',
      end_date_min: searchParams.get('end_date_min') || undefined,
      order: searchParams.get('order') as any,
      ascending: searchParams.get('ascending') === 'true',
      limit: parseInt(searchParams.get('limit') || '100')
    });

    const data = processForCountdown ? processEventsForCountdown(events) : events;

    return Response.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=59',
      },
    });
  } catch (error) {
    console.error('API proxy error:', error);
    return Response.json(
      { error: 'Failed to fetch from Polymarket API' },
      { status: 500 }
    );
  }
}

function processEventsForCountdown(events: any[]) {
  const now = new Date();
  return events.flatMap(event => {
    const eventDeadline = new Date(event.endDate || event.end_date_min);
    if (!eventDeadline.getTime() || eventDeadline <= now) return [];

    const hoursUntil = (eventDeadline.getTime() - now.getTime()) / 3600000;
    const urgency = hoursUntil < 1 ? 'critical' : hoursUntil < 24 ? 'urgent' : hoursUntil < 168 ? 'soon' : 'normal';

    return (event.markets || [])
      .filter((m: any) => parseFloat(String(m.liquidity || m.liquidityNum || '0')) >= MIN_LIQUIDITY)
      .map((market: any) => ({
        ...market,
        eventId: event.id,
        eventTitle: event.title,
        eventSlug: event.slug,
        category: event.category || market.category,
        _deadline: eventDeadline.toISOString(),
        _urgency: urgency,
        _hoursUntil: hoursUntil,
        endDate: eventDeadline.toISOString(),
      }));
  }).sort((a, b) => new Date(a._deadline).getTime() - new Date(b._deadline).getTime());
}
