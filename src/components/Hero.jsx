import { Link } from "react-router-dom";
function Hero() {
  return (
    <section className="hero" id="home">

      <div className="hero-content">

        <div className="hero-badge">
          ✨ AI-Powered Travel Planning
        </div>

        <h1>
          Plan Your Perfect
          <span> Journey With AI</span>
        </h1>

        <p>
          Tell us where you want to go, your budget, interests,
          and travel style. Our AI creates a personalized travel
          plan for you in seconds.
        </p>

        <div className="hero-buttons">
          <Link to="/planner" className="primary-btn">
             ✨ Start Planning
        </Link>

          <button className="secondary-btn">
            Explore Features →
          </button>
        </div>

        <div className="hero-stats">

          <div>
            <strong>AI</strong>
            <small>Powered Planning</small>
          </div>

          <div>
            <strong>24/7</strong>
            <small>Travel Assistant</small>
          </div>

          <div>
            <strong>100%</strong>
            <small>Personalized</small>
          </div>

        </div>

      </div>


      <div className="hero-visual">

        <div className="travel-card">

          <div className="card-top">
            <span>🌍</span>
            <span>AI Trip</span>
          </div>

          <div className="destination">
            <small>Your next destination</small>
            <h2>Goa, India 🇮🇳</h2>
          </div>

          <div className="trip-info">

            <div>
              <span>📅</span>
              <p>
                <strong>3 Days</strong>
                <small>Duration</small>
              </p>
            </div>

            <div>
              <span>💰</span>
              <p>
                <strong>₹15,000</strong>
                <small>Budget</small>
              </p>
            </div>

          </div>

          <div className="ai-message">
            🤖 Your personalized itinerary is ready!
          </div>

        </div>

        <div className="floating-card card-one">
          🏖️ <span>Beach Trip</span>
        </div>

        <div className="floating-card card-two">
          🍜 <span>Food Guide</span>
        </div>

      </div>

    </section>
  );
}

export default Hero;