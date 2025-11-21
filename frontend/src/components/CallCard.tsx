"use client";
import { Call } from "@/lib/api";
import { Activity, Calendar } from "lucide-react";
import Link from "next/link";

// Props definition: This component expects a 'call' object as input

interface CallCardProps {
    call: Call;
}

export default function CallCard({ call }: CallCardProps) {
  // 1. Format Date
  // "2023-11-21T10:00:00" -> "Nov 21, 10:00 AM"
  const date = new Date(call.upload_timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  // 2. Determine Sentiment Color
  // AI gives a score from -1 (Bad) to 1 (Good).
  // We use this to color-code the badge.
  const sentimentScore = call.analysis_json.sentiment_score || 0;
  const sentimentColor = 
    sentimentScore > 0.3 ? "text-green-600 bg-green-50" : // Positive
    sentimentScore < -0.3 ? "text-red-600 bg-red-50" :   // Negative
    "text-slate-600 bg-slate-50";                         // Neutral

  return (
    // The whole card is a clickable link to the details page
    <Link href={`/calls/${call.id}`} className="block group">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all duration-200">
        
        {/* --- HEADER: Filename & Date --- */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-start">
          <div className="space-y-1">
            {/* Truncate long filenames with CSS */}
            <h3 className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors truncate max-w-[200px]" title={call.filename}>
              {call.filename}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar className="w-3 h-3" />
              {date}
            </div>
          </div>
          
          {/* Sentiment Badge */}
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${sentimentColor}`}>
            {call.analysis_json.sentiment_label || "Neutral"}
          </div>
        </div>

        {/* --- BODY: Summary & Tags --- */}
        <div className="p-4 space-y-4">
          {/* Summary Snippet (limited to 2 lines) */}
          <p className="text-sm text-slate-600 line-clamp-2 min-h-[40px]">
            {call.analysis_json.summary || "Processing summary..."}
          </p>

          {/* Tag List */}
          <div className="flex flex-wrap gap-1.5">
            {/* Combine System Tags + Custom Tags */}
            {[...call.tags, ...call.custom_tags].slice(0, 3).map((tag, i) => (
              <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] uppercase tracking-wider font-medium rounded">
                {tag}
              </span>
            ))}
            
            {/* "+2 more" indicator if there are too many tags */}
            {([...call.tags, ...call.custom_tags].length > 3) && (
              <span className="px-2 py-0.5 bg-slate-50 text-slate-400 text-[10px] rounded">
                +{([...call.tags, ...call.custom_tags].length - 3)}
              </span>
            )}
          </div>
        </div>

        {/* --- FOOTER: Intent --- */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {/* Intent (e.g., "Purchase") */}
                <span>{call.analysis_json.intent || "Unknown Intent"}</span>
            </div>
            <div className="group-hover:translate-x-1 transition-transform text-blue-500 font-medium">
                View Details →
            </div>
        </div>
      </div>
    </Link>
  );
}

