// components/Calendar.js - Bennet Salon (CORREGIDO)

function Calendar({ onDateSelect, selectedDate }) {
    const [currentDate, setCurrentDate] = React.useState(new Date());
    
    // Obtener fecha de HOY a las 00:00
    const getToday = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    };

    // Fecha de MAÑANA (primer día disponible)
    const getTomorrow = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow;
    };

    // Verificar si una fecha es PASADA (antes de hoy)
    const isPastDate = (date) => {
        const today = getToday();
        return date < today; // Fechas menores a hoy = pasadas
    };

    // Verificar si es DOMINGO (cerrado)
    const isSunday = (date) => {
        return date && date.getDay() === 0;
    };

    const nextMonth = () => {
        const next = new Date(currentDate);
        next.setMonth(currentDate.getMonth() + 1);
        setCurrentDate(next);
    };

    const prevMonth = () => {
        const prev = new Date(currentDate);
        prev.setMonth(currentDate.getMonth() - 1);
        setCurrentDate(prev);
    };

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }

    const formatDate = (date) => {
        if (!date) return '';
        const y = date.getFullYear();
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const d = date.getDate().toString().padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const isSelected = (date) => {
        return date && selectedDate === formatDate(date);
    };

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    return (
        <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <div className="icon-calendar text-pink-500"></div>
                2. Seleccioná una fecha
            </h2>
            
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-100">
                    <button onClick={prevMonth} className="p-2 hover:bg-white rounded-full transition-colors text-gray-600">
                        <div className="icon-chevron-left"></div>
                    </button>
                    <span className="font-bold text-gray-800 text-lg capitalize">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </span>
                    <button onClick={nextMonth} className="p-2 hover:bg-white rounded-full transition-colors text-gray-600">
                        <div className="icon-chevron-right"></div>
                    </button>
                </div>

                <div className="p-4">
                    <div className="grid grid-cols-7 mb-2 text-center">
                        {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
                            <div key={i} className={`text-xs font-medium py-1 ${d === 'D' ? 'text-red-400' : 'text-gray-400'}`}>{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {days.map((date, idx) => {
                            if (!date) return <div key={idx} className="h-10"></div>;
                            
                            const past = isPastDate(date);
                            const sunday = isSunday(date);
                            const selected = isSelected(date);
                            
                            // Un día está disponible si  es pasado y NO es domingo
                            const available = !past && !sunday;
                            
                            let dayStyle = "h-10 w-full flex items-center justify-center rounded-lg text-sm font-medium transition-all";
                            
                            if (selected) {
                                dayStyle += " bg-gray-900 text-white shadow-md scale-105";
                            } else if (!available) {
                                dayStyle += " text-gray-300 cursor-not-allowed bg-gray-50 line-through decoration-gray-400";
                            } else {
                                dayStyle += " text-gray-700 hover:bg-pink-50 hover:text-pink-600 cursor-pointer";
                            }
                            
                            return (
                                <button
                                    key={idx}
                                    onClick={() => available && onDateSelect(formatDate(date))}
                                    disabled={!available}
                                    className={dayStyle}
                                >
                                    {date.getDate()}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
            
            {/* Mensaje informativo */}
            <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
                <span className="font-medium">📅 Disponible desde:</span> mañana
            </div>
        </div>
    );
}