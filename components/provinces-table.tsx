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
import { Loader2, Trash2, Edit, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useProvinces } from "@/hooks/use-province";
import { Province } from "@/types/types";

export function ProvincesTable() {
  const {
    provinces,
    isLoading,
    error,
    stats,
    removeProvince,
    addProvince,
    updateProvince,
  } = useProvinces();
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
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground">
            Total Provinces
          </p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground">
            Ce mois-ci
          </p>
          <p className="text-2xl font-bold">{stats.monthCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground">
            Aujourd&apos;hui
          </p>
          <p className="text-2xl font-bold">{stats.todayCount}</p>
        </div>
      </div>

      {/* Barre d'action supérieure */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Liste des Provinces</h2>
        <ProvinceFormDialog onSubmit={addProvince} />
      </div>

      {/* Tableau */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom de la province</TableHead>
              <TableHead>Pays</TableHead>
              <TableHead>Date d&apos;ajout</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {provinces.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground"
                >
                  Aucune province enregistrée
                </TableCell>
              </TableRow>
            ) : (
              provinces.map((province) => (
                <TableRow key={province._id}>
                  <TableCell className="font-medium">{province.name}</TableCell>
                  <TableCell>{province.country}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {province.createdAt
                      ? formatDistanceToNow(new Date(province.createdAt), {
                          addSuffix: true,
                          locale: fr,
                        })
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Modifier */}
                      <ProvinceFormDialog
                        province={province}
                        onSubmit={(data) => updateProvince(province._id, data)}
                      />

                      {/* Supprimer */}
                      <DeleteProvinceDialog
                        province={province}
                        onDelete={() => removeProvince(province._id)}
                        isLoading={loadingId === province._id}
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

// --- Composant Formulaire (Ajout et Edition) ---
function ProvinceFormDialog({
  province,
  onSubmit,
}: {
  province?: Province;
  onSubmit: (data: any) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: province?.name || "",
    country: province?.country || "RD Congo",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {province ? (
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Ajouter une province
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {province ? "Modifier la province" : "Nouvelle province"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de la province</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="ex: Kinshasa"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Pays</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
              required
            />
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
              {province ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Composant Suppression avec confirmation ---
function DeleteProvinceDialog({
  province,
  onDelete,
  isLoading,
}: {
  province: Province;
  onDelete: () => Promise<void>;
  isLoading: boolean;
}) {
  const [confirmText, setConfirmText] = useState("");
  const expectedText = `supprimer ${province.name.toLowerCase()}`;

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
          <AlertDialogTitle>Supprimer la province ?</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer la province{" "}
            <strong>{province.name}</strong> ? Toutes les sections liées
            pourraient être impactées.
            <br />
            <br />
            Saisissez :{" "}
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
            Confirmer la suppression
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
