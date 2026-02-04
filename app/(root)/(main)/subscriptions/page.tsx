import { SubscriptionsTable } from "@/components/subscriptions-table";

export default function SectionPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Gestion des Subscriptions</h1>
      <SubscriptionsTable />
    </div>
  );
}
