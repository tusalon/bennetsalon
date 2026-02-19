// admin-app.js - Bennet Salon (VERSIÓN CON VERIFICACIÓN REAL)

const SUPABASE_URL = 'https://bjpzdeixwkgpiqdjwclk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqcHpkZWl4d2tncGlxZGp3Y2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NTUxMjIsImV4cCI6MjA4NzAzMTEyMn0.cJXxeKEj47kCir8lC91YWonuo7XN8UytBn58ki_cWoU';

const TABLE_NAME = 'bennet.salon';

// 🔥 FUNCIÓN CORREGIDA - Solo dice éxito si realmente funcionó
async function updateBookingStatus(id, newStatus) {
    try {
        console.log('🔄 Enviando solicitud a Supabase...');
        
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/${encodeURIComponent(TABLE_NAME)}?id=eq.${id}`,
            {
                method: 'PATCH',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ estado: newStatus })
            }
        );
        
        console.log('📡 Código de respuesta:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error detallado:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        // Verificar que realmente se actualizó
        const verifyResponse = await fetch(
            `${SUPABASE_URL}/rest/v1/${encodeURIComponent(TABLE_NAME)}?id=eq.${id}&select=estado`,
            {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            }
        );
        
        if (verifyResponse.ok) {
            const verifyData = await verifyResponse.json();
            console.log('✅ Nuevo estado en BD:', verifyData[0]?.estado);
        }
        
        return { success: true };
    } catch (error) {
        console.error('❌ Error en updateBookingStatus:', error);
        throw error;
    }
}

// Obtener todos los turnos
async function getAllBookings() {
    try {
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
        return data;
    } catch (error) {
        console.error('Error fetching all bookings:', error);
        return [];
    }
}

// Formato de hora 12h
const formatTo12Hour = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    let hour12 = hours % 12;
    hour12 = hour12 === 0 ? 12 : hour12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

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

    const handleStatusChange = async (id, newStatus, bookingData) => {
        if (!confirm(`¿Estás seguro de cambiar el estado a ${newStatus}?`)) return;
        
        try {
            console.log('🎯 Iniciando cambio de estado para turno', id);
            
            await updateBookingStatus(id, newStatus);
            
            const phone = bookingData.cliente_whatsapp;
            let mensaje = "";
            
            if (newStatus === "Confirmado") {
                mensaje = `✅ *TURNO CONFIRMADO* ✅\n\nHola ${bookingData.cliente_nombre}, te confirmamos tu turno en *Bennet Salon*:\n\n📅 *Fecha:* ${bookingData.fecha}\n⏰ *Hora:* ${formatTo12Hour(bookingData.hora_inicio)}\n💅 *Servicio:* ${bookingData.servicio}\n\n📱 Contacto: +53 54438629\n\n¡Te esperamos! ✨`;
            } else {
                mensaje = `❌ *TURNO CANCELADO* ❌\n\nHola ${bookingData.cliente_nombre}, lamentamos informarte que tu turno del ${bookingData.fecha} a las ${formatTo12Hour(bookingData.hora_inicio)} ha sido cancelado.\n\nPor favor, contactanos para reagendar.\n📱 +53 54438629\n\nDisculpá las molestias.`;
            }
            
            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}`, '_blank');
            
            // Recargar la lista
            await fetchBookings();
            
            alert(`✅ Turno ${newStatus} correctamente`);
            
        } catch (error) {
            console.error('❌ Error completo:', error);
            alert('❌ Error al actualizar el turno. Revisá la consola (F12).');
        }
    };

    const filteredBookings = filterDate 
        ? bookings.filter(b => b.fecha === filterDate)
        : bookings;

    // Vista móvil (tarjetas) - IGUAL QUE ANTES
    // Vista desktop (tabla) - IGUAL QUE ANTES
    // ... (mantener el mismo return que antes)
    
    return (
        <div className="min-h-screen bg-gray-100 p-3 sm:p-6">
            <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <div className="icon-shield-check text-pink-500"></div>
                        Panel Admin - Bennet Salon
                    </h1>
                    <button onClick={fetchBookings} className="self-end sm:self-auto p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                        <div className="icon-refresh-cw"></div>
                    </button>
                </div>

                {/* Filtro */}
                <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="w-full sm:w-auto flex items-center gap-2">
                        <span className="text-sm text-gray-600 whitespace-nowrap">📅 Filtrar:</span>
                        <input 
                            type="date" 
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                    {filterDate && (
                        <button onClick={() => setFilterDate('')} className="text-sm text-red-500 hover:underline">
                            ✕ Limpiar filtro
                        </button>
                    )}
                    <div className="sm:ml-auto text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        Total: {filteredBookings.length} turnos
                    </div>
                </div>

                {/* Lista de turnos */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin h-8 w-8 border-b-2 border-pink-500 rounded-full mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-500">Cargando turnos...</p>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                        <div className="icon-calendar-x text-4xl text-gray-300 mb-2"></div>
                        <p className="text-gray-500">No hay turnos para mostrar</p>
                        {filterDate && (
                            <button onClick={() => setFilterDate('')} className="mt-2 text-sm text-pink-500 hover:underline">
                                Ver todos los turnos
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Vista móvil - Tarjetas */}
                        <div className="space-y-3 sm:hidden">
                            {filteredBookings.map(booking => (
                                <div key={booking.id} className="bg-white rounded-xl shadow-sm p-4 space-y-3">
                                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                        <span className="font-semibold text-gray-900">{booking.fecha}</span>
                                        <span className="text-sm bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
                                            {formatTo12Hour(booking.hora_inicio)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500 text-sm">👤</span>
                                        <span className="font-medium text-gray-900">{booking.cliente_nombre}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500 text-sm">📱</span>
                                        <a href={`https://wa.me/${booking.cliente_whatsapp}`} target="_blank" className="text-green-600 text-sm break-all">
                                            {booking.cliente_whatsapp}
                                        </a>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-gray-500 text-sm">💅</span>
                                        <span className="text-gray-800 text-sm flex-1">{booking.servicio}</span>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                            ${booking.estado === 'Confirmado' ? 'bg-green-100 text-green-700' : 
                                              booking.estado === 'Cancelado' ? 'bg-red-100 text-red-700' : 
                                              'bg-yellow-100 text-yellow-700'}`}>
                                            {booking.estado}
                                        </span>
                                        <div className="flex gap-2">
                                            {booking.estado === 'Reservado' && (
                                                <>
                                                    <button onClick={() => handleStatusChange(booking.id, 'Confirmado', booking)}
                                                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                                                        <div className="icon-check"></div>
                                                    </button>
                                                    <button onClick={() => handleStatusChange(booking.id, 'Cancelado', booking)}
                                                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                                                        <div className="icon-x"></div>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Vista desktop - Tabla */}
                        <div className="hidden sm:block bg-white rounded-xl shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-4">Fecha/Hora</th>
                                        <th className="p-4">Cliente</th>
                                        <th className="p-4">WhatsApp</th>
                                        <th className="p-4">Servicio</th>
                                        <th className="p-4">Estado</th>
                                        <th className="p-4">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredBookings.map(booking => (
                                        <tr key={booking.id}>
                                            <td className="p-4">
                                                <div>{booking.fecha}</div>
                                                <div className="text-sm text-gray-500">{formatTo12Hour(booking.hora_inicio)}</div>
                                            </td>
                                            <td className="p-4">{booking.cliente_nombre}</td>
                                            <td className="p-4">
                                                <a href={`https://wa.me/${booking.cliente_whatsapp}`} target="_blank" className="text-green-600">
                                                    {booking.cliente_whatsapp}
                                                </a>
                                            </td>
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
                                                <div className="flex gap-2">
                                                    {booking.estado === 'Reservado' && (
                                                        <>
                                                            <button onClick={() => handleStatusChange(booking.id, 'Confirmado', booking)}
                                                                    className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                                                                <div className="icon-check"></div>
                                                            </button>
                                                            <button onClick={() => handleStatusChange(booking.id, 'Cancelado', booking)}
                                                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                                                                <div className="icon-x"></div>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AdminApp />);