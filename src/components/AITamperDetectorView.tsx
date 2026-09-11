import React, { useState } from 'react';
import {
  Cpu,
  Upload,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Layers,
  Send,
  Eye,
  FileCheck,
  RefreshCw,
  FileSearch,
  Lock,
  ArrowUpRight,
} from 'lucide-react';
import { TamperAnalysisResult, UserProfile } from '../types';
import { analyzeDocumentForTampering } from '../services/tamperDetectionService';

interface AITamperDetectorViewProps {
  currentUser: UserProfile | null;
  onEscalate: (result: TamperAnalysisResult) => void;
}

export const AITamperDetectorView: React.FC<AITamperDetectorViewProps> = ({
  currentUser,
  onEscalate,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<TamperAnalysisResult | null>(null);
  const [escalated, setEscalated] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState<string>('Initializing forensic engine...');

  const handleCustomFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setEscalated(false);
    setAnalyzingStep('Ingesting document byte stream & calculating SHA-256 digest...');

    const stepTimer1 = setTimeout(() => {
      setAnalyzingStep('Running Error Level Analysis (ELA) pixel variance matrix...');
    }, 400);

    const stepTimer2 = setTimeout(() => {
      setAnalyzingStep('Evaluating typographic baseline and glyph kerning offsets...');
    }, 800);

    try {
      const result = await analyzeDocumentForTampering(file);
      setAnalysisResult(result);
    } catch (err) {
      console.error('Tamper analysis failed', err);
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsAnalyzing(false);
      // Reset input value so same file can be re-selected if desired
      e.target.value = '';
    }
  };

  const handleResetAnalysis = () => {
    setAnalysisResult(null);
    setEscalated(false);
  };

  const handleEscalateClick = () => {
    if (!analysisResult) return;
    onEscalate(analysisResult);
    setEscalated(true);
  };

  return (
    <div className="bg-[#f8fafc] min-h-[calc(100vh-140px)] p-4 sm:p-7 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
          <Cpu className="w-4 h-4 text-emerald-600" />
          <span className="uppercase tracking-wider">AI FORENSIC TAMPER DETECTION ENGINE</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          AI Document Verification & Error Level Analysis (ELA)
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          Inspect statutory bonds, land titles, identity credentials, and certificates for fraudulent alterations.
          Our model evaluates Error Level Analysis (ELA) pixel compression variance, font kerning consistency,
          metadata headers, and cryptographic hash anchoring.
        </p>
      </div>

      {/* Main Analysis Container */}
      {!analysisResult && !isAnalyzing ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Card */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileSearch className="w-5 h-5 text-orange-600" />
                <span>Upload Custom Document for Forensic Scan</span>
              </h2>
              <p className="text-xs text-slate-500">
                Upload your digital certificate, land deed, fixed deposit bond, or photo. The forensic neural map
                runs strictly on your submitted file with zero sample fallback.
              </p>
            </div>

            {/* Drag and Drop Zone */}
            <label className="flex flex-col items-center justify-center p-8 sm:p-12 border-2 border-dashed border-orange-300 hover:border-orange-500 bg-orange-50/20 hover:bg-orange-50/50 rounded-2xl cursor-pointer transition-all text-center space-y-3 group">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                <Upload className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="text-sm font-bold text-slate-900 block">
                  Click to Browse or Drag Document / Photo Here
                </span>
                <span className="text-xs text-slate-500 block">
                  Supports PDF, PNG, JPG, JPEG, WEBP (Up to 25MB)
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-semibold">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>Cryptographically processed in client sandbox</span>
              </div>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={handleCustomFileUpload}
                className="hidden"
              />
            </label>

            {/* Verification Principles Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800">1. Pixel ELA Scan</div>
                <div className="text-[11px] text-slate-500">
                  Detects re-saved JPEG compression blocks and cloned pixels.
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800">2. Font Kerning OCR</div>
                <div className="text-[11px] text-slate-500">
                  Flags non-uniform baseline offsets and substituted typography layers.
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800">3. Blockchain Check</div>
                <div className="text-[11px] text-slate-500">
                  Calculates SHA-256 digest to verify registry state immutability.
                </div>
              </div>
            </div>
          </div>

          {/* Operational Instructions Sidebar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-orange-600" />
              <span>Inspection Guidelines</span>
            </h3>

            <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Strict User-Uploaded Verification</span>
                </div>
                <p className="text-[11px] text-blue-800">
                  All default sample images have been disabled. The Forensic Visual Map and analysis run strictly on documents and photos uploaded by you.
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-slate-800">Accepted Statutory Documents:</div>
                <ul className="space-y-1.5 list-disc pl-4 text-slate-500 text-[11px]">
                  <li>State Bank of India (SBI) Fixed Deposit Bonds</li>
                  <li>State Revenue Land Allotment & Title Deeds</li>
                  <li>UGC / AICTE University Degrees & Academic Marks</li>
                  <li>Vehicle Registration Certificates & Municipal Permits</li>
                </ul>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="font-bold text-slate-800">Post-Analysis Redressal:</div>
                <p className="text-[11px] text-slate-500">
                  If an uploaded document exhibits tampering or fraudulent alteration, you can directly dispatch a formal complaint dossier to the Verification Officer queue.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : isAnalyzing ? (
        /* Progress View */
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-2xs space-y-4 max-w-2xl mx-auto">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              Running AI Forensic Tampering Scan
            </h3>
            <p className="text-xs text-orange-600 font-medium animate-pulse">
              {analyzingStep}
            </p>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Evaluating pixel compression noise matrices & font kerning offsets
          </div>
        </div>
      ) : analysisResult ? (
        /* Analysis Results Panel */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
          {/* Top Actions & Verdict Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-bold text-slate-900">
                  {analysisResult.documentName}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    analysisResult.tamperPercentage > 45
                      ? 'bg-red-100 text-red-800'
                      : analysisResult.tamperPercentage > 15
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {analysisResult.riskLevel.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  ({analysisResult.fileSize})
                </span>
              </div>
              <div className="font-mono text-xs text-slate-500 break-all">
                SHA-256: {analysisResult.documentHash}
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <div className="text-xs font-bold text-slate-500 uppercase">Tamper Index</div>
                <div
                  className={`text-3xl font-black ${
                    analysisResult.tamperPercentage > 45
                      ? 'text-red-600'
                      : analysisResult.tamperPercentage > 15
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {analysisResult.tamperPercentage}%
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetAnalysis}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Upload another document"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Scan Another</span>
              </button>
            </div>
          </div>

          {/* 3 Metric Breakdown Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
              <div className="text-slate-500 font-medium">Font Kerning Score</div>
              <div className="text-lg font-bold text-slate-900">
                {analysisResult.fontConsistencyScore}%
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-orange-600 h-full"
                  style={{ width: `${analysisResult.fontConsistencyScore}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
              <div className="text-slate-500 font-medium">Pixel ELA Score</div>
              <div className="text-lg font-bold text-slate-900">
                {analysisResult.pixelElaScore}%
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full"
                  style={{ width: `${analysisResult.pixelElaScore}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
              <div className="text-slate-500 font-medium">Blockchain Anchor</div>
              <div className="text-lg font-bold text-slate-900">
                {analysisResult.blockchainAnchorVerified ? 'VERIFIED' : 'MISMATCH'}
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    analysisResult.blockchainAnchorVerified ? 'bg-emerald-600' : 'bg-red-600'
                  }`}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* Forensic Visual Map Rendering User Uploaded Document */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-orange-600" />
                <span>Forensic Visual Map (Uploaded Document Anomaly Overlay):</span>
              </div>
              <span className="text-[11px] text-slate-500">
                Analyzed on {new Date(analysisResult.analyzedAt).toLocaleTimeString()}
              </span>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-slate-900 flex items-center justify-center min-h-[300px] max-h-[460px]">
              <img
                src={analysisResult.previewUrl}
                alt="Uploaded user document forensic view"
                className="w-full max-h-[460px] object-contain"
              />

              {/* Highlight boxes overlay mapped onto the uploaded document */}
              {analysisResult.visualHighlights.map((zone) => (
                <div
                  key={zone.id}
                  className="absolute border-2 border-red-500 bg-red-500/20 rounded flex items-start p-1 pointer-events-none"
                  style={{
                    left: `${zone.x}%`,
                    top: `${zone.y}%`,
                    width: `${zone.w}%`,
                    height: `${zone.h}%`,
                  }}
                >
                  <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                    {zone.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Issues Identified */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Forensic Anomaly & Integrity Log:
            </div>
            {analysisResult.issues.length > 0 ? (
              <div className="space-y-2">
                {analysisResult.issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-start gap-3 text-xs"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">{issue.title}</div>
                      <div className="text-slate-600 text-[11px]">{issue.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>No compression anomalies or typographic inconsistencies detected in this document.</span>
              </div>
            )}
          </div>

          {/* Action Buttons: Escalation / Send Complaint to Verification Officer */}
          {analysisResult.tamperPercentage > 15 && (
            <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-orange-950">
                <span className="font-bold">Send Tamper Complaint:</span> Dispatches cryptographic dossier
                directly to the Verification Officer queue to verify and send back your original document.
              </div>

              <button
                type="button"
                onClick={handleEscalateClick}
                disabled={escalated}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                  escalated
                    ? 'bg-emerald-600 text-white'
                    : 'bg-orange-600 hover:bg-orange-700 text-white shadow-xs'
                }`}
              >
                {escalated ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complaint Sent to Verification Officer!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Complaint to Verification Officer</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

