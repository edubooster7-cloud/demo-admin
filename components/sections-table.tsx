"use client";

import { useState } from "react";
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
import { Loader2, Trash2, Edit, Plus, LayoutGrid } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Section, useSections } from "@/hooks/user-section";
import { useProvinces } from "@/hooks/use-province";

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
  const [loadingId, setLoadingId] = useState<string | null>(null);

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
      {/* Statistiques */}
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

      {/* Header avec bouton d'ajout */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <LayoutGrid className="size-5" /> Liste des Sections
        </h2>
        <SectionFormDialog onSubmit={addSection} />
      </div>

      {/* Tableau */}
      <div className="rounded-lg border bg-card shadow-sm">
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
            {sections.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground"
                >
                  Aucune section trouvée
                </TableCell>
              </TableRow>
            ) : (
              sections.map((section) => (
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

// --- Formulaire d'Ajout/Edition ---
function SectionFormDialog({
  section,
  onSubmit,
}: {
  section?: Section;
  onSubmit: (data: any) => Promise<void>;
}) {
  const { provinces } = useProvinces(); // On récupère les provinces pour la sélection
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(section?.name || "");
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>(
    section?.provinces?.map((p: any) => p._id || p) || [],
  );

  const toggleProvince = (id: string) => {
    setSelectedProvinces((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Pour l'ajout, on envoie { name, provinces: string[] }
      // Pour l'update, adapter selon votre API (votre hook updateSection prend provinceId unique ou name)
      await onSubmit({ name, provinces: selectedProvinces });
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
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Nouvelle Section
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
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
            <Label>Provinces concernées</Label>
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
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {province.name}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <p className="text-[10px] text-muted-foreground italic">
              Sélectionnez les provinces où cette section est disponible.
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

// --- Suppression avec confirmation ---
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
            <strong>{section.name}</strong> ? Cette action est irréversible et
            pourrait affecter les cours liés.
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
