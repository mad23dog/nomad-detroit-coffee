function Header() {
    try {
        const [isMenuOpen, setIsMenuOpen] = React.useState(false);
        
        const handleNavClick = (e, sectionId) => {
            e.preventDefault();
            scrollToElement(sectionId);
            setIsMenuOpen(false);
        };

        const toggleMenu = () => {
            setIsMenuOpen(!isMenuOpen);
        };

        React.useEffect(() => {
            const handleResize = () => {
                if (window.innerWidth > 768 && isMenuOpen) {
                    setIsMenuOpen(false);
                }
            };

            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }, [isMenuOpen]);

        const navLinks = [
            { href: '#products', text: 'Products', id: 'products' },
            { href: '#about', text: 'About', id: 'about' },
            { href: '#locations', text: 'Locations', id: 'locations' },
            { href: '#contact', text: 'Contact', id: 'contact' }
        ];

        return (
            <header className="header" data-name="header">
                <div className="container px-0">
                    <nav className="flex items-center justify-between h-14">
                        <div className="flex items-center" data-name="left-section">
                            <div className="logo-container" data-name="logo-container">
                                <a href="/" 
                                   onClick={(e) => handleNavClick(e, 'hero')}
                                   className="flex items-center" 
                                   data-name="logo-link">
                                    <img src="https://app.trickle.so/storage/public/images/usr_0a2701f050000001/dfb1f7db-483b-4252-99c3-e8c34fb8f240.png" 
                                         alt="Nomad Detroit Coffee Logo" 
                                         className="logo-image"
                                         data-name="logo-image" />
                                </a>
                            </div>
                            <div className="company-title ml-8" data-name="company-title">
                                Nomad Detroit Coffee
                            </div>
                        </div>
                        
                        {/* Desktop Navigation */}
                        <div className="hidden md:flex space-x-3" data-name="desktop-nav">
                            {navLinks.map(link => (
                                <a key={link.id}
                                   href={link.href}
                                   onClick={(e) => handleNavClick(e, link.id)}
                                   className="nav-link"
                                   data-name={`${link.id}-link`}>
                                    {link.text}
                                </a>
                            ))}
                        </div>

                        {/* Mobile Menu Button */}
                        <button 
                            className="md:hidden p-2 focus:outline-none"
                            onClick={toggleMenu}
                            aria-label="Toggle menu"
                            data-name="mobile-menu-button"
                        >
                            <div className={`hamburger-icon ${isMenuOpen ? 'open' : ''}`}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </button>
                    </nav>

                    {/* Mobile Navigation */}
                    <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`} data-name="mobile-menu">
                        {navLinks.map(link => (
                            <a key={link.id}
                               href={link.href}
                               onClick={(e) => handleNavClick(e, link.id)}
                               className="mobile-nav-link"
                               data-name={`mobile-${link.id}-link`}>
                                {link.text}
                            </a>
                        ))}
                    </div>
                </div>
            </header>
        );
    } catch (error) {
        reportError(error);
        return null;
    }
}
