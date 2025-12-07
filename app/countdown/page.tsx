'use client';

import { useEffect, useMemo } from 'react';
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
    error,
    lastUpdate
  } = useCountdownStore();

  // 计算唯一的 event 数量
  const uniqueEventCount = useMemo(() => {
    const eventIds = new Set<string>();
    filteredMarkets.forEach(m => {
      if (m.eventId) eventIds.add(m.eventId);
    });
    return eventIds.size;
  }, [filteredMarkets]);

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
        fetchAll: 'true'
      });

      const res = await fetch(`/api/events?${params}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }
      const markets = await res.json();
      setMarkets(markets);
      setLastUpdate(Date.now());
    } catch (error: any) {
      console.error('Failed to fetch markets:', error);
      setError(error.message?.includes('Network') ? '网络连接失败，请稍后重试' : '加载市场数据失败，请重试');
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
                <h1 className="text-3xl font-bold text-gray-900">尾盘市场</h1>
                <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                  实时展示价格、成交量、流动性、结束时间等关键数据，掌握尾盘动态，利用最后时刻的信息优势获利。
                </p>
                <p className="text-gray-500 text-xs mt-1.5">
                  {uniqueEventCount} 个事件 • {filteredMarkets.length} 个市场 {lastUpdate && `• 更新于 ${new Date(lastUpdate).toLocaleTimeString('zh-CN')}`}
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
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">✕</button>
            </div>
          )}
          <AdvancedFilterBar />
          <MarketTable />
        </motion.div>
      </div>
    </main>
  );
}
