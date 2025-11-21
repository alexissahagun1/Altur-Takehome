import Link from "next/link";
export const dynamic = 'force-dynamic';
import UploadZone from "@/components/UploadZone";
import CallCard from "@/components/CallCard";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import { api } from "@/lib/api";

// This is a SERVER COMPONENT.
// It runs on the server first, fetches data, and sends HTML to the browser.
// This is great for SEO and performance.
export default async function Home() {
  
  // 1. Fetch Data
  // We call our API helper. Since this is on the server (localhost:8000), it happens fast.
  const calls = await api.getCalls();
  const hasCalls = calls.length > 0;

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      {/* --- Header Section --- */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Logo Icon */}
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Altur Analysis</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* --- Hero Text --- */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Call Intelligence Dashboard</h1>
          <p className="text-slate-500 text-lg">Upload sales calls to get instant AI-powered insights, sentiment analysis, and automated tagging.</p>
        </div>

        {/* --- Component 1: Upload Zone --- */}
        <UploadZone />

        {/* --- Component 2: Analytics --- */}
        {/* Only show if we actually have calls to analyze */}
        {hasCalls ? <AnalyticsDashboard /> : null}

        {/* --- Component 3: Call List --- */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Recent Calls</h2>
            <div className="text-sm text-slate-500">
              Showing {calls.length} call{calls.length !== 1 ? 's' : ''}
            </div>
          </div>

          {calls.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Loop through the calls and render a card for each */}
              {calls.map((call) => (
                <CallCard key={call.id} call={call} />
              ))}
            </div>
          ) : (
            // Empty State
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
              <p className="text-slate-400">No calls processed yet. Upload one above to get started.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
