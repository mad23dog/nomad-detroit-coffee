function Hero() {
    try {
        useIntersectionObserver();
        
        const handleShopNowClick = (e) => {
            e.preventDefault();
            scrollToElement('products');
        };
        
        return (
            <section className="hero" id="hero" data-name="hero">
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title animate-fade-in-up" data-name="hero-title">
                            Wander the World Through Coffee
                        </h1>
                        <p className="hero-subtitle animate-fade-in-up delay-200" data-name="hero-subtitle">
                            Global Flavors, Locally Roasted
                        </p>
                        <a href="#products" 
                           onClick={handleShopNowClick}
                           className="bg-black text-white px-8 py-4 rounded-full text-lg hover:bg-gray-800 transition-colors animate-fade-in-up delay-400"
                           data-name="shop-now-button">
                            Shop Now
                        </a>
                    </div>
                </div>
            </section>
        );
    } catch (error) {
        reportError(error);
        return null;
    }
}
