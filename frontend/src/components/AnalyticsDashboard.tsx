"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, MessageSquare, Users } from "lucide-react";

// Define the data shape for our analytics
// (This matches what backend/main.py /analytics endpoint returns)
interface AnalyticsData {
  total_calls: number;
  avg_sentiment: number;
  sentiment_distribution: Record<string, number>; // This is an object where the Keys are Strings ("Positive") and the Values are Numbers (10)
  top_tags: Record<string, number>; // same as above but for top_tags
}

export default function AnalyticsDashboard() {
  // State to hold the data
  const [data, setData] = useState<AnalyticsData | null>(null);

  // Fetch data when the component mounts (loads)
  useEffect(() => {
    api.getAnalytics().then(setData).catch(console.error);
  }, []);

  // Don't render anything until data loads
  if (!data) return null;

  // Transform backend data for Recharts. Takes an object and turns it into an array of pairs (label, count), which is a tuple.
  // we need this because charting library Recharts, needs it this way. If we pass an object it will crash
  // Recharts doesnt know how to read a dictionary, only how to loop through a list/tuple.
  const sentimentData = Object.entries(data.sentiment_distribution).map(([label, count]) => {
    let barColor = '#94a3b8'; // Default Neutral (Gray)
    if (label === 'Positive') barColor = '#22c55e'; // Green
    if (label === 'Negative') barColor = '#ef4444'; // Red

    return {
      name: label,
      value: count,
      color: barColor
    };
  });

  return (
    <div className="mb-10 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Performance Overview
        </h2>
      </div>

      {/* KPI Cards (Key Performance Indicators) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Total Volume */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
            <MessageSquare className="w-4 h-4" /> Total Calls
          </div>
          <div className="text-2xl font-bold text-slate-900">{data.total_calls}</div>
        </div>
        
        {/* Card 2: Average Sentiment */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
            <Users className="w-4 h-4" /> Avg Sentiment
          </div>
          <div className={`text-2xl font-bold ${data.avg_sentiment > 0 ? 'text-green-600' : 'text-slate-900'}`}>
            {data.avg_sentiment > 0 ? '+' : ''}{data.avg_sentiment}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart 1: Sentiment Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-900 mb-6">Sentiment Distribution</h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {/* here we use the sentimentData we talked before which now is a tuple of (label, count) and not an object. */}
              <BarChart data={sentimentData}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Top Tags List */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-900 mb-4">Top Call Tags</h3>
          <div className="space-y-3">
            {Object.entries(data.top_tags).map(([tag, count], i) => (
              <div key={tag} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600">
                    {i + 1}
                  </div>
                  <span className="text-sm text-slate-700 capitalize">{tag}</span>
                </div>
                <div className="text-sm font-semibold text-slate-900 bg-slate-50 px-2 py-0.5 rounded">
                    {count}
                </div>
              </div>
            ))}
            {Object.keys(data.top_tags).length === 0 && (
                <div className="text-sm text-slate-400 italic">No tags generated yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
