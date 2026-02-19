// components/TimeSlots.js - Bennet Salon

function TimeSlots({ service, date, onTimeSelect, selectedTime }) {
    const [slots, setSlots] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        if (!service || !date) return;

        const loadSlots = async () => {
            setLoading(true);
            try {
                // 1. Generar los 2 turnos base (8 AM y 2 PM)
                const baseSlots = generateBaseSlots(service.duration);
                
                // 2. Obtener turnos de Supabase para esta fecha
                // 🔥 IMPORTANTE: Solo los que NO están cancelados
                const response = await fetch(
                    `https://bjpzdeixwkgpiqdjwclk.supabase.co/rest/v1/bennet.salon?fecha=eq.${date}&estado=neq.Cancelado&select=*`,
                    {
                        headers: {
                            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqcHpkZWl4d2tncGlxZGp3Y2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NTUxMjIsImV4cCI6MjA4NzAzMTEyMn0.cJXxeKEj47kCir8lC91YWonuo7XN8UytBn58ki_cWoU'
                        }
                    }
                );
                const bookings = await response.json();
                
                // 3. Filtrar horarios ocupados
                let available = filterAvailableSlots(baseSlots, service.duration, bookings);
                
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

    // ... resto del código (renderizado)
}