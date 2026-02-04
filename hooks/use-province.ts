"use client";

import api from "@/app/api/axios";
import { isSameMonth, isToday, parseISO } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export interface Province {
  _id: string;
  name: string;
  country: string;
  addedby?: string;
  createdAt?: string;
}

export function useProvinces() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProvinces = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get("/province");
      if (response.data.success) {
        setProvinces(response.data.provinces);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Erreur de récupération";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProvinces();
  }, [fetchProvinces]);

  const addProvince = async (data: { name: string; country: string }) => {
    try {
      const response = await api.post("/province", data);
      if (response.data.success) {
        setProvinces((prev) => [...prev, response.data.province]);
        toast.success("Province ajoutée");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors de l'ajout");
    }
  };

  const updateProvince = async (
    id: string,
    data: { name?: string; country?: string },
  ) => {
    try {
      const response = await api.put(`/province/${id}`, data);
      if (response.data.success) {
        setProvinces((prev) =>
          prev.map((p) => (p._id === id ? response.data.province : p)),
        );
        toast.success("Province mise à jour");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur de mise à jour");
    }
  };

  const removeProvince = async (id: string) => {
    try {
      const response = await api.delete(`/province/${id}`);
      if (response.data.success) {
        setProvinces((prev) => prev.filter((p) => p._id !== id));
        toast.success("Province supprimée");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur de suppression");
    }
  };

  const stats = useMemo(() => {
    const now = new Date();
    const itemsWithDates = provinces.map((p) => ({
      ...p,
      dateObj: p.createdAt ? parseISO(p.createdAt) : null,
    }));

    const todayCount = itemsWithDates.filter(
      (p) => p.dateObj && isToday(p.dateObj),
    ).length;

    const monthCount = itemsWithDates.filter(
      (p) => p.dateObj && isSameMonth(p.dateObj, now),
    ).length;

    return {
      total: provinces.length,
      todayCount,
      monthCount,
    };
  }, [provinces]);

  return {
    provinces,
    isLoading,
    error,
    stats,
    refresh: fetchProvinces,
    addProvince,
    updateProvince,
    removeProvince,
  };
}
