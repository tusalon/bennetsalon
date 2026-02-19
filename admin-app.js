// admin-app.js - Bennet Salon (VERSIÓN QUE SÍ FUNCIONA)

const SUPABASE_URL = 'https://bjpzdeixwkgpiqdjwclk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqcHpkZWl4d2tncGlxZGp3Y2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NTUxMjIsImV4cCI6MjA4NzAzMTEyMn0.cJXxeKEj47kCir8lC91YWonuo7XN8UytBn58ki_cWoU';

// 🔥 NOMBRE DE TABLA SIN ENCODE (directo)
const TABLE_NAME = 'bennet.salon';

function AdminApp() {
    const [bookings, setBookings] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [filterDate, setFilterDate] = React.useState('');

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `${SUPABASE_URL}/rest/v1/${TABLE_NAME}?select=*`,
                { 
                    headers: { 
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                    } 
                }
            );
            const data = await res.json();
            setBookings(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchBookings();
    }, []);

    const updateStatus = async (id, newStatus) => {
        if (!confirm(`¿Cambiar estado a ${newStatus}?`)) return;
        
        try {
            const res = await fetch(
                `${SUPABASE_URL}/rest/v1/${TABLE_NAME}?id=eq.${id}`,
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
            
            if (res.ok) {
                alert(`✅ Turno ${newStatus}`);
                fetchBookings();
            } else {
                const error = await res.text();
                alert(`❌ Error: ${res.status} - ${error}`);
            }
        } catch (error) {
            alert('❌ Error de red');
        }
    };

    const formatTo12Hour = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        let hour12 = hours % 12;
        hour12 = hour12 === 0 ? 12 : hour12;
        return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    const filteredBookings = filterDate 
        ? bookings.filter(b => b.fecha === filterDate)
        : bookings;

    return (
        <div className="min-h-screen bg-gray-100 p-3 sm:p-6">
            <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
                <div className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                        Panel Admin - Bennet Salon
                    </h1>
                    <button onClick={fetchBookings} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                        <div className="icon-refresh-cw"></div>
                    </button>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm flex flex-wrap items-center gap-3">
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
                    <span className="ml-auto text-sm text-gray-500">
                        Total: {filteredBookings.length} turnos
                    </span>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin h-8 w-8 border-b-2 border-pink-500 rounded-full mx-auto"></div>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                        <p className="text-gray-500">No hay turnos</p>
                    </div>
                ) : (
                    <>
                        {/* Vista móvil */}
                        <div className="space-y-3 sm:hidden">
                            {filteredBookings.map(b => (
                                <div key={b.id} className="bg-white rounded-xl shadow-sm p-4">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-semibold">{b.fecha}</span>
                                        <span className="text-sm bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
                                            {formatTo12Hour(b.hora_inicio)}
                                        </span>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <div>👤 {b.cliente_nombre}</div>
                                        <div>📱 {b.cliente_whatsapp}</div>
                                        <div>💅 {b.servicio}</div>
                                    </div>
                                    <div className="flex items-center justify-between mt-3 pt-2 border-t">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                            ${b.estado === 'Confirmado' ? 'bg-green-100 text-green-700' : 
                                              b.estado === 'Cancelado' ? 'bg-red-100 text-red-700' : 
                                              'bg-yellow-100 text-yellow-700'}`}>
                                            {b.estado}
                                        </span>
                                        {b.estado === 'Reservado' && (
                                            <div className="flex gap-2">
                                                <button onClick={() => updateStatus(b.id, 'Confirmado')}
                                                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                                                    <div className="icon-check"></div>
                                                </button>
                                                <button onClick={() => updateStatus(b.id, 'Cancelado')}
                                                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                                                    <div className="icon-x"></div>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Vista desktop */}
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
                                <tbody>
                                    {filteredBookings.map(b => (
                                        <tr key={b.id}>
                                            <td className="p-4">
                                                <div>{b.fecha}</div>
                                                <div className="text-sm text-gray-500">{formatTo12Hour(b.hora_inicio)}</div>
                                            </td>
                                            <td className="p-4">{b.cliente_nombre}</td>
                                            <td className="p-4">{b.cliente_whatsapp}</td>
                                            <td className="p-4">{b.servicio}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                                    ${b.estado === 'Confirmado' ? 'bg-green-100 text-green-700' : 
                                                      b.estado === 'Cancelado' ? 'bg-red-100 text-red-700' : 
                                                      'bg-yellow-100 text-yellow-700'}`}>
                                                    {b.estado}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {b.estado === 'Reservado' && (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => updateStatus(b.id, 'Confirmado')}
                                                                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                                                            <div className="icon-check"></div>
                                                        </button>
                                                        <button onClick={() => updateStatus(b.id, 'Cancelado')}
                                                                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                                                            <div className="icon-x"></div>
                                                        </button>
                                                    </div>
                                                )}
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