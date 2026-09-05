function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: "📝",
      title: "Enter Your Preferences",
      description:
        "Tell us your destination, number of days, budget, interests, and preferred travel style.",
    },
    {
      number: "02",
      icon: "🤖",
      title: "AI Creates Your Plan",
      description:
        "Our AI analyzes your preferences and creates a personalized day-by-day travel itinerary.",
    },
    {
      number: "03",
      icon: "✈️",
      title: "Enjoy Your Journey",
      description:
        "Follow your personalized plan, discover new places, and enjoy a stress-free travel experience.",
    },
  ];

  return (
    <section className="how-section" id="how-it-works">

      <div className="section-heading">
        <span>HOW IT WORKS</span>

        <h2>
          Plan Your Trip in
          <strong> 3 Simple Steps</strong>
        </h2>

        <p>
          No complicated planning. Just enter your preferences
          and let AI do the work.
        </p>
      </div>

      <div className="steps-container">

        {steps.map((step, index) => (
          <div className="step-wrapper" key={step.number}>

            <div className="step-card">

              <div className="step-number">
                {step.number}
              </div>

              <div className="step-icon">
                {step.icon}
              </div>

              <h3>{step.title}</h3>

              <p>{step.description}</p>

            </div>

            {index < steps.length - 1 && (
              <div className="step-arrow">
                →
              </div>
            )}

          </div>
        ))}

      </div>

    </section>
  );
}

export default HowItWorks;