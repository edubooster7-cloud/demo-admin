"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import api from "@/app/api/axios";
import { toast } from "sonner";
import { isSameMonth, isToday, parseISO, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  Trash2,
  Edit,
  Plus,
  LayoutGrid,
  Search,
  XCircle,
} from "lucide-react";

// External Hooks
import { useProvinces } from "@/hooks/use-province";

// --- Types ---
export interface Section {
  _id: string;
  name: string;
  provinces: any[];
  addedby?: any;
  courses?: any[];
  createdAt?: string;
}

// --- Internal Hook: useSections ---
export function useSections() {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    data: { name?: string; provinces?: string[] },
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

    return {
      total: sections.length,
      todayCount: itemsWithDates.filter((s) => s.dateObj && isToday(s.dateObj))
        .length,
      monthCount: itemsWithDates.filter(
        (s) => s.dateObj && isSameMonth(s.dateObj, now),
      ).length,
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

// --- Main Component: SectionsTable ---
export function SectionsTable() {
  const {
    sections,
    isLoading,
    error,
    stats,
    removeSection,
    addSection,
    updateSection,
  } = useSections();

  const [searchTerm, setSearchTerm] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Filtered logic
  const filteredSections = useMemo(() => {
    if (!searchTerm.trim()) return sections;
    return sections.filter((s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [sections, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm font-medium text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Total Sections
          </p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Créées ce mois
          </p>
          <p className="text-2xl font-bold">{stats.monthCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Aujourd&apos;hui
          </p>
          <p className="text-2xl font-bold">{stats.todayCount}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <LayoutGrid className="size-5" /> Liste des Sections
        </h2>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher une section..."
              className="pl-9 h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <SectionFormDialog onSubmit={addSection} />
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom de la section</TableHead>
              <TableHead>Provinces liées</TableHead>
              <TableHead>Créé le</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSections.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-12 text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <XCircle className="h-8 w-8 opacity-20" />
                    <p>
                      Aucune section trouvée{" "}
                      {searchTerm && `pour "${searchTerm}"`}
                    </p>
                    {searchTerm && (
                      <Button variant="link" onClick={() => setSearchTerm("")}>
                        Effacer la recherche
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredSections.map((section) => (
                <TableRow key={section._id}>
                  <TableCell className="font-medium">{section.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {section.provinces && section.provinces.length > 0 ? (
                        section.provinces.map((p: any) => (
                          <Badge
                            key={p._id || p}
                            variant="secondary"
                            className="text-[10px]"
                          >
                            {p.name || "Province"}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Aucune province
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {section.createdAt
                      ? formatDistanceToNow(new Date(section.createdAt), {
                          addSuffix: true,
                          locale: fr,
                        })
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <SectionFormDialog
                        section={section}
                        onSubmit={(data) => updateSection(section._id, data)}
                      />
                      <DeleteSectionDialog
                        section={section}
                        onDelete={() => removeSection(section._id)}
                        isLoading={loadingId === section._id}
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

// --- Form Component: SectionFormDialog ---
function SectionFormDialog({
  section,
  onSubmit,
}: {
  section?: Section;
  onSubmit: (data: any) => Promise<void>;
}) {
  const { provinces } = useProvinces();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(section?.name || "");
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>(
    section?.provinces?.map((p: any) => p._id || p) || [],
  );

  const isAllSelected =
    provinces.length > 0 && selectedProvinces.length === provinces.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProvinces(provinces.map((p) => p._id));
    } else {
      setSelectedProvinces([]);
    }
  };

  const toggleProvince = (id: string) => {
    setSelectedProvinces((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ name, provinces: selectedProvinces });
      if (!section) {
        setName("");
        setSelectedProvinces([]);
      }
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {section ? (
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <Button size="sm" className="gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Nouvelle Section
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {section ? "Modifier la section" : "Créer une section"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="section-name">Nom de la section</Label>
            <Input
              id="section-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Biologie-Chimie"
              required
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Provinces concernées</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={isAllSelected}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                />
                <label
                  htmlFor="select-all"
                  className="text-xs font-medium cursor-pointer"
                >
                  Tout sélectionner
                </label>
              </div>
            </div>

            <ScrollArea className="h-48 w-full rounded-md border p-4">
              <div className="space-y-4">
                {provinces.map((province) => (
                  <div
                    key={province._id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={province._id}
                      checked={selectedProvinces.includes(province._id)}
                      onCheckedChange={() => toggleProvince(province._id)}
                    />
                    <label
                      htmlFor={province._id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {province.name}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <p className="text-[10px] text-muted-foreground italic">
              {selectedProvinces.length} province(s) sélectionnée(s).
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {section ? "Mettre à jour" : "Créer la section"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Delete Dialog Component ---
function DeleteSectionDialog({
  section,
  onDelete,
  isLoading,
}: {
  section: Section;
  onDelete: () => Promise<void>;
  isLoading: boolean;
}) {
  const [confirmText, setConfirmText] = useState("");
  const expectedText = `supprimer ${section.name.toLowerCase()}`;

  return (
    <AlertDialog onOpenChange={(open) => !open && setConfirmText("")}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer la section ?</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer la section{" "}
            <strong>{section.name}</strong> ?
            <br />
            <br />
            Saisissez pour confirmer :{" "}
            <span className="font-mono font-bold text-foreground select-none">
              {expectedText}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Confirmation"
          className="my-4 border-destructive/20 focus-visible:ring-destructive"
        />
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            disabled={confirmText !== expectedText || isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Supprimer définitivement
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
