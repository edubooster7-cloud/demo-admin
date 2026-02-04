"use client";

import api from "@/app/api/axios";
import { User } from "@/context/auth-context";
import { isSameMonth, isToday, parseISO } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoadingUsers(true);
      setError(null);
      const response = await api.get("/users/admin/users/find");
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Erreur de récupération";
      setError(message);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const removeUser = async (userId: string) => {
    try {
      const response = await api.delete(`/users/users/delete/${userId}`);
      if (response.data.success) {
        setUsers((prev) => prev.filter((u) => (u._id || u._id) !== userId));
        toast.success("Utilisateur supprimé");
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Erreur lors de la suppression";
      toast.error(msg);
      throw err;
    }
  };

  const restoreUser = async (userId: string) => {
    try {
      const response = await api.patch(`/users/users/${userId}/restore`);

      if (response.data.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId || u._id === userId
              ? {
                  ...u,
                  isDeleted: false,
                  deletedAt: null,
                  isActive: true,
                }
              : u,
          ),
        );

        toast.success("Utilisateur restauré avec succès");
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Erreur lors de la restauration";
      toast.error(msg);
      throw err;
    }
  };

  const toggleActive = async (userId: string) => {
    try {
      const response = await api.patch(
        `/users/admin/users/${userId}/toggle-active`,
      );
      const updatedUser = response.data.user;

      setUsers((prev) =>
        prev.map((u) => {
          const currentId = u._id || u._id;
          if (currentId === userId) {
            return { ...u, isActive: updatedUser.isActive };
          }
          return u;
        }),
      );

      toast.success(response.data.message || "Statut mis à jour");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Erreur de mise à jour";
      toast.error(msg);
      throw err;
    }
  };

  const stats = useMemo(() => {
    const now = new Date();
    const usersWithDates = users.map((user) => ({
      ...user,
      dateObj: user.createdAt ? parseISO(user.createdAt as string) : null,
    }));

    const todayCount = usersWithDates.filter(
      (u) => u.dateObj && isToday(u.dateObj),
    ).length;

    const monthCount = usersWithDates.filter(
      (u) => u.dateObj && isSameMonth(u.dateObj, now),
    ).length;

    return {
      total: users.length,
      todayCount,
      monthCount,
    };
  }, [users]);

  return {
    users,
    isLoadingUsers,
    error,
    stats,
    restoreUser,
    refresh: fetchUsers,
    removeUser,
    toggleActive,
  };
}
