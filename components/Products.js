function Products() {
    const products = [
        {
            id: 1,
            name: "Ethiopian Yirgacheffe",
            description: "Bright, floral notes with citrus undertones",
            price: 19.99,
            image: "https://app.trickle.so/storage/public/images/usr_0a2701f050000001/86de8b67-8170-4881-bb76-1049f25c4261.png",
            stripeLink: "https://buy.stripe.com/test_yourlink1"
        },
        {
            id: 2,
            name: "Nicaragua",
            description: "Full-bodied with caramel sweetness",
            price: 19.99,
            image: "https://app.trickle.so/storage/public/images/usr_0a2701f050000001/a2b75407-6d18-40aa-8758-8eee4eb5ef5b.png",
            stripeLink: "https://buy.stripe.com/test_yourlink2"
        },
        {
            id: 3,
            name: "Decaf Colombia",
            description: "Sweet and balanced with chocolate notes",
            price: 19.99,
            image: "https://app.trickle.so/storage/public/images/usr_0a2701f050000001/1c6a5839-6ec0-40a3-9eee-44c8fc423a29.png",
            stripeLink: "https://buy.stripe.com/test_yourlink3"
        },
        {
            id: 4,
            name: "Vagabond Blend",
            description: "Bold and complex with a smooth finish",
            price: 19.99,
            image: "https://app.trickle.so/storage/public/images/usr_0a2701f050000001/8e81e053-41b9-4f17-b1dd-d8739e562219.png",
            stripeLink: "https://buy.stripe.com/test_yourlink4"
        }
    ];

    try {
        useIntersectionObserver();

        return (
            <section id="products" className="section" data-name="products-section">
                <div className="container">
                    <h2 className="text-4xl font-bold text-center mb-12 animate-fade-in-up" data-name="products-title">
                        Our Coffee Selection
                    </h2>
                    <div className="product-grid">
                        {products.map((product, index) => (
                            <div key={product.id} 
                                 className={`product-card animate-scale-in delay-${index * 200}`}
                                 data-name={`product-${product.id}`}>
                                <img src={product.image} 
                                     alt={product.name} 
                                     className="product-image" />
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                                    <p className="text-gray-600 mb-4">{product.description}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-bold">${product.price}</span>
                                        <a href={product.stripeLink} 
                                           className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors"
                                           data-name={`buy-button-${product.id}`}>
                                            Buy Now
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    } catch (error) {
        reportError(error);
        return null;
    }
}
