// components/TimeSlots.js - Bennet Salon (COMPLETO)

function TimeSlots({ service, date, onTimeSelect, selectedTime }) {
    const [slots, setSlots] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        if (!service || !date) return;

        const loadSlots = async () => {
            setLoading(true);
            setError(null);
            try {
                // 1. Generar los 2 turnos base (8 AM y 2 PM)
                const baseSlots = generateBaseSlots(service.duration);
                
                // 2. Obtener turnos de Supabase para esta fecha (solo no cancelados)
                const response = await fetch(
                    `https://bjpzdeixwkgpiqdjwclk.supabase.co/rest/v1/bennet.salon?fecha=eq.${date}&estado=neq.Cancelado&select=*`,
                    {
                        headers: {
                            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqcHpkZWl4d2tncGlxZGp3Y2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NTUxMjIsImV4cCI6MjA4NzAzMTEyMn0.cJXxeKEj47kCir8lC91YWonuo7XN8UytBn58ki_cWoU'
                        }
                    }
                );
                
                if (!response.ok) {
                    throw new Error('Error al cargar turnos');
                }
                
                const bookings = await response.json();
                
                // 3. Filtrar horarios ocupados
                let available = filterAvailableSlots(baseSlots, service.duration, bookings);
                
                // 4. Verificar si es hoy para filtrar horas pasadas
                const today = new Date();
                const todayStr = today.toISOString().split('T')[0];
                const isToday = date === todayStr;
                
                if (isToday) {
                    available = available.filter(time => !isTimePast(time));
                }
                
                setSlots(available);
            } catch (err) {
                console.error(err);
                setError("Error al cargar horarios");
            } finally {
                setLoading(false);
            }
        };

        loadSlots();
    }, [service, date]);

    // Función para verificar si una hora ya pasó (solo para hoy)
    const isTimePast = (timeStr24) => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        const [slotHour, slotMinute] = timeStr24.split(':').map(Number);
        
        if (slotHour < currentHour) return true;
        if (slotHour === currentHour && slotMinute < currentMinute) return true;
        return false;
    };

    if (!service || !date) return null;

    return (
        <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <div className="icon-clock text-pink-500"></div>
                3. Elegí un horario
            </h2>

            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
            ) : slots.length === 0 ? (
                <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="icon-calendar-x text-3xl text-gray-400 mb-2 mx-auto"></div>
                    <p className="text-gray-600">No hay horarios disponibles para esta fecha.</p>
                    <p className="text-sm text-gray-400 mt-1">Por favor, seleccioná otro día.</p>
                </div>
            ) : (
                <>
                    <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded-lg flex items-center gap-2">
                        <div className="icon-info"></div>
                        <span>⏰ Horarios disponibles: 8:00 AM y 2:00 PM</span>
                    </div>
                    
                    {date === new Date().toISOString().split('T')[0] && (
                        <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded-lg flex items-center gap-2">
                            <div className="icon-clock text-amber-500"></div>
                            <span>Solo se muestran horarios futuros para hoy</span>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {slots.map(time24h => {
                            const time12h = formatTo12Hour(time24h);
                            return (
                                <button
                                    key={time24h}
                                    onClick={() => onTimeSelect(time24h)}
                                    className={`
                                        py-2 px-3 rounded-lg text-sm font-semibold transition-all shadow-sm
                                        ${selectedTime === time24h
                                            ? 'bg-green-600 text-white ring-2 ring-green-600 ring-offset-1'
                                            : 'bg-white text-green-700 border border-green-200 hover:bg-green-50 hover:border-green-300'}
                                    `}
                                >
                                    {time12h}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}