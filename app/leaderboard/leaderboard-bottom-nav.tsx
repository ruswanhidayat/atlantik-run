import RunBottomNav from "@/app/components/run-bottom-nav";

type LeaderboardBottomNavProps = {
  canRecord: boolean;
  isAdmin: boolean;
};

export default function LeaderboardBottomNav({
  canRecord,
  isAdmin,
}: LeaderboardBottomNavProps) {
  return (
    <RunBottomNav
      active="rank"
      canRecord={canRecord}
      isAdmin={isAdmin}
    />
  );
}