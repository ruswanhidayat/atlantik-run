import RunBottomNav from "@/app/components/run-bottom-nav";

type RecordBottomNavProps = {
  isAdmin: boolean;
};

export default function RecordBottomNav({
  isAdmin,
}: RecordBottomNavProps) {
  return (
    <RunBottomNav
      active="record"
      isAdmin={isAdmin}
    />
  );
}