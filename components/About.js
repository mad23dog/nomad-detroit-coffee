function About() {
    try {
        useIntersectionObserver();

        return (
            <section id="about" className="section bg-white" data-name="about-section">
                <div className="container">
                    <h2 className="text-4xl font-bold text-center mb-12 animate-fade-in-up" data-name="about-title">
                        Our Story
                    </h2>
                    <div className="max-w-3xl mx-auto text-lg text-gray-600 text-center">
                        <p className="animate-fade-in-up delay-200 leading-relaxed" data-name="story">
                            We founded Nomad Detroit Coffee in 2018 rooted in on our shared love and curiosity of coffee 
                            and the journey it takes from earth to cup. Blending together craft and data we artistically 
                            roast in small batches ensuring a perfect brewed cup aimed to transport you to the corner of 
                            the world from which it originates. Coffee in its variety of shapes, sizes, density, aroma, 
                            and flavor is a perfect representation of the diversity of the world we call home. To that end, 
                            we hope and encourage you to enjoy this coffee in whichever way you choose, pour over, drip, 
                            french press, espresso... cream, sugar, or black. However you like it is exactly the way we like it.
                        </p>
                    </div>
                </div>
            </section>
        );
    } catch (error) {
        reportError(error);
        return null;
    }
}
