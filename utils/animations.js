function useIntersectionObserver() {
    try {
        React.useEffect(() => {
            const observerCallback = (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.visibility = 'visible';
                    }
                });
            };

            const observerOptions = {
                root: null,
                rootMargin: '0px',
                threshold: 0.1
            };

            const observer = new IntersectionObserver(observerCallback, observerOptions);
            const animatedElements = document.querySelectorAll('.animate-fade-in, .animate-fade-in-up, .animate-scale-in, .animate-slide-in-left, .animate-slide-in-right');

            animatedElements.forEach(element => {
                element.style.visibility = 'hidden';
                observer.observe(element);
            });

            return () => observer.disconnect();
        }, []);
    } catch (error) {
        reportError(error);
    }
}
