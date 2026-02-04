import { CoursesTable } from "@/components/courses-table";

export default function ProvincesPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Gestion des Cours</h1>
      <CoursesTable />
    </div>
  );
}
