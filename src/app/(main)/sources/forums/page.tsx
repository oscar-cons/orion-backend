import { PageHeader } from "@/components/page-header";
import { SourcesTable } from "@/components/sources-table";

export default function ForumsPage() {
  return (
    <>
      <PageHeader
        title="Forum Sources"
        description="Search and filter through all identified forum sources."
      />
      <SourcesTable defaultTypeFilter="Forum" />
    </>
  );
}
