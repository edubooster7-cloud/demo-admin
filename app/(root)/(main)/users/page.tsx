import { UsersTable } from "@/components/user-table";

export const metadata = {
  title: "Gestion des Utilisateurs",
  description: "Gérez et visualisez l'ensemble des utilisateurs",
};

export default function UsersPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-10">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Utilisateurs</h1>
            <p className="mt-2 text-muted-foreground">
              Gérez et visualisez l'ensemble des utilisateurs de votre
              application.
            </p>
          </div>
          <UsersTable />
        </div>
      </div>
    </main>
  );
}
