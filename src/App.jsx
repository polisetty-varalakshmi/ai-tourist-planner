import { useState } from "react";
import jsPDF from "jspdf";
import "./App.css";

function App() {
  const [destination, setDestination] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
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

  const destinationSuggestions = [
    "Goa",
    "Chennai",
    "Hyderabad",
    "Bangalore",
    "Mumbai",
    "Delhi",
    "Kochi",
    "Mysore",
    "Pondicherry",
    "Tirupati",
    "Visakhapatnam",
    "Jaipur",
    "Agra",
    "Ooty",
    "Manali",
    "Munnar",
  ];

  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tripPlan, setTripPlan] = useState("");
  const [error, setError] = useState("");
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // =====================================================
  // SAVED TRIP / FAVORITE
  // =====================================================

  const [savedTrip, setSavedTrip] = useState(() => {
    try {
      const storedTrip = localStorage.getItem(
        "aiTouristPlannerSavedTrip"
      );

      return storedTrip ? JSON.parse(storedTrip) : null;
    } catch (error) {
      console.error("Unable to load saved trip:", error);
      return null;
    }
  });

  const [showSavedTrips, setShowSavedTrips] = useState(false);

  // =====================================================
  // TRIP HISTORY
  // =====================================================

  const [tripHistory, setTripHistory] = useState(() => {
    try {
      const storedHistory = localStorage.getItem(
        "aiTouristPlannerTripHistory"
      );

      return storedHistory ? JSON.parse(storedHistory) : [];
    } catch (error) {
      console.error("Unable to load trip history:", error);
      return [];
    }
  });

  const [showTripHistory, setShowTripHistory] = useState(false);
  const [currentHistoryTripId, setCurrentHistoryTripId] = useState(null);

  // Check whether currently displayed trip is the saved trip
  const isCurrentTripSaved =
    savedTrip &&
    savedTrip.destination === destination &&
    savedTrip.tripPlan === tripPlan;

  const isCurrentTripFavorite =
    isCurrentTripSaved && savedTrip.favorite === true;

  // =====================================================
  // SELECT / UNSELECT INTERESTS
  // =====================================================

  const filteredDestinations = destinationSuggestions.filter(
    (place) =>
      place.toLowerCase().includes(destination.toLowerCase()) &&
      place.toLowerCase() !== destination.toLowerCase()
  );

  const toggleInterest = (interest) => {
    setInterests((previous) => {
      if (previous.includes(interest)) {
        return previous.filter((item) => item !== interest);
      }

      return [...previous, interest];
    });
  };

  // =====================================================
  // GET WEATHER
  // =====================================================

  const getWeather = async (place) => {
    setWeather(null);
    setWeatherLoading(true);

    try {
      // Find destination coordinates
      const locationResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          place
        )}&count=1&language=en&format=json`
      );

      const locationData = await locationResponse.json();

      if (
        !locationData.results ||
        locationData.results.length === 0
      ) {
        throw new Error("Location not found");
      }

      const location = locationData.results[0];

      // Get current weather
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=kmh`
      );

      const weatherData = await weatherResponse.json();

      const weatherCode = weatherData.current.weather_code;

      let condition = "Clear";

      if (weatherCode === 0) {
        condition = "Clear Sky";
      } else if (
        weatherCode === 1 ||
        weatherCode === 2
      ) {
        condition = "Partly Cloudy";
      } else if (weatherCode === 3) {
        condition = "Cloudy";
      } else if (
        weatherCode >= 45 &&
        weatherCode <= 48
      ) {
        condition = "Foggy";
      } else if (
        weatherCode >= 51 &&
        weatherCode <= 57
      ) {
        condition = "Drizzle";
      } else if (
        weatherCode >= 61 &&
        weatherCode <= 67
      ) {
        condition = "Rainy";
      } else if (
        weatherCode >= 71 &&
        weatherCode <= 77
      ) {
        condition = "Snowy";
      } else if (
        weatherCode >= 80 &&
        weatherCode <= 82
      ) {
        condition = "Rain Showers";
      } else if (
        weatherCode >= 95 &&
        weatherCode <= 99
      ) {
        condition = "Thunderstorm";
      }

      setWeather({
        city: location.name,
        country: location.country,
        temperature: Math.round(
          weatherData.current.temperature_2m
        ),
        feelsLike: Math.round(
          weatherData.current.apparent_temperature
        ),
        condition,
        wind: Math.round(
          weatherData.current.wind_speed_10m
        ),
      });
    } catch (err) {
      console.error("Weather Error:", err);
      setWeather(null);
    } finally {
      setWeatherLoading(false);
    }
  };

  // =====================================================
  // GENERATE TRIP
  // =====================================================

  const generateTrip = async () => {
    console.log("🟢 Generate My Trip button clicked");

    setError("");
    setTripPlan("");

    if (!destination.trim()) {
      setError("Please enter a destination.");
      return;
    }

    if (interests.length === 0) {
      setError("Please select at least one interest.");
      return;
    }

    setLoading(true);

    console.log("📤 Sending trip request to backend...");
    console.log({
      destination,
      days,
      budget,
      travelType,
      interests,
    });

    try {
      const response = await fetch(
        "https://ai-tourist-planner-tbko.onrender.com/api/plan-trip",
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

      console.log(
        "📥 Backend response status:",
        response.status
      );

      const data = await response.json();

      console.log("📦 Backend response:", data);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to generate trip."
        );
      }

      console.log("✅ Trip generated successfully");

      setTripPlan(data.plan);

      getWeather(destination);

      // Save every successfully generated trip to Trip History
      const historyTrip = {
        id: Date.now(),
        destination: destination.trim(),
        days: Number(days),
        budget: Number(budget),
        travelType,
        interests: [...interests],
        tripPlan: data.plan,
        favorite: false,
        createdAt: new Date().toISOString(),
      };

      setCurrentHistoryTripId(historyTrip.id);

      setTripHistory((previous) => {
        const updatedHistory = [historyTrip, ...previous];

        localStorage.setItem(
          "aiTouristPlannerTripHistory",
          JSON.stringify(updatedHistory)
        );

        return updatedHistory;
      });
    } catch (err) {
      console.error("❌ Frontend Error:", err);

      setError(
        err.message ||
          "Unable to generate trip. Please check the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // REMOVE MARKDOWN / EXISTING EMOJIS
  // =====================================================

  const cleanText = (text) => {
    return text
      .replace(/\*\*/g, "")
      .replace(/__/g, "")
      .replace(/^[-•]\s*/, "")
      .replace(/^#+\s*/, "")
      .replace(
        /^[\p{Extended_Pictographic}\s]+/u,
        ""
      )
      .trim();
  };

  // =====================================================
  // CONTENT BASED EMOJIS
  // =====================================================

  const getContentEmoji = (text) => {
    const lower = text.toLowerCase();

    // Time
    if (lower.includes("morning")) return "🌞";
    if (lower.includes("afternoon")) return "☀️";
    if (lower.includes("evening")) return "🌆";
    if (lower.includes("night")) return "🌙";

    // Beaches / Sea
    if (
      lower.includes("beach") ||
      lower.includes("sea") ||
      lower.includes("coast") ||
      lower.includes("island") ||
      lower.includes("shore")
    ) {
      return "🏖️";
    }

    // Mountains
    if (
      lower.includes("mountain") ||
      lower.includes("hill") ||
      lower.includes("trek") ||
      lower.includes("hiking")
    ) {
      return "⛰️";
    }

    // Waterfalls / Lakes
    if (
      lower.includes("waterfall") ||
      lower.includes("lake") ||
      lower.includes("river") ||
      lower.includes("water")
    ) {
      return "💦";
    }

    // Temples / Spiritual
    if (
      lower.includes("temple") ||
      lower.includes("church") ||
      lower.includes("mosque") ||
      lower.includes("basilica") ||
      lower.includes("spiritual") ||
      lower.includes("shrine")
    ) {
      return "🛕";
    }

    // History / Heritage
    if (
      lower.includes("museum") ||
      lower.includes("heritage") ||
      lower.includes("monument") ||
      lower.includes("fort") ||
      lower.includes("palace") ||
      lower.includes("historical") ||
      lower.includes("history")
    ) {
      return "🏛️";
    }

    // Nature
    if (
      lower.includes("nature") ||
      lower.includes("garden") ||
      lower.includes("park") ||
      lower.includes("forest") ||
      lower.includes("greenery")
    ) {
      return "🌿";
    }

    // Wildlife
    if (
      lower.includes("wildlife") ||
      lower.includes("zoo") ||
      lower.includes("animal") ||
      lower.includes("bird") ||
      lower.includes("safari")
    ) {
      return "🦋";
    }

    // Adventure
    if (
      lower.includes("adventure") ||
      lower.includes("surfing") ||
      lower.includes("rafting") ||
      lower.includes("camping") ||
      lower.includes("water sport") ||
      lower.includes("boating") ||
      lower.includes("scuba") ||
      lower.includes("diving")
    ) {
      return "🏄";
    }

    // Food
    if (
      lower.includes("food") ||
      lower.includes("restaurant") ||
      lower.includes("breakfast") ||
      lower.includes("lunch") ||
      lower.includes("dinner") ||
      lower.includes("biryani") ||
      lower.includes("cuisine") ||
      lower.includes("dish") ||
      lower.includes("meal") ||
      lower.includes("local food")
    ) {
      return "🍴";
    }

    // Drinks
    if (
      lower.includes("coffee") ||
      lower.includes("tea") ||
      lower.includes("cafe")
    ) {
      return "☕";
    }

    // Desserts
    if (
      lower.includes("dessert") ||
      lower.includes("sweet") ||
      lower.includes("ice cream")
    ) {
      return "🍨";
    }

    // Shopping
    if (
      lower.includes("shopping") ||
      lower.includes("market") ||
      lower.includes("mall") ||
      lower.includes("souvenir") ||
      lower.includes("shop")
    ) {
      return "🛍️";
    }

    // Photography
    if (
      lower.includes("photography") ||
      lower.includes("photo") ||
      lower.includes("sunset") ||
      lower.includes("viewpoint") ||
      lower.includes("scenic")
    ) {
      return "📸";
    }

    // Transport
    if (
      lower.includes("transport") ||
      lower.includes("taxi") ||
      lower.includes("metro") ||
      lower.includes("bus") ||
      lower.includes("train") ||
      lower.includes("airport") ||
      lower.includes("drive") ||
      lower.includes("car")
    ) {
      return "🚗";
    }

    // Accommodation
    if (
      lower.includes("hotel") ||
      lower.includes("stay") ||
      lower.includes("resort") ||
      lower.includes("room") ||
      lower.includes("accommodation")
    ) {
      return "🏨";
    }

    // Budget
    if (
      lower.includes("budget") ||
      lower.includes("cost") ||
      lower.includes("price") ||
      lower.includes("expense") ||
      lower.includes("₹") ||
      lower.includes("rs.")
    ) {
      return "💰";
    }

    // Weather
    if (
      lower.includes("weather") ||
      lower.includes("climate") ||
      lower.includes("temperature") ||
      lower.includes("rain")
    ) {
      return "🌤️";
    }

    // Safety
    if (
      lower.includes("safety") ||
      lower.includes("safe") ||
      lower.includes("emergency")
    ) {
      return "🛡️";
    }

    // Clothing
    if (
      lower.includes("clothing") ||
      lower.includes("dress") ||
      lower.includes("wear")
    ) {
      return "👕";
    }

    // Timing
    if (
      lower.includes("timing") ||
      lower.includes("time") ||
      lower.includes("hours") ||
      lower.includes("opening")
    ) {
      return "⏰";
    }

    // Culture
    if (
      lower.includes("culture") ||
      lower.includes("traditional") ||
      lower.includes("festival")
    ) {
      return "🎭";
    }

    // Relaxation
    if (
      lower.includes("relax") ||
      lower.includes("relaxing") ||
      lower.includes("peaceful")
    ) {
      return "😌";
    }

    return "📌";
  };

  // =====================================================
  // SECTION EMOJIS
  // =====================================================

  const getSectionEmoji = (text) => {
    const lower = text.toLowerCase();

    if (
      lower.includes("trip overview") ||
      lower.includes("overview")
    ) {
      return "🗺️";
    }

    if (
      lower.includes("day-by-day") ||
      lower.includes("day by day") ||
      lower.includes("itinerary")
    ) {
      return "📅";
    }

    if (
      lower.includes("top places") ||
      lower.includes("places to visit")
    ) {
      return "📍";
    }

    if (
      lower.includes("food") ||
      lower.includes("local food")
    ) {
      return "🍴";
    }

    if (
      lower.includes("travel tips") ||
      lower.includes("tips")
    ) {
      return "💡";
    }

    if (lower.includes("best time")) {
      return "🌤️";
    }

    if (lower.includes("budget")) {
      return "💰";
    }

    if (
      lower.includes("accommodation") ||
      lower.includes("stay")
    ) {
      return "🏨";
    }

    return "📌";
  };

  // =====================================================
  // CHECK HEADINGS
  // =====================================================

  const isMainSection = (text) => {
    const lower = text.toLowerCase();

    return (
      lower.includes("trip overview") ||
      lower.includes("day-by-day itinerary") ||
      lower.includes("day by day itinerary") ||
      lower.includes("top places to visit") ||
      lower.includes("food to try") ||
      lower.includes("local food") ||
      lower.includes("travel tips") ||
      lower.includes("best time to visit") ||
      lower.includes("budget summary") ||
      lower.includes("accommodation")
    );
  };

  const isDayHeading = (text) => {
    return /^day\s*\d+/i.test(text);
  };

  const isTimeLine = (text) => {
    return /^(morning|afternoon|evening|night)\s*:/i.test(
      text
    );
  };

  // =====================================================
  // RENDER TRIP PLAN
  // =====================================================

  const renderTripPlan = () => {
    if (!tripPlan) return null;

    const lines = tripPlan
      .split("\n")
      .map((line) => cleanText(line))
      .filter((line) => line.length > 0);

    return lines.map((line, index) => {
      // Major section
      if (isMainSection(line)) {
        return (
          <div
            key={index}
            className="trip-section"
            style={{
              marginTop: "18px",
              marginBottom: "8px",
            }}
          >
            <div
              className="trip-section-title"
              style={{
                padding: "8px 12px",
                marginBottom: "6px",
              }}
            >
              <span className="section-emoji">
                {getSectionEmoji(line)}
              </span>

              <span>{line}</span>
            </div>
          </div>
        );
      }

      // Day heading
      if (isDayHeading(line)) {
        return (
          <div
            className="day-section"
            key={index}
            style={{
              marginTop: "14px",
              marginBottom: "6px",
            }}
          >
            <div
              className="day-title"
              style={{
                padding: "7px 10px",
                marginBottom: "5px",
              }}
            >
              <span>🌅</span>
              <span>{line}</span>
            </div>
          </div>
        );
      }

      // Morning / Afternoon / Evening / Night
      if (isTimeLine(line)) {
        const timeMatch = line.match(
          /^(Morning|Afternoon|Evening|Night)\s*:\s*(.*)$/i
        );

        if (timeMatch) {
          const time = timeMatch[1];
          const content = timeMatch[2];

          return (
            <div
              className="time-item"
              key={index}
              style={{
                margin: "5px 0",
                padding: "5px 8px",
              }}
            >
              <div className="time-label">
                <span>
                  {getContentEmoji(time)}
                </span>

                <strong>{time}:</strong>
              </div>

              <div className="time-content">
                <span style={{ marginRight: "6px" }}>
                  {getContentEmoji(content)}
                </span>

                {content}
              </div>
            </div>
          );
        }
      }

      // Normal content
      return (
        <div
          className="trip-item"
          key={index}
          style={{
            margin: "4px 0",
            padding: "4px 8px",
          }}
        >
          <span
            className="item-emoji"
            style={{
              marginRight: "8px",
              flexShrink: 0,
            }}
          >
            {getContentEmoji(line)}
          </span>

          <span className="item-text">
            {line}
          </span>
        </div>
      );
    });
  };

  // =====================================================
  // DOWNLOAD PDF
  // =====================================================

  const downloadPDF = () => {
    if (!tripPlan) {
      return;
    }

    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    let y = 20;

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("AI Tourist Planner", margin, y);

    y += 12;

    // Trip details
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    doc.text(
      `Destination: ${destination}`,
      margin,
      y
    );

    y += 7;

    doc.text(
      `Duration: ${days} Days`,
      margin,
      y
    );

    y += 7;

    doc.text(
      `Budget: Rs. ${Number(budget).toLocaleString(
        "en-IN"
      )}`,
      margin,
      y
    );

    y += 7;

    doc.text(
      `Travel Type: ${travelType}`,
      margin,
      y
    );

    y += 7;

    doc.text(
      `Interests: ${interests.join(", ")}`,
      margin,
      y
    );

    y += 12;

    // Section heading
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(
      "Your AI Travel Plan",
      margin,
      y
    );

    y += 10;

    // Clean the AI content for PDF
    const cleanPDFText = (text) => {
      return text
        // Remove markdown
        .replace(/\*\*/g, "")
        .replace(/__/g, "")
        .replace(/^#+\s*/gm, "")

        // Replace rupee symbol
        .replace(/₹/g, "Rs.")

        // Remove emojis / pictographic characters
        .replace(
          /[\u{1F000}-\u{1FAFF}]/gu,
          ""
        )

        // Remove miscellaneous symbols that can break jsPDF
        .replace(
          /[\u{2600}-\u{27BF}]/gu,
          ""
        )

        // Replace long separator lines
        .replace(
          /[━─═]{3,}/g,
          "--------------------------------"
        )

        // Remove unwanted bullet characters
        .replace(
          /^[•●▪️🔹🔸]\s*/gm,
          "- "
        )

        // Remove excessive spaces
        .replace(/[ \t]+/g, " ")

        // Keep line breaks clean
        .replace(/\n{3,}/g, "\n\n")

        .trim();
    };

    const cleanPlan = cleanPDFText(tripPlan);

    const lines = doc.splitTextToSize(
      cleanPlan,
      contentWidth
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);

    lines.forEach((line) => {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }

      doc.text(line, margin, y);
      y += 6;
    });

    // File name
    const safeDestination = destination
      .trim()
      .replace(/[<>:"/\\|?*]/g, "")
      .replace(/\s+/g, "-");

    doc.save(
      `${safeDestination}-Travel-Plan.pdf`
    );
  };

  // =====================================================
  // SAVE TRIP
  // =====================================================

  const saveTrip = () => {
    if (!tripPlan) return;

    const existingFavorite =
      savedTrip &&
      savedTrip.destination === destination &&
      savedTrip.tripPlan === tripPlan
        ? savedTrip.favorite === true
        : false;

    const newSavedTrip = {
      destination,
      days,
      budget,
      travelType,
      interests,
      tripPlan,
      favorite: existingFavorite,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "aiTouristPlannerSavedTrip",
      JSON.stringify(newSavedTrip)
    );

    setSavedTrip(newSavedTrip);

    setShowSavedTrips(true);
  };

  // =====================================================
  // REMOVE SAVED TRIP
  // =====================================================

  const removeSavedTrip = () => {
    localStorage.removeItem(
      "aiTouristPlannerSavedTrip"
    );

    setSavedTrip(null);
    setShowSavedTrips(false);
  };

  // =====================================================
  // TRIP HISTORY FUNCTIONS
  // =====================================================

  const loadHistoryTrip = (trip) => {
    setDestination(trip.destination);
    setDays(trip.days);
    setBudget(trip.budget);
    setTravelType(trip.travelType);
    setInterests(trip.interests || []);
    setTripPlan(trip.tripPlan);
    setError("");
    setCurrentHistoryTripId(trip.id);

    setShowTripHistory(false);

    getWeather(trip.destination);

    setTimeout(() => {
      document
        .querySelector(".result-section")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };

  const deleteHistoryTrip = (id) => {
    setTripHistory((previous) => {
      const updatedHistory = previous.filter(
        (trip) => trip.id !== id
      );

      localStorage.setItem(
        "aiTouristPlannerTripHistory",
        JSON.stringify(updatedHistory)
      );

      return updatedHistory;
    });

    if (currentHistoryTripId === id) {
      setCurrentHistoryTripId(null);
    }
  };

  const toggleHistoryFavorite = (id) => {
    setTripHistory((previous) => {
      const updatedHistory = previous.map((trip) =>
        trip.id === id
          ? {
              ...trip,
              favorite: !trip.favorite,
            }
          : trip
      );

      localStorage.setItem(
        "aiTouristPlannerTripHistory",
        JSON.stringify(updatedHistory)
      );

      return updatedHistory;
    });
  };

  // =====================================================
  // FAVORITE TRIP
  // =====================================================

  const toggleFavorite = () => {
    if (!tripPlan) return;

    const isSameSavedTrip =
      savedTrip &&
      savedTrip.destination === destination &&
      savedTrip.tripPlan === tripPlan;

    const newFavoriteStatus = isSameSavedTrip
      ? !savedTrip.favorite
      : true;

    const newSavedTrip = {
      destination,
      days,
      budget,
      travelType,
      interests,
      tripPlan,
      favorite: newFavoriteStatus,
      savedAt: isSameSavedTrip
        ? savedTrip.savedAt
        : new Date().toISOString(),
    };

    localStorage.setItem(
      "aiTouristPlannerSavedTrip",
      JSON.stringify(newSavedTrip)
    );

    setSavedTrip(newSavedTrip);

    // Keep the current history item's favorite status in sync
    if (currentHistoryTripId !== null) {
      setTripHistory((previous) => {
        const updatedHistory = previous.map((trip) =>
          trip.id === currentHistoryTripId
            ? {
                ...trip,
                favorite: newFavoriteStatus,
              }
            : trip
        );

        localStorage.setItem(
          "aiTouristPlannerTripHistory",
          JSON.stringify(updatedHistory)
        );

        return updatedHistory;
      });
    }
  };

  // =====================================================
  // LOAD SAVED TRIP
  // =====================================================

  const loadSavedTrip = () => {
    if (!savedTrip) return;

    setDestination(savedTrip.destination);
    setDays(savedTrip.days);
    setBudget(savedTrip.budget);
    setTravelType(savedTrip.travelType);
    setInterests(savedTrip.interests || []);
    setTripPlan(savedTrip.tripPlan);
    setCurrentHistoryTripId(null);
    setError("");
    setShowSavedTrips(false);

    getWeather(savedTrip.destination);

    setTimeout(() => {
      document
        .querySelector(".result-section")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };

  // =====================================================
  // PLAN ANOTHER TRIP
  // =====================================================

  const planAnotherTrip = () => {
    setTripPlan("");
    setError("");
    setWeather(null);

    window.scrollTo({
      top:
        document.getElementById("planner")?.offsetTop ||
        0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // RETURN UI
  // =====================================================

  return (
    <div className="app">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

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

        {/* =================================================
            SAVED TRIPS
        ================================================= */}

        <div className="saved-trips-wrapper">

          <button
            type="button"
            className="saved-trips-button"
            onClick={() => {
              setShowSavedTrips(!showSavedTrips);
              setShowTripHistory(false);
            }}
          >
            ⭐ Saved Trips{" "}
            {savedTrip ? "(1)" : "(0)"}
          </button>

          {showSavedTrips && (
            <div className="saved-trips-panel">

              <div className="saved-trips-header">

                <h3>⭐ Saved Trips</h3>

                <button
                  type="button"
                  className="saved-trips-close"
                  onClick={() =>
                    setShowSavedTrips(false)
                  }
                >
                  ✕
                </button>

              </div>

              {savedTrip ? (
                <div className="saved-trip-card">

                  <div className="saved-trip-icon">
                    {savedTrip.favorite
                      ? "❤️"
                      : "🗺️"}
                  </div>

                  <div className="saved-trip-info">

                    <h4>
                      {savedTrip.destination}
                    </h4>

                    <p>
                      {savedTrip.days} days •{" "}
                      {savedTrip.travelType}
                    </p>

                    <p>
                      Budget: ₹
                      {Number(
                        savedTrip.budget
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </p>

                    {savedTrip.favorite && (
                      <span className="favorite-status">
                        ❤️ Favorite Trip
                      </span>
                    )}

                  </div>

                  <div className="saved-trip-actions">

                    <button
                      type="button"
                      className="view-saved-button"
                      onClick={loadSavedTrip}
                    >
                      👁️ View Trip
                    </button>

                    <button
                      type="button"
                      className="remove-saved-button"
                      onClick={removeSavedTrip}
                    >
                      🗑️ Remove
                    </button>

                  </div>

                </div>
              ) : (
                <div className="no-saved-trips">

                  <div className="no-saved-icon">
                    🧳
                  </div>

                  <h4>No Saved Trips Yet</h4>

                  <p>
                    Generate a trip and click
                    "Save Trip" to see it here.
                  </p>

                </div>
              )}

            </div>
          )}

        </div>

        {/* =================================================
            TRIP HISTORY
        ================================================= */}

        <div className="trip-history-wrapper">

          <button
            type="button"
            className="history-btn"
            onClick={() => {
              setShowTripHistory(!showTripHistory);
              setShowSavedTrips(false);
            }}
          >
            📚 History ({tripHistory.length})
          </button>

          {showTripHistory && (
            <div className="trip-history-panel">

              <div className="trip-history-header">

                <div>
                  <h2>📚 Trip History</h2>
                  <p>Your previously generated trips</p>
                </div>

                <button
                  type="button"
                  className="close-history-btn"
                  onClick={() =>
                    setShowTripHistory(false)
                  }
                >
                  ✕
                </button>

              </div>

              {tripHistory.length === 0 ? (
                <div className="empty-history">

                  <div className="empty-history-icon">
                    🗺️
                  </div>

                  <h3>No trips yet</h3>

                  <p>
                    Generate your first trip and it will
                    appear here.
                  </p>

                </div>
              ) : (
                <div className="history-list">

                  {tripHistory.map((trip) => (
                    <div
                      className="history-card"
                      key={trip.id}
                    >

                      <div className="history-card-top">

                        <div>

                          <h3>
                            📍 {trip.destination}
                          </h3>

                          <p>
                            {trip.days} days •{" "}
                            {trip.travelType}
                          </p>

                          <span className="history-date">
                            {new Date(
                              trip.createdAt
                            ).toLocaleDateString()}
                          </span>

                        </div>

                        <button
                          type="button"
                          className="history-favorite-btn"
                          onClick={() =>
                            toggleHistoryFavorite(
                              trip.id
                            )
                          }
                          title="Favorite"
                        >
                          {trip.favorite
                            ? "❤️"
                            : "🤍"}
                        </button>

                      </div>

                      <div className="history-card-actions">

                        <button
                          type="button"
                          className="history-view-btn"
                          onClick={() =>
                            loadHistoryTrip(trip)
                          }
                        >
                          👀 View Trip
                        </button>

                        <button
                          type="button"
                          className="history-delete-btn"
                          onClick={() =>
                            deleteHistoryTrip(trip.id)
                          }
                        >
                          🗑️ Delete
                        </button>

                      </div>

                    </div>
                  ))}

                </div>
              )}

            </div>
          )}

        </div>

        <button
          className="nav-button"
          onClick={() =>
            document
              .getElementById("planner")
              ?.scrollIntoView({
                behavior: "smooth",
              })
          }
        >
          Start Planning
        </button>

      </nav>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className="hero"
        id="home"
      >

        <div className="hero-content">

          <div className="hero-icon">
            ✈️
          </div>

          <h1>
            AI Smart Tourist Planner
          </h1>

          <p>
            Plan your perfect trip with the power of Artificial Intelligence.
          </p>

          <button
            className="hero-button"
            onClick={() =>
              document
                .getElementById("planner")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            Plan My Trip →
          </button>

        </div>

      </section>

      {/* =====================================================
          PLANNER
      ===================================================== */}

      <section
        className="planner-section"
        id="planner"
      >

        <div className="planner-card">

          <div className="section-heading">

            <span>🧳</span>

            <div>

              <h2>
                Create Your Travel Plan
              </h2>

              <p>
                Tell us about your trip and AI will create your itinerary.
              </p>

            </div>

          </div>

          {/* Destination */}

          <div className="form-group">

            <label>
              📍 Destination
            </label>

            <div className="destination-input-wrapper">

              <input
                type="text"
                placeholder="Enter destination e.g. Goa"
                value={destination}
                onChange={(e) => {
                  setDestination(
                    e.target.value
                  );
                  setShowSuggestions(true);
                }}
                onFocus={() =>
                  setShowSuggestions(true)
                }
              />

              {showSuggestions &&
                destination.trim() !== "" &&
                filteredDestinations.length > 0 && (

                  <div className="destination-suggestions">

                    {filteredDestinations.map(
                      (place) => (

                        <button
                          type="button"
                          key={place}
                          className="destination-suggestion"
                          onClick={() => {
                            setDestination(
                              place
                            );
                            setShowSuggestions(
                              false
                            );
                          }}
                        >
                          📍 {place}
                        </button>

                      )
                    )}

                  </div>

                )}

            </div>

          </div>

          {/* Days + Budget */}

          <div className="two-columns">

            <div className="form-group">

              <label>
                📅 Number of Days
              </label>

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

              <label>
                💰 Budget (₹)
              </label>

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

            <label>
              👥 Travel Type
            </label>

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

              {interestOptions.map(
                (interest) => (

                  <button
                    type="button"
                    key={interest}
                    className={`interest-option ${
                      interests.includes(
                        interest
                      )
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      toggleInterest(
                        interest
                      )
                    }
                  >

                    <span>
                      {interests.includes(
                        interest
                      )
                        ? "✓"
                        : "＋"}
                    </span>

                    {interest}

                  </button>

                )
              )}

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

      {/* =====================================================
          TRIP RESULT
      ===================================================== */}

      {tripPlan && (

        <section className="result-section">

          <div className="result-card">

            <div className="result-title">

              <span>
                🗺️
              </span>

              <div>

                <h2>
                  Your AI Travel Plan
                </h2>

                <p>
                  {destination} • {days} days • ₹{budget}
                </p>

              </div>

            </div>

            {/* =================================================
                WEATHER
            ================================================= */}

            {weatherLoading && (
              <div className="weather-card weather-loading">
                🌦️ Checking current weather...
              </div>
            )}

            {weather && (
              <div className="weather-card">

                <div className="weather-heading">

                  <span>🌤️</span>

                  <div>

                    <h3>
                      Current Weather
                    </h3>

                    <p>
                      📍 {weather.city}, {weather.country}
                    </p>

                  </div>

                </div>

                <div className="weather-details">

                  <div className="weather-item">

                    <span className="weather-icon">
                      🌡️
                    </span>

                    <div>

                      <small>
                        Temperature
                      </small>

                      <strong>
                        {weather.temperature}°C
                      </strong>

                    </div>

                  </div>

                  <div className="weather-item">

                    <span className="weather-icon">
                      ☁️
                    </span>

                    <div>

                      <small>
                        Condition
                      </small>

                      <strong>
                        {weather.condition}
                      </strong>

                    </div>

                  </div>

                  <div className="weather-item">

                    <span className="weather-icon">
                      🌡️
                    </span>

                    <div>

                      <small>
                        Feels Like
                      </small>

                      <strong>
                        {weather.feelsLike}°C
                      </strong>

                    </div>

                  </div>

                  <div className="weather-item">

                    <span className="weather-icon">
                      💨
                    </span>

                    <div>

                      <small>
                        Wind
                      </small>

                      <strong>
                        {weather.wind} km/h
                      </strong>

                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* =================================================
                INTERACTIVE MAP
            ================================================= */}

            <div className="map-card">

              <div className="map-heading">

                <span>🗺️</span>

                <div>

                  <h3>
                    Explore Destination
                  </h3>

                  <p>
                    📍 Explore {destination} on the map
                  </p>

                </div>

              </div>

              <div className="map-container">

                <iframe
                  src={`https://www.google.com/maps?q=${encodeURIComponent(
                    destination
                  )}&output=embed`}
                  title={`Map of ${destination}`}
                  loading="lazy"
                  allowFullScreen
                ></iframe>

              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  destination
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="map-button"
              >
                📍 Open in Google Maps
              </a>

            </div>

            <div className="map-place-options">

              <p className="map-place-title">
                🔎 Explore Places in {destination}
              </p>

              <div className="map-place-buttons">

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `beaches in ${destination}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🏖️ Beaches
                </a>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `restaurants in ${destination}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🍴 Restaurants
                </a>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `tourist places in ${destination}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🏛️ Tourist Places
                </a>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `shopping places in ${destination}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🛍️ Shopping
                </a>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `hotels in ${destination}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🏨 Hotels
                </a>

              </div>

            </div>

            {/* =================================================
                ITINERARY
            ================================================= */}

            <div className="trip-plan">

              {renderTripPlan()}

            </div>

            {/* =================================================
                RESULT ACTION BUTTONS
            ================================================= */}

            <div className="result-actions">

              {/* SAVE */}

              <button
                type="button"
                className="save-trip-button"
                onClick={
                  isCurrentTripSaved
                    ? removeSavedTrip
                    : saveTrip
                }
              >
                {isCurrentTripSaved
                  ? "⭐ Trip Saved"
                  : "☆ Save Trip"}
              </button>

              {/* FAVORITE */}

              <button
                type="button"
                className={`favorite-button ${
                  isCurrentTripFavorite
                    ? "favorite-active"
                    : ""
                }`}
                onClick={toggleFavorite}
              >
                {isCurrentTripFavorite
                  ? "❤️ Favorite"
                  : "♡ Favorite"}
              </button>

              {/* DOWNLOAD */}

              <button
                type="button"
                className="download-button"
                onClick={downloadPDF}
              >
                📄 Download Itinerary
              </button>

              {/* PLAN ANOTHER */}

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

      {/* =====================================================
          FEATURES
      ===================================================== */}

      <section
        className="features-section"
        id="features"
      >

        <div className="section-title">

          <h2>
            Why Use AI Tourist Planner?
          </h2>

          <p>
            Everything you need to create a better travel experience.
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
              Get personalized travel plans generated using artificial intelligence.
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
              Plan your trip according to your available travel budget.
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
              Select your interests and receive recommendations made for you.
            </p>

          </div>

        </div>

      </section>

      {/* =====================================================
          ABOUT
      ===================================================== */}

      <section
        className="about-section"
        id="about"
      >

        <h2>
          About AI Tourist Planner
        </h2>

        <p>
          AI Tourist Planner helps travelers create personalized itineraries
          based on destination, budget, travel duration, travel type, and
          interests.
        </p>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer>

        <p>
          © 2026 AI Tourist Planner. Plan smarter. Travel better. 🌍
        </p>

      </footer>

    </div>
  );
}

export default App;