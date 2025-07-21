import { PageHeader } from "@/components/page-header";
import { RansomwareTable } from "@/components/ransomware-table";

export default function RansomwarePage() {
  return (
    <>
      <PageHeader
        title="Ransomware"
        description="Search and filter through all identified ransomware sources."
      />
      <RansomwareTable />
    </>
  );
} 