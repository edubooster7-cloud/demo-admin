"use client";

import { useUsers } from "@/hooks/use-users";
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export function UsersTable() {
  const { users, isLoadingUsers, error, stats, restoreUser, toggleActive } =
    useUsers();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggleActive = async (userId: string) => {
    setLoadingId(userId);
    try {
      await toggleActive(userId);
    } finally {
      setLoadingId(null);
    }
  };

  if (isLoadingUsers) {
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
      {/* Stats (inchangées) */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground">
            Total Utilisateurs
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

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Rejoint</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Aucun utilisateur
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.name || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.isActive}
                        onCheckedChange={() => handleToggleActive(user._id)}
                        disabled={loadingId === user._id}
                      />
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.createdAt
                      ? formatDistanceToNow(new Date(user.createdAt), {
                          addSuffix: true,
                          locale: fr,
                        })
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => restoreUser(user._id)}
                      disabled={!user.isDeleted || loadingId === user._id}
                      className="text-primary hover:bg-primary/10 disabled:opacity-40"
                    >
                      {loadingId === user._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Restaurer"
                      )}
                    </Button>
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

// --- Sous-composant pour la suppression avec confirmation textuelle ---
function DeleteUserDialog({
  user,
  onDelete,
  isLoading,
}: {
  user: any;
  onDelete: () => Promise<void>;
  isLoading: boolean;
}) {
  const [confirmText, setConfirmText] = useState("");
  const expectedText = `supprimer ${user.email}`;

  return (
    <AlertDialog onOpenChange={(open) => !open && setConfirmText("")}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Action irréversible</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action supprimera définitivement le compte de{" "}
            <strong>{user.email}</strong>.
            <br />
            <br />
            Pour confirmer, veuillez saisir :{" "}
            <span className="font-mono font-bold text-foreground select-none">
              {expectedText}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-4">
          <Input
            placeholder="Saisissez la phrase de confirmation"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="border-destructive/20 focus-visible:ring-destructive"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setConfirmText("")}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            disabled={confirmText !== expectedText}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
          >
            Confirmer la suppression
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
