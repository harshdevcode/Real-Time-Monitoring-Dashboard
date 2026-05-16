import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { OverviewDashboard } from "@/components/dashboard/OverviewDashboard";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[220px] flex-shrink-0 overflow-y-auto">
          <Sidebar />
        </div>
        <main
          className="flex-1 overflow-y-auto p-5"
          aria-label="Main dashboard content"
        >
          <OverviewDashboard />
        </main>
      </div>
    </div>
  );
}
