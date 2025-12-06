'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, RefreshCw } from 'lucide-react';
import { useCountdownStore } from '@/lib/store/countdown';
import { AdvancedFilterBar } from '@/components/countdown/AdvancedFilterBar';
import { MarketTable } from '@/components/countdown/MarketTable';

export default function CountdownPage() {
  const {
    setMarkets,
    setLoading,
    setError,
    setLastUpdate,
    setCurrentTime,
    loadFromLocalStorage,
    filteredMarkets,
    loading,
    lastUpdate
  } = useCountdownStore();

  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        closed: 'false',
        active: 'true',
        end_date_min: new Date().toISOString(),
        order: 'endDate',
        ascending: 'true',
        processForCountdown: 'true',
        fetchAll: 'true',
        onlyNegRisk: 'true'
      });

      const res = await fetch(`/api/events?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const markets = await res.json();
      setMarkets(markets);
      setLastUpdate(Date.now());
    } catch (error) {
      console.error('Failed to fetch markets:', error);
      setError('加载市场数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [setCurrentTime]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1800px] mx-auto px-6 py-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-polyBlue rounded-lg">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">尾盘市场 (NegRisk)</h1>
                <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                  NegRisk 市场（负风险协议，保证最终只有一个结果发生）。实时展示价格、成交量、流动性、结束时间等关键数据，掌握尾盘动态，利用最后时刻的信息优势获利。<br />
                  <span className="text-gray-500 text-xs">默认已排除体育竞技、电竞、加密货币价格、股市短期、天气、短期事件、社交媒体等高波动性分类，可在筛选栏中自定义。</span>
                </p>
                <p className="text-gray-500 text-xs mt-1.5">
                  {filteredMarkets.length} 个市场 {lastUpdate && `• 更新于 ${new Date(lastUpdate).toLocaleTimeString('zh-CN')}`}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={fetchData}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-polyBlue text-white rounded-lg hover:bg-polyBlue/90 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <AdvancedFilterBar />
          <MarketTable />
        </motion.div>
      </div>
    </main>
  );
}
