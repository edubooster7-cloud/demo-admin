"use client";

import { useState } from "react";
import { useSubscriptions } from "@/hooks/use-subscriptions";
import { Subscription } from "@/types/types";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function SubscriptionsTable() {
  const {
    subscriptions,
    isLoading,
    stats,
    pagination,
    refresh,
    activateManual,
  } = useSubscriptions();

  const [currentStatus, setCurrentStatus] = useState<string>("all");
  const [activatingId, setActivatingId] = useState<string | null>(null);

  // Gérer le changement de filtre
  const handleStatusChange = (status: string) => {
    setCurrentStatus(status);
    refresh(1, status === "all" ? undefined : status);
  };

  // Gérer le changement de page
  const handlePageChange = (newPage: number) => {
    refresh(newPage, currentStatus === "all" ? undefined : currentStatus);
  };

  const handleActivate = async (id: string) => {
    setActivatingId(id);
    try {
      await activateManual(id);
    } finally {
      setActivatingId(null);
    }
  };

  if (isLoading && subscriptions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* --- CARTES DE STATISTIQUES --- */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <CreditCard className="size-4" />
            <p className="text-sm font-medium">Revenu Total (Estimé)</p>
          </div>
          <p className="text-2xl font-bold">
            ${stats.totalRevenueUSD.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Basé sur {stats.totalActiveCount} abonnements actifs
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <UserCheck className="size-4" />
            <p className="text-sm font-medium">Utilisateurs Premium</p>
          </div>
          <p className="text-2xl font-bold">{stats.activePremiumCount}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Membres avec accès illimité
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="size-4" />
            <p className="text-sm font-medium">Ventes Aujourd&apos;hui</p>
          </div>
          <p className="text-2xl font-bold">{stats.todayCount}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Nouveaux paiements enregistrés
          </p>
        </div>
      </div>

      {/* --- FILTRES --- */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Historique des transactions</h2>
        <Select value={currentStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="ACTIVE">Actif</SelectItem>
            <SelectItem value="PENDING">En attente</SelectItem>
            <SelectItem value="PAID">Payé</SelectItem>
            <SelectItem value="FAILED">Échoué</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* --- TABLEAU --- */}
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Téléphone Client</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-10 text-muted-foreground"
                >
                  Aucune transaction trouvée.
                </TableCell>
              </TableRow>
            ) : (
              subscriptions.map((sub) => (
                <TableRow key={sub._id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {sub.user?.name || "Utilisateur inconnu"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {sub.user?.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {sub.clientPhone}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {sub.amount} {sub.currency}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={sub.status} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(sub.createdAt), "dd MMM yyyy HH:mm", {
                      locale: fr,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    {sub.status === "PENDING" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs border-primary text-primary hover:bg-primary/5"
                          >
                            Valider manuellement
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Confirmer l&apos;activation ?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Vous êtes sur le point d&apos;activer
                              l&apos;abonnement de{" "}
                              <strong>{sub.user?.name}</strong>. Assurez-vous
                              d&apos;avoir bien reçu le paiement de {sub.amount}{" "}
                              {sub.currency}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleActivate(sub._id)}
                              className="bg-primary text-white"
                            >
                              Confirmer le paiement
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    {activatingId === sub._id && (
                      <Loader2 className="ml-auto size-4 animate-spin text-primary" />
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* --- PAGINATION --- */}
        <div className="flex items-center justify-between px-4 py-4 border-t bg-muted/20">
          <p className="text-xs text-muted-foreground">
            Page {pagination.current} sur {pagination.total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current === 1 || isLoading}
              onClick={() => handlePageChange(pagination.current - 1)}
            >
              <ChevronLeft className="size-4 mr-1" /> Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current === pagination.total || isLoading}
              onClick={() => handlePageChange(pagination.current + 1)}
            >
              Suivant <ChevronRight className="size-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Helper pour les Badges de Statut ---
function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none flex w-fit items-center gap-1">
          <CheckCircle2 className="size-3" /> Actif
        </Badge>
      );
    case "PAID":
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">
          Payé
        </Badge>
      );
    case "PENDING":
      return (
        <Badge
          variant="outline"
          className="text-amber-600 border-amber-200 bg-amber-50 flex w-fit items-center gap-1"
        >
          <Clock className="size-3" /> En attente
        </Badge>
      );
    case "FAILED":
      return (
        <Badge variant="destructive" className="flex w-fit items-center gap-1">
          <XCircle className="size-3" /> Échoué
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}
