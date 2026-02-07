"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useSections } from "@/hooks/user-section";
import { Course } from "@/types/types";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  BookOpen,
  FileEdit,
  FileText,
  Loader2,
  Plus,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import { useState, useCallback, useEffect, useMemo } from "react";
import api from "@/app/api/axios";
import { isSameMonth, isToday, parseISO } from "date-fns";
import { toast } from "sonner";

export function CoursesTable() {
  const {
    courses,
    isLoading,
    error,
    stats,
    filterBySection,
    selectedSectionId,
    publishCourse,
    unpublishCourse,
    removeCourse,
    regenerateQuestions,
    addCourse,
  } = useCourses();

  const { sections } = useSections();
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  /**
   * LOGIC: PUBLISH / UNPUBLISH
   */
  const handleToggleStatus = async (course: Course) => {
    setActionLoadingId(course._id);
    try {
      if (course.status === "published") {
        await unpublishCourse(course._id);
      } else {
        await publishCourse(course._id);
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  /**
   * LOGIC: REGENERATE QUESTIONS
   */
  const handleRegenerate = async (courseId: string) => {
    setActionLoadingId(courseId);
    try {
      await regenerateQuestions(courseId);
    } finally {
      setActionLoadingId(null);
    }
  };

  /**
   * LOGIC: REMOVE COURSE
   */
  const handleDeleteCourse = async (courseId: string) => {
    setActionLoadingId(courseId);
    try {
      await removeCourse(courseId);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (isLoading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* --- STATISTIQUES --- */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Total Cours
          </p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm border-l-4 border-l-green-500">
          <p className="text-sm font-medium text-muted-foreground">Publiés</p>
          <p className="text-2xl font-bold">{stats.publishedCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm border-l-4 border-l-amber-500">
          <p className="text-sm font-medium text-muted-foreground">
            Brouillons
          </p>
          <p className="text-2xl font-bold">{stats.draftCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Ajoutés ce mois
          </p>
          <p className="text-2xl font-bold">{stats.newThisMonth}</p>
        </div>
      </div>

      {/* --- BARRE D'OUTILS --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BookOpen className="size-5" /> Catalogue des cours
        </h2>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={selectedSectionId} onValueChange={filterBySection}>
            <SelectTrigger className="w-full sm:w-50">
              <SelectValue placeholder="Toutes les sections" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les sections</SelectItem>
              {sections.map((section) => (
                <SelectItem key={section._id} value={section._id}>
                  {section.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <AddCourseDialog onSubmit={addCourse} sections={sections} />
        </div>
      </div>

      {/* --- TABLEAU --- */}
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre du cours</TableHead>
              <TableHead>Sections</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date d&apos;ajout</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-10 text-muted-foreground"
                >
                  Aucun cours trouvé.
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => (
                <TableRow key={course._id}>
                  <TableCell>
                    <div className="flex flex-col max-w-62.5">
                      <span className="font-medium truncate">
                        {course.title}
                      </span>
                      <span className="text-xs text-muted-foreground truncate italic">
                        {course.description || "Pas de description"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {course.sections.map((s, idx) => {
                        const isObject = typeof s === "object" && s !== null;
                        const sId = isObject ? s._id : s;
                        const sName = isObject
                          ? s.name
                          : sections.find((sec) => sec._id === s)?.name ||
                            "Section";

                        return (
                          <Badge
                            key={`${course._id}-${sId}-${idx}`}
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {sName}
                          </Badge>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={course.status === "published"}
                        onCheckedChange={() => handleToggleStatus(course)}
                        disabled={actionLoadingId === course._id}
                      />
                      {course.status === "published" ? (
                        <Badge className="bg-green-100 text-green-700 border-none">
                          En ligne
                        </Badge>
                      ) : (
                        <Badge variant="outline">Brouillon</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(course.createdAt), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={actionLoadingId === course._id}
                        onClick={() => handleRegenerate(course._id)}
                        title="Régénérer les questions"
                      >
                        {actionLoadingId === course._id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <RefreshCcw className="size-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <FileEdit className="size-4" />
                      </Button>
                      <DeleteCourseDialog
                        course={course}
                        onDelete={() => handleDeleteCourse(course._id)}
                        isLoading={actionLoadingId === course._id}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// --- Modale d'ajout de cours ---
function AddCourseDialog({
  onSubmit,
  sections,
}: {
  onSubmit: (data: {
    title: string;
    description: string;
    sections: string[];
    pdfFile: File;
  }) => Promise<any>;
  sections: any[];
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // LOGIC: Select All
  const isAllSelected =
    sections.length > 0 && selectedSections.length === sections.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSections(sections.map((s) => s._id));
    } else {
      setSelectedSections([]);
    }
  };

  const handleToggleSection = (sectionId: string) => {
    setSelectedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId],
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile) return;

    setLoading(true);
    try {
      await onSubmit({
        title,
        description,
        sections: selectedSections,
        pdfFile: pdfFile,
      });

      setOpen(false);
      setTitle("");
      setDescription("");
      setSelectedSections([]);
      setPdfFile(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="size-4" /> Nouveau cours
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Créer un nouveau cours</DialogTitle>
          <DialogDescription>
            Importez un fichier PDF. L'IA générera automatiquement les questions
            de QCM.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAdd} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre du cours</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Géographie"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description..."
              className="resize-none"
              rows={2}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pdf">Fichier source (PDF)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="pdf"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="cursor-pointer"
                required
              />
              {pdfFile && <FileText className="text-primary size-5 shrink-0" />}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Sections cibles</Label>
              {/* BOUTON TOUT SÉLECTIONNER */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all-sections"
                  checked={isAllSelected}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                />
                <label
                  htmlFor="select-all-sections"
                  className="text-xs font-medium cursor-pointer"
                >
                  Tout sélectionner
                </label>
              </div>
            </div>

            <ScrollArea className="h-32 rounded-md border p-3">
              <div className="grid grid-cols-2 gap-3">
                {sections.map((section) => (
                  <div
                    key={section._id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`add-sec-${section._id}`}
                      checked={selectedSections.includes(section._id)}
                      onCheckedChange={() => handleToggleSection(section._id)}
                    />
                    <label
                      htmlFor={`add-sec-${section._id}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {section.name}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={
                loading || !title || selectedSections.length === 0 || !pdfFile
              }
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Génération...
                </>
              ) : (
                "Lancer la création"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Composant Suppression sécurisée ---
function DeleteCourseDialog({
  course,
  onDelete,
  isLoading,
}: {
  course: Course;
  onDelete: () => Promise<void>;
  isLoading: boolean;
}) {
  const [confirmText, setConfirmText] = useState("");
  const expectedText = `supprimer ${course.title.toLowerCase()}`;

  return (
    <AlertDialog onOpenChange={(open) => !open && setConfirmText("")}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:bg-destructive/10"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Suppression définitive</AlertDialogTitle>
          <AlertDialogDescription>
            Confirmez la suppression de <strong>{course.title}</strong> en
            tapant la phrase ci-dessous.
            <br />
            <br />
            Tapez :{" "}
            <span className="font-mono font-bold text-foreground select-none">
              {expectedText}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Confirmation"
          className="my-4 border-destructive/20"
        />
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
            disabled={confirmText !== expectedText || isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Confirmer"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * HOOK useCourses
 */
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

  const addCourse = async (data: {
    title: string;
    description: string;
    sections: string[];
    pdfFile: File;
  }) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("sections", JSON.stringify(data.sections));
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
