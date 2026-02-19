// admin-app.js - Bennet Salon (VERSIÓN CON UN SOLO BOTÓN - CANCELAR)

const SUPABASE_URL = 'https://bjpzdeixwkgpiqdjwclk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqcHpkZWl4d2tncGlxZGp3Y2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NTUxMjIsImV4cCI6MjA4NzAzMTEyMn0.cJXxeKEj47kCir8lC91YWonuo7XN8UytBn58ki_cWoU';

const TABLE_NAME = 'bennet.salon';

// 🔥 IMPORTAR FUNCIONES DE API.JS (ASUMIMOS QUE ESTÁN DISPONIBLES)
// updateBookingStatus debe estar definida en api.js

function AdminApp() {
    const [bookings, setBookings] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [filterDate, setFilterDate] = React.useState('');

    const fetchBookings = async () => {
        setLoading(true);
        const data = await getAllBookings();
        data.sort((a, b) => {
            if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
            return a.hora_inicio.localeCompare(b.hora_inicio);
        });
        setBookings(data);
        setLoading(false);
    };

    React.useEffect(() => {
        fetchBookings();
    }, []);

    // 🔥 FUNCIÓN SOLO PARA CANCELAR (basada en la que funciona)
    const handleCancel = async (id, bookingData) => {
        if (!confirm(`¿Cancelar turno de ${bookingData.cliente_nombre}?`)) return;
        
        try {
            // Usar la función que sí funciona (updateBookingStatus)
            await updateBookingStatus(id, 'Cancelado');
            
            // WhatsApp
            const phone = bookingData.cliente_whatsapp;
            const msg = `❌ Turno cancelado\n\n${bookingData.cliente_nombre}, tu turno del ${bookingData.fecha} a las ${bookingData.hora_inicio} fue cancelado.`;
            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
            
            fetchBookings();
            alert('✅ Turno cancelado');
        } catch (error) {
            alert('Error al cancelar');
        }
    };

    const filteredBookings = filterDate 
        ? bookings.filter(b => b.fecha === filterDate)
        : bookings;

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Panel Admin - Bennet Salon
                    </h1>
                    <button onClick={fetchBookings} className="p-2 bg-gray-100 rounded-full">
                        <div className="icon-refresh-cw"></div>
                    </button>
                </div>

                {/* Filtro */}
                <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4">
                    <input 
                        type="date" 
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2"
                    />
                    {filterDate && (
                        <button onClick={() => setFilterDate('')} className="text-sm text-red-500">
                            Limpiar
                        </button>
                    )}
                </div>

                {/* Lista */}
                {loading ? (
                    <div className="text-center py-12">Cargando...</div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr>
                                    <th className="p-4">Fecha/Hora</th>
                                    <th className="p-4">Cliente</th>
                                    <th className="p-4">WhatsApp</th>
                                    <th className="p-4">Servicio</th>
                                    <th className="p-4">Estado</th>
                                    <th className="p-4">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBookings.map(booking => (
                                    <tr key={booking.id}>
                                        <td className="p-4">
                                            {booking.fecha} {booking.hora_inicio}
                                        </td>
                                        <td className="p-4">{booking.cliente_nombre}</td>
                                        <td className="p-4">{booking.cliente_whatsapp}</td>
                                        <td className="p-4">{booking.servicio}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                                ${booking.estado === 'Confirmado' ? 'bg-green-100 text-green-700' : 
                                                  booking.estado === 'Cancelado' ? 'bg-red-100 text-red-700' : 
                                                  'bg-yellow-100 text-yellow-700'}`}>
                                                {booking.estado}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {booking.estado === 'Reservado' && (
                                                <button 
                                                    onClick={() => handleCancel(booking.id, booking)}
                                                    className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                                >
                                                    Cancelar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AdminApp />);