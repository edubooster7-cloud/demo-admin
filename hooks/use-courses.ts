"use client";

import api from "@/app/api/axios";
import { Course } from "@/types/types";
import { isSameMonth, isToday, parseISO } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSectionId, setSelectedSectionId] = useState<string | "all">(
    "all",
  );

  const fetchCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get("/cours/admin/");
      if (response.data.success) {
        setCourses(response.data.courses);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur de chargement des cours");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  /**
   * AJOUT D'UN COURS (AVEC PDF ET GÉNÉRATION IA)
   */
  const addCourse = async (data: {
    title: string;
    description: string;
    sections: string[];
    pdfFile: File;
  }) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    // On envoie les sections en JSON string car Multer/FormData ne gère pas nativement les tableaux
    formData.append("sections", JSON.stringify(data.sections));
    // Le nom du champ doit correspondre à celui attendu par votre backend ('pdf')
    formData.append("pdf", data.pdfFile);

    try {
      const response = await api.post("/cours/admin/courses", formData);

      if (response.data.success) {
        setCourses((prev) => [response.data.course, ...prev]);
        toast.success("Cours créé et questions générées avec succès !");
        return response.data.course;
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Erreur lors de la création";
      toast.error(msg);
      throw err;
    }
  };

  const publishCourse = async (courseId: string) => {
    try {
      const res = await api.post(`/cours/admin/publish/${courseId}`);
      setCourses((prev) =>
        prev.map((c) => (c._id === courseId ? res.data.course : c)),
      );
      toast.success("Cours publié et étudiants notifiés");
    } catch (err: any) {
      console.log("Error in publish course", err);
      toast.error(err.response?.data?.message || "Erreur de publication");
    }
  };

  const unpublishCourse = async (courseId: string) => {
    try {
      const res = await api.post(`/cours/admin/unpublish/${courseId}`);
      setCourses((prev) =>
        prev.map((c) => (c._id === courseId ? res.data.course : c)),
      );
      toast.success("Cours dépublié");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur");
    }
  };

  const removeCourse = async (courseId: string) => {
    try {
      await api.delete(`/cours/admin/delete/${courseId}`);
      setCourses((prev) => prev.filter((c) => c._id !== courseId));
      toast.success("Cours et questions supprimés");
    } catch (err: any) {
      toast.error("Échec de la suppression");
    }
  };

  const regenerateQuestions = async (courseId: string) => {
    try {
      await api.post(`/cours/regenerate/${courseId}`);
      toast.success("Questions en cours de régénération");
    } catch (err: any) {
      toast.error("Erreur de régénération");
    }
  };

  const filteredCourses = useMemo(() => {
    if (selectedSectionId === "all") return courses;
    return courses.filter((course) =>
      course.sections.some((sec) => sec._id === selectedSectionId),
    );
  }, [courses, selectedSectionId]);

  const stats = useMemo(() => {
    const now = new Date();
    const published = courses.filter((c) => c.status === "published");

    return {
      total: courses.length,
      publishedCount: published.length,
      draftCount: courses.length - published.length,
      newThisMonth: courses.filter((c) =>
        isSameMonth(parseISO(c.createdAt as string), now),
      ).length,
      todayCount: courses.filter((c) =>
        isToday(parseISO(c.createdAt as string)),
      ).length,
    };
  }, [courses]);

  return {
    courses: filteredCourses,
    allCourses: courses,
    isLoading,
    error,
    stats,
    filterBySection: setSelectedSectionId,
    selectedSectionId,
    refresh: fetchCourses,
    addCourse,
    publishCourse,
    unpublishCourse,
    removeCourse,
    regenerateQuestions,
  };
}
