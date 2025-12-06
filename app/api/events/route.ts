import { NextRequest } from 'next/server';
import { PolymarketGammaClient } from '@/lib/polymarket';

const MIN_LIQUIDITY = 1000;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams);
    console.log('📥 API 接收到的参数:', params);

    const client = new PolymarketGammaClient();
    const processForCountdown = searchParams.get('processForCountdown') === 'true';
    const onlyNegRisk = searchParams.get('onlyNegRisk') === 'true';
    const fetchAll = searchParams.get('fetchAll') === 'true';

    console.log(`🎛️  processForCountdown=${processForCountdown}, onlyNegRisk=${onlyNegRisk}, fetchAll=${fetchAll}`);

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
        console.log(`📦 获取第 ${pageCount} 页 (offset: ${offset}, limit: ${limit})`);

        try {
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

          console.log(`   ✓ 获取到 ${events.length} 个事件`);
          allEvents.push(...events);

          if (events.length < limit) {
            hasMore = false;
            console.log(`✅ 完成！总共获取 ${allEvents.length} 个事件`);
          } else {
            offset += limit;
          }
        } catch (pageError: any) {
          console.error(`❌ 第 ${pageCount} 页获取失败:`, pageError.message);
          // 如果已经获取了一些数据，继续处理；否则抛出错误
          if (allEvents.length > 0) {
            console.log(`⚠️  部分数据获取成功，继续处理已获取的 ${allEvents.length} 个事件`);
            hasMore = false;
          } else {
            throw pageError;
          }
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
    console.log(`🎯 NegRisk 过滤: ${allEvents.length} → ${events.length} 个事件`);

    const data = processForCountdown ? processEventsForCountdown(events) : events;
    console.log(`📊 处理后的市场数量: ${data.length}`);

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

function processEventsForCountdown(events: any[]) {
  const now = new Date();
  return events.flatMap(event => {
    const eventDeadline = new Date(event.endDate || event.end_date_min);
    if (!eventDeadline.getTime() || eventDeadline <= now) return [];

    const hoursUntil = (eventDeadline.getTime() - now.getTime()) / 3600000;
    const urgency = hoursUntil < 1 ? 'critical' : hoursUntil < 24 ? 'urgent' : hoursUntil < 168 ? 'soon' : 'normal';

    // 提取 event tags 的 label 和 id
    const eventTags = event.tags ? event.tags.map((tag: any) => tag.label) : [];
    const eventTagIds = event.tags ? event.tags.map((tag: any) => parseInt(tag.id)) : [];

    return (event.markets || [])
      .filter((m: any) => parseFloat(String(m.liquidity || m.liquidityNum || '0')) >= MIN_LIQUIDITY)
      .map((market: any) => ({
        ...market,
        eventId: event.id,
        eventTitle: event.title,
        eventSlug: event.slug,
        category: event.category || market.category,
        tags: eventTags,
        tagIds: eventTagIds,
        _deadline: eventDeadline.toISOString(),
        _urgency: urgency,
        _hoursUntil: hoursUntil,
        endDate: eventDeadline.toISOString(),
      }));
  }).sort((a, b) => new Date(a._deadline).getTime() - new Date(b._deadline).getTime());
}
