import { PageHeader } from "@/components/page-header";
import { ForumTable } from "@/components/forum-table";

export default function ForumsPage() {
  return (
    <>
      <PageHeader
        title="Forum Sources"
        description="Search and filter through all identified forum sources."
      />
      <ForumTable />
    </>
  );
}
