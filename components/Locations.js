function Locations() {
    try {
        useIntersectionObserver();

        return (
            <section id="locations" className="section bg-gray-50" data-name="locations-section">
                <div className="container">
                    <h2 className="text-4xl font-bold text-center mb-12 animate-fade-in-up" data-name="locations-title">
                        Visit Us
                    </h2>
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white p-8 rounded-lg shadow-sm animate-fade-in-up" data-name="market-location">
                            <div className="flex flex-col md:flex-row md:space-x-8">
                                <div className="flex-1 mb-6 md:mb-0">
                                    <h3 className="text-2xl font-semibold mb-4">Royal Oak Farmers Market</h3>
                                    <p className="mb-2">316 E 11 Mile Rd</p>
                                    <p className="mb-2">Royal Oak, MI 48067</p>
                                    <p className="mb-4">Saturdays: 7am - 1pm</p>
                                    <a href="https://goo.gl/maps/QZ8oKKcEq6vSQ5su6" 
                                       target="_blank" 
                                       className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                                       data-name="market-map-link">
                                        View on Map →
                                    </a>
                                </div>
                                <div className="flex-1">
                                    <Calendar />
                                </div>
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
