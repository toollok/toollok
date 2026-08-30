"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import {
     Key, ShieldAlert, Upload, FileText, Copy, Check, Download, RefreshCw,
     Search, Filter, Eye, EyeOff, AlertTriangle, CheckCircle2, Terminal,
     GitBranch, Lock, Unlock, HelpCircle, X, ShieldCheck, Zap, FileCode,
     SlidersHorizontal, ArrowDownToLine, Trash2, Info, ChevronRight
} from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import AdSlot from "@/components/ui/AdSlot";

export interface Finding {
     id: string;
     type: string;
     secret: string;
     maskedSecret: string;
     severity: "Critical" | "High" | "Medium" | "Low" | "Informational";
     confidence: number;
     confidenceReason: string;
     entropy: number;
     variableName: string;
     fileName: string;
     lineNumber: number;
     columnNumber: number;
     context: string;
     remediation: string[];
     isNewInDiff: boolean;
     ignored: boolean;
     revealed: boolean;
}

// Shannon Entropy Calculation (Bits per character)
function calculateShannonEntropy(str: string): number {
     if (!str) return 0;
     const len = str.length;
     const frequencies: Record<string, number> = {};
     for (let i = 0; i < len; i++) {
          const char = str[i];
          frequencies[char] = (frequencies[char] || 0) + 1;
     }
     let entropy = 0;
     for (const char in frequencies) {
          const p = frequencies[char] / len;
          entropy -= p * Math.log2(p);
     }
     return Number(entropy.toFixed(2));
}

// Mask secret securely
function maskSecretValue(secret: string): string {
     if (!secret || secret.length <= 6) return "••••••••";
     if (secret.startsWith("-----BEGIN")) {
          const firstLine = secret.split("\n")[0] || "-----BEGIN PRIVATE KEY-----";
          return `${firstLine}\n•••••••• [REDACTED CRYPTOGRAPHIC MATERIAL] ••••••••\n-----END PRIVATE KEY-----`;
     }
     const prefixLength = Math.min(4, Math.floor(secret.length / 4));
     const suffixLength = Math.min(4, Math.floor(secret.length / 4));
     const start = secret.slice(0, prefixLength);
     const end = secret.slice(-suffixLength);
     const bulletCount = Math.min(16, Math.max(6, secret.length - prefixLength - suffixLength));
     return `${start}${"•".repeat(bulletCount)}${end}`;
}

// Check for common test/mock/placeholder values to suppress false alarms
const PLACEHOLDER_TERMS = [
     "example", "sample", "demo", "test", "changeme", "replace_me", "replace-me",
     "your_api_key", "your-api-key", "your_token", "your-token", "your_secret",
     "xxx", "xxxx", "abc123", "<your_key>", "todo", "undefined", "null", "dummy",
     "my_secret", "placeholder", "fake", "insert_here"
];

function isLikelyPlaceholder(str: string): boolean {
     const lower = str.toLowerCase();
     return PLACEHOLDER_TERMS.some(term => lower.includes(term));
}

interface SecretSignature {
     type: string;
     severity: "Critical" | "High" | "Medium" | "Low" | "Informational";
     regex: RegExp;
     baseConfidence: number;
     category: "Cloud" | "Platform" | "SaaS" | "Auth" | "Database" | "Crypto" | "Generic";
     remediation: string[];
}

const SECRET_SIGNATURES: SecretSignature[] = [
     {
          type: "AWS Access Key ID",
          category: "Cloud",
          severity: "Critical",
          regex: /\b((?:AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16})\b/g,
          baseConfidence: 98,
          remediation: [
               "Revoke and rotate the AWS Access Key immediately in the AWS IAM Console.",
               "Check AWS CloudTrail logs for unauthorized API calls originated with this key.",
               "Remove hardcoded keys and utilize AWS IAM Roles or AWS Secrets Manager."
          ]
     },
     {
          type: "AWS Secret Access Key",
          category: "Cloud",
          severity: "Critical",
          regex: /(?:aws_secret_access_key|aws_secret_key|secret_access_key)\s*[:=]\s*['"]?([A-Za-z0-9/+=]{40})['"]?/gi,
          baseConfidence: 95,
          remediation: [
               "Deactivate the associated AWS IAM user or keypair immediately.",
               "Audit cloud infrastructure for rogue resources (EC2 instances, Lambda functions).",
               "Store AWS credentials in ~/.aws/credentials or secure environment variables."
          ]
     },
     {
          type: "GitHub Personal Access Token",
          category: "Platform",
          severity: "Critical",
          regex: /\b(ghp_[a-zA-Z0-9]{36}|ghs_[a-zA-Z0-9]{36}|gho_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59})\b/g,
          baseConfidence: 99,
          remediation: [
               "Revoke the token immediately via GitHub Settings -> Developer Settings -> Personal Access Tokens.",
               "Review GitHub Audit Logs to verify if private repositories or packages were accessed.",
               "Store automation tokens in GitHub Repository Secrets."
          ]
     },
     {
          type: "GitLab Personal Access Token",
          category: "Platform",
          severity: "Critical",
          regex: /\b(glpat-[a-zA-Z0-9_-]{20,24})\b/g,
          baseConfidence: 99,
          remediation: [
               "Revoke the token in GitLab User Settings -> Access Tokens.",
               "Audit repository clone events and CI/CD pipelines.",
               "Transition automation scripts to Project or Group Access Tokens."
          ]
     },
     {
          type: "Google API Key",
          category: "Cloud",
          severity: "High",
          regex: /\b(AIza[0-9A-Za-z-_]{35})\b/g,
          baseConfidence: 92,
          remediation: [
               "Restrict the API key by HTTP referrers or IP addresses in Google Cloud Console.",
               "Rotate the key if exposed publicly to prevent quota drain and unauthorized billing.",
               "Enable Google Cloud budget alerts."
          ]
     },
     {
          type: "Stripe Live Secret Key",
          category: "SaaS",
          severity: "Critical",
          regex: /\b(sk_live_[0-9a-zA-Z]{24,99}|rk_live_[0-9a-zA-Z]{24,99})\b/g,
          baseConfidence: 99,
          remediation: [
               "Roll the API key in the Stripe Dashboard (Developers -> API Keys).",
               "Audit recent Stripe events for unauthorized charges, customer data exports, or refunds.",
               "Never embed Stripe secret keys in client-side bundles."
          ]
     },
     {
          type: "Slack Token / Webhook",
          category: "SaaS",
          severity: "High",
          regex: /\b(xox[baprs]-[0-9a-zA-Z]{10,48}|https:\/\/hooks\.slack\.com\/services\/T[a-zA-Z0-9_]+\/B[a-zA-Z0-9_]+\/[a-zA-Z0-9_]+)\b/g,
          baseConfidence: 96,
          remediation: [
               "Revoke the token or delete the Incoming Webhook in the Slack API Console.",
               "Review Slack workspace audit logs for unexpected message exfiltration.",
               "Restrict bot scopes to the minimum necessary capabilities."
          ]
     },
     {
          type: "JSON Web Token (JWT)",
          category: "Auth",
          severity: "Medium",
          regex: /\b(ey[A-Za-z0-9-_=]{10,}\.[A-Za-z0-9-_=]{10,}\.?[A-Za-z0-9-_.+/=]*)\b/g,
          baseConfidence: 86,
          remediation: [
               "Inspect payload claims to verify whether confidential user data or elevated roles are exposed.",
               "Ensure tokens have short lifespans and rotate the signing secret.",
               "Use asymmetric keys (RS256/ES256) where practical."
          ]
     },
     {
          type: "Database Connection URI",
          category: "Database",
          severity: "Critical",
          regex: /\b((?:postgres|postgresql|mysql|mongodb|mongodb\+srv|redis|mssql):\/\/[^\s"'`]+:[^\s"'`]+@[^\s"'`]+)\b/gi,
          baseConfidence: 97,
          remediation: [
               "Change the database user password immediately on your database cluster.",
               "Verify firewall rules, VPC peering, and IP allowlists restricting public port access.",
               "Store connection URIs inside a secure secret store or backend environment."
          ]
     },
     {
          type: "Generic API Key / Secret Variable",
          category: "Generic",
          severity: "High",
          regex: /(?:api_key|apikey|secret_key|client_secret|auth_token|access_token|private_token|secret)\s*[:=]\s*['"]([a-zA-Z0-9_\-./+=]{16,})['"]/gi,
          baseConfidence: 75,
          remediation: [
               "Identify the third-party provider associated with the variable and revoke the key.",
               "Ensure configuration files (.env) are included in your .gitignore.",
               "Use secret injection during deployment."
          ]
     }
];

const MULTILINE_CRYPTO_REGEX = /-----BEGIN (?:RSA|DSA|EC|OPENSSH|PGP|ENCRYPTED)? ?PRIVATE KEY-----[\s\S]*?-----END (?:RSA|DSA|EC|OPENSSH|PGP|ENCRYPTED)? ?PRIVATE KEY-----/g;

const SAMPLE_CODE = `# ToolLok Safe Simulated Environment Sample
# (Demo data only — contains simulated non-functional test strings)
APP_NAME=ToolLok-Production
PORT=8080
NODE_ENV=production

# Database Configuration
DATABASE_URL=postgres://tool_admin:SimulatedPass_9988_Demo!@db.internal.toollok:5432/main_db
REDIS_URL=redis://default:AuthTokenDemoSecret12345@cache.internal.toollok:6379

# Cloud Credentials
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

# Third-Party APIs
STRIPE_API_KEY=sk_live_51NzWXYZDemoKey987654321012345678
GOOGLE_MAPS_KEY=AIzaSyD_ExampleMapKey9900AABBCCDDEEFFGG
GITHUB_DEPLOY_TOKEN=ghp_SimulatedTokenABC123XYZ9876543210ABCDEF

# Session & JWT
JWT_SECRET=eyJhGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRvb2xMb2siLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
`;

export default function LocalEnvSecretScanner() {
     const [inputContent, setInputContent] = useState<string>(SAMPLE_CODE);
     const [selectedFormat, setSelectedFormat] = useState<string>("env");
     const [scanMode, setScanMode] = useState<"paste" | "upload" | "gitdiff">("paste");
     const [uploadedFileName, setUploadedFileName] = useState<string>(".env.production");
     const [uploadedFileSize, setUploadedFileSize] = useState<string>("1.2 KB");

     // Scan state & progress
     const [isScanning, setIsScanning] = useState<boolean>(false);
     const [scanProgress, setScanProgress] = useState<number>(0);
     const [findings, setFindings] = useState<Finding[]>([]);
     const [hasScanned, setHasScanned] = useState<boolean>(false);

     // Filters & Search
     const [searchQuery, setSearchQuery] = useState<string>("");
     const [severityFilter, setSeverityFilter] = useState<string>("All");
     const [findingFilter, setFindingFilter] = useState<"all" | "active" | "ignored" | "diff">("all");

     // Modals & Notices
     const [showCiModal, setShowCiModal] = useState<boolean>(false);
     const [ciConfigType, setCiConfigType] = useState<"github" | "precommit" | "gitlab">("github");
     const [copyWarningNotice, setCopyWarningNotice] = useState<string | null>(null);

     const fileInputRef = useRef<HTMLInputElement>(null);
     const { isCopied, copy } = useCopyToClipboard(2000);

     // File drag and drop
     const [isDragging, setIsDragging] = useState<boolean>(false);

     // High-performance chunked scanning engine
     const executeScan = useCallback((contentToScan: string) => {
          if (!contentToScan.trim()) {
               setFindings([]);
               setHasScanned(true);
               return;
          }

          setIsScanning(true);
          setScanProgress(10);

          // Microtask chunking to prevent UI freezing on large files
          setTimeout(() => {
               const rawDetections: Finding[] = [];
               const lines = contentToScan.split("\n");

               // 1. Check Multi-line Cryptographic Blocks
               let cryptoMatch: RegExpExecArray | null;
               const cryptoRegex = new RegExp(MULTILINE_CRYPTO_REGEX.source, MULTILINE_CRYPTO_REGEX.flags);
               while ((cryptoMatch = cryptoRegex.exec(contentToScan)) !== null) {
                    const secretVal = cryptoMatch[0];
                    const beforeMatch = contentToScan.substring(0, cryptoMatch.index);
                    const lineNum = beforeMatch.split("\n").length;
                    const colNum = cryptoMatch.index - beforeMatch.lastIndexOf("\n");
                    const entropy = calculateShannonEntropy(secretVal.slice(0, 120));

                    rawDetections.push({
                         id: `crypto-${lineNum}-${colNum}`,
                         type: "Private Cryptographic Key (PEM Block)",
                         severity: "Critical",
                         confidence: 100,
                         confidenceReason: "Matched verified PEM private key block header and structure.",
                         secret: secretVal,
                         maskedSecret: maskSecretValue(secretVal),
                         variableName: "PRIVATE_KEY_PEM",
                         fileName: uploadedFileName,
                         lineNumber: lineNum,
                         columnNumber: Math.max(1, colNum),
                         entropy, // <--- ADDED MISSING PROPERTY
                         context: "-----BEGIN PRIVATE KEY----- ... [PEM BLOCK] ... -----END PRIVATE KEY-----",
                         remediation: [
                              "Revoke this private key across all servers and authorized_keys entries.",
                              "Generate a fresh Ed25519/RSA keypair with a strong passphrase.",
                              "Never commit private keys to version control."
                         ],
                         isNewInDiff: scanMode === "gitdiff" && lines[lineNum - 1]?.startsWith("+") && !lines[lineNum - 1]?.startsWith("+++"),
                         ignored: false,
                         revealed: false
                    });
               }

               // 2. Line by Line Inspection
               lines.forEach((line, idx) => {
                    const lineNumber = idx + 1;
                    const isDiffAddition = scanMode === "gitdiff" && line.startsWith("+") && !line.startsWith("+++");

                    // Skip non-added lines if strictly reviewing diff additions or scan all
                    const lineClean = scanMode === "gitdiff" && line.startsWith("+") ? line.substring(1) : line;

                    // Skip comment lines in config/code
                    const trimmed = lineClean.trim();
                    if (trimmed.startsWith("#") || trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) {
                         // If it's a comment but contains an obvious key, we still parse it.
                    }

                    // Test each signature
                    SECRET_SIGNATURES.forEach(sig => {
                         const reg = new RegExp(sig.regex.source, sig.regex.flags);
                         let match: RegExpExecArray | null;

                         while ((match = reg.exec(lineClean)) !== null) {
                              const secretVal = match[1] || match[0];
                              if (!secretVal || secretVal.length < 8) continue;

                              const entropy = calculateShannonEntropy(secretVal);
                              const isPlaceholder = isLikelyPlaceholder(secretVal) || isLikelyPlaceholder(lineClean);

                              // Variable name extraction
                              const varMatch = lineClean.substring(0, match.index).match(/([a-zA-Z0-9_.-]+)\s*[:=]/);
                              const variableName = varMatch ? varMatch[1].trim() : "inline_credential";

                              // Confidence calculation model
                              let confidence = sig.baseConfidence;
                              let reason = `Matched provider signature for ${sig.type}.`;

                              if (isPlaceholder) {
                                   confidence = Math.max(25, confidence - 45);
                                   reason = "Identified as a sample/placeholder test string.";
                              } else {
                                   if (entropy > 4.6) {
                                        confidence = Math.min(99, confidence + 3);
                                        reason += ` High entropy (${entropy} bits/char) confirms high cryptographic randomness.`;
                                   } else if (entropy < 3.2 && sig.category !== "Database") {
                                        confidence = Math.max(45, confidence - 20);
                                        reason += ` Lower entropy (${entropy} bits/char) indicates predictable or structured text.`;
                                   }

                                   if (varMatch && /key|secret|token|pass|auth|cred/i.test(variableName)) {
                                        confidence = Math.min(99, confidence + 2);
                                        reason += " Variable name confirms credential context.";
                                   }
                              }

                              // Severity downgrade if it's clearly a placeholder
                              const finalSeverity = isPlaceholder ? "Informational" : sig.severity;

                              // Short safe context preview (masked)
                              const maskedContext = lineClean.replace(secretVal, maskSecretValue(secretVal)).trim();

                              rawDetections.push({
                                   id: `finding-${lineNumber}-${match.index}-${Math.random().toString(36).substring(2, 6)}`,
                                   type: sig.type,
                                   severity: finalSeverity,
                                   confidence,
                                   confidenceReason: reason,
                                   secret: secretVal,
                                   maskedSecret: maskSecretValue(secretVal),
                                   variableName,
                                   fileName: uploadedFileName,
                                   lineNumber,
                                   columnNumber: match.index + 1,
                                   entropy, // <--- ADDED MISSING PROPERTY
                                   context: maskedContext,
                                   remediation: sig.remediation,
                                   isNewInDiff: isDiffAddition,
                                   ignored: false,
                                   revealed: false
                              });
                         }
                    });

                    // 3. Fallback High-Entropy Generic String Detection for variable assignments
                    const assignMatch = lineClean.match(/(?:export\s+)?([a-zA-Z0-9_]{3,40})\s*[:=]\s*['"]?([a-zA-Z0-9/+=_.-]{20,120})['"]?/);
                    if (assignMatch) {
                         const varName = assignMatch[1];
                         const val = assignMatch[2];
                         const entropy = calculateShannonEntropy(val);

                         // If high entropy and variable suggests secret, and not already caught
                         if (entropy >= 4.75 && /key|secret|token|auth|pass|hash|salt|api/i.test(varName) && !isLikelyPlaceholder(val)) {
                              const alreadyCaptured = rawDetections.some(d => d.secret === val && d.lineNumber === lineNumber);
                              if (!alreadyCaptured) {
                                   rawDetections.push({
                                        id: `entropy-${lineNumber}-${Math.random().toString(36).substring(2, 6)}`,
                                        type: "High-Entropy Secret Token",
                                        severity: "High",
                                        confidence: 82,
                                        confidenceReason: `Variable name '${varName}' combined with high Shannon entropy (${entropy} bits/char) indicates an unclassified API secret.`,
                                        secret: val,
                                        maskedSecret: maskSecretValue(val),
                                        variableName: varName,
                                        fileName: uploadedFileName,
                                        lineNumber,
                                        columnNumber: lineClean.indexOf(val) + 1,
                                        entropy, // <--- ADDED MISSING PROPERTY
                                        context: lineClean.replace(val, maskSecretValue(val)).trim(),
                                        remediation: [
                                             "Audit which API service this token connects to and rotate it.",
                                             "Store credentials in an encrypted secret management vault."
                                        ],
                                        isNewInDiff: isDiffAddition,
                                        ignored: false,
                                        revealed: false
                                   });
                              }
                         }
                    }
               });

               // 4. Deduplication & Consolidation: keep most specific signature per line & column
               const uniqueFindings: Finding[] = [];
               rawDetections.forEach(det => {
                    const duplicateIdx = uniqueFindings.findIndex(
                         existing => existing.lineNumber === det.lineNumber && (existing.secret.includes(det.secret) || det.secret.includes(existing.secret))
                    );

                    if (duplicateIdx === -1) {
                         uniqueFindings.push(det);
                    } else {
                         // Keep the one with higher confidence or higher severity
                         if (det.confidence > uniqueFindings[duplicateIdx].confidence) {
                              uniqueFindings[duplicateIdx] = det;
                         }
                    }
               });

               setFindings(uniqueFindings);
               setScanProgress(100);
               setIsScanning(false);
               setHasScanned(true);
          }, 150);
     }, [uploadedFileName, scanMode]);

     // Run on initial load with demo data
     useEffect(() => {
          executeScan(SAMPLE_CODE);
     }, [executeScan]);

     // Handle file uploads with format detection
     const handleFileUpload = (file: File) => {
          if (!file) return;
          setUploadedFileName(file.name);
          setUploadedFileSize(`${(file.size / 1024).toFixed(1)} KB`);

          // Detect format from extension
          const ext = file.name.split(".").pop()?.toLowerCase() || "";
          if (ext === "json") setSelectedFormat("json");
          else if (ext === "yaml" || ext === "yml") setSelectedFormat("yaml");
          else if (ext === "diff" || ext === "patch") {
               setSelectedFormat("diff");
               setScanMode("gitdiff");
          } else if (["js", "ts", "jsx", "tsx", "py", "php", "go", "java"].includes(ext)) {
               setSelectedFormat("code");
          } else {
               setSelectedFormat("env");
          }

          const reader = new FileReader();
          reader.onload = (e) => {
               const content = (e.target?.result as string) || "";
               setInputContent(content);
               executeScan(content);
          };
          reader.readAsText(file);
     };

     const onDragOver = (e: React.DragEvent) => {
          e.preventDefault();
          setIsDragging(true);
     };

     const onDragLeave = () => {
          setIsDragging(false);
     };

     const onDrop = (e: React.DragEvent) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
               handleFileUpload(e.dataTransfer.files[0]);
          }
     };

     // Toggle reveal state
     const toggleReveal = (id: string) => {
          setFindings(prev => prev.map(f => f.id === id ? { ...f, revealed: !f.revealed } : f));
     };

     // Toggle ignore state
     const toggleIgnore = (id: string) => {
          setFindings(prev => prev.map(f => f.id === id ? { ...f, ignored: !f.ignored } : f));
     };

     // Metrics & Deterministic Risk Score
     const stats = useMemo(() => {
          const active = findings.filter(f => !f.ignored);
          const critical = active.filter(f => f.severity === "Critical").length;
          const high = active.filter(f => f.severity === "High").length;
          const medium = active.filter(f => f.severity === "Medium").length;
          const low = active.filter(f => f.severity === "Low").length;
          const info = active.filter(f => f.severity === "Informational").length;
          const newInDiffCount = active.filter(f => f.isNewInDiff).length;

          // Deterministic formula
          const penalty = (critical * 32) + (high * 18) + (medium * 8) + (low * 2);
          const riskScore = Math.max(0, 100 - penalty);

          let riskLevel = "Clean / Low Risk";
          let riskColor = "text-emerald-500 dark:text-emerald-400";
          let riskBg = "bg-emerald-500/10 border-emerald-500/20";

          if (riskScore < 40) {
               riskLevel = "Critical Risk — Compromised";
               riskColor = "text-rose-600 dark:text-rose-400";
               riskBg = "bg-rose-500/10 border-rose-500/20";
          } else if (riskScore < 70) {
               riskLevel = "High Risk — Leaks Found";
               riskColor = "text-orange-500 dark:text-orange-400";
               riskBg = "bg-orange-500/10 border-orange-500/20";
          } else if (riskScore < 90) {
               riskLevel = "Moderate Risk — Review Needed";
               riskColor = "text-amber-500 dark:text-amber-400";
               riskBg = "bg-amber-500/10 border-amber-500/20";
          }

          return { total: active.length, critical, high, medium, low, info, newInDiffCount, riskScore, riskLevel, riskColor, riskBg };
     }, [findings]);

     // Filtered findings pipeline
     const filteredFindings = useMemo(() => {
          return findings.filter(f => {
               // Primary category filter
               if (findingFilter === "active" && f.ignored) return false;
               if (findingFilter === "ignored" && !f.ignored) return false;
               if (findingFilter === "diff" && (!f.isNewInDiff || f.ignored)) return false;

               // Severity filter
               if (severityFilter !== "All" && f.severity !== severityFilter) return false;

               // Search query
               if (searchQuery.trim() !== "") {
                    const q = searchQuery.toLowerCase();
                    return (
                         f.type.toLowerCase().includes(q) ||
                         f.variableName.toLowerCase().includes(q) ||
                         f.fileName.toLowerCase().includes(q) ||
                         f.context.toLowerCase().includes(q) ||
                         f.remediation.some(r => r.toLowerCase().includes(q))
                    );
               }
               return true;
          });
     }, [findings, findingFilter, severityFilter, searchQuery]);

     // Safe Sanitized Report Exporter (Never exposes raw credentials)
     const exportSanitizedReport = (format: "json" | "csv" | "md" | "txt") => {
          const activeFindings = findings.filter(f => !f.ignored);
          let output = "";

          if (format === "json") {
               output = JSON.stringify({
                    scanReport: "ToolLok Local .env & Secret Token Scanner",
                    auditTimestamp: new Date().toISOString(),
                    fileAudited: uploadedFileName,
                    fileFormat: selectedFormat,
                    securityRiskScore: `${stats.riskScore}/100`,
                    riskLevel: stats.riskLevel,
                    totalActiveFindings: activeFindings.length,
                    summaryBySeverity: {
                         critical: stats.critical,
                         high: stats.high,
                         medium: stats.medium,
                         low: stats.low,
                         informational: stats.info
                    },
                    findings: activeFindings.map(f => ({
                         type: f.type,
                         severity: f.severity,
                         confidence: `${f.confidence}%`,
                         confidenceReason: f.confidenceReason,
                         variableName: f.variableName,
                         maskedSecret: f.maskedSecret,
                         location: `${f.fileName}:${f.lineNumber}:${f.columnNumber}`,
                         entropy: `${f.entropy} bits/char`,
                         newInGitDiff: f.isNewInDiff,
                         remediation: f.remediation
                    }))
               }, null, 2);
          } else if (format === "csv") {
               output = "Type,Severity,Confidence,Variable,MaskedSecret,Location,Entropy,NewInDiff\n";
               activeFindings.forEach(f => {
                    const safeVar = `"${f.variableName.replace(/"/g, '""')}"`;
                    const safeMask = `"${f.maskedSecret.replace(/"/g, '""')}"`;
                    const safeLoc = `"${f.fileName}:${f.lineNumber}:${f.columnNumber}"`;
                    output += `"${f.type}","${f.severity}","${f.confidence}%",${safeVar},${safeMask},${safeLoc},"${f.entropy} bits/char",${f.isNewInDiff}\n`;
               });
          } else if (format === "md") {
               output = `# ToolLok Security Audit Report\n\n- **Target File:** \`${uploadedFileName}\`\n- **Audit Date:** ${new Date().toUTCString()}\n- **Security Risk Score:** **${stats.riskScore}/100** (${stats.riskLevel})\n- **Active Findings:** ${activeFindings.length}\n\n---\n\n## Findings Summary\n\n`;
               activeFindings.forEach((f, idx) => {
                    output += `### ${idx + 1}. ${f.type} [${f.severity.toUpperCase()}]\n- **Variable:** \`${f.variableName}\`\n- **Masked Value:** \`${f.maskedSecret}\`\n- **Location:** Line ${f.lineNumber}, Column ${f.columnNumber}\n- **Confidence:** ${f.confidence}% (${f.confidenceReason})\n- **Entropy:** ${f.entropy} bits/char\n\n**Remediation Steps:**\n${f.remediation.map(r => `1. ${r}`).join("\n")}\n\n`;
               });
          } else {
               output = `TOOLLOK SECRET AUDIT REPORT (CONFIDENTIAL)\nGenerated: ${new Date().toUTCString()}\nFile: ${uploadedFileName}\nRisk Score: ${stats.riskScore}/100 [${stats.riskLevel}]\nTotal Findings: ${activeFindings.length}\n\n` +
                    activeFindings.map((f, i) => `[${i + 1}] ${f.type} | ${f.severity} | Line ${f.lineNumber} | ${f.variableName}=${f.maskedSecret}`).join("\n");
          }

          const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `toollok-secret-scan-${uploadedFileName.replace(/[^a-zA-Z0-9_-]/g, "_")}.${format === "md" ? "md" : format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
     };

     // Safe Raw Secret Copy with UI Toast Warning
     const handleCopySecret = (secret: string, isRaw: boolean) => {
          copy(secret);
          if (isRaw) {
               setCopyWarningNotice("Warning: Unmasked credential copied to your local clipboard buffer.");
               setTimeout(() => setCopyWarningNotice(null), 4000);
          }
     };

     // CI Helper Template Generator
     const ciConfigOutput = useMemo(() => {
          if (ciConfigType === "github") {
               return `# .github/workflows/secret-scanning.yml
name: ToolLok Automated Secret Scan
on:
  push:
    branches: [main, master, develop]
  pull_request:
    branches: [main, master]

jobs:
  secret-scan:
    name: Scan Repositories for Leaked Secrets
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Run Gitleaks Open Source Scanner
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          GITLEAKS_ENABLE_SUMMARY: true`;
          } else if (ciConfigType === "precommit") {
               return `# .pre-commit-config.yaml
# Install via: pip install pre-commit && pre-commit install
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.4
    hooks:
      - id: gitleaks
        name: Detect hardcoded secrets before commit
        entry: gitleaks protect --verbose --redact --staged`;
          } else {
               return `# .gitlab-ci.yml
stages:
  - test

secret_detection:
  stage: test
  image:
    name: zricethezav/gitleaks:latest
    entrypoint: [""]
  script:
    - gitleaks detect --verbose --redact --source .
  allow_failure: false`;
          }
     }, [ciConfigType]);

     // Keyboard shortcut Ctrl/Cmd + S to trigger scan
     useKeyboardShortcuts([
          {
               key: "s",
               ctrlOrCmd: true,
               action: () => {
                    executeScan(inputContent);
               }
          }
     ]);

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 px-2 sm:px-4 py-4 overflow-x-hidden">

               {/* HEADER SECTION */}
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3.5">
                         <div className="w-12 h-12 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 shrink-0 shadow-sm">
                              <Key size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                   <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                        Local .env & Secret Token Scanner
                                   </h1>
                                   <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
                                        <ShieldCheck size={13} className="text-emerald-500" /> 100% Local & Private
                                   </span>
                              </div>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                                   Client-side static analysis tool to detect AWS keys, OAuth tokens, private keys, database credentials, and high-entropy secrets without remote uploads.
                              </p>
                         </div>
                    </div>

                    <div className="flex items-center gap-2">
                         <button
                              onClick={() => setShowCiModal(true)}
                              className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-rose-500/50 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
                         >
                              <Terminal size={15} className="text-rose-500" /> CI / Hook Config
                         </button>
                    </div>
               </div>

               <AdSlot adSlot="top-secret-scanner-ad" format="horizontal" minHeight="90px" className="hidden md:flex" />

               {/* PRIVACY & ZERO KNOWLEDGE BANNER */}
               <div className="bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 rounded-2xl p-4 flex items-start sm:items-center justify-between gap-3 text-xs text-rose-900 dark:text-rose-200 shadow-sm">
                    <div className="flex items-start sm:items-center gap-2.5">
                         <Lock size={16} className="shrink-0 text-rose-600 dark:text-rose-400 mt-0.5 sm:mt-0" />
                         <span>
                              <strong>Zero-Knowledge Guarantee:</strong> All regex matching, entropy calculations, and git diff parsers execute entirely in your browser memory. No code or credentials are ever transmitted over the network or saved to persistent storage.
                         </span>
                    </div>
                    <div className="hidden lg:flex items-center gap-2 font-mono text-[11px] text-rose-700 dark:text-rose-400 bg-white/80 dark:bg-gray-900/80 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800 shrink-0">
                         <span>Shortcuts: <kbd className="font-bold">Ctrl+S</kbd> to scan</span>
                    </div>
               </div>

               {/* CLIPBOARD SECURITY NOTICE TOAST */}
               {copyWarningNotice && (
                    <div className="bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 rounded-xl px-4 py-2 text-xs flex items-center gap-2 transition-all animate-pulse">
                         <AlertTriangle size={15} />
                         <span>{copyWarningNotice}</span>
                    </div>
               )}

               {/* WORKSPACE: INPUT & DASHBOARD */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* LEFT COLUMN: SOURCE INPUT & UPLOAD */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl flex flex-col gap-5 transition-colors">

                              {/* Input Format Selector & Header */}
                              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                                   <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                        <FileCode size={15} className="text-rose-500" /> Target Configuration
                                   </span>

                                   <div className="flex items-center gap-2">
                                        <select
                                             value={selectedFormat}
                                             onChange={(e) => setSelectedFormat(e.target.value)}
                                             className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 outline-none cursor-pointer"
                                        >
                                             <option value="env">.env / Config</option>
                                             <option value="json">JSON</option>
                                             <option value="yaml">YAML / Workflows</option>
                                             <option value="code">JavaScript / Python</option>
                                             <option value="diff">Git Diff / Patch</option>
                                             <option value="txt">Plain Text / Logs</option>
                                        </select>
                                   </div>
                              </div>

                              {/* Mode Switch Tabs */}
                              <div className="flex rounded-xl bg-gray-100 dark:bg-gray-950 p-1 border border-gray-200 dark:border-gray-800">
                                   <button
                                        onClick={() => setScanMode("paste")}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${scanMode === "paste" ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}
                                   >
                                        Editor / Paste
                                   </button>
                                   <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${scanMode === "upload" ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}
                                   >
                                        Upload File
                                   </button>
                                   <button
                                        onClick={() => { setScanMode("gitdiff"); setSelectedFormat("diff"); }}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${scanMode === "gitdiff" ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}
                                   >
                                        Git Diff Mode
                                   </button>
                                   <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                        className="hidden"
                                        accept=".env,.env.*,.json,.yaml,.yml,.toml,.txt,.js,.ts,.py,.php,.go,.java,.sh,.diff,.patch,Dockerfile"
                                   />
                              </div>

                              {/* Drag & Drop or Text Area */}
                              <div
                                   onDragOver={onDragOver}
                                   onDragLeave={onDragLeave}
                                   onDrop={onDrop}
                                   className={`relative rounded-2xl transition-all ${isDragging ? "ring-2 ring-rose-500 ring-offset-2 dark:ring-offset-gray-900" : ""}`}
                              >
                                   <textarea
                                        value={inputContent}
                                        onChange={(e) => setInputContent(e.target.value)}
                                        placeholder={
                                             scanMode === "gitdiff"
                                                  ? "Paste git diff output here (+ lines will be flagged as newly introduced)..."
                                                  : "Paste your .env configuration, source code, private keys, or API tokens to inspect..."
                                        }
                                        className="w-full h-80 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 font-mono text-xs text-gray-900 dark:text-gray-200 outline-none focus:border-rose-500 transition-colors resize-y leading-relaxed"
                                        spellCheck={false}
                                   />

                                   {isDragging && (
                                        <div className="absolute inset-0 bg-rose-500/10 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center text-rose-600 dark:text-rose-400 font-bold text-xs gap-2 border-2 border-dashed border-rose-500">
                                             <Upload size={28} className="animate-bounce" />
                                             <span>Drop configuration or source file to scan</span>
                                        </div>
                                   )}
                              </div>

                              {/* File Info / Status Details */}
                              <div className="flex items-center justify-between text-[11px] font-mono text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-950 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <span className="truncate max-w-[200px]">Target: <strong className="text-gray-700 dark:text-gray-200">{uploadedFileName}</strong></span>
                                   <span>{inputContent.split("\n").length} lines • {uploadedFileSize}</span>
                              </div>

                              {/* Action Bar */}
                              <div className="flex items-center gap-3">
                                   <button
                                        onClick={() => executeScan(inputContent)}
                                        disabled={isScanning || !inputContent.trim()}
                                        className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-rose-600/20 text-xs cursor-pointer"
                                   >
                                        {isScanning ? <RefreshCw size={15} className="animate-spin" /> : <ShieldAlert size={15} />}
                                        {isScanning ? `Scanning (${scanProgress}%)...` : "Run Security Scan (Ctrl+S)"}
                                   </button>

                                   <button
                                        onClick={() => {
                                             setInputContent(SAMPLE_CODE);
                                             setUploadedFileName("demo_sample.env");
                                             setUploadedFileSize("1.2 KB");
                                             executeScan(SAMPLE_CODE);
                                        }}
                                        className="px-3.5 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl text-xs transition-colors shrink-0"
                                        title="Load Safe Demo Sample"
                                   >
                                        Sample
                                   </button>

                                   <button
                                        onClick={() => {
                                             setInputContent("");
                                             setFindings([]);
                                             setHasScanned(false);
                                        }}
                                        className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-rose-500 font-bold rounded-xl transition-colors shrink-0"
                                        title="Clear content"
                                   >
                                        <Trash2 size={16} />
                                   </button>
                              </div>

                         </div>
                    </div>

                    {/* RIGHT COLUMN: SECURITY DASHBOARD & FINDINGS */}
                    <div className="lg:col-span-7 flex flex-col gap-6">

                         {/* AUDIT SUMMARY DASHBOARD */}
                         <div className="bg-[#0c121e] border border-gray-800 rounded-3xl p-6 shadow-xl text-white">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-gray-800 pb-3">
                                   <div className="flex items-center gap-2.5">
                                        <ShieldAlert size={20} className="text-rose-400" />
                                        <div>
                                             <h2 className="font-bold text-base leading-tight">Security Audit Posture</h2>
                                             <span className="text-xs text-gray-400">Heuristic credential and entropy risk assessment</span>
                                        </div>
                                   </div>

                                   <div className={`px-3 py-1 rounded-xl text-xs font-bold border ${stats.riskBg} ${stats.riskColor}`}>
                                        {stats.riskLevel}
                                   </div>
                              </div>

                              {/* Stat Cards Grid */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
                                   <div className="bg-gray-950 border border-gray-800/80 rounded-2xl p-4 text-center">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Risk Score</span>
                                        <span className={`text-3xl font-black font-mono ${stats.riskColor}`}>
                                             {stats.riskScore}<span className="text-xs font-normal text-gray-500">/100</span>
                                        </span>
                                   </div>

                                   <div className="bg-gray-950 border border-gray-800/80 rounded-2xl p-4 text-center">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Critical / High</span>
                                        <span className="text-3xl font-black font-mono text-rose-400">
                                             {stats.critical + stats.high}
                                        </span>
                                   </div>

                                   <div className="bg-gray-950 border border-gray-800/80 rounded-2xl p-4 text-center">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Med / Low</span>
                                        <span className="text-3xl font-black font-mono text-amber-400">
                                             {stats.medium + stats.low}
                                        </span>
                                   </div>

                                   <div className="bg-gray-950 border border-gray-800/80 rounded-2xl p-4 text-center">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Active Leaks</span>
                                        <span className="text-3xl font-black font-mono text-cyan-400">
                                             {stats.total}
                                        </span>
                                   </div>
                              </div>

                              {/* Export Toolbar */}
                              {hasScanned && (
                                   <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-800/80 text-xs">
                                        <span className="text-gray-400 font-bold flex items-center gap-1.5">
                                             <ArrowDownToLine size={14} className="text-rose-400" /> Export Sanitized Report:
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                             <button onClick={() => exportSanitizedReport("json")} className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-xl font-bold text-gray-300 hover:text-white transition-colors">JSON</button>
                                             <button onClick={() => exportSanitizedReport("csv")} className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-xl font-bold text-gray-300 hover:text-white transition-colors">CSV</button>
                                             <button onClick={() => exportSanitizedReport("md")} className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-xl font-bold text-gray-300 hover:text-white transition-colors">Markdown</button>
                                             <button onClick={() => exportSanitizedReport("txt")} className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-xl font-bold text-gray-300 hover:text-white transition-colors">Text</button>
                                        </div>
                                   </div>
                              )}
                         </div>

                         {/* FINDINGS WORKSPACE & FILTER BAR */}
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl flex flex-col gap-5 transition-colors">

                              {/* Filter Tabs & Search */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">

                                   {/* Category Pills */}
                                   <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-950 p-1 rounded-xl border border-gray-200 dark:border-gray-800 text-xs overflow-x-auto">
                                        <button
                                             onClick={() => setFindingFilter("all")}
                                             className={`px-3 py-1 rounded-lg font-bold transition-all ${findingFilter === "all" ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm" : "text-gray-500"}`}
                                        >
                                             All ({findings.length})
                                        </button>
                                        <button
                                             onClick={() => setFindingFilter("active")}
                                             className={`px-3 py-1 rounded-lg font-bold transition-all ${findingFilter === "active" ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm" : "text-gray-500"}`}
                                        >
                                             Active ({stats.total})
                                        </button>
                                        {stats.newInDiffCount > 0 && (
                                             <button
                                                  onClick={() => setFindingFilter("diff")}
                                                  className={`px-3 py-1 rounded-lg font-bold text-rose-600 dark:text-rose-400 transition-all ${findingFilter === "diff" ? "bg-white dark:bg-gray-800 shadow-sm" : "text-gray-500"}`}
                                             >
                                                  Diff ({stats.newInDiffCount})
                                             </button>
                                        )}
                                        <button
                                             onClick={() => setFindingFilter("ignored")}
                                             className={`px-3 py-1 rounded-lg font-bold transition-all ${findingFilter === "ignored" ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm" : "text-gray-500"}`}
                                        >
                                             Ignored ({findings.filter(f => f.ignored).length})
                                        </button>
                                   </div>

                                   {/* Search & Severity Dropdown */}
                                   <div className="flex items-center gap-2">
                                        <div className="relative flex-1 sm:flex-initial">
                                             <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                                             <input
                                                  type="text"
                                                  value={searchQuery}
                                                  onChange={(e) => setSearchQuery(e.target.value)}
                                                  placeholder="Search findings..."
                                                  className="w-full sm:w-44 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-900 dark:text-white outline-none focus:border-rose-500"
                                             />
                                        </div>

                                        <select
                                             value={severityFilter}
                                             onChange={(e) => setSeverityFilter(e.target.value)}
                                             className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 outline-none cursor-pointer"
                                        >
                                             <option value="All">All Severity</option>
                                             <option value="Critical">Critical</option>
                                             <option value="High">High</option>
                                             <option value="Medium">Medium</option>
                                             <option value="Low">Low</option>
                                             <option value="Informational">Informational</option>
                                        </select>
                                   </div>
                              </div>

                              {/* Findings List */}
                              {!hasScanned ? (
                                   <div className="py-20 text-center text-gray-400 dark:text-gray-500 text-xs flex flex-col items-center gap-2">
                                        <Key size={36} className="text-gray-300 dark:text-gray-700" />
                                        <span>Paste configuration content or upload a file and click "Run Security Scan".</span>
                                   </div>
                              ) : filteredFindings.length === 0 ? (
                                   <div className="py-16 text-center text-emerald-600 dark:text-emerald-400 text-xs flex flex-col items-center gap-2.5">
                                        <CheckCircle2 size={36} />
                                        <span className="font-bold text-sm">No likely secrets or vulnerabilities detected matching your current filters.</span>
                                        <span className="text-gray-500 text-[11px] max-w-sm">Detection is heuristic; always practice defense-in-depth and avoid checking secrets into Git.</span>
                                   </div>
                              ) : (
                                   <div className="space-y-4 max-h-[620px] overflow-y-auto pr-1">
                                        {filteredFindings.map((finding) => (
                                             <div
                                                  key={finding.id}
                                                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${finding.ignored
                                                       ? 'opacity-50 bg-gray-50 dark:bg-gray-950/40 border-gray-200 dark:border-gray-800'
                                                       : 'bg-gray-50/80 dark:bg-gray-950 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                                                       }`}
                                             >
                                                  {/* Card Header */}
                                                  <div className="flex items-start justify-between gap-3 mb-2.5">
                                                       <div className="flex items-center gap-2 flex-wrap">
                                                            {/* Severity Badge */}
                                                            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${finding.severity === 'Critical' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30' :
                                                                 finding.severity === 'High' ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30' :
                                                                      finding.severity === 'Medium' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' :
                                                                           finding.severity === 'Low' ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' :
                                                                                'bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/30'
                                                                 }`}>
                                                                 {finding.severity}
                                                            </span>

                                                            {finding.isNewInDiff && (
                                                                 <span className="bg-rose-600 text-white font-black text-[9px] px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                                                                      NEW IN DIFF
                                                                 </span>
                                                            )}

                                                            <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{finding.type}</h3>
                                                            <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500">
                                                                 {finding.fileName}:{finding.lineNumber}:{finding.columnNumber}
                                                            </span>
                                                       </div>

                                                       <div className="flex items-center gap-1.5 shrink-0">
                                                            <button
                                                                 onClick={() => toggleIgnore(finding.id)}
                                                                 className="text-[11px] px-2.5 py-1 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold transition-colors cursor-pointer"
                                                            >
                                                                 {finding.ignored ? "Restore" : "Mark Safe / Ignore"}
                                                            </button>
                                                       </div>
                                                  </div>

                                                  {/* Masked Secret Value Box */}
                                                  <div className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2.5 my-2 font-mono text-xs shadow-xs">
                                                       <div className="flex items-center gap-2 overflow-hidden mr-2">
                                                            <span className="text-gray-400 font-bold shrink-0">{finding.variableName}=</span>
                                                            <span className="text-rose-600 dark:text-rose-400 font-bold truncate">
                                                                 {finding.revealed ? finding.secret : finding.maskedSecret}
                                                            </span>
                                                       </div>

                                                       <div className="flex items-center gap-1.5 shrink-0">
                                                            <button
                                                                 onClick={() => toggleReveal(finding.id)}
                                                                 className="text-gray-500 hover:text-gray-900 dark:hover:text-white p-1 rounded transition-colors"
                                                                 title={finding.revealed ? "Mask Secret" : "Reveal Secret Temporarily"}
                                                            >
                                                                 {finding.revealed ? <EyeOff size={15} /> : <Eye size={15} />}
                                                            </button>

                                                            <button
                                                                 onClick={() => handleCopySecret(finding.secret, true)}
                                                                 className="text-gray-500 hover:text-gray-900 dark:hover:text-white p-1 rounded transition-colors"
                                                                 title="Copy Raw Secret (Warning: exposes to clipboard)"
                                                            >
                                                                 <Copy size={15} />
                                                            </button>
                                                       </div>
                                                  </div>

                                                  {/* Metadata & Signals */}
                                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-500 dark:text-gray-400 mt-2 bg-gray-100/50 dark:bg-gray-900/50 p-2.5 rounded-xl border border-gray-200/50 dark:border-gray-800/50">
                                                       <div>
                                                            Confidence: <strong className="text-gray-700 dark:text-gray-200">{finding.confidence}%</strong>
                                                            <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{finding.confidenceReason}</p>
                                                       </div>
                                                       <div className="sm:text-right">
                                                            Entropy: <strong className="font-mono text-gray-700 dark:text-gray-200">{finding.entropy} bits/char</strong>
                                                            <p className="text-[10px] text-gray-400 leading-tight mt-0.5">Shannon randomness indicator</p>
                                                       </div>
                                                  </div>

                                                  {/* Remediation Guide */}
                                                  {!finding.ignored && finding.remediation && finding.remediation.length > 0 && (
                                                       <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800 text-[11px] text-gray-600 dark:text-gray-400">
                                                            <strong className="text-rose-600 dark:text-rose-400 block mb-1">Recommended Remediation:</strong>
                                                            <ol className="list-decimal pl-4 space-y-0.5">
                                                                 {finding.remediation.map((step, idx) => (
                                                                      <li key={idx}>{step}</li>
                                                                 ))}
                                                            </ol>
                                                       </div>
                                                  )}
                                             </div>
                                        ))}
                                   </div>
                              )}

                         </div>

                    </div>
               </div>

               {/* CI SCANNING CONFIGURATION MODAL */}
               {showCiModal && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
                              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                                   <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                                        <Terminal size={18} className="text-rose-500" /> Automated Secret Scanning CI Helper
                                   </h3>
                                   <button onClick={() => setShowCiModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1">
                                        <X size={18} />
                                   </button>
                              </div>

                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                   Integrate verified open-source secret scanners (Gitleaks, TruffleHog) into your continuous integration pipeline to block leaked credentials before code reaches production.
                              </p>

                              <div className="flex rounded-xl bg-gray-100 dark:bg-gray-950 p-1 border border-gray-200 dark:border-gray-800">
                                   <button
                                        onClick={() => setCiConfigType("github")}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${ciConfigType === "github" ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm" : "text-gray-500"}`}
                                   >
                                        GitHub Actions
                                   </button>
                                   <button
                                        onClick={() => setCiConfigType("precommit")}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${ciConfigType === "precommit" ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm" : "text-gray-500"}`}
                                   >
                                        Pre-commit Hook
                                   </button>
                                   <button
                                        onClick={() => setCiConfigType("gitlab")}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${ciConfigType === "gitlab" ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm" : "text-gray-500"}`}
                                   >
                                        GitLab CI
                                   </button>
                              </div>

                              <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4 font-mono text-xs text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed">
                                   {ciConfigOutput}
                              </div>

                              <div className="flex items-center justify-end gap-3 pt-2">
                                   <button
                                        onClick={() => copy(ciConfigOutput)}
                                        className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md cursor-pointer"
                                   >
                                        {isCopied ? <Check size={14} /> : <Copy size={14} />} {isCopied ? "Copied Configuration!" : "Copy Configuration"}
                                   </button>
                                   <button
                                        onClick={() => setShowCiModal(false)}
                                        className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl text-xs transition-colors"
                                   >
                                        Close
                                   </button>
                              </div>
                         </div>
                    </div>
               )}


               {/* SEO CONTENT & EDUCATIONAL GUIDE */}
               <div className="bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-sm dark:shadow-none mt-4">
                    <div className="prose dark:prose-invert max-w-none">
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                              Professional In-Browser Secret Detection & Hardening Utility
                         </h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              Hardcoded credentials, leaked environment files, and committed cloud keys remain one of the most widespread initial access vectors for security breaches. ToolLok's <strong>Local .env & Secret Token Scanner</strong> enables developers, security researchers, and DevOps engineers to perform fast static secret detection directly within browser memory. Explore our complementary <Link href="/categories/cybersecurity-tools" className="text-rose-600 dark:text-rose-400 hover:underline">Cybersecurity Tools</Link> and <Link href="/categories/developer-tools" className="text-blue-600 dark:text-blue-400 hover:underline">Developer Tools</Link> to secure your software delivery pipelines.
                         </p>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Detection Capabilities</h3>
                         <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-8">
                              <li><strong>Multi-Cloud & SaaS Coverage:</strong> Scans for AWS IAM keys, Stripe secret tokens, Slack webhooks, Google API keys, GitHub PATs, and GitLab tokens.</li>
                              <li><strong>Shannon Entropy Calculations:</strong> Evaluates mathematical randomness (bits per character) to flag undocumented or custom API keys that bypass static regex signatures.</li>
                              <li><strong>Git Diff Addition Tracking:</strong> Pinpoints credentials introduced in new commit lines (prefixed with <code>+</code>) to speed up code reviews.</li>
                              <li><strong>Zero Server Transmission:</strong> Built using client-side execution to ensure proprietary source code and tokens never touch an external server.</li>
                         </ul>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                         <div className="space-y-4">
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Is my code or .env file uploaded to any server?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">No. All pattern matching, entropy analysis, and report generation take place strictly within your local browser memory. No network requests are made with your file content.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">How does the scanner differentiate real secrets from placeholders?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">The engine cross-references detected strings against common placeholder dictionaries (e.g. <code>example</code>, <code>your-token</code>, <code>changeme</code>) and evaluates Shannon entropy to lower the confidence and severity of non-sensitive test strings.</p>
                              </div>
                         </div>
                    </div>

                    <script
                         type="application/ld+json"
                         dangerouslySetInnerHTML={{
                              __html: JSON.stringify({
                                   "@context": "https://schema.org",
                                   "@type": "FAQPage",
                                   "mainEntity": [
                                        {
                                             "@type": "Question",
                                             "name": "Is my code or .env file uploaded to any server?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "No. All pattern matching, entropy analysis, and report generation take place strictly within your local browser memory." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "How does the scanner differentiate real secrets from placeholders?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "The engine cross-references detected strings against common placeholder dictionaries and calculates Shannon entropy to suppress false alarms." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>

               <AdSlot adSlot="bottom-secret-scanner-ad" format="fluid" className="mt-4" />
          </div>
     );
}