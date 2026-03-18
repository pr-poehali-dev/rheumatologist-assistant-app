import StatsOverview from "@/components/StatsOverview";
import DoctorReport from "@/components/DoctorReport";

export default function StatsPage() {
  return (
    <div className="pb-24 space-y-5 animate-fade-in">
      <StatsOverview />
      <DoctorReport />
    </div>
  );
}
