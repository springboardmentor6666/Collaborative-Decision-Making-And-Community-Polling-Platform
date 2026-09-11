import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  CheckCircle2, 
  Vote, 
  Users, 
  BarChart3, 
  Sparkles, 
  ShieldCheck, 
  MessageSquare, 
  Layers, 
  Zap, 
  Cpu, 
  TrendingUp, 
  Lock, 
  GitBranch, 
  ChevronRight, 
  ChevronDown, 
  Star, 
  Check, 
  X, 
  Menu as MenuIcon, 
  X as CloseIcon, 
  Activity,
  Flame,
  Award,
  Globe,
  Sliders,
  FileText
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function LandingPage() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Interactive Hero Demo State
  const [activeOption, setActiveOption] = useState<"A" | "B" | "C">("A");
  const [votes, setVotes] = useState({ A: 942, B: 388, C: 210 });
  const [userVoted, setUserVoted] = useState(false);

  // Interactive Decision Board Template Selector
  const [selectedCategory, setSelectedCategory] = useState<"engineering" | "product" | "governance" | "budget">("engineering");

  // Interactive FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const totalVotes = votes.A + votes.B + votes.C;
  const pctA = Math.round((votes.A / totalVotes) * 100);
  const pctB = Math.round((votes.B / totalVotes) * 100);
  const pctC = Math.round((votes.C / totalVotes) * 100);

  const handleVote = (opt: "A" | "B" | "C") => {
    if (userVoted && activeOption === opt) return;
    
    setVotes(prev => {
      const next = { ...prev };
      if (userVoted) {
        next[activeOption] = Math.max(0, next[activeOption] - 1);
      }
      next[opt] = next[opt] + 1;
      return next;
    });
    setActiveOption(opt);
    setUserVoted(true);
  };

  const decisionTemplates = {
    engineering: {
      title: "RFC-104: Database Migration to Distributed PostgreSQL",
      community: "Core Architecture Guild",
      badge: "Critical RFC",
      urgency: "Closes in 2 days",
      consensus: "88% Alignment Reached",
      author: "Alex Morgan (Principal Architect)",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80",
      summary: "Transition monolithic MySQL clusters to distributed PostgreSQL with TimescaleDB extensions for high-throughput time-series analytics.",
      options: [
        { name: "Distributed CockroachDB", score: "94% Consensus", votes: 48, status: "Recommended" },
        { name: "Managed AWS Aurora PostgreSQL", score: "62% Feasible", votes: 22, status: "Alternative" },
        { name: "Vertical MySQL Scaling", score: "18% Rejected", votes: 4, status: "Legacy" }
      ],
      pros: ["Zero downtime failover", "Standard SQL compliance", "Horizontal partition scaling"],
      cons: ["Higher infrastructure memory overhead", "Learning curve for dev team"]
    },
    product: {
      title: "PRD-2026: Prioritizing AI Consensus Assistant vs Mobile Native Apps",
      community: "Product & Growth Council",
      badge: "Q4 Roadmap",
      urgency: "Voting Active",
      consensus: "76% Consensus",
      author: "Elena Rostova (VP Product)",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&h=120&q=80",
      summary: "Evaluate resource allocation between native iOS/Android mobile clients or integrated AI synthesis for automated stakeholder briefs.",
      options: [
        { name: "AI Consensus Synthesizer & NLP Briefs", score: "76% Support", votes: 112, status: "Leading" },
        { name: "Cross-Platform React Native App", score: "42% Support", votes: 45, status: "Planned Next" },
        { name: "Browser Extension Only", score: "12% Support", votes: 11, status: "Deprioritized" }
      ],
      pros: ["Reduces meeting overhead by 60%", "Instant executive summaries", "High market differentiation"],
      cons: ["Requires LLM inference budget allocation"]
    },
    governance: {
      title: "PROP-42: Community Treasury Grant for Open Source Tooling",
      community: "Decentralized Ecosystem DAO",
      badge: "Quadratic Vote",
      urgency: "36 hrs remaining",
      consensus: "92% Supermajority",
      author: "Marcus Chen (Governance Steward)",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80",
      summary: "Distribute 250,000 USD from community pool across 5 open-source developer tooling grants using weighted quadratic voting.",
      options: [
        { name: "Approve Full Allocation ($250k)", score: "92% Weighted", votes: 1840, status: "Passing" },
        { name: "Phased Tranche Milestone ($100k initial)", score: "54% Weighted", votes: 420, status: "Backup" },
        { name: "Reject & Request Re-submission", score: "8% Weighted", votes: 65, status: "Rejected" }
      ],
      pros: ["Transparent milestone escrow", "Stimulates builder ecosystem", "Audited treasury contracts"],
      cons: ["Requires monthly reporting oversight"]
    },
    budget: {
      title: "BUDGET-2026: Infrastructure & Cloud Spend Optimization",
      community: "Engineering Operations",
      badge: "Finance & Ops",
      urgency: "Closes this week",
      consensus: "84% Approved",
      author: "Samantha Bell (Head of DevOps)",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80",
      summary: "Commit to 3-year compute savings plan with Kubernetes multi-zone consolidation to cut monthly cloud cost by 32%.",
      options: [
        { name: "3-Yr Compute Savings Plan + Spot Fleets", score: "84% Backing", votes: 38, status: "Selected" },
        { name: "Multi-Cloud Arbitrage Strategy", score: "30% Backing", votes: 9, status: "High Risk" },
        { name: "Maintain On-Demand Baseline", score: "5% Backing", votes: 2, status: "Costly" }
      ],
      pros: ["Immediate $18k/month recurring savings", "Guaranteed SLA uptime", "Zero dev friction"],
      cons: ["36-month minimum commitment contract"]
    }
  };

  const faqs = [
    {
      q: "How does DecisionHub prevent vote tampering and brigading?",
      a: "DecisionHub employs cryptographically verifiable audit logs, multi-factor voter verification, role-based governance tiers, and options for token/reputation-weighted or quadratic voting to ensure every ballot is genuine and immune to manipulation."
    },
    {
      q: "Can private teams use DecisionHub for confidential internal decisions?",
      a: "Yes. Communities can be configured as strictly private, invite-only, or SSO-enforced with end-to-end access control. Your internal discussions, proprietary options, and votes remain strictly isolated to your verified organization."
    },
    {
      q: "What voting methodologies are supported on the platform?",
      a: "DecisionHub supports Single Choice, Multiple Choice, Ranked Choice (Instant Runoff Voting / IRV), Approval Voting, Quadratic Voting, and Custom Weighted Governance. You can choose the ideal voting rule per decision board."
    },
    {
      q: "How does the AI Consensus Synthesizer assist team deliberation?",
      a: "Our AI engine analyzes discussion threads in real-time, extracts key pros and cons across all proposed options, detects bias or overlooked edge cases, and produces structured Architecture Decision Records (ADRs) ready for executive export."
    },
    {
      q: "Is there a free tier for communities and small teams?",
      a: "DecisionHub offers a comprehensive Free Forever tier that includes unlimited public communities, structured decision boards, live polling, and participation analytics for teams up to 50 active members."
    }
  ];

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white relative overflow-x-hidden">
      
      {/* Background Ambient Glows & Grid */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-25"></div>
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-blue-600/15 rounded-full blur-[140px]"></div>
        <div className="absolute top-[30%] -left-48 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[130px]"></div>
        <div className="absolute top-[60%] -right-48 w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[400px] bg-purple-600/10 rounded-full blur-[150px]"></div>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#070A12]/80 border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex justify-between items-center">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/35 transition-all">
              <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center overflow-hidden">
                <img 
                  src="/networking.png" 
                  alt="DecisionHub Logo" 
                  className="w-6 h-6 object-contain filter drop-shadow transition-transform group-hover:scale-110"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white leading-none">
                  Decision<span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Hub</span>
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase bg-blue-500/15 text-blue-400 border border-blue-500/30 rounded-full tracking-wide">
                  v2.0
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-400 tracking-wider mt-0.5 hidden xs:block">
                Consensus Intelligence Platform
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm font-medium text-slate-300">
            <a href="#features" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/50 transition-colors">
              Features
            </a>
            <a href="#interactive-demo" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/50 transition-colors">
              Live Demo
            </a>
            <a href="#how-it-works" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/50 transition-colors">
              How It Works
            </a>
            <a href="#templates" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/50 transition-colors">
              Use Cases
            </a>
            <a href="#faq" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/50 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all"
            >
              Sign In
            </Link>
            
            <Link
              to="/register"
              className="relative group px-4 sm:px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:via-indigo-500 hover:to-cyan-400 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40 transition-all transform active:scale-95 flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-6 bg-[#0B0F19]/95 border-b border-slate-800 backdrop-blur-2xl space-y-2 animate-in slide-in-from-top-4 duration-200">
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-slate-200 hover:bg-slate-800/80 font-medium"
            >
              Features
            </a>
            <a 
              href="#interactive-demo" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-slate-200 hover:bg-slate-800/80 font-medium"
            >
              Live Demo
            </a>
            <a 
              href="#how-it-works" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-slate-200 hover:bg-slate-800/80 font-medium"
            >
              How It Works
            </a>
            <a 
              href="#templates" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-slate-200 hover:bg-slate-800/80 font-medium"
            >
              Use Cases
            </a>
            <a 
              href="#faq" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-slate-200 hover:bg-slate-800/80 font-medium"
            >
              FAQ
            </a>
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              <Link 
                to="/login"
                className="w-full text-center py-2.5 rounded-xl text-slate-200 bg-slate-800/60 font-semibold"
              >
                Sign In
              </Link>
              <Link 
                to="/register"
                className="w-full text-center py-2.5 rounded-xl text-white bg-blue-600 font-bold"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Body */}
      <main className="flex-1 relative z-10">
        
        {/* HERO SECTION */}
        <section className="pt-10 sm:pt-16 lg:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Hero Left Column */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              
              {/* Highlight Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-950/60 text-blue-400 text-xs sm:text-sm font-semibold rounded-full border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)] backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                <span>AI-Powered Decision Intelligence & Governance</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl xs:text-5xl sm:text-6xl lg:text-[62px] font-black text-white leading-[1.1] tracking-tight">
                Collaborative <br className="hidden sm:inline" />
                decision-making for{" "}
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                  modern teams
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
                Eliminate endless meetings and chaotic chat debates. Create structured decision boards, compare trade-offs with AI pros & cons, invite your community to vote, and lock in consensus faster.
              </p>

              {/* CTA Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3.5 pt-2 max-w-md mx-auto lg:mx-0">
                <Link
                  to="/register"
                  className="px-7 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-center text-sm sm:text-base rounded-xl shadow-[0_0_25px_rgba(37,99,235,0.35)] hover:shadow-[0_0_35px_rgba(37,99,235,0.5)] transition-all transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>Get Started for Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/decisions"
                  className="px-6 py-3.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-center text-sm sm:text-base rounded-xl border border-slate-700/80 hover:border-slate-600 shadow-md backdrop-blur-sm transition-all flex items-center justify-center gap-2"
                >
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span>Browse Public Boards</span>
                </Link>
              </div>

              {/* Feature Checklist Badges */}
              <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2.5 text-xs sm:text-sm text-slate-400 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Free Forever Tier</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Real-Time Live Voting</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Verifiable Governance</span>
                </div>
              </div>

              {/* Trust Signal / Community Counter */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center lg:justify-start gap-4">
                <div className="flex -space-x-2">
                  <img className="w-8 h-8 rounded-full border-2 border-[#070A12] object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" alt="Avatar" />
                  <img className="w-8 h-8 rounded-full border-2 border-[#070A12] object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80" alt="Avatar" />
                  <img className="w-8 h-8 rounded-full border-2 border-[#070A12] object-cover" src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=80&q=80" alt="Avatar" />
                  <img className="w-8 h-8 rounded-full border-2 border-[#070A12] object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80" alt="Avatar" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1 text-amber-400 text-xs">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                    <span className="font-bold ml-1 text-slate-200">4.9/5</span>
                  </div>
                  <p className="text-xs text-slate-400">Trusted by 10,000+ engineers & community leaders</p>
                </div>
              </div>

            </div>

            {/* Hero Right Column - Interactive Live Preview Widget */}
            <div id="interactive-demo" className="lg:col-span-6 w-full max-w-xl mx-auto lg:max-w-none">
              <div className="relative group">
                
                {/* Glow Border Effect behind card */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 rounded-3xl blur-xl opacity-35 group-hover:opacity-60 transition duration-1000"></div>

                {/* Main Card Container */}
                <div className="relative bg-slate-900/90 border border-slate-700/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                  
                  {/* Top Bar / Metadata */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-blue-400 tracking-wider uppercase">
                          Interactive Live Demo
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Click to Vote
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                        RFC-2026: Architecture Strategy Choice
                      </h2>
                    </div>

                    <div className="flex items-center gap-2 bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-full text-xs font-bold shrink-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>Active Board</span>
                    </div>
                  </div>

                  {/* Dynamic Vote Options */}
                  <div className="space-y-3.5">
                    
                    {/* Option A */}
                    <button
                      type="button"
                      onClick={() => handleVote("A")}
                      className={`w-full text-left p-4 rounded-2xl border transition-all relative overflow-hidden group/opt cursor-pointer ${
                        activeOption === "A" 
                          ? "bg-blue-950/40 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
                          : "bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800/80"
                      }`}
                    >
                      {/* Animated Percentage Bar */}
                      <div 
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600/30 to-indigo-600/20 transition-all duration-700 ease-out rounded-2xl"
                        style={{ width: `${pctA}%` }}
                      ></div>

                      <div className="relative z-10 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black border ${
                            activeOption === "A" ? "bg-blue-600 border-blue-400 text-white" : "bg-slate-800 border-slate-600 text-slate-400"
                          }`}>
                            {activeOption === "A" ? <Check className="w-3.5 h-3.5" /> : "A"}
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">Option A</span>
                            <p className="text-sm sm:text-base font-bold text-white">Event-Driven Microservices (Rust + Go)</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-lg sm:text-xl font-black text-blue-400">{pctA}%</span>
                          <p className="text-[11px] text-slate-400">{votes.A} votes</p>
                        </div>
                      </div>
                    </button>

                    {/* Option B */}
                    <button
                      type="button"
                      onClick={() => handleVote("B")}
                      className={`w-full text-left p-4 rounded-2xl border transition-all relative overflow-hidden group/opt cursor-pointer ${
                        activeOption === "B" 
                          ? "bg-indigo-950/40 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]" 
                          : "bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800/80"
                      }`}
                    >
                      <div 
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-600/30 to-purple-600/20 transition-all duration-700 ease-out rounded-2xl"
                        style={{ width: `${pctB}%` }}
                      ></div>

                      <div className="relative z-10 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black border ${
                            activeOption === "B" ? "bg-indigo-600 border-indigo-400 text-white" : "bg-slate-800 border-slate-600 text-slate-400"
                          }`}>
                            {activeOption === "B" ? <Check className="w-3.5 h-3.5" /> : "B"}
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">Option B</span>
                            <p className="text-sm sm:text-base font-bold text-white">High-Performance Modular Monolith</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-lg sm:text-xl font-black text-indigo-300">{pctB}%</span>
                          <p className="text-[11px] text-slate-400">{votes.B} votes</p>
                        </div>
                      </div>
                    </button>

                    {/* Option C */}
                    <button
                      type="button"
                      onClick={() => handleVote("C")}
                      className={`w-full text-left p-4 rounded-2xl border transition-all relative overflow-hidden group/opt cursor-pointer ${
                        activeOption === "C" 
                          ? "bg-cyan-950/40 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]" 
                          : "bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800/80"
                      }`}
                    >
                      <div 
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-600/30 to-blue-600/20 transition-all duration-700 ease-out rounded-2xl"
                        style={{ width: `${pctC}%` }}
                      ></div>

                      <div className="relative z-10 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black border ${
                            activeOption === "C" ? "bg-cyan-600 border-cyan-400 text-white" : "bg-slate-800 border-slate-600 text-slate-400"
                          }`}>
                            {activeOption === "C" ? <Check className="w-3.5 h-3.5" /> : "C"}
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">Option C</span>
                            <p className="text-sm sm:text-base font-bold text-white">Hybrid Edge Serverless (Cloudflare / AWS)</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-lg sm:text-xl font-black text-cyan-300">{pctC}%</span>
                          <p className="text-[11px] text-slate-400">{votes.C} votes</p>
                        </div>
                      </div>
                    </button>

                  </div>

                  {/* Live AI Consensus Box */}
                  <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs text-slate-300 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-300">
                        {userVoted ? `✨ You cast your vote for Option ${activeOption}!` : "✨ AI Consensus Synthesis:"}
                      </p>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        {activeOption === "A" 
                          ? "Option A leads with 61% support among senior architects citing sub-millisecond event streaming capability."
                          : activeOption === "B"
                          ? "Option B favored for rapid onboarding velocity and lower operational complexity in the short term."
                          : "Option C gains momentum for global latency reduction and zero fixed infrastructure cost."}
                      </p>
                    </div>
                  </div>

                  {/* Card Meta Stats Footer */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-medium border-t border-slate-800">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <Vote className="w-4 h-4 text-blue-400" />
                        <span className="font-bold text-white">{totalVotes.toLocaleString()}</span> votes
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <MessageSquare className="w-4 h-4 text-indigo-400" />
                        <span className="font-bold text-white">48</span> arguments
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2.5 py-1 rounded-md font-semibold text-[11px]">
                        Ends in 3 days
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </section>

        {/* METRICS & SOCIAL PROOF STRIP */}
        <section className="border-y border-slate-800/80 bg-slate-950/60 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <p className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                99.2%
              </p>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">Faster Consensus Velocity</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <p className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-indigo-400 to-purple-300 bg-clip-text text-transparent">
                50,000+
              </p>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">Decisions Resolved</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <p className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                450,000+
              </p>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">Verified Votes Cast</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <p className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">
                100%
              </p>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">Audit Trail Transparency</p>
            </div>

          </div>
        </section>

        {/* CORE CAPABILITIES / FEATURE GRID */}
        <section id="features" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-950/60 text-indigo-400 text-xs font-bold rounded-full border border-indigo-500/30">
              <Zap className="w-3.5 h-3.5" />
              <span>Full-Stack Decision Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Everything high-performing teams need to align & execute
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              From informal temperature checks to binding architectural elections, DecisionHub provides an end-to-end framework for collective governance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Feature 1 */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/40 hover:bg-slate-900/80 transition-all group duration-300 shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Structured Decision Matrices</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Break complex problems into multiple actionable options with explicit pros, cons, feasibility scores, and estimated impact parameters.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-900/80 transition-all group duration-300 shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Vote className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Advanced Voting Modes</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Support for Single Choice, Ranked Choice (IRV), Quadratic Voting, Approval Voting, and weighted stakeholder governance rules.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 hover:bg-slate-900/80 transition-all group duration-300 shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">AI Consensus Synthesizer</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Automated NLP summaries that synthesize opposing viewpoints, surface hidden biases, and create instant executive summaries.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-900/80 transition-all group duration-300 shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Community & Council Spaces</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Organize by team, department, DAO council, or public community with customized member permissions, invite codes, and leadership roles.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/40 hover:bg-slate-900/80 transition-all group duration-300 shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Real-Time Consensus Analytics</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Live visual distribution charts, voter turnout velocity heatmaps, and sentiment tracking across all deliberation threads.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-purple-500/40 hover:bg-slate-900/80 transition-all group duration-300 shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Tamper-Proof Audit & ADRs</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Every vote and outcome is logged with immutable audit timestamps. One-click export to Markdown Architecture Decision Records (ADRs).
              </p>
            </div>

          </div>
        </section>

        {/* HOW IT WORKS (3-STEP VISUAL WORKFLOW) */}
        <section id="how-it-works" className="py-20 sm:py-28 bg-slate-950/70 border-t border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/60 text-cyan-400 text-xs font-bold rounded-full border border-cyan-500/30">
                <GitBranch className="w-3.5 h-3.5" />
                <span>Streamlined 3-Step Methodology</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                From discussion chaos to executed decision in minutes
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Replace fragmented chat threads and endless alignment syncs with a repeatable, transparent decision pipeline.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              
              {/* Step 1 */}
              <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 relative space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                  1
                </div>
                <h3 className="text-xl font-bold text-white">Frame the Decision Matrix</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Define the context, list mutually exclusive options, set deadline timers, and attach evaluation criteria and documentation.
                </p>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono">
                  $ dhub create-decision --type=ranked-choice
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 relative space-y-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  2
                </div>
                <h3 className="text-xl font-bold text-white">Deliberate & Cast Votes</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Team members debate pros and cons in structured threads, AI synthesizes opposing points, and participants cast verifiable ballots.
                </p>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono">
                  ✓ Quorum 82% reached • 42 debates logged
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 relative space-y-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  3
                </div>
                <h3 className="text-xl font-bold text-white">Achieve Consensus & Export</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Lock in the winning decision with mathematical clarity. Automatically export Markdown ADRs or sync to Jira, GitHub, and Slack.
                </p>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-emerald-400 font-mono">
                  📄 ADR-2026-042.md generated & signed
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* INTERACTIVE USE CASES / TEMPLATE BROWSER */}
        <section id="templates" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-950/60 text-purple-400 text-xs font-bold rounded-full border border-purple-500/30">
              <Sliders className="w-3.5 h-3.5" />
              <span>Tailored for Every Domain</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Tested templates for high-impact decision scenarios
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Explore how software architects, product executives, DAO leaders, and operations teams leverage DecisionHub boards.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {(["engineering", "product", "governance", "budget"] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm capitalize transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                }`}
              >
                {cat === "engineering" && "🛠️ Engineering & Architecture"}
                {cat === "product" && "🚀 Product Roadmap"}
                {cat === "governance" && "🏛️ Community Governance"}
                {cat === "budget" && "💰 Budget & Finance"}
              </button>
            ))}
          </div>

          {/* Active Template Showcase Card */}
          {(() => {
            const t = decisionTemplates[selectedCategory];
            return (
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
                
                {/* Header Info */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                        {t.badge}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        Space: <strong className="text-slate-200">{t.community}</strong>
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">{t.title}</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <img src={t.avatar} alt="Author" className="w-10 h-10 rounded-full border border-slate-700 object-cover" />
                    <div>
                      <p className="text-xs font-bold text-white">{t.author}</p>
                      <p className="text-[11px] text-emerald-400 font-medium">{t.consensus}</p>
                    </div>
                  </div>
                </div>

                {/* Body Summary */}
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {t.summary}
                </p>

                {/* Options Breakdown Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {t.options.map((opt, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400">
                          Option {String.fromCharCode(65 + i)}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-slate-800 text-slate-300">
                          {opt.status}
                        </span>
                      </div>
                      <p className="font-bold text-white text-sm">{opt.name}</p>
                      <div className="flex justify-between items-center text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                        <span className="text-emerald-400 font-bold">{opt.score}</span>
                        <span>{opt.votes} votes</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pros & Cons Tag Strip */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> Key Advantages
                    </p>
                    <ul className="text-xs text-slate-300 space-y-1.5">
                      {t.pros.map((p, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400">•</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20">
                    <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5" /> Trade-offs & Risks
                    </p>
                    <ul className="text-xs text-slate-300 space-y-1.5">
                      {t.cons.map((c, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-400">•</span> {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>
            );
          })()}

        </section>

        {/* COMPARISON: CHAOS VS DECISIONHUB */}
        <section className="py-20 sm:py-28 bg-slate-950/60 border-t border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Why forward-thinking teams replace chaotic chat polls
              </h2>
              <p className="text-slate-400 text-sm sm:text-base">
                See the difference when decisions are treated as structured first-class assets.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              
              {/* The Old Way */}
              <div className="p-8 rounded-3xl bg-red-950/10 border border-red-500/20 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                    <X className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-red-200">The Slack / Email Chaos</h3>
                </div>

                <ul className="space-y-3.5 text-sm text-slate-400">
                  <li className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>Buried in 140+ unorganized threaded comments without criteria.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>Loudest voices in the room dominate without weighted governance.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>No permanent record of why option B was picked 6 months later.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>Endless re-litigation and second-guessing by newcomers.</span>
                  </li>
                </ul>
              </div>

              {/* The DecisionHub Way */}
              <div className="p-8 rounded-3xl bg-blue-950/20 border border-blue-500/30 space-y-5 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Check className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-200">The DecisionHub Framework</h3>
                </div>

                <ul className="space-y-3.5 text-sm text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Structured option matrix with side-by-side trade-off scores.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Ranked choice & quadratic voting for equitable consensus.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>One-click exportable Architecture Decision Records (ADRs).</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>AI-powered synthesis that extracts signal from deliberation noise.</span>
                  </li>
                </ul>
              </div>

            </div>

          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Loved by engineers, architects, & community stewards
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              See how cross-functional teams transformed their decision velocity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            
            <div className="p-7 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-4">
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                "DecisionHub completely eliminated our 2-hour Monday architectural debate meetings. We frame the RFC asynchronously, let the team rank choices, and lock in decisions within 48 hours."
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Sarah J." className="w-9 h-9 rounded-full object-cover" />
                <div>
                  <p className="text-xs font-bold text-white">Sarah Jenkins</p>
                  <p className="text-[11px] text-slate-400">Staff Infrastructure Engineer</p>
                </div>
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-4">
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                "The quadratic voting and AI summary features are absolute game changers for our 12,000-member open source ecosystem. Community satisfaction with governance is at an all-time high."
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="David K." className="w-9 h-9 rounded-full object-cover" />
                <div>
                  <p className="text-xs font-bold text-white">David Thorne</p>
                  <p className="text-[11px] text-slate-400">Ecosystem DAO Steward</p>
                </div>
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-4">
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                "Having verifiable Architecture Decision Records generated automatically right after voting closes has saved our compliance and audit teams hundreds of hours."
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
                <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&q=80" alt="Michael L." className="w-9 h-9 rounded-full object-cover" />
                <div>
                  <p className="text-xs font-bold text-white">Elena Rostova</p>
                  <p className="text-[11px] text-slate-400">VP of Engineering</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="py-20 sm:py-28 bg-slate-950/70 border-t border-slate-800/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center mb-14 space-y-4">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-slate-400 text-sm sm:text-base">
                Everything you need to know about DecisionHub and community governance.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div 
                    key={i} 
                    className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="w-full text-left p-5 sm:p-6 flex justify-between items-center gap-4 text-white font-bold text-sm sm:text-base hover:text-blue-400 transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-blue-400" : ""}`} />
                    </button>

                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/50">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* FINAL CALL TO ACTION (GLOW BANNER) */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="relative rounded-3xl bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-slate-900/90 border border-blue-500/30 p-8 sm:p-14 md:p-16 text-center space-y-6 overflow-hidden shadow-[0_0_60px_rgba(37,99,235,0.2)]">
            
            {/* Ambient Background Aura */}
            <div className="absolute -right-24 -top-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -left-24 -bottom-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold rounded-full border border-blue-400/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Start Free • No Credit Card Required</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                Ready to make smarter, faster consensus decisions?
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Join thousands of teams building better alignment today. Launch your first structured community board in less than 60 seconds.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-3.5 pt-4">
                <Link
                  to="/register"
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-center text-sm sm:text-base rounded-xl shadow-lg shadow-blue-600/30 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>Create Your Free Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/decisions"
                  className="px-8 py-4 bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-semibold text-center text-sm sm:text-base rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <span>Explore Decisions Feed</span>
                </Link>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 bg-[#05070E] py-14 px-4 sm:px-6 lg:px-8 text-slate-400 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10">
          
          {/* Col 1 - Brand */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <img src="/networking.png" alt="DecisionHub" className="w-5 h-5 object-contain" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                Decision<span className="text-blue-400">Hub</span>
              </span>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              The collaborative consensus and community governance engine designed for high-velocity software teams, DAOs, and product organizations.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>All Systems Operational (99.99% Uptime)</span>
            </div>
          </div>

          {/* Col 2 - Product */}
          <div className="space-y-3">
            <p className="text-white font-bold text-xs uppercase tracking-wider">Product</p>
            <ul className="space-y-2 text-xs">
              <li><a href="#features" className="hover:text-blue-400 transition-colors">Decision Matrix</a></li>
              <li><a href="#interactive-demo" className="hover:text-blue-400 transition-colors">Voting Engine</a></li>
              <li><a href="#templates" className="hover:text-blue-400 transition-colors">Community Spaces</a></li>
              <li><a href="#features" className="hover:text-blue-400 transition-colors">AI Synthesizer</a></li>
              <li><Link to="/decisions" className="hover:text-blue-400 transition-colors">Public Feed</Link></li>
            </ul>
          </div>

          {/* Col 3 - Resources */}
          <div className="space-y-3">
            <p className="text-white font-bold text-xs uppercase tracking-wider">Resources</p>
            <ul className="space-y-2 text-xs">
              <li><a href="#how-it-works" className="hover:text-blue-400 transition-colors">Documentation</a></li>
              <li><a href="#templates" className="hover:text-blue-400 transition-colors">ADR Templates</a></li>
              <li><a href="#faq" className="hover:text-blue-400 transition-colors">Governance Guide</a></li>
              <li><Link to="/reports" className="hover:text-blue-400 transition-colors">Reports & Analytics</Link></li>
            </ul>
          </div>

          {/* Col 4 - Auth & Legal */}
          <div className="space-y-3">
            <p className="text-white font-bold text-xs uppercase tracking-wider">Account</p>
            <ul className="space-y-2 text-xs">
              <li><Link to="/login" className="hover:text-blue-400 transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-blue-400 transition-colors">Create Account</Link></li>
              <li><Link to="/dashboard" className="hover:text-blue-400 transition-colors">Dashboard</Link></li>
              <li><span className="text-slate-500">Privacy & Terms</span></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-10 mt-10 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 DecisionHub Platform Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Security Audited</span>
            <span>Cryptographically Signed</span>
            <span>Enterprise Ready</span>
          </div>
        </div>
      </footer>

    </div>
  );
}