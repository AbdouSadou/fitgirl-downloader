"use client";

import { Download, Moon, Search, Sun, Trash2, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AlertDialog } from "../components/AlertDialog";

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [url, setUrl] = useState("");
  const [links, setLinks] = useState("");
  const [logs, setLogs] = useState<{ msg: string; color: string }[]>([]);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: "", message: "" });
  
  const cancelFlag = useRef(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const logMsg = (msg: string, color: string) => {
    setLogs((prev) => [...prev, { msg, color }]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const showAlert = (title: string, message: string) => {
    setAlertConfig({ isOpen: true, title, message });
  };

  const hideAlert = () => {
    setAlertConfig((prev) => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    // Auto-scroll to bottom whenever logs change
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const getLinks = async () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      showAlert("No URL", "Please enter a valid FitGirl Game Link first.");
      return;
    }

    if (!trimmedUrl.startsWith("https://fitgirl-repacks.site") && !trimmedUrl.startsWith("fitgirl-repacks.site")) {
      showAlert("Invalid URL", "The link must start with 'https://fitgirl-repacks.site' or 'fitgirl-repacks.site'.");
      return;
    }

    const strippedDomain = trimmedUrl.replace(/^https?:\/\//, "").replace(/^fitgirl-repacks\.site/, "");
    if (strippedDomain === "" || strippedDomain === "/") {
      showAlert("Invalid URL", "Please provide a link to a specific game, not the home page.");
      return;
    }

    logMsg(`Fetching links from: ${trimmedUrl}`, "text-blue-500");
    try {
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(trimmedUrl)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      
      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      
      const extractedLinks: string[] = [];
      const dLinksDivs = doc.querySelectorAll("div.dlinks");
      
      dLinksDivs.forEach((div) => {
        const anchors = div.querySelectorAll("a");
        anchors.forEach((a) => {
          if (a.href.startsWith("https://fuckingfast.co/")) {
            extractedLinks.push(a.href);
          }
        });
      });

      if (extractedLinks.length === 0) {
        showAlert("No Links", "No Matching URLs Found.");
      } else {
        setLinks(extractedLinks.join("\n"));
        logMsg(`Found ${extractedLinks.length} links.`, "text-green-500");
      }
    } catch (ex: any) {
      logMsg(`Error fetching links: ${ex.message}`, "text-red-500");
    }
  };

  const startDownload = async () => {
    const linkArray = links.split("\n").map((l) => l.trim()).filter(Boolean);
    if (linkArray.length === 0) {
      showAlert("No Links", "Please fetch links first or paste download links into the box.");
      return;
    }

    setIsDownloading(true);
    cancelFlag.current = false;
    setProgress(0);
    setProgressText("");

    for (let i = 0; i < linkArray.length; i++) {
        if (cancelFlag.current) {
            logMsg("Process manually aborted.", "text-red-500");
            break;
        }

        const link = linkArray[i];
        logMsg(`Processing link ${i + 1}/${linkArray.length}: ${link}`, theme === "dark" ? "text-gray-300" : "text-gray-700");

        try {
            const proxyLink = `https://corsproxy.io/?${encodeURIComponent(link)}`;
            const res = await fetch(proxyLink);
            if (!res.ok) {
                logMsg(`Failed to fetch page: ${res.status}`, "text-red-500");
                continue;
            }

            const html = await res.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            
            let fileUrl = "";
            let fileName = `file_part_${i+1}.bin`;
            
            const titleMeta = doc.querySelector("meta[name=\"title\"]");
            if (titleMeta) {
                fileName = titleMeta.getAttribute("content") || fileName;
            }

            const scripts = doc.querySelectorAll("script");
            scripts.forEach((script) => {
                const text = script.textContent;
                if (text && text.includes("function download")) {
                    const match = text.match(/window\.open\((["'])(https?:\/\/[^\s"']+)\1/);
                    if (match && match[2]) fileUrl = match[2];
                }
            });

            if (fileUrl) {
                logMsg(`Passing to browser download manager: ${fileName}`, "text-blue-500");
                
                const a = document.createElement("a");
                a.href = fileUrl;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                setProgress((i + 1) / linkArray.length);
                setProgressText(`[${i + 1}/${linkArray.length}] Handed off to browser`);
                
                // Remove the completed link from the text box immediately 
                setLinks((prev) => prev.split("\n").filter((l) => l !== link).join("\n"));
                
                // Add a delay to prevent browser popup blockers from stopping rapid consecutive downloads
                if (i < linkArray.length - 1 && !cancelFlag.current) {
                    logMsg("Waiting 10 seconds to prevent browser popup block...", "text-blue-400");
                    await new Promise((resolve) => setTimeout(resolve, 10000));
                }
            } else {
                logMsg("Download Function Not Found in script", "text-red-500");
            }
        } catch (ex: any) {
            logMsg(`Error processing link ${link}: ${ex.message}`, "text-red-500");
        }
    }

    setIsDownloading(false);
    if (!cancelFlag.current) {
        logMsg("All done!", "text-green-500");
    }
  };

  const stopDownload = () => {
    cancelFlag.current = true;
    setIsDownloading(false);
  };

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <div className={`min-h-screen p-8 transition-colors ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      <div className="max-w-4xl mx-auto space-y-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">FitGirl Easy Downloader (fuckingfast.co)</h1>
          <button onClick={toggleTheme} className={`p-2 rounded-full transition ${theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-200"}`}>
            {theme === "dark" ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>

        {/* URL Input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            className={`flex-1 p-3 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-gray-900"}`}
            placeholder="Fitgirl Game Link..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isDownloading}
          />
          <button
            onClick={getLinks}
            disabled={isDownloading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition disabled:opacity-50"
          >
            <Search size={20} />
            Get Links
          </button>
        </div>

        {/* Links Input */}
        <div>
          <label className="block mb-2 font-semibold">Download Links (fuckingfast.co)</label>
          <textarea
            className={`w-full h-32 p-3 font-mono text-sm rounded-lg border outline-none focus:ring-2 focus:ring-blue-500 resize-y ${theme === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-gray-900"}`}
            value={links}
            onChange={(e) => setLinks(e.target.value)}
            disabled={isDownloading}
          ></textarea>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={startDownload}
              disabled={isDownloading}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold transition disabled:opacity-50"
            >
              <Download size={20} />
              Download
            </button>
            {isDownloading && (
              <button
                onClick={stopDownload}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold transition"
              >
                <XCircle size={20} />
                Cancel
              </button>
            )}
          </div>

          {/* Progress Bar placeholder */}
          {isDownloading && (
            <div className="w-full max-w-md">
              <div className={`w-full rounded-full h-2.5 mb-1 text-center ${theme === "dark" ? "bg-gray-700" : "bg-gray-300"}`}>
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-center">{progressText || "Working..."}</p>
            </div>
          )}
        </div>

        {/* Console/Logs Header */}
        <div className="flex items-center justify-between px-1">
          <h2 className="font-semibold">Activity Logs</h2>
          <button
            onClick={clearLogs}
            disabled={isDownloading}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition disabled:opacity-50"
          >
            <Trash2 size={16} />
            Clear Logs
          </button>
        </div>

        {/* Console/Logs */}
        <div className={`h-64 border rounded-lg p-4 overflow-y-auto font-mono text-sm ${theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-300 bg-white"}`}>
          {logs.length === 0 && <span className="text-gray-500">Logs will appear here...</span>}
          {logs.map((log, i) => (
            <div key={i} className={`font-bold ${log.color} mb-1`}>
              {log.msg}
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>
      
      <AlertDialog
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        theme={theme}
        onClose={hideAlert}
      />
    </div>
  );
}
