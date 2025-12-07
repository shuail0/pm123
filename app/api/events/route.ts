import { NextRequest } from 'next/server';
import { PolymarketGammaClient } from '@/lib/polymarket';

const MIN_LIQUIDITY = 1000;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const client = new PolymarketGammaClient();
    const processForCountdown = searchParams.get('processForCountdown') === 'true';
    const onlyNegRisk = searchParams.get('onlyNegRisk') === 'true';
    const fetchAll = searchParams.get('fetchAll') === 'true';

    const excludeTagsParam = searchParams.get('exclude_tag_id');
    const excludeTagIds = excludeTagsParam ? excludeTagsParam.split(',').map(Number) : undefined;

    let allEvents: any[] = [];

    if (fetchAll) {
      console.log('🔄 开始分页获取所有事件...');
      const limit = 500;
      let offset = 0;
      let hasMore = true;
      let pageCount = 0;

      while (hasMore) {
        pageCount++;
        const events = await client.listEvents({
          closed: searchParams.get('closed') === 'true',
          active: searchParams.get('active') === 'true',
          end_date_min: searchParams.get('end_date_min') || undefined,
          order: searchParams.get('order') as any,
          ascending: searchParams.get('ascending') === 'true',
          limit,
          offset,
          exclude_tag_id: excludeTagIds
        });

        allEvents.push(...events);
        hasMore = events.length >= limit;
        offset += limit;
      }
    } else {
      allEvents = await client.listEvents({
        closed: searchParams.get('closed') === 'true',
        active: searchParams.get('active') === 'true',
        end_date_min: searchParams.get('end_date_min') || undefined,
        order: searchParams.get('order') as any,
        ascending: searchParams.get('ascending') === 'true',
        limit: parseInt(searchParams.get('limit') || '100'),
        exclude_tag_id: excludeTagIds
      });
    }

    const events = onlyNegRisk ? allEvents.filter(e => e.negRisk === true) : allEvents;
    const data = processForCountdown ? processEventsForCountdown(events) : events;

    return Response.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=59',
      },
    });
  } catch (error: any) {
    console.error('API proxy error:', error);
    const isNetworkError = error.cause?.code === 'ECONNRESET' || error.message?.includes('fetch failed');
    return Response.json(
      {
        error: isNetworkError
          ? 'Network connection failed. Please try again later.'
          : 'Failed to fetch from Polymarket API',
        details: error.message
      },
      { status: 500 }
    );
  }
}

const OFFICIAL_CATEGORIES = ['politics', 'sports', 'finance', 'crypto', 'geopolitics', 'earnings', 'tech', 'pop-culture', 'world', 'economy', 'global-elections', 'mentions'];

function processEventsForCountdown(events: any[]) {
  const now = new Date();
  return events.flatMap(event => {
    const eventDeadline = new Date(event.endDate || event.end_date_min);
    if (!eventDeadline.getTime() || eventDeadline <= now) return [];

    const hoursUntil = (eventDeadline.getTime() - now.getTime()) / 3600000;
    const urgency = hoursUntil < 1 ? 'critical' : hoursUntil < 24 ? 'urgent' : hoursUntil < 168 ? 'soon' : 'normal';
    const category = event.tags?.find((tag: any) => OFFICIAL_CATEGORIES.includes(tag.slug))?.slug || 'others';

    return (event.markets || [])
      .filter((m: any) => parseFloat(String(m.liquidity || m.liquidityNum || '0')) >= MIN_LIQUIDITY)
      .map((market: any) => ({
        ...market,
        eventId: event.id,
        eventTitle: event.title,
        eventSlug: event.slug,
        category,
        tags: event.tags?.map((tag: any) => tag.label) || [],
        tagIds: event.tags?.map((tag: any) => parseInt(tag.id)) || [],
        _deadline: eventDeadline.toISOString(),
        _urgency: urgency,
        _hoursUntil: hoursUntil,
        endDate: eventDeadline.toISOString(),
      }));
  }).sort((a, b) => new Date(a._deadline).getTime() - new Date(b._deadline).getTime());
}
