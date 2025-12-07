import { NextRequest } from 'next/server';
import { PolymarketGammaClient } from '@/lib/polymarket';
import { getTimeRange } from '@/lib/utils/timeRanges';

const MIN_LIQUIDITY = 1000;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 10;

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
      const limit = 500;
      const BATCH_SIZE = 6; // 每批并行请求数

      // 激进策略：直接并行请求前6批（0-3000条数据）
      const initialBatch = Array.from({ length: BATCH_SIZE }, (_, i) =>
        client.listEvents({
          closed: searchParams.get('closed') === 'true',
          active: searchParams.get('active') === 'true',
          end_date_min: searchParams.get('end_date_min') || undefined,
          order: searchParams.get('order') as any,
          ascending: searchParams.get('ascending') === 'true',
          limit,
          offset: i * limit,
          exclude_tag_id: excludeTagIds
        })
      );

      const initialResults = await Promise.all(initialBatch);

      // 合并结果并检查是否还有更多数据
      for (const events of initialResults) {
        if (events.length > 0) allEvents.push(...events);
      }

      // 如果最后一批还是满的，继续获取
      const lastBatch = initialResults[initialResults.length - 1];
      if (lastBatch.length >= limit) {
        let offset = BATCH_SIZE * limit;
        while (true) {
          const moreBatch = await Promise.all(
            Array.from({ length: BATCH_SIZE }, (_, i) =>
              client.listEvents({
                closed: searchParams.get('closed') === 'true',
                active: searchParams.get('active') === 'true',
                end_date_min: searchParams.get('end_date_min') || undefined,
                order: searchParams.get('order') as any,
                ascending: searchParams.get('ascending') === 'true',
                limit,
                offset: offset + i * limit,
                exclude_tag_id: excludeTagIds
              })
            )
          );

          let hasMore = false;
          for (const events of moreBatch) {
            if (events.length > 0) {
              allEvents.push(...events);
              if (events.length >= limit) hasMore = true;
            }
          }

          if (!hasMore) break;
          offset += BATCH_SIZE * limit;
        }
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
  const now = Date.now();
  const results: any[] = [];

  for (const event of events) {
    const deadline = new Date(event.endDate || event.end_date_min).getTime();
    if (!deadline || deadline <= now) continue;

    const hoursUntil = (deadline - now) / 3600000;
    const urgency = getTimeRange(hoursUntil);
    const category = event.tags?.find((tag: any) => OFFICIAL_CATEGORIES.includes(tag.slug))?.slug || 'others';
    const deadlineISO = new Date(deadline).toISOString();
    const tags = event.tags?.map((tag: any) => tag.label) || [];
    const tagIds = event.tags?.map((tag: any) => parseInt(tag.id)) || [];

    for (const market of event.markets || []) {
      if (parseFloat(String(market.liquidity || market.liquidityNum || '0')) < MIN_LIQUIDITY) continue;

      results.push({
        ...market,
        eventId: event.id,
        eventTitle: event.title,
        eventSlug: event.slug,
        category,
        tags,
        tagIds,
        _deadline: deadlineISO,
        _urgency: urgency,
        _hoursUntil: hoursUntil,
        endDate: deadlineISO,
      });
    }
  }

  return results.sort((a, b) => new Date(a._deadline).getTime() - new Date(b._deadline).getTime());
}
