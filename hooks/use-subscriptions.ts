"use client";

import api from "@/app/api/axios";
import { Subscription, SubscriptionStats } from "@/types/types";
import { isSameMonth, isToday, parseISO } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [statsData, setStatsData] = useState<SubscriptionStats[]>([]);
  const [activePremiumCount, setActivePremiumCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, total: 1 });

  const fetchSubscriptions = useCallback(async (page = 1, status?: string) => {
    try {
      setIsLoading(true);
      const url = `/subscription/admin/all?page=${page}${status ? `&status=${status}` : ""}`;
      const response = await api.get(url);

      setSubscriptions(response.data.subscriptions);
      setPagination({
        current: response.data.currentPage,
        total: response.data.totalPages,
      });
    } catch (error: any) {
      toast.error("Erreur de chargement des abonnements");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get("/subscription/admin/stats");
      setStatsData(response.data.stats);
      setActivePremiumCount(response.data.activeUsers);
    } catch (error) {
      console.error("Erreur stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
    fetchStats();
  }, [fetchSubscriptions, fetchStats]);

  const activateManual = async (id: string) => {
    try {
      const response = await api.patch(`/subscription/admin/activate/${id}`);
      if (response.data.sub) {
        setSubscriptions((prev) =>
          prev.map((s) =>
            s._id === id ? { ...s, status: "ACTIVE" as const } : s,
          ),
        );
        toast.success("Abonnement activé avec succès");
        fetchStats();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur d'activation");
    }
  };

  const timeStats = useMemo(() => {
    const now = new Date();

    const subsWithDates = subscriptions.map((s) => ({
      ...s,
      dateObj: s.createdAt ? parseISO(s.createdAt) : null,
    }));

    const todayCount = subsWithDates.filter(
      (s) => s.dateObj && isToday(s.dateObj),
    ).length;

    const monthCount = subsWithDates.filter(
      (s) => s.dateObj && isSameMonth(s.dateObj, now),
    ).length;

    const activeStats = statsData.find((s) => s._id === "ACTIVE");
    const totalActiveCount = activeStats ? activeStats.totalCount : 0;

    const totalRevenueUSD = totalActiveCount * 10;

    const totalRevenueCDF = statsData.reduce(
      (acc, curr) => acc + curr.totalRevenueCDF,
      0,
    );

    return {
      total: subscriptions.length,
      todayCount,
      monthCount,
      totalRevenueUSD,
      totalRevenueCDF,
      activePremiumCount,
      totalActiveCount,
    };
  }, [subscriptions, statsData, activePremiumCount]);

  return {
    subscriptions,
    stats: timeStats,
    pagination,
    isLoading,
    refresh: fetchSubscriptions,
    activateManual,
    fetchStats,
  };
}
