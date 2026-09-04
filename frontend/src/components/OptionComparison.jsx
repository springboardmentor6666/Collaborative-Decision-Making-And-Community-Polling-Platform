import { useState, useRef } from "react";
import "../styles/OptionComparison.css";

function OptionComparison() {
  const [activeTab, setActiveTab] = useState("All Factors");
  const [selectedOptions, setSelectedOptions] = useState([
    "Laptop A",
    "Laptop C",
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

  const options = [
    {
      id: "Laptop A",
      number: "01",
      name: "Laptop A",
      description: "Affordable and reliable for everyday use.",
      price: "₹55,000",
      rating: "4.5",
      tag: "Best Value",

      scores: {
        "All Factors": 92,
        Cost: 95,
        Benefits: 88,
        Risk: 92,
        Time: 85,
        Convenience: 90,
      },

      pros: [
        "Affordable",
        "Good performance",
        "Reliable",
      ],

      cons: [
        "Average camera",
      ],
    },

    {
      id: "Laptop B",
      number: "02",
      name: "Laptop B",
      description: "Powerful option with better performance.",
      price: "₹60,000",
      rating: "4.2",
      tag: "Performance",

      scores: {
        "All Factors": 84,
        Cost: 80,
        Benefits: 96,
        Risk: 82,
        Time: 94,
        Convenience: 86,
      },

      pros: [
        "High performance",
        "Good display",
        "Fast processor",
      ],

      cons: [
        "Higher price",
      ],
    },

    {
      id: "Laptop C",
      number: "03",
      name: "Laptop C",
      description: "Balanced choice with good overall value.",
      price: "₹52,000",
      rating: "4.3",
      tag: "Balanced",

      scores: {
        "All Factors": 88,
        Cost: 98,
        Benefits: 90,
        Risk: 87,
        Time: 89,
        Convenience: 95,
      },

      pros: [
        "Good value",
        "Lightweight",
        "Good battery",
      ],

      cons: [
        "Limited storage",
      ],
    },
  ];

  /* =========================
     TAB CLICK + SMOOTH SCROLL
  ========================= */

  const handleFactorClick = (factorName) => {
    setActiveTab(factorName);

    setTimeout(() => {
      if (factorName === "All Factors") {
        overviewRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else {
        detailsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  /* =========================
     SELECT / UNSELECT OPTION
  ========================= */

  const toggleOption = (name) => {
    if (selectedOptions.includes(name)) {
      setSelectedOptions(
        selectedOptions.filter(
          (option) => option !== name
        )
      );
    } else {
      if (selectedOptions.length < 3) {
        setSelectedOptions([
          ...selectedOptions,
          name,
        ]);
      }
    }
  };

  const selectedData = options.filter((option) =>
    selectedOptions.includes(option.id)
  );

  /* =========================
     RECOMMENDATION
  ========================= */

  const recommendedOption =
    selectedData.length > 0
      ? [...selectedData].sort(
          (a, b) =>
            b.scores[activeTab] -
            a.scores[activeTab]
        )[0]
      : null;

  return (
    <div className="comparison-page">

      {/* ================= HEADER ================= */}

      <header className="comparison-header">

        <div>

          <span className="comparison-badge">
            DECISION ANALYSIS
          </span>

          <h1>
            Compare & Decide Smarter
          </h1>

          <p>
            Evaluate your options side by side
            and find the choice that fits you best.
          </p>

        </div>

        <div className="decision-icon">
          ⚖️
        </div>

      </header>


      {/* ================= FACTOR TABS ================= */}

      <div className="factor-tabs">

        {factors.map((factor) => (

          <button
            key={factor.name}
            className={
              activeTab === factor.name
                ? "factor-tab active"
                : "factor-tab"
            }
            onClick={() =>
              handleFactorClick(factor.name)
            }
          >

            <span>
              {factor.icon}
            </span>

            {factor.name}

          </button>

        ))}

      </div>


      {/* ================= STEP 1 ================= */}

      <section className="options-section">

        <div className="section-heading">

          <div>

            <span className="step-label">
              STEP 1
            </span>

            <h2>
              Select Your Options
            </h2>

            <p>
              Choose up to three options
              that you want to compare.
            </p>

          </div>

          <div className="selection-count">
            {selectedOptions.length}/3 Selected
          </div>

        </div>


        <div className="option-grid">

          {options.map((option) => {

            const isSelected =
              selectedOptions.includes(option.id);

            return (

              <div
                key={option.id}
                className={
                  isSelected
                    ? "option-card selected"
                    : "option-card"
                }
                onClick={() =>
                  toggleOption(option.id)
                }
              >

                <div className="card-top">

                  <span className="option-number">
                    {option.number}
                  </span>

                  {isSelected && (
                    <span className="selected-check">
                      ✓
                    </span>
                  )}

                </div>


                <div className="laptop-icon">
                  💻
                </div>


                <h3>
                  {option.name}
                </h3>


                <p className="option-description">
                  {option.description}
                </p>


                <div className="option-info">

                  <div>

                    <span>
                      Price
                    </span>

                    <strong>
                      {option.price}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Rating
                    </span>

                    <strong>
                      ⭐ {option.rating}
                    </strong>

                  </div>

                </div>


                <div className="tag">
                  {option.tag}
                </div>


                <button
                  className={
                    isSelected
                      ? "select-btn selected-btn"
                      : "select-btn"
                  }
                  onClick={(e) => {

                    e.stopPropagation();

                    toggleOption(option.id);

                  }}
                >

                  {isSelected
                    ? "Selected ✓"
                    : "Select Option"}

                </button>

              </div>

            );

          })}

        </div>

      </section>


      {/* ================= STEP 2 ================= */}

      <section
        className="analysis-section"
        ref={overviewRef}
      >

        <div className="section-heading">

          <div>

            <span className="step-label">
              STEP 2
            </span>

            <h2>
              Comparison Overview
            </h2>

            <p>
              See how your selected options
              perform across important factors.
            </p>

          </div>

        </div>


        <div className="analysis-card">

          <div className="analysis-title">

            <h3>
              {activeTab} Score
            </h3>

            <span>
              {activeTab}
            </span>

          </div>


          <div className="score-list">

            {selectedData.length === 0 ? (

              <p>
                Select at least one option
                to see the comparison.
              </p>

            ) : (

              selectedData.map(
                (option, index) => (

                  <div
                    className="score-row"
                    key={option.id}
                  >

                    <div className="score-name">

                      <span className="rank">
                        {index + 1}
                      </span>

                      <strong>
                        {option.name}
                      </strong>

                    </div>


                    <div className="score-bar-container">

                      <div
                        className="score-bar"
                        style={{
                          width: `${option.scores[activeTab]}%`,
                        }}
                      ></div>

                    </div>


                    <strong className="score-value">

                      {option.scores[activeTab]}

                    </strong>

                  </div>

                )
              )

            )}

          </div>

        </div>

      </section>


      {/* ================= STEP 3 ================= */}

      <section
        className="details-section"
        ref={detailsRef}
      >

        <div className="section-heading">

          <div>

            <span className="step-label">
              STEP 3
            </span>

            <h2>
              Detailed Comparison
            </h2>

            <p>
              Quickly understand the strengths
              and limitations of each option.
            </p>

          </div>

        </div>


        <div className="details-grid">

          {selectedData.map((option) => (

            <div
              className="detail-card"
              key={option.id}
            >

              <div className="detail-header">

                <h3>
                  {option.name}
                </h3>

                <span className="mini-score">

                  {option.scores[activeTab]}/100

                </span>

              </div>


              <div className="pros-cons">

                <div>

                  <h4>
                    ✓ Pros
                  </h4>

                  {option.pros.map((pro) => (

                    <p key={pro}>
                      <span>+</span>{" "}
                      {pro}
                    </p>

                  ))}

                </div>


                <div>

                  <h4>
                    − Cons
                  </h4>

                  {option.cons.map((con) => (

                    <p key={con}>
                      <span>−</span>{" "}
                      {con}
                    </p>

                  ))}

                </div>

              </div>

            </div>

          ))}

        </div>

      </section>


      {/* ================= RECOMMENDATION ================= */}

      {recommendedOption && (

        <section className="recommendation-section">

          <div className="recommendation-icon">
            🏆
          </div>


          <div className="recommendation-content">

            <span>
              OUR RECOMMENDATION
            </span>

            <h2>
              {recommendedOption.name}
            </h2>

            <p>

              Based on the{" "}
              {activeTab.toLowerCase()}{" "}
              comparison, this option currently
              performs the best among your
              selected choices.

            </p>


            <div className="recommendation-points">

              <span>
                ✓ Best {activeTab.toLowerCase()} score
              </span>

              <span>
                ✓ Strong overall choice
              </span>

              <span>
                ✓ Suitable for comparison
              </span>

            </div>

          </div>


          <div className="recommendation-score">

            <strong>
              {recommendedOption.scores[activeTab]}
            </strong>

            <span>
              {activeTab} Score
            </span>

          </div>

        </section>

      )}


      {/* ================= BOTTOM ================= */}

      <div className="bottom-message">

        Make decisions with confidence, together.

      </div>

    </div>
  );
}

export default OptionComparison;