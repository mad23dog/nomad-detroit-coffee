function Contact() {
    try {
        useIntersectionObserver();

        return (
            <section id="contact" className="section bg-white" data-name="contact-section">
                <div className="container">
                    <h2 className="text-4xl font-bold text-center mb-12 animate-fade-in-up" data-name="contact-title">
                        Get in Touch
                    </h2>
                    <div className="max-w-xl mx-auto text-center">
                        <div className="space-y-6">
                            <div className="animate-fade-in-up delay-200">
                                <h3 className="text-xl font-semibold mb-2">General Inquiries</h3>
                                <p>
                                    <a href="mailto:hello@nomaddetroit.coffee" 
                                       className="text-blue-600 hover:text-blue-800"
                                       data-name="email-link">
                                        hello@nomaddetroit.coffee
                                    </a>
                                </p>
                            </div>
                            <div className="animate-fade-in-up delay-400">
                                <h3 className="text-xl font-semibold mb-2">Wholesale Orders</h3>
                                <p>
                                    <a href="mailto:wholesale@nomaddetroit.coffee" 
                                       className="text-blue-600 hover:text-blue-800"
                                       data-name="wholesale-link">
                                        wholesale@nomaddetroit.coffee
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    } catch (error) {
        reportError(error);
        return null;
    }
}

function App() {
    try {
        return (
            <div data-name="app">
                <Header />
                <Hero />
                <Products />
                <About />
                <Locations />
                <Contact />
                <Footer />
            </div>
        );
    } catch (error) {
        reportError(error);
        return null;
    }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
