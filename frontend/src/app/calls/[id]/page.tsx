"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { api, Call } from "@/lib/api";
import { ArrowLeft, Calendar, Download, Clock, Tag, User, MessageSquare } from "lucide-react";

// --- INTERFACES ---
// We define what data our components expect to receive.
// This makes it easy to see at a glance what "ingredients" a component needs.

interface CallHeaderProps {
  call: Call;
}

interface CallStatsProps {
  call: Call;
}

interface TagSectionProps {
  call: Call;
  onUpdate: (updatedCall: Call) => void; // A function that takes a Call and returns nothing
}

// --- COMPONENT 1: Header (Title & Export) ---
// Displays the filename, date, size, and the download button.
function CallHeader(props: CallHeaderProps) {
  const call = props.call;
  
  // Format the date nicely
  const date = new Date(call.upload_timestamp).toLocaleString();
  
  // Convert bytes to Megabytes (MB)
  const fileSizeInBytes = call.metadata_json?.file_size_bytes || 0;
  const fileSizeMB = (fileSizeInBytes / 1024 / 1024).toFixed(2);

  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{call.filename}</h1>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" /> {date}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> {fileSizeMB} MB
          </span>
        </div>
      </div>
      
      {/* Export Button */}
      <a 
        href={api.exportUrl(call.id)}
        className="inline-flex items-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
      >
        <Download className="w-4 h-4 mr-2" /> Export JSON
      </a>
    </div>
  );
}

// --- COMPONENT 2: Stats Grid (Sentiment, Intent, Speakers) ---
// Displays the AI analysis results in a 3-column grid.
function CallStats(props: CallStatsProps) {
  const call = props.call;
  
  // Extract values from the analysis JSON for easier usage
  const sentimentLabel = call.analysis_json.sentiment_label;
  const sentimentScore = call.analysis_json.sentiment_score;
  const intent = call.analysis_json.intent;
  const speakerRoles = call.analysis_json.speaker_roles;
  
  // Decide the color based on the sentiment label
  let sentimentColor = 'text-slate-600'; // Default (Neutral)
  if (sentimentLabel === 'Positive') {
    sentimentColor = 'text-green-600';
  } else if (sentimentLabel === 'Negative') {
    sentimentColor = 'text-red-600';
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
      
      {/* Column 1: Sentiment */}
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Sentiment</div>
        <div className="flex items-center gap-2">
          <span className={`text-lg font-semibold ${sentimentColor}`}>
            {sentimentLabel}
          </span>
          <span className="text-sm text-slate-400">({sentimentScore})</span>
        </div>
      </div>

      {/* Column 2: Intent */}
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Intent</div>
        <div className="text-lg font-medium text-slate-900">{intent || "Unknown"}</div>
      </div>

      {/* Column 3: Speakers */}
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Speakers</div>
        <div className="flex gap-1">
          {/* Loop through speakers and show a badge for each */}
          {speakerRoles?.map(role => (
            <span key={role} className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-medium">
              <User className="w-3 h-3 mr-1" /> {role}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- COMPONENT 3: Tag Manager (Handles Editing) ---
// Allows the user to view and edit custom tags.
function TagSection(props: TagSectionProps) {
  const call = props.call;
  const onUpdate = props.onUpdate;

  // State to toggle between "View Mode" and "Edit Mode"
  const [isEditing, setIsEditing] = useState(false);
  // State to hold the text in the input box
  const [input, setInput] = useState("");

  // When user clicks "Edit", fill the input box with current tags
  const startEditing = () => {
    const currentTagsString = call.custom_tags.join(", ");
    setInput(currentTagsString);
    setIsEditing(true);
  };

  // When user clicks "Save", send data to API
  const saveTags = async () => {
    // Split string by comma to get an array: "sales, urgent" -> ["sales", "urgent"]
    const tagsArray = input.split(",").map(tag => tag.trim()).filter(tag => tag !== "");
    
    try {
      const updatedCall = await api.updateTags(call.id, tagsArray);
      onUpdate(updatedCall); // Tell the parent component about the update
      setIsEditing(false);   // Go back to View Mode
    } catch (e) {
      alert("Failed to save tags");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Tag className="w-5 h-5 text-blue-500" /> Tags
        </h2>
        
        {/* Toggle Button: Shows "Save" if editing, "Edit" if viewing */}
        <button 
          onClick={() => isEditing ? saveTags() : startEditing()}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {isEditing ? "Save" : "Edit"}
        </button>
      </div>

      <div className="space-y-4">
        {/* 1. System Tags (ReadOnly) */}
        <div>
          <div className="text-xs font-medium text-slate-400 mb-2">AI Generated</div>
          <div className="flex flex-wrap gap-2">
            {call.tags.map(tag => (
              <span key={tag} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md border border-slate-200">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 2. Custom Tags (Editable) */}
        <div>
          <div className="text-xs font-medium text-slate-700 mb-2">Custom Tags</div>
          
          {isEditing ? (
            // Edit Mode: Show Text Area
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full p-2 text-sm border border-slate-300 rounded-md outline-none focus:border-blue-500"
              rows={3}
            />
          ) : (
            // View Mode: Show Badges
            <div className="flex flex-wrap gap-2">
              {call.custom_tags.length > 0 ? call.custom_tags.map(tag => (
                <span key={tag} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md border border-blue-100">
                  {tag}
                </span>
              )) : (
                <span className="text-sm text-slate-400 italic">No custom tags added.</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- MAIN PAGE COMPONENT ---
// This acts as the "Controller". It fetches data and coordinates the sub-components.
export default function CallDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the params (Next.js 15 requirement)
  const { id } = use(params);
  
  const [call, setCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(true);

  // Load data when the page opens
  useEffect(() => {
    if (id) {
      const callId = Number(id);
      api.getCall(callId)
        .then(data => setCall(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  // Show Loading Spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show 404 Message
  if (!call) {
    return <div>Call not found</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-6">
          <CallHeader call={call} />
          <CallStats call={call} />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Transcript & Summary */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Summary Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" /> Executive Summary
              </h2>
              <p className="text-slate-700 leading-relaxed">{call.analysis_json.summary}</p>
              
              {/* Key Insights List */}
              {call.analysis_json.key_insights && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Key Insights</h3>
                  <ul className="space-y-2">
                    {call.analysis_json.key_insights.map((insight, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Transcript Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Transcript</h2>
              <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 font-mono whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
                {call.transcript}
              </div>
            </div>
          </div>

          {/* Right Column: Tags */}
          <div className="space-y-6">
             <TagSection call={call} onUpdate={setCall} />
          </div>
        </div>
      </div>
    </div>
  );
}
