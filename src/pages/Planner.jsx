
import { useState } from "react";
import { jsPDF } from "jspdf";
import "./Planner.css";

/* =========================================================
   HELPER FUNCTIONS
   Keep these ABOVE the App / Planner component
   ========================================================= */

/* Remove markdown formatting from AI response */
const cleanText = (text) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^[-•]\s*/, "")
    .trim();
};

/* Remove emojis already added by AI so we can add
   clean emojis according to the content */
const removeLeadingEmoji = (text) => {
  return text
    .replace(
      /^[\s]*(?:🌍|🗺️|📍|📅|🚗|💰|❤️|🧳|🌅|☀️|🌆|🏖️|🏛️|🍴|🍽️|🍛|🥘|☕|🛍️|📸|🐘|🌿|🏔️|🕌|⛪|🎭|🎨|🎟️|💡|⚠️|🌤️|💵|💸|🌙|🥤|🚌|🚕|🚆|✈️|🏨|📌|🎒|🌊|🌳|🏞️|🏝️|🏄|🐬|📷|🛕|🎉|🍜|🍲|🥗|🍕|🍨|🛒|🧭|⛱️|🌞|🌧️|🌧|🌸|🌺|🕒|💳|💵|📝|🔹|🔸|✨|😊|👥)\s*/u,
      ""
    )
    .trim();
};

/* Choose emoji according to the content */
const getContentEmoji = (text) => {
  const lower = text.toLowerCase();

  /* Main sections */
  if (
    lower.includes("trip overview") ||
    lower.includes("overview")
  ) {
    return "🗺️";
  }

  if (
    lower.includes("day-by-day") ||
    lower.includes("itinerary")
  ) {
    return "📅";
  }

  if (
    lower.includes("top places") ||
    lower.includes("places to visit") ||
    lower.includes("attractions")
  ) {
    return "📍";
  }

  if (
    lower.includes("food to try") ||
    lower.includes("food") ||
    lower.includes("local cuisine") ||
    lower.includes("restaurants")
  ) {
    return "🍴";
  }

  if (
    lower.includes("travel tips") ||
    lower.includes("tips")
  ) {
    return "💡";
  }

  if (
    lower.includes("best time") ||
    lower.includes("time to visit") ||
    lower.includes("weather")
  ) {
    return "🌤️";
  }

  if (
    lower.includes("budget summary") ||
    lower.includes("budget breakdown") ||
    lower.includes("total estimated")
  ) {
    return "💰";
  }

  /* Day headings */
  if (/^day\s*\d+/i.test(text)) {
    return "🌅";
  }

  /* Time periods */
  if (lower.includes("morning")) {
    return "🌅";
  }

  if (lower.includes("afternoon")) {
    return "☀️";
  }

  if (lower.includes("evening")) {
    return "🌆";
  }

  /* Places / activities */
  if (
    lower.includes("beach") ||
    lower.includes("coast") ||
    lower.includes("sea") ||
    lower.includes("ocean")
  ) {
    return "🏖️";
  }

  if (
    lower.includes("temple") ||
    lower.includes("church") ||
    lower.includes("mosque") ||
    lower.includes("basilica") ||
    lower.includes("spiritual")
  ) {
    return "🛕";
  }

  if (
    lower.includes("museum") ||
    lower.includes("heritage") ||
    lower.includes("history") ||
    lower.includes("fort") ||
    lower.includes("palace")
  ) {
    return "🏛️";
  }

  if (
    lower.includes("shopping") ||
    lower.includes("mall") ||
    lower.includes("bazaar") ||
    lower.includes("market")
  ) {
    return "🛍️";
  }

  if (
    lower.includes("photograph") ||
    lower.includes("photography") ||
    lower.includes("photo")
  ) {
    return "📸";
  }

  if (
    lower.includes("wildlife") ||
    lower.includes("animal") ||
    lower.includes("zoo")
  ) {
    return "🐘";
  }

  if (
    lower.includes("nature") ||
    lower.includes("garden") ||
    lower.includes("forest") ||
    lower.includes("park")
  ) {
    return "🌿";
  }

  if (
    lower.includes("adventure") ||
    lower.includes("trek") ||
    lower.includes("surf") ||
    lower.includes("rafting")
  ) {
    return "🏄";
  }

  if (
    lower.includes("hotel") ||
    lower.includes("accommodation") ||
    lower.includes("stay")
  ) {
    return "🏨";
  }

  if (
    lower.includes("transport") ||
    lower.includes("travel") ||
    lower.includes("drive") ||
    lower.includes("cab") ||
    lower.includes("auto") ||
    lower.includes("metro") ||
    lower.includes("bus") ||
    lower.includes("train")
  ) {
    return "🚗";
  }

  if (
    lower.includes("breakfast") ||
    lower.includes("lunch") ||
    lower.includes("dinner") ||
    lower.includes("snack") ||
    lower.includes("biryani") ||
    lower.includes("coffee") ||
    lower.includes("restaurant")
  ) {
    return "🍽️";
  }

  if (
    lower.includes("ticket") ||
    lower.includes("entry fee") ||
    lower.includes("activity")
  ) {
    return "🎟️";
  }

  if (
    lower.includes("spiritual") ||
    lower.includes("prayer")
  ) {
    return "🙏";
  }

  if (
    lower.includes("budget") ||
    lower.includes("price") ||
    lower.includes("cost") ||
    lower.includes("₹")
  ) {
    return "💰";
  }

  /* Default */
  return "📌";
};

/* Format one AI line */
const formatPlanLine = (line) => {
  const cleaned = cleanText(removeLeadingEmoji(line));

  if (!cleaned) {
    return null;
  }

  return cleaned;
};

/* Identify heading types */
const getLineClass = (text) => {
  const lower = text.toLowerCase();

  /* Main section headings */
  if (
    /^(?:\d+\.\s*)?(trip overview|day-by-day itinerary|top places to visit|places to visit|food to try|travel tips|best time to visit|budget summary)/i.test(
      text
    ) ||
    lower.includes("trip overview") ||
    lower.includes("day-by-day itinerary") ||
    lower.includes("top places to visit") ||
    lower.includes("food to try") ||
    lower.includes("travel tips") ||
    lower.includes("best time to visit") ||
    lower.includes("budget summary")
  ) {
    return "section-heading";
  }

  /* Day heading */
  if (/^(?:\d+\.\s*)?day\s*\d+/i.test(text)) {
    return "day-heading";
  }

  /* Morning / afternoon / evening */
  if (
    /^(?:[-•]\s*)?(morning|afternoon|evening)\s*:/i.test(text)
  ) {
    return "time-item";
  }

  /* Interest information */
  if (/interests\s*:/i.test(text)) {
    return "interests-line";
  }

  return "content-line";
};

/* =========================================================
   PDF DOWNLOAD FUNCTION
   ========================================================= */

const downloadTripPDF = (tripPlan, destination, days, budget, travelType) => {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = 18;
  const usableWidth = pageWidth - margin * 2;

  let y = 20;

  /* PDF title */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("AI Tourist Planner", margin, y);

  y += 10;

  doc.setFontSize(13);
  doc.setFont("helvetica", "normal");

  doc.text(
    `${destination} • ${days} Days • ${travelType}`,
    margin,
    y
  );

  y += 7;

  doc.text(`Budget: Rs. ${Number(budget).toLocaleString("en-IN")}`, margin, y);

  y += 10;

  doc.line(margin, y, pageWidth - margin, y);

  y += 10;

  /* Trip content */
  const lines = tripPlan.split("\n");

  lines.forEach((rawLine) => {
    let line = formatPlanLine(rawLine);

    if (!line) {
      y += 5;
      return;
    }

    /* Remove emojis for PDF because default jsPDF fonts
       may not display emoji correctly */
    line = line.replace(
      /[^\x00-\x7F₹]/g,
      ""
    );

    line = line.replace(/\s+/g, " ").trim();

    if (!line) {
      return;
    }

    const lineClass = getLineClass(line);

    /* Section heading */
    if (lineClass === "section-heading") {
      y += 5;

      if (y > pageHeight - 25) {
        doc.addPage();
        y = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);

      const wrappedHeading = doc.splitTextToSize(
        line,
        usableWidth
      );

      doc.text(wrappedHeading, margin, y);

      y += wrappedHeading.length * 7 + 5;
    }

    /* Day heading */
    else if (lineClass === "day-heading") {
      y += 4;

      if (y > pageHeight - 25) {
        doc.addPage();
        y = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);

      const wrappedDay = doc.splitTextToSize(
        line,
        usableWidth
      );

      doc.text(wrappedDay, margin, y);

      y += wrappedDay.length * 7 + 3;
    }

    /* Normal content */
    else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);

      const wrappedText = doc.splitTextToSize(
        line,
        usableWidth - 5
      );

      if (y + wrappedText.length * 6 > pageHeight - 18) {
        doc.addPage();
        y = 20;
      }

      doc.text(wrappedText, margin + 3, y);

      y += wrappedText.length * 6 + 3;
    }
  });

  /* Footer */
  const totalPages = doc.internal.getNumberOfPages();

  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    doc.text(
      `AI Tourist Planner • Page ${page} of ${totalPages}`,
      margin,
      pageHeight - 8
    );
  }

  const safeDestination =
    destination.trim().replace(/[^a-zA-Z0-9]/g, "-") ||
    "Trip";

  doc.save(`AI-Tourist-Plan-${safeDestination}.pdf`);
};

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

function Planner() {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState(15000);
  const [travelType, setTravelType] = useState("Family");

  const interestOptions = [
    "Beaches",
    "Nature",
    "Food",
    "Adventure",
    "Culture",
    "History",
    "Shopping",
    "Photography",
    "Wildlife",
    "Spiritual",
  ];

  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tripPlan, setTripPlan] = useState("");
  const [error, setError] = useState("");

  /* =======================================================
     SELECT / UNSELECT INTEREST
     ======================================================= */

  const toggleInterest = (interest) => {
    setInterests((previous) => {
      if (previous.includes(interest)) {
        return previous.filter((item) => item !== interest);
      }

      return [...previous, interest];
    });
  };

  /* =======================================================
     GENERATE TRIP
     ======================================================= */

  const generateTrip = async () => {
    setError("");
    setTripPlan("");

    if (!destination.trim()) {
      setError("Please enter a destination.");
      return;
    }

    if (!days || Number(days) < 1) {
      setError("Please enter a valid number of days.");
      return;
    }

    if (!budget || Number(budget) < 1000) {
      setError("Please enter a valid budget.");
      return;
    }

    if (interests.length === 0) {
      setError("Please select at least one interest.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/plan-trip",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            destination: destination.trim(),
            days: Number(days),
            budget: Number(budget),
            travelType,
            interests,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to generate trip."
        );
      }

      setTripPlan(data.plan || "");
    } catch (err) {
      console.error("Trip generation error:", err);

      setError(
        "Unable to connect to the backend. Make sure the backend is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     PLAN ANOTHER TRIP
     ======================================================= */

  const planAnotherTrip = () => {
    setTripPlan("");
    setError("");

    setDestination("");
    setDays(3);
    setBudget(15000);
    setTravelType("Family");
    setInterests([]);

    setTimeout(() => {
      document
        .getElementById("planner")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };

  /* =======================================================
     SCROLL TO PLANNER
     ======================================================= */

  const scrollToPlanner = () => {
    document
      .getElementById("planner")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="app">

      {/* =================================================
          NAVBAR
          ================================================= */}

      <nav className="navbar">
        <div className="logo">
          🌍 <span>AI Tourist Planner</span>
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#planner">Plan Trip</a>
          <a href="#about">About</a>
        </div>

        <button
          className="nav-button"
          onClick={scrollToPlanner}
        >
          Start Planning
        </button>
      </nav>

      {/* =================================================
          HERO SECTION
          ================================================= */}

      <section className="hero" id="home">
        <div className="hero-content">

          <div className="hero-icon">
            ✈️
          </div>

          <h1>AI Smart Tourist Planner</h1>

          <p>
            Plan your perfect trip with the power of
            Artificial Intelligence.
          </p>

          <button
            className="hero-button"
            onClick={scrollToPlanner}
          >
            Plan My Trip →
          </button>

        </div>
      </section>

      {/* =================================================
          PLANNER SECTION
          ================================================= */}

      <section
        className="planner-section"
        id="planner"
      >
        <div className="planner-card">

          {/* Heading */}

          <div className="section-heading">
            <span>🧳</span>

            <div>
              <h2>Create Your Travel Plan</h2>

              <p>
                Tell us about your trip and AI will create
                your itinerary.
              </p>
            </div>
          </div>

          {/* Destination */}

          <div className="form-group">
            <label>📍 Destination</label>

            <input
              type="text"
              placeholder="Enter destination e.g. Goa"
              value={destination}
              onChange={(e) =>
                setDestination(e.target.value)
              }
            />
          </div>

          {/* Days + Budget */}

          <div className="two-columns">

            <div className="form-group">
              <label>📅 Number of Days</label>

              <input
                type="number"
                min="1"
                max="30"
                value={days}
                onChange={(e) =>
                  setDays(e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>💰 Budget (₹)</label>

              <input
                type="number"
                min="1000"
                value={budget}
                onChange={(e) =>
                  setBudget(e.target.value)
                }
              />
            </div>

          </div>

          {/* Travel Type */}

          <div className="form-group">
            <label>👥 Travel Type</label>

            <select
              value={travelType}
              onChange={(e) =>
                setTravelType(e.target.value)
              }
            >
              <option value="Solo">
                Solo
              </option>

              <option value="Couple">
                Couple
              </option>

              <option value="Family">
                Family
              </option>

              <option value="Friends">
                Friends
              </option>
            </select>
          </div>

          {/* Interests */}

          <div className="form-group">

            <label>
              ❤️ Your Interests
            </label>

            <p className="interest-description">
              Select one or more interests:
            </p>

            <div className="interest-grid">

              {interestOptions.map((interest) => (

                <button
                  type="button"
                  key={interest}
                  className={`interest-option ${
                    interests.includes(interest)
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    toggleInterest(interest)
                  }
                >

                  <span>
                    {interests.includes(interest)
                      ? "✓"
                      : "＋"}
                  </span>

                  {interest}

                </button>

              ))}

            </div>

            {interests.length > 0 && (

              <div className="selected-interests">

                <strong>
                  Selected:
                </strong>{" "}

                {interests.join(", ")}

              </div>

            )}

          </div>

          {/* Error */}

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          {/* Generate Button */}

          <button
            className="generate-button"
            onClick={generateTrip}
            disabled={loading}
          >
            {loading
              ? "✨ Generating Your Trip..."
              : "✨ Generate My Trip"}
          </button>

        </div>
      </section>

      {/* =================================================
          TRIP RESULT
          ================================================= */}

      {tripPlan && (

        <section className="result-section">

          <div className="result-card">

            {/* Result Header */}

            <div className="result-title">

              <span>🗺️</span>

              <div>

                <h2>
                  Your AI Travel Plan
                </h2>

                <p>
                  {destination} • {days} days • ₹
                  {Number(budget).toLocaleString("en-IN")}
                </p>

              </div>

            </div>

            {/* =================================================
                ORGANIZED TRIP PLAN
                ================================================= */}

            <div className="trip-plan">

              {tripPlan
                .split("\n")
                .map((line, index) => {

                  /* Blank line = controlled spacing */

                  if (!line.trim()) {
                    return (
                      <div
                        className="plan-space"
                        key={`space-${index}`}
                      />
                    );
                  }

                  const formattedLine =
                    formatPlanLine(line);

                  if (!formattedLine) {
                    return null;
                  }

                  const lineClass =
                    getLineClass(formattedLine);

                  const emoji =
                    getContentEmoji(formattedLine);

                  return (
                    <p
                      className={lineClass}
                      key={`line-${index}`}
                    >

                      <span className="plan-emoji">
                        {emoji}
                      </span>

                      <span className="plan-text">
                        {formattedLine}
                      </span>

                    </p>
                  );
                })}

            </div>

            {/* =================================================
                ACTION BUTTONS
                THESE ARE ALWAYS AT THE END OF THE PLAN
                ================================================= */}

            <div className="result-actions">

              <button
                type="button"
                className="download-button"
                onClick={() =>
                  downloadTripPDF(
                    tripPlan,
                    destination,
                    days,
                    budget,
                    travelType
                  )
                }
              >
                📥 Download PDF
              </button>

              <button
                type="button"
                className="another-trip-button"
                onClick={planAnotherTrip}
              >
                🔄 Plan Another Trip
              </button>

            </div>

          </div>

        </section>

      )}

      {/* =================================================
          FEATURES
          ================================================= */}

      <section
        className="features-section"
        id="features"
      >

        <div className="section-title">

          <h2>
            Why Use AI Tourist Planner?
          </h2>

          <p>
            Everything you need to create a better
            travel experience.
          </p>

        </div>

        <div className="features-grid">

          <div className="feature-card">

            <div className="feature-icon">
              🤖
            </div>

            <h3>
              AI Powered
            </h3>

            <p>
              Get personalized travel plans generated
              using artificial intelligence.
            </p>

          </div>

          <div className="feature-card">

            <div className="feature-icon">
              💰
            </div>

            <h3>
              Budget Friendly
            </h3>

            <p>
              Plan your trip according to your
              available travel budget.
            </p>

          </div>

          <div className="feature-card">

            <div className="feature-icon">
              ❤️
            </div>

            <h3>
              Personalized
            </h3>

            <p>
              Select your interests and receive
              recommendations made for you.
            </p>

          </div>

        </div>

      </section>

      {/* =================================================
          ABOUT
          ================================================= */}

      <section
        className="about-section"
        id="about"
      >

        <h2>
          About AI Tourist Planner
        </h2>

        <p>
          AI Tourist Planner helps travelers create
          personalized itineraries based on destination,
          budget, travel duration, travel type, and
          interests.
        </p>

      </section>

      {/* =================================================
          FOOTER
          ================================================= */}

      <footer>
        <p>
          © 2026 AI Tourist Planner.
          Plan smarter. Travel better. 🌍
        </p>
      </footer>

    </div>
  );
}

export default Planner;