import { PolymarketGammaClient } from "@/lib/polymarket";

async function getMarkets() {
  const client = new PolymarketGammaClient();

  try {
    const markets = await client.listMarkets({
      limit: 20,
      active: true,
      order: "volume_num",
      ascending: false,
    });
    return markets;
  } catch (error) {
    console.error("获取市场数据失败:", error);
    return [];
  }
}

export default async function MarketsPage() {
  const markets = await getMarkets();

  return (
    <main className="min-h-screen bg-gray-6">
      <div className="bg-gray-1 text-white py-16">
        <div className="container-content">
          <h1 className="text-4xl font-black mb-4">市场搜索</h1>
          <p className="text-gray-4 text-lg">
            浏览 Polymarket 预测市场
          </p>
        </div>
      </div>

      <div className="container-content py-8">
        <div className="card p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-5 pb-4">
              <h2 className="text-xl font-bold">活跃市场</h2>
              <div className="text-sm text-gray-3">
                按交易量排序
              </div>
            </div>

            {markets.length > 0 ? (
              <div className="grid gap-4">
                {markets.map((market: any) => (
                  <div
                    key={market.id}
                    className="border border-gray-5 rounded-lg p-4 hover:border-polyBlue transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">
                          {market.question}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-3">
                          <span>
                            交易量: ${(market.volume || 0).toLocaleString()}
                          </span>
                          <span>
                            流动性: ${(market.liquidity || 0).toLocaleString()}
                          </span>
                          {market.end_date_iso && (
                            <span>
                              结束: {new Date(market.end_date_iso).toLocaleDateString("zh-CN")}
                            </span>
                          )}
                        </div>
                      </div>
                      {market.active && (
                        <span className="px-2 py-1 bg-success bg-opacity-10 text-success text-xs rounded">
                          活跃
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-3 py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">暂无数据</h3>
                <p className="text-sm">无法加载市场数据</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
