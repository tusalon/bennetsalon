// admin-app.js - Bennet Salon (VERSIÓN CON ÍCONOS Y ESTADO CORREGIDO)

const SUPABASE_URL = 'https://bjpzdeixwkgpiqdjwclk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqcHpkZWl4d2tncGlxZGp3Y2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NTUxMjIsImV4cCI6MjA4NzAzMTEyMn0.cJXxeKEj47kCir8lC91YWonuo7XN8UytBn58ki_cWoU';

const TABLE_NAME = 'bennet.salon';

// Cache simple
let cache = {
    allBookings: null,
    allBookingsTimestamp: null
};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Obtener todos los turnos
async function getAllBookings() {
    if (cache.allBookings && (Date.now() - cache.allBookingsTimestamp) < CACHE_DURATION) {
        console.log('📦 Usando cache del admin');
        return cache.allBookings;
    }

    try {
        console.log('🌐 Solicitando turnos para admin...');
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/${encodeURIComponent(TABLE_NAME)}?select=*&order=fecha.desc,hora_inicio.asc`,
            {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (!response.ok) throw new Error('Error fetching bookings');
        
        const data = await response.json();
        console.log('✅ Turnos obtenidos:', data.length);
        
        cache.allBookings = data;
        cache.allBookingsTimestamp = Date.now();
        return data;
    } catch (error) {
        console.error('❌ Error fetching all bookings:', error);
        return cache.allBookings || [];
    }
}

// 🔥 ACTUALIZAR ESTADO (CORREGIDO)
async function updateBookingStatus(id, newStatus) {
    try {
        console.log('🔄 Actualizando turno:', id, 'a', newStatus);
        
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/${encodeURIComponent(TABLE_NAME)}?id=eq.${id}`,
            {
                method: 'PATCH',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation' // Para que devuelva el dato actualizado
                },
                body: JSON.stringify({ estado: newStatus })
            }
        );
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error response:', response.status, errorText);
            throw new Error(`Error updating booking: ${response.status}`);
        }
        
        const updatedData = await response.json();
        console.log('✅ Turno actualizado:', updatedData);
        
        // Limpiar cache
        cache.allBookings = null;
        return { success: true, data: updatedData };
    } catch (error) {
        console.error('❌ Error updating booking:', error);
        throw error;
    }
}

// Componente principal
function AdminApp() {
    const [bookings, setBookings] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [filterDate, setFilterDate] = React.useState('');
    const [message, setMessage] = React.useState({ text: '', type: '' });

    const fetchBookings = async () => {
        setLoading(true);
        setMessage({ text: '', type: '' });
        try {
            const data = await getAllBookings();
            data.sort((a, b) => {
                if (a.fecha > b.fecha) return -1;
                if (a.fecha < b.fecha) return 1;
                return (a.hora_inicio || '').localeCompare(b.hora_inicio || '');
            });
            setBookings(data);
        } catch (error) {
            console.error('Error:', error);
            setMessage({ text: 'Error al cargar turnos', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchBookings();
    }, []);

    // 🔥 MANEJAR CAMBIO DE ESTADO (CORREGIDO)
    const handleStatusChange = async (id, newStatus, bookingData) => {
        if (!confirm(`¿Estás seguro de cambiar el estado a ${newStatus}?`)) return;
        
        setMessage({ text: '', type: '' });
        
        try {
            await updateBookingStatus(id, newStatus);
            
            // Enviar WhatsApp al cliente (opcional)
            const phone = bookingData.cliente_whatsapp;
            let mensaje = "";
            
            if (newStatus === "Confirmado") {
                mensaje = `✅ *TURNO CONFIRMADO* ✅\n\nHola ${bookingData.cliente_nombre}, te confirmamos tu turno en *Bennet Salon*:\n\n📅 *Fecha:* ${bookingData.fecha}\n⏰ *Hora:* ${bookingData.hora_inicio}\n💅 *Servicio:* ${bookingData.servicio} (${bookingData.duracion} min)\n\n📱 Ante cualquier cambio, contactanos al +53 54438629\n\n¡Te esperamos! ✨`;
            } else if (newStatus === "Cancelado") {
                mensaje = `❌ *TURNO CANCELADO* ❌\n\nHola ${bookingData.cliente_nombre}, lamentamos informarte que tu turno del *${bookingData.fecha}* a las *${bookingData.hora_inicio}* ha sido cancelado.\n\nPor favor, contactanos para reagendar:\n📱 +53 54438629\n\nDisculpá las molestias.`;
            }
            
            const encodedMensaje = encodeURIComponent(mensaje);
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            
            if (isIOS) {
                window.location.href = `whatsapp://send?phone=${phone}&text=${encodedMensaje}`;
                setTimeout(() => {
                    window.location.href = `https://wa.me/${phone}?text=${encodedMensaje}`;
                }, 500);
            } else {
                window.open(`https://wa.me/${phone}?text=${encodedMensaje}`, '_blank');
            }
            
            setMessage({ text: `✅ Turno ${newStatus} correctamente`, type: 'success' });
            fetchBookings(); // Recargar la lista
        } catch (error) {
            console.error('❌ Error:', error);
            setMessage({ text: '❌ Error al actualizar el turno', type: 'error' });
        }
    };

    const filteredBookings = filterDate 
        ? bookings.filter(b => b.fecha === filterDate)
        : bookings;

    return (
        <div className="min-h-screen p-6 bg-gray-100">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Panel Admin - Bennet Salon
                    </h1>
                    <button 
                        onClick={fetchBookings}
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                        title="Actualizar"
                    >
                        <div className="icon-refresh-cw"></div>
                    </button>
                </div>

                {/* Filtro */}
                <div className="bg-white p-4 rounded-xl shadow-sm">
                    <input 
                        type="date" 
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2"
                    />
                    {filterDate && (
                        <button 
                            onClick={() => setFilterDate('')}
                            className="ml-4 text-sm text-red-500 hover:underline"
                        >
                            Limpiar filtro
                        </button>
                    )}
                </div>

                {/* Mensaje de éxito/error */}
                {message.text && (
                    <div className={`p-3 rounded-lg ${
                        message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                        {message.text}
                    </div>
                )}

                {/* Lista de turnos */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4">Fecha/Hora</th>
                                    <th className="p-4">Cliente</th>
                                    <th className="p-4">WhatsApp</th>
                                    <th className="p-4">Servicio</th>
                                    <th className="p-4">Estado</th>
                                    <th className="p-4 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredBookings.map(booking => (
                                    <tr key={booking.id} className="hover:bg-gray-50">
                                        <td className="p-4">
                                            {booking.fecha} {booking.hora_inicio}
                                        </td>
                                        <td className="p-4 font-medium">{booking.cliente_nombre}</td>
                                        <td className="p-4">
                                            <a href={`https://wa.me/${booking.cliente_whatsapp}`} 
                                               target="_blank" 
                                               className="text-green-600 hover:underline">
                                                {booking.cliente_whatsapp}
                                            </a>
                                        </td>
                                        <td className="p-4">{booking.servicio}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold inline-block
                                                ${booking.estado === 'Confirmado' ? 'bg-green-100 text-green-700' : 
                                                  booking.estado === 'Cancelado' ? 'bg-red-100 text-red-700' : 
                                                  'bg-yellow-100 text-yellow-700'}`}>
                                                {booking.estado}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                {/* 🔥 BOTONES CON ÍCONOS */}
                                                {booking.estado === 'Reservado' && (
                                                    <>
                                                        <button 
                                                            onClick={() => handleStatusChange(booking.id, 'Confirmado', booking)}
                                                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                                            title="Confirmar turno"
                                                        >
                                                            <div className="icon-check text-xl"></div>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleStatusChange(booking.id, 'Cancelado', booking)}
                                                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                            title="Cancelar turno"
                                                        >
                                                            <div className="icon-x text-xl"></div>
                                                        </button>
                                                    </>
                                                )}
                                                {booking.estado === 'Confirmado' && (
                                                    <span className="text-sm text-gray-500 italic">Confirmado</span>
                                                )}
                                                {booking.estado === 'Cancelado' && (
                                                    <span className="text-sm text-gray-500 italic">Cancelado</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredBookings.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-gray-500">
                                            No hay turnos para mostrar
                                        </td>
                                    </tr>
                                )}
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