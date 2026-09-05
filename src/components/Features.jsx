function Features() {
  const features = [
    {
      icon: "🤖",
      title: "AI-Powered Itinerary",
      description:
        "Get a personalized day-by-day travel plan based on your destination, interests, and travel style.",
    },
    {
      icon: "💰",
      title: "Smart Budget Planning",
      description:
        "Plan your trip according to your budget with estimated expenses for hotels, food, and transportation.",
    },
    {
      icon: "🗺️",
      title: "Personalized Recommendations",
      description:
        "Discover tourist attractions, local experiences, food, and activities that match your preferences.",
    },
    {
      icon: "🎒",
      title: "Travel Essentials",
      description:
        "Get useful packing suggestions, travel tips, and important things to remember before your journey.",
    },
  ];

  return (
    <section className="features-section" id="features">

      <div className="section-heading">
        <span>WHY CHOOSE US</span>

        <h2>
          Everything You Need for
          <strong> a Better Trip</strong>
        </h2>

        <p>
          Let AI handle the planning while you focus on
          enjoying your journey.
        </p>
      </div>

      <div className="features-grid">
        {features.map((feature, index) => (
          <div className="feature-card" key={index}>

            <div className="feature-icon">
              {feature.icon}
            </div>

            <h3>{feature.title}</h3>

            <p>{feature.description}</p>

            <span className="feature-arrow">
              Learn more →
            </span>

          </div>
        ))}
      </div>

    </section>
  );
}

export default Features;