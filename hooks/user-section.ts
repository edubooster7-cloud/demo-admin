"use client";

import api from "@/app/api/axios";
import { isSameMonth, isToday, parseISO } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export interface Section {
  _id: string;
  name: string;
  provinces: any[];
  addedby?: any;
  courses?: any[];
  createdAt?: string;
}

export function useSections() {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Récupérer toutes les sections
  const fetchSections = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get("/section");
      if (response.data.success) {
        setSections(response.data.sections);
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Erreur de récupération des sections";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  // 2. Ajouter une section
  const addSection = async (data: { name: string; provinces: string[] }) => {
    try {
      const response = await api.post("/section/province/", data);
      if (response.data.success) {
        setSections((prev) => [...prev, response.data.section]);
        toast.success("Section créée avec succès");
        return response.data.section;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors de la création");
      throw err;
    }
  };

  const updateSection = async (
    id: string,
    data: { name?: string; provinceId?: string },
  ) => {
    try {
      const response = await api.patch(`/section/${id}`, data);
      if (response.data.success) {
        setSections((prev) =>
          prev.map((s) => (s._id === id ? response.data.section : s)),
        );
        toast.success("Section mise à jour");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur de mise à jour");
    }
  };

  const removeSection = async (id: string) => {
    try {
      const response = await api.delete(`/section/${id}`);
      if (response.data.success) {
        setSections((prev) => prev.filter((s) => s._id !== id));
        toast.success("Section supprimée");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur de suppression");
    }
  };

  const stats = useMemo(() => {
    const now = new Date();
    const itemsWithDates = sections.map((s) => ({
      ...s,
      dateObj: s.createdAt ? parseISO(s.createdAt) : null,
    }));

    const todayCount = itemsWithDates.filter(
      (s) => s.dateObj && isToday(s.dateObj),
    ).length;

    const monthCount = itemsWithDates.filter(
      (s) => s.dateObj && isSameMonth(s.dateObj, now),
    ).length;

    return {
      total: sections.length,
      todayCount,
      monthCount,
    };
  }, [sections]);

  return {
    sections,
    isLoading,
    error,
    stats,
    refresh: fetchSections,
    addSection,
    updateSection,
    removeSection,
  };
}
