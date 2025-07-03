import { PageHeader } from "@/components/page-header";
import { SourcesTable } from "@/components/sources-table";

export default function SourcesPage() {
  return (
    <>
      <PageHeader
        title="Master Table of Sources"
        description="Search and filter through all identified web sources."
      />
      <SourcesTable />
    </>
  );
}
