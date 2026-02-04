import { ProvincesTable } from "@/components/provinces-table";

export default function ProvincesPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Gestion des Provinces</h1>
      <ProvincesTable />
    </div>
  );
}
