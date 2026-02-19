// admin-app.js - Bennet Salon (VERSIÓN QUE IMITA EL SQL)

const SUPABASE_URL = 'https://bjpzdeixwkgpiqdjwclk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqcHpkZWl4d2tncGlxZGp3Y2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NTUxMjIsImV4cCI6MjA4NzAzMTEyMn0.cJXxeKEj47kCir8lC91YWonuo7XN8UytBn58ki_cWoU';

// 🔥 NOMBRE DE TABLA ENTRE COMILLAS (como en el SQL)
const TABLE_NAME = '"bennet.salon"';

function AdminApp() {
    const [bookings, setBookings] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [filterDate, setFilterDate] = React.useState('');

    const fetchBookings = async () => {
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
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchBookings();
    }, []);

    const updateStatus = async (id, newStatus) => {
        if (!confirm(`¿Cambiar a ${newStatus}?`)) return;
        
        try {
            // 🔥 MISMA URL QUE USASTE EN SQL
            const url = `${SUPABASE_URL}/rest/v1/${TABLE_NAME}?id=eq.${id}`;
            console.log('URL:', url);
            
            const res = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ estado: newStatus })
            });
            
            console.log('Status:', res.status);
            
            if (res.ok) {
                alert('✅ Actualizado');
                fetchBookings();
            } else {
                const error = await res.text();
                alert(`❌ Error ${res.status}: ${error}`);
                console.error(error);
            }
        } catch (error) {
            alert('❌ Error de red');
            console.error(error);
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

    if (loading) return <div className="p-8 text-center">Cargando...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-3 sm:p-6">
            <div className="max-w-6xl mx-auto space-y-4">
                <div className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
                    <h1 className="text-xl font-bold">Panel Admin - Bennet Salon</h1>
                    <button onClick={fetchBookings} className="p-2 bg-gray-100 rounded-full">
                        ↻
                    </button>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm flex gap-3">
                    <input 
                        type="date" 
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="border rounded px-3 py-2"
                    />
                    {filterDate && (
                        <button onClick={() => setFilterDate('')} className="text-red-500">
                            Limpiar
                        </button>
                    )}
                </div>

                <div className="space-y-3 sm:hidden">
                    {filteredBookings.map(b => (
                        <div key={b.id} className="bg-white p-4 rounded-xl shadow-sm">
                            <div className="flex justify-between mb-2">
                                <span className="font-semibold">{b.fecha}</span>
                                <span className="text-sm bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
                                    {formatTo12Hour(b.hora_inicio)}
                                </span>
                            </div>
                            <div className="text-sm space-y-1">
                                <div>👤 {b.cliente_nombre}</div>
                                <div>📱 {b.cliente_whatsapp}</div>
                                <div>💅 {b.servicio}</div>
                            </div>
                            <div className="flex justify-between items-center mt-3 pt-2 border-t">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                    ${b.estado === 'Confirmado' ? 'bg-green-100 text-green-700' : 
                                      b.estado === 'Cancelado' ? 'bg-red-100 text-red-700' : 
                                      'bg-yellow-100 text-yellow-700'}`}>
                                    {b.estado}
                                </span>
                                {b.estado === 'Reservado' && (
                                    <div className="flex gap-2">
                                        <button onClick={() => updateStatus(b.id, 'Confirmado')}
                                                className="p-2 bg-green-500 text-white rounded-lg">
                                            ✓
                                        </button>
                                        <button onClick={() => updateStatus(b.id, 'Cancelado')}
                                                className="p-2 bg-red-500 text-white rounded-lg">
                                            ✗
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="hidden sm:block bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 text-left">Fecha/Hora</th>
                                <th className="p-4 text-left">Cliente</th>
                                <th className="p-4 text-left">WhatsApp</th>
                                <th className="p-4 text-left">Servicio</th>
                                <th className="p-4 text-left">Estado</th>
                                <th className="p-4 text-left">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.map(b => (
                                <tr key={b.id} className="border-t">
                                    <td className="p-4">
                                        {b.fecha}<br/>
                                        <span className="text-sm text-gray-500">{formatTo12Hour(b.hora_inicio)}</span>
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
                                                        className="p-2 bg-green-500 text-white rounded-lg">
                                                    ✓
                                                </button>
                                                <button onClick={() => updateStatus(b.id, 'Cancelado')}
                                                        className="p-2 bg-red-500 text-white rounded-lg">
                                                    ✗
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AdminApp />);