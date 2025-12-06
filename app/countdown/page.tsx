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
    settings,
    filteredMarkets,
    loading,
    lastUpdate
  } = useCountdownStore();

  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  useEffect(() => {
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
          limit: '500',
          processForCountdown: 'true'
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

    fetchData();

    if (settings.autoRefresh) {
      const interval = setInterval(fetchData, settings.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [setMarkets, setLoading, setError, setLastUpdate, settings]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [setCurrentTime]);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 顶部标题栏 */}
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
                <p className="text-gray-500 text-sm mt-0.5">
                  {filteredMarkets.length} 个即将结束的市场 {lastUpdate && `• 更新于 ${new Date(lastUpdate).toLocaleTimeString('zh-CN')}`}
                </p>
              </div>
            </div>

            <button
              onClick={async () => {
                try {
                  setLoading(true);
                  const params = new URLSearchParams({
                    closed: 'false',
                    active: 'true',
                    end_date_min: new Date().toISOString(),
                    order: 'endDate',
                    ascending: 'true',
                    limit: '500',
                    processForCountdown: 'true'
                  });
                  const res = await fetch(`/api/events?${params}`);
                  if (!res.ok) throw new Error(`HTTP ${res.status}`);
                  const markets = await res.json();
                  setMarkets(markets);
                  setLastUpdate(Date.now());
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-polyBlue text-white rounded-lg hover:bg-polyBlue/90 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </button>
          </motion.div>
        </div>
      </div>

      {/* 主内容区 */}
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
