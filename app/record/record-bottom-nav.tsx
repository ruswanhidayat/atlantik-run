import RunBottomNav from "@/app/components/run-bottom-nav";

type RecordBottomNavProps = {
  canRecord: boolean;
  isAdmin: boolean;
};

export default function RecordBottomNav({
  canRecord,
  isAdmin,
}: RecordBottomNavProps) {
  return (
    <RunBottomNav
      active="record"
      canRecord={canRecord}
      isAdmin={isAdmin}
    />
  );
}