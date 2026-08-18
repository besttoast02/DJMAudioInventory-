"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Commit {
  id: string;
  message: string;
  createdAt: string;
}

interface Deploy {
  id: string;
  status: string;
  commit?: Commit;
  trigger: string;
  createdAt: string;
  finishedAt: string | null;
}

interface Service {
  id: string;
  name: string;
  type: string;
  repo: string;
  branch: string;
  updatedAt: string;
  dashboardUrl: string;
  latestDeploy: Deploy | null;
}

export default function MonitorPage() {
  const [apiKey, setApiKey] = useState<string>("");
  const [tempKey, setTempKey] = useState<string>("");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(60);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [activeHeartbeat, setActiveHeartbeat] = useState<boolean>(false);

  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Set isClient to true on mount to avoid Next.js hydration mismatch
  useEffect(() => {
    setIsClient(true);
    const savedKey = localStorage.getItem("RENDER_MONITOR_API_KEY") || "";
    if (savedKey) {
      setApiKey(savedKey);
      setTempKey(savedKey);
    }
  }, []);

  // Fetch statuses from our secure API proxy
  const fetchStatuses = async (keyToUse: string = apiKey) => {
    if (!keyToUse) return;
    setLoading(true);
    setError(null);
    setActiveHeartbeat(true);

    try {
      const response = await fetch("/api/render-status", {
        headers: {
          "x-render-api-key": keyToUse,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch service status");
      }

      const data = await response.json();
      setServices(data.services || []);
      setCountdown(60); // Reset timer on successful fetch
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
      setTimeout(() => setActiveHeartbeat(false), 800);
    }
  };

  // Trigger fetch when apiKey changes
  useEffect(() => {
    if (apiKey) {
      fetchStatuses(apiKey);
    }
  }, [apiKey]);

  // Handle countdown timer & auto-refresh every minute
  useEffect(() => {
    if (!apiKey || error) return;

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchStatuses(apiKey);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [apiKey, error]);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempKey.trim()) return;
    localStorage.setItem("RENDER_MONITOR_API_KEY", tempKey.trim());
    setApiKey(tempKey.trim());
  };

  const handleDisconnect = () => {
    localStorage.removeItem("RENDER_MONITOR_API_KEY");
    setApiKey("");
    setTempKey("");
    setServices([]);
    setError(null);
  };

  // Helper to format date
  const formatTime = (isoString: string | null) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const formatDateAgo = (isoString: string | null) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.round(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin === 1) return "1 minute ago";
    if (diffMin < 60) return `${diffMin} minutes ago`;
    const diffHours = Math.round(diffMin / 60);
    if (diffHours === 1) return "1 hour ago";
    return `${diffHours} hours ago`;
  };

  // Helper to get status colors
  const getStatusBadge = (status: string | undefined) => {
    const s = status ? status.toLowerCase() : "";
    if (s === "live") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
          Live
        </span>
      );
    }
    if (s.includes("progress")) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Deploying
        </span>
      );
    }
    if (s.includes("failed")) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <span className="w-2 h-2 rounded-full bg-rose-400 mr-2"></span>
          Failed
        </span>
      );
    }
    if (s === "queued") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <span className="w-2 h-2 rounded-full bg-amber-400 mr-2 animate-bounce"></span>
          Queued
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
        Unknown
      </span>
    );
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium">Initializing Monitor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white font-sans selection:bg-blue-600 selection:text-white pb-20">
      
      {/* Top Banner Header */}
      <header className="border-b border-slate-800/60 bg-slate-950/40 backdrop-blur-md sticky top-0 z-30 transition-all duration-300">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600/15 text-blue-500 rounded-xl border border-blue-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">DJM Deployment Hub</h1>
              <p className="text-xs text-slate-400">Live Render Upload Monitor</p>
            </div>
          </div>

          {apiKey && (
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2 bg-slate-900/60 px-4 py-2 rounded-xl border border-slate-800/80">
                <span className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${activeHeartbeat ? "bg-emerald-400 scale-125" : "bg-emerald-500"}`}></span>
                <span className="text-xs font-semibold text-slate-400">Connected</span>
              </div>
              <button
                onClick={handleDisconnect}
                className="px-3.5 py-2 text-xs font-semibold text-rose-400 bg-rose-500/5 hover:bg-rose-500/15 rounded-xl border border-rose-500/20 hover:border-rose-500/40 transition-all duration-200 cursor-pointer"
              >
                Disconnect Key
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 pt-12 max-w-6xl">
        
        {/* Setup API Key View */}
        {!apiKey ? (
          <div className="max-w-md mx-auto py-12">
            <div className="bg-slate-900/40 backdrop-blur-lg border border-slate-800/60 p-8 rounded-3xl shadow-xl flex flex-col space-y-6">
              <div className="text-center flex flex-col space-y-2">
                <h2 className="text-2xl font-bold">Connect Render Account</h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Enter your Render Personal Access Token to visually monitor active deployments and uploads.
                </p>
              </div>

              <form onSubmit={handleSaveKey} className="space-y-4">
                <div>
                  <label htmlFor="token" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Render API Key
                  </label>
                  <input
                    type="password"
                    id="token"
                    placeholder="rnd_..."
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2"
                >
                  <span>Start Monitoring</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
              </form>

              <div className="border-t border-slate-800/60 pt-4 text-center">
                <a
                  href="https://dashboard.render.com/account"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:underline inline-flex items-center space-x-1"
                >
                  <span>Generate token in Render Account settings</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* Active Monitor View */
          <div className="space-y-8">
            
            {/* Controller Dashboard controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/30 backdrop-blur-md border border-slate-800/60 p-6 rounded-2xl">
              <div>
                <h2 className="text-lg font-bold">Services & Build Pipelines</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Updates automatically every minute. Last compiled states across the repository.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {/* Countdown ring */}
                <div className="flex items-center space-x-3 bg-slate-950/60 px-4 py-2.5 rounded-xl border border-slate-800/80">
                  <div className="relative flex items-center justify-center w-7 h-7">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="14"
                        cy="14"
                        r="11"
                        stroke="#1e293b"
                        strokeWidth="2.5"
                        fill="transparent"
                      />
                      <circle
                        cx="14"
                        cy="14"
                        r="11"
                        stroke="#3b82f6"
                        strokeWidth="2.5"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 11}
                        strokeDashoffset={(2 * Math.PI * 11) * (1 - countdown / 60)}
                        className="transition-all duration-1000 ease-linear"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-bold">{countdown}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-300">Next Auto-Refresh</span>
                </div>

                <button
                  onClick={() => fetchStatuses()}
                  disabled={loading}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer inline-flex items-center space-x-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
                  <span>Manual Refresh</span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm flex items-center space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 flex-shrink-0"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <div className="flex-1">
                  <span className="font-semibold">Authentication or connection issue:</span> {error}
                </div>
              </div>
            )}

            {/* Loading Indicator for Empty State */}
            {loading && services.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 font-semibold">Contacting Render API...</p>
              </div>
            )}

            {/* Services Grid */}
            {services.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-900/20 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700/60 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 flex flex-col justify-between space-y-6 group"
                  >
                    {/* Top details: name, type, status */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded-md">
                            {item.type.replace("_", " ")}
                          </span>
                          <h3 className="text-lg font-bold group-hover:text-blue-400 transition-colors">
                            {item.name}
                          </h3>
                        </div>
                        {getStatusBadge(item.latestDeploy?.status)}
                      </div>

                      {/* Code Branch */}
                      <div className="flex items-center text-xs text-slate-400 space-x-2 bg-slate-950/40 px-3 py-1.5 rounded-xl border border-slate-800/50 w-fit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>
                        <span className="font-semibold text-slate-300">{item.branch}</span>
                      </div>
                    </div>

                    {/* Middle details: latest deploy commit details */}
                    <div className="border-t border-b border-slate-800/60 py-4 flex flex-col space-y-3 text-xs">
                      {item.latestDeploy ? (
                        <>
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                              Latest Commit
                            </span>
                            <div className="text-slate-200 leading-normal line-clamp-2 italic font-mono">
                              "{item.latestDeploy.commit?.message || "No commit message"}"
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                                Commit SHA
                              </span>
                              <span className="font-mono text-slate-400">
                                {item.latestDeploy.commit?.id.substring(0, 7) || "N/A"}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                                Triggered By
                              </span>
                              <span className="text-slate-400 capitalize">
                                {item.latestDeploy.trigger.replace("_", " ")}
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-slate-500 italic py-4">No deployment history found.</div>
                      )}
                    </div>

                    {/* Bottom details: timestamps & quick actions */}
                    <div className="flex justify-between items-center text-[11px] text-slate-400 gap-4 pt-2">
                      <div className="flex flex-col space-y-1">
                        <span>Started: {formatTime(item.latestDeploy?.createdAt || null)}</span>
                        <span className="text-slate-500">
                          {formatDateAgo(item.latestDeploy?.createdAt || null)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {item.dashboardUrl && (
                          <a
                            href={item.dashboardUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-slate-950/60 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl transition-all duration-200 cursor-pointer"
                            title="Open Render Dashboard"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                          </a>
                        )}
                        {item.repo && (
                          <a
                            href={item.repo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-slate-950/60 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl transition-all duration-200 cursor-pointer"
                            title="Open GitHub Repository"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {services.length === 0 && !loading && !error && (
              <div className="py-20 text-center bg-slate-900/20 border border-slate-800/60 rounded-2xl">
                <p className="text-slate-400 font-semibold">No services found in this Render account.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
