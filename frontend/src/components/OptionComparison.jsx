import { useState, useRef } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../styles/OptionComparison.css";

const PRESET_DATASETS = {
  laptops: {
    title: "Best Laptop for Productivity & Development",
    category: "Technology",
    options: [
      {
        id: "Laptop A",
        number: "01",
        name: "Laptop A (Budget Pro)",
        description: "Affordable and reliable for everyday multitasking and coding.",
        price: "₹55,000",
        rating: "4.5",
        tag: "Best Value",
        scores: { "All Factors": 92, Cost: 95, Benefits: 88, Risk: 92, Time: 85, Convenience: 90 },
        pros: ["Affordable pricing", "Solid battery life", "Reliable keyboard"],
        cons: ["Average webcam", "Plastic chassis"]
      },
      {
        id: "Laptop B",
        number: "02",
        name: "Laptop B (Power Ultra)",
        description: "Powerhouse option with high-tier GPU and thermal headroom.",
        price: "₹95,000",
        rating: "4.8",
        tag: "Performance",
        scores: { "All Factors": 89, Cost: 72, Benefits: 98, Risk: 85, Time: 94, Convenience: 88 },
        pros: ["Blazing fast CPU/GPU", "Vibrant OLED display", "Expandable RAM"],
        cons: ["Heavier build", "Higher price point"]
      },
      {
        id: "Laptop C",
        number: "03",
        name: "Laptop C (Slim Air)",
        description: "Ultra-portable notebook tailored for mobility and battery endurance.",
        price: "₹72,000",
        rating: "4.6",
        tag: "Balanced",
        scores: { "All Factors": 90, Cost: 84, Benefits: 91, Risk: 89, Time: 92, Convenience: 96 },
        pros: ["Lightweight (1.2kg)", "All-day 15hr battery", "Silent fanless design"],
        cons: ["Limited port selection", "Non-upgradable storage"]
      }
    ]
  },
  mbaVsJob: {
    title: "MBA vs Continuing Corporate Job",
    category: "Career",
    options: [
      {
        id: "MBA",
        number: "01",
        name: "Pursue Full-Time Top MBA",
        description: "2-year immersive business school to pivot into strategy or consulting.",
        price: "Tuition ₹28L",
        rating: "4.7",
        tag: "Executive Career",
        scores: { "All Factors": 88, Cost: 60, Benefits: 97, Risk: 75, Time: 78, Convenience: 82 },
        pros: ["Tier-1 alumni network", "Accelerated leadership trajectory", "High salary ceiling"],
        cons: ["2-year lost salary", "Substantial student loans"]
      },
      {
        id: "Job",
        number: "02",
        name: "Continue Corporate Career",
        description: "Stay in current product track, gain real seniority and stock grants.",
        price: "Zero Debt",
        rating: "4.4",
        tag: "Financial Stability",
        scores: { "All Factors": 85, Cost: 98, Benefits: 80, Risk: 92, Time: 88, Convenience: 91 },
        pros: ["Steady promotion trajectory", "Zero debt burden", "Hands-on domain mastery"],
        cons: ["Harder to transition industries", "Slower executive networking"]
      }
    ]
  },
  phone: {
    title: "Apple iPhone 16 Pro vs Samsung Galaxy S24 Ultra",
    category: "Technology",
    options: [
      {
        id: "iPhone",
        number: "01",
        name: "Apple iPhone 16 Pro",
        description: "Refined iOS ecosystem with class-leading video and long trade-in value.",
        price: "₹1,19,900",
        rating: "4.8",
        tag: "Ecosystem King",
        scores: { "All Factors": 93, Cost: 75, Benefits: 95, Risk: 96, Time: 94, Convenience: 97 },
        pros: ["A18 Pro silicon", "Unmatched ProRes video", "AirDrop & Mac synergy"],
        cons: ["Closed iOS ecosystem", "Costly proprietary cloud storage"]
      },
      {
        id: "Samsung",
        number: "02",
        name: "Samsung Galaxy S24 Ultra",
        description: "Ultimate Android powerhouse with integrated S-Pen and periscope zoom.",
        price: "₹1,29,999",
        rating: "4.7",
        tag: "Feature Powerhouse",
        scores: { "All Factors": 90, Cost: 74, Benefits: 96, Risk: 89, Time: 91, Convenience: 90 },
        pros: ["Integrated S-Pen stylus", "100x Space Zoom camera", "Split-screen multitasking"],
        cons: ["Rapid resale depreciation", "Heavier in-hand feel"]
      }
    ]
  },
  travel: {
    title: "Goa vs Bali Vacation & Workation",
    category: "Travel",
    options: [
      {
        id: "Bali",
        number: "01",
        name: "Tropical Retreat in Bali",
        description: "Lush private pool villas, surfing breaks, and cultural heritage.",
        price: "₹85,000 Total",
        rating: "4.9",
        tag: "Exotic Escape",
        scores: { "All Factors": 91, Cost: 76, Benefits: 98, Risk: 90, Time: 82, Convenience: 86 },
        pros: ["World-class cafe culture", "Stunning jungle villas", "Vibrant nomad community"],
        cons: ["International flight expenses", "Visa and forex conversions"]
      },
      {
        id: "Goa",
        number: "02",
        name: "Beach Vacation in Goa",
        description: "Effortless coastal getaway with heritage churches and seafood shacks.",
        price: "₹35,000 Total",
        rating: "4.5",
        tag: "Quick & Easy",
        scores: { "All Factors": 87, Cost: 95, Benefits: 82, Risk: 94, Time: 96, Convenience: 94 },
        pros: ["Quick 2hr domestic flight", "Budget friendly", "No passport / visa hurdles"],
        cons: ["Peak season crowd traffic", "Monsoon weather fluctuations"]
      }
    ]
  },
  workplace: {
    title: "100% Fully Remote Work vs Hybrid Policy",
    category: "Lifestyle",
    options: [
      {
        id: "Remote",
        number: "01",
        name: "100% Remote Work",
        description: "Total location independence with asynchronous workflows.",
        price: "0 Commute Cost",
        rating: "4.8",
        tag: "Total Autonomy",
        scores: { "All Factors": 92, Cost: 98, Benefits: 93, Risk: 86, Time: 99, Convenience: 96 },
        pros: ["Zero commute hours lost", "Work from any city", "Custom home office setup"],
        cons: ["Potential social isolation", "Requires strict personal discipline"]
      },
      {
        id: "Hybrid",
        number: "02",
        name: "Hybrid (2 Days Office / 3 Remote)",
        description: "Balanced cadence combining deep focus at home with in-person synergy.",
        price: "Moderate Transit",
        rating: "4.4",
        tag: "Collaborative Balance",
        scores: { "All Factors": 85, Cost: 84, Benefits: 88, Risk: 92, Time: 86, Convenience: 87 },
        pros: ["Face-to-face team bonding", "Clear work/home boundary", "Instant whiteboard sessions"],
        cons: ["Commute on office days", "Desk sharing / hot-desking hassles"]
      }
    ]
  }
};

function OptionComparison() {
  const [selectedPreset, setSelectedPreset] = useState("laptops");
  const [activeTab, setActiveTab] = useState("All Factors");
  
  const currentDataset = PRESET_DATASETS[selectedPreset];
  const [selectedOptions, setSelectedOptions] = useState([
    currentDataset.options[0].id,
    currentDataset.options[1] ? currentDataset.options[1].id : currentDataset.options[0].id
  ]);

  const overviewRef = useRef(null);
  const detailsRef = useRef(null);

  const factors = [
    { name: "All Factors", icon: "✦" },
    { name: "Cost", icon: "₹" },
    { name: "Benefits", icon: "✦" },
    { name: "Risk", icon: "!" },
    { name: "Time", icon: "◷" },
    { name: "Convenience", icon: "✓" },
  ];

  const handleDatasetChange = (key) => {
    setSelectedPreset(key);
    const ds = PRESET_DATASETS[key];
    setSelectedOptions([
      ds.options[0].id,
      ds.options[1] ? ds.options[1].id : ds.options[0].id
    ]);
  };

  const handleToggleOption = (id) => {
    if (selectedOptions.includes(id)) {
      if (selectedOptions.length > 1) {
        setSelectedOptions((prev) => prev.filter((item) => item !== id));
      }
    } else {
      if (selectedOptions.length < 3) {
        setSelectedOptions((prev) => [...prev, id]);
      } else {
        setSelectedOptions((prev) => [prev[1], prev[2], id]);
      }
    }
  };

  const selectedData = currentDataset.options.filter((option) =>
    selectedOptions.includes(option.id)
  );

  const recommendedOption =
    selectedData.length > 0
      ? [...selectedData].sort(
          (a, b) => (b.scores[activeTab] || 0) - (a.scores[activeTab] || 0)
        )[0]
      : currentDataset.options[0];

  return (
    <div style={{ background: "#0b0f19", minHeight: "100vh", color: "#f8fafc", fontFamily: "Inter, sans-serif" }}>
      <Navbar />

      <div className="comparison-page" style={{ paddingTop: "20px" }}>
        {/* Preset Selector Banner */}
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto 30px auto",
            background: "#111827",
            border: "1px solid #1f2937",
            borderRadius: "16px",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px"
          }}
        >
          <div>
            <div style={{ fontSize: "0.8rem", color: "#38bdf8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
              DECISION BOARD MATRIX
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "2px" }}>
              {currentDataset.title}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Select Topic:</span>
            <select
              value={selectedPreset}
              onChange={(e) => handleDatasetChange(e.target.value)}
              style={{
                background: "#1e293b",
                border: "1px solid #334155",
                color: "#fff",
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              <option value="laptops">💻 Laptops (Electronics)</option>
              <option value="mbaVsJob">🎓 MBA vs Corporate Job (Career)</option>
              <option value="phone">📱 iPhone vs Samsung (Tech)</option>
              <option value="travel">🌴 Goa vs Bali (Travel)</option>
              <option value="workplace">🏠 Remote vs Office (Lifestyle)</option>
            </select>
          </div>
        </div>

        {/* HEADER */}
        <header className="comparison-header">
          <div>
            <span className="comparison-badge">DECISION ANALYSIS</span>
            <h1>Option Comparison & Trade-Off Matrix</h1>
            <p>
              Compare alternatives side-by-side using structured factor scoring, pros, cons, and weighted evaluations.
            </p>
          </div>

          <div className="option-selectors">
            {currentDataset.options.map((opt) => {
              const isSelected = selectedOptions.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  className={`option-chip ${isSelected ? "active" : ""}`}
                  onClick={() => handleToggleOption(opt.id)}
                >
                  <span className="chip-indicator"></span>
                  {opt.name}
                </button>
              );
            })}
          </div>
        </header>

        {/* FACTOR TABS */}
        <div className="factors-tab-bar">
          {factors.map((f) => (
            <button
              key={f.name}
              className={`factor-tab ${activeTab === f.name ? "active" : ""}`}
              onClick={() => setActiveTab(f.name)}
            >
              <span className="tab-icon">{f.icon}</span>
              {f.name}
            </button>
          ))}
        </div>

        {/* CARDS GRID */}
        <section className="comparison-cards-grid" ref={overviewRef}>
          {selectedData.map((opt) => (
            <div key={opt.id} className="option-card">
              <div className="card-top">
                <span className="option-num">{opt.number}</span>
                <span className="option-tag">{opt.tag}</span>
              </div>

              <h3>{opt.name}</h3>
              <p className="option-desc">{opt.description}</p>

              <div className="price-rating-row">
                <span className="price-val">{opt.price}</span>
                <span className="rating-pill">★ {opt.rating}</span>
              </div>

              <div className="score-meter-container">
                <div className="meter-label">
                  <span>{activeTab} Score</span>
                  <span className="score-num">{opt.scores[activeTab] || 85}/100</span>
                </div>
                <div className="meter-track">
                  <div
                    className="meter-fill"
                    style={{ width: `${opt.scores[activeTab] || 85}%` }}
                  ></div>
                </div>
              </div>

              <div className="pros-cons-preview">
                <div className="pros-col">
                  <strong>PROS</strong>
                  <ul>
                    {opt.pros.map((p, i) => (
                      <li key={i}>✓ {p}</li>
                    ))}
                  </ul>
                </div>
                <div className="cons-col">
                  <strong>CONS</strong>
                  <ul>
                    {opt.cons.map((c, i) => (
                      <li key={i}>✕ {c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* WINNER RECOMMENDATION */}
        {recommendedOption && (
          <section className="recommendation-banner" ref={detailsRef}>
            <div className="recommendation-icon">🏆</div>
            <div className="recommendation-content">
              <span className="rec-badge">TOP RANKED CHOICE ({activeTab})</span>
              <h2>{recommendedOption.name}</h2>
              <p>
                Leading on <strong>{activeTab}</strong> with an aggregate evaluation score of{" "}
                <strong>{recommendedOption.scores[activeTab]} points</strong>.
              </p>
            </div>
            <div className="recommendation-score">
              <strong>{recommendedOption.scores[activeTab]}</strong>
              <span>Score Index</span>
            </div>
          </section>
        )}

        {/* BOTTOM MESSAGE */}
        <div className="bottom-message">
          Make informed decisions with confidence, powered by collective intelligence.
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default OptionComparison;