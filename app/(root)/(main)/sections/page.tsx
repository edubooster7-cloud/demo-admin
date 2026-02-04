import { SectionsTable } from "@/components/sections-table";

export default function SectionPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Gestion des Sections</h1>
      <SectionsTable />
    </div>
  );
}
