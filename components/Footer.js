function Footer() {
    try {
        const [showAdmin, setShowAdmin] = React.useState(false);

        const handleAdminClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowAdmin(!showAdmin);
        };

        return (
            <footer className="footer" data-name="footer">
                <div className="container">
                    <div className="footer-links">
                        <div data-name="company-info">
                            <h3 className="footer-title">Nomad Detroit Coffee</h3>
                            <p>Wandering the world through coffee since 2018.</p>
                            <p className="mt-4">Our mission is to bring the finest global coffee experiences to your cup.</p>
                        </div>
                        <div data-name="contact-info">
                            <h3 className="footer-title">Contact</h3>
                            <p>123 Coffee Street</p>
                            <p>Detroit, MI 48201</p>
                            <a href="tel:+13135555555" className="block">
                                (313) 555-5555
                            </a>
                            <a href="mailto:hello@nomaddetroit.coffee" 
                               className="hover:text-black transition-colors"
                               data-name="footer-email">
                                hello@nomaddetroit.coffee
                            </a>
                        </div>
                        <div data-name="social-links">
                            <h3 className="footer-title">Follow Us</h3>
                            <div className="space-y-2">
                                <a href="https://instagram.com/nomaddetroit" 
                                   target="_blank" 
                                   className="block hover:text-black transition-colors"
                                   data-name="instagram-link">
                                    Instagram
                                </a>
                                <a href="https://facebook.com/nomaddetroit" 
                                   target="_blank" 
                                   className="block hover:text-black transition-colors"
                                   data-name="facebook-link">
                                    Facebook
                                </a>
                                <a href="https://twitter.com/nomaddetroit" 
                                   target="_blank" 
                                   className="block hover:text-black transition-colors"
                                   data-name="twitter-link">
                                    Twitter
                                </a>
                            </div>
                        </div>
                        <div data-name="hours-info">
                            <h3 className="footer-title">Market Hours</h3>
                            <p>Royal Oak Farmers Market</p>
                            <p>Saturday: 7am - 1pm</p>
                            <p className="mt-4">Check calendar for dates</p>
                        </div>
                    </div>
                    <div className="copyright" data-name="copyright">
                        <div>© 2024 Nomad Detroit Coffee. All rights reserved.</div>
                        <div className="mt-2">
                            <button 
                                onClick={handleAdminClick}
                                className="text-gray-500 hover:text-black text-sm transition-colors bg-transparent border-none cursor-pointer"
                                data-name="admin-link">
                                Admin
                            </button>
                        </div>
                    </div>
                    {showAdmin && (
                        <div className="mt-8" data-name="admin-section">
                            <AdminLogin />
                        </div>
                    )}
                </div>
            </footer>
        );
    } catch (error) {
        reportError(error);
        return null;
    }
}
