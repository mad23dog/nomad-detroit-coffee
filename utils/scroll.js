function scrollToElement(elementId) {
    try {
        const element = document.getElementById(elementId);
        if (element) {
            const headerOffset = 64; // Height of the fixed header
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    } catch (error) {
        reportError(error);
    }
}
