function Calendar() {
    try {
        const [selectedDates, setSelectedDates] = React.useState([]);
        const [isAdmin, setIsAdmin] = React.useState(false);
        const [currentDate, setCurrentDate] = React.useState(new Date());

        React.useEffect(() => {
            // Load saved market dates
            const savedDates = localStorage.getItem('marketDates');
            if (savedDates) {
                setSelectedDates(JSON.parse(savedDates).map(date => new Date(date)));
            }

            // Check admin status
            const checkAdminStatus = () => {
                const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
                setIsAdmin(isAdminLoggedIn);
            };

            checkAdminStatus();
            window.addEventListener('adminLoginChanged', checkAdminStatus);

            return () => {
                window.removeEventListener('adminLoginChanged', checkAdminStatus);
            };
        }, []);

        const getDaysInMonth = (date) => {
            const year = date.getFullYear();
            const month = date.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const firstDayOfMonth = new Date(year, month, 1).getDay();
            return { daysInMonth, firstDayOfMonth };
        };

        const isSaturday = (date) => {
            return date.getDay() === 6;
        };

        const isSelected = (date) => {
            return selectedDates.some(selectedDate => 
                selectedDate.getDate() === date.getDate() &&
                selectedDate.getMonth() === date.getMonth() &&
                selectedDate.getFullYear() === date.getFullYear()
            );
        };

        const handleDateClick = (date) => {
            if (!isAdmin || !isSaturday(date)) return;

            const dateExists = selectedDates.some(selectedDate => 
                selectedDate.getDate() === date.getDate() &&
                selectedDate.getMonth() === date.getMonth() &&
                selectedDate.getFullYear() === date.getFullYear()
            );

            const newSelectedDates = dateExists
                ? selectedDates.filter(selectedDate => 
                    selectedDate.getDate() !== date.getDate() ||
                    selectedDate.getMonth() !== date.getMonth() ||
                    selectedDate.getFullYear() !== date.getFullYear()
                )
                : [...selectedDates, date];

            setSelectedDates(newSelectedDates);
            localStorage.setItem('marketDates', JSON.stringify(newSelectedDates));
        };

        const changeMonth = (increment) => {
            const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1);
            setCurrentDate(newDate);
        };

        const renderCalendar = () => {
            const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentDate);
            const days = [];
            const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

            // Add empty cells for days before the first day of the month
            for (let i = 0; i < firstDayOfMonth; i++) {
                days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
            }

            // Add cells for each day of the month
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                const isSaturdayDay = isSaturday(date);
                const isSelectedDay = isSelected(date);
                const dayClass = isSaturdayDay 
                    ? isSelectedDay 
                        ? 'at-market' 
                        : 'saturday'
                    : '';

                days.push(
                    <div
                        key={day}
                        onClick={() => handleDateClick(date)}
                        className={`calendar-day ${dayClass} ${isAdmin && isSaturdayDay ? 'cursor-pointer hover:opacity-75' : ''}`}
                        data-name={`calendar-day-${day}`}
                    >
                        {day}
                    </div>
                );
            }

            return (
                <div className="calendar-grid" data-name="calendar-grid">
                    {weekdays.map(day => (
                        <div key={day} className="calendar-weekday" data-name={`weekday-${day}`}>
                            {day}
                        </div>
                    ))}
                    {days}
                </div>
            );
        };

        return (
            <div className="calendar-container" data-name="calendar">
                <div className="calendar-header" data-name="calendar-header">
                    <button 
                        onClick={() => changeMonth(-1)}
                        className="month-nav-btn"
                        data-name="prev-month"
                    >
                        ‹
                    </button>
                    <h3 className="calendar-title">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button 
                        onClick={() => changeMonth(1)}
                        className="month-nav-btn"
                        data-name="next-month"
                    >
                        ›
                    </button>
                </div>
                {renderCalendar()}
                <div className="calendar-legend" data-name="calendar-legend">
                    <div className="legend-item">
                        <div className="legend-color at-market"></div>
                        <span>Days at Market</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color saturday"></div>
                        <span>Saturdays</span>
                    </div>
                </div>
                {isAdmin && (
                    <div className="mt-4 text-sm text-gray-600" data-name="admin-instructions">
                        Click on Saturdays to toggle market presence
                    </div>
                )}
            </div>
        );
    } catch (error) {
        reportError(error);
        return null;
    }
}
