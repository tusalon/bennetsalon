// admin-app.js - Bennet Salon (VERSIÓN CON LOGS)

const SUPABASE_URL = 'https://bjpzdeixwkgpiqdjwclk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqcHpkZWl4d2tncGlxZGp3Y2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NTUxMjIsImV4cCI6MjA4NzAzMTEyMn0.cJXxeKEj47kCir8lC91YWonuo7XN8UytBn58ki_cWoU';

const TABLE_NAME = 'bennet.salon';

async function getAllBookings() {
    console.log('📥 Obteniendo turnos...');
    const res = await fetch(
        `${SUPABASE_URL}/rest/v1/${TABLE_NAME}?select=*&order=fecha.desc,hora_inicio.asc`,
        {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        }
    );
    const data = await res.json();
    console.log('📦 Turnos recibidos:', data.length);
    return data;
}

async function cancelBooking(id) {
    console.log('🔄 Cancelando turno:', id);
    const res = await fetch(
        `${SUPABASE_URL}/rest/v1/${TABLE_NAME}?id=eq.${id}`,
        {
            method: 'PATCH',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ estado: 'Cancelado' })
        }
    );
    console.log('📡 Respuesta cancelación:', res.status);
    return res.ok;
}

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
        console.log('🔄 Recargando lista...');
        setLoading(true);
        const data = await getAllBookings();
        data.sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora_inicio.localeCompare(b.hora_inicio));
        console.log('📋 Turnos después de ordenar:', data.length);
        setBookings(data);
        setLoading(false);
    };

    React.useEffect(() => {
        fetchBookings();
    }, []);

    const handleCancel = async (id, bookingData) => {
        console.log('🎯 Iniciando cancelación para turno:', id);
        
        if (!confirm(`¿Cancelar turno de ${bookingData.cliente_nombre}?`)) {
            console.log('❌ Cancelación abortada por usuario');
            return;
        }

        const ok = await cancelBooking(id);
        console.log('✅ Resultado cancelación:', ok);
        
        if (ok) {
            const msg = `❌ Turno cancelado\n\n${bookingData.cliente_nombre}, tu turno del ${bookingData.fecha} a las ${formatTo12Hour(bookingData.hora_inicio)} fue cancelado.`;
            window.open(`https://wa.me/${bookingData.cliente_whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
            
            alert('✅ Turno cancelado');
            console.log('🔄 Recargando después de cancelar...');
            await fetchBookings();
        } else {
            console.error('❌ Error en cancelBooking');
            alert('❌ Error al cancelar');
        }
    };

    const filteredBookings = filterDate
        ? bookings.filter(b => b.fecha === filterDate && b.estado !== 'Cancelado')
        : bookings.filter(b => b.estado !== 'Cancelado');

    console.log('👁️ Turnos a mostrar:', filteredBookings.length);

    return (
        <div className="min-h-screen bg-gray-100 p-3 sm:p-6">
            <div className="max-w-6xl mx-auto space-y-4">
                <div className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
                    <h1 className="text-xl font-bold">Panel Admin - Bennet Salon</h1>
                    <button onClick={fetchBookings} className="p-2 bg-gray-100 rounded-full">↻</button>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm flex gap-3">
                    <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="border rounded px-3 py-2" />
                    {filterDate && <button onClick={() => setFilterDate('')} className="text-red-500">Limpiar</button>}
                    <span className="ml-auto">Total: {filteredBookings.length}</span>
                </div>

                {loading ? (
                    <div className="text-center py-12">Cargando...</div>
                ) : (
                    <>
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
                                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Confirmado</span>
                                        <button onClick={() => handleCancel(b.id, b)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600">✗</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="hidden sm:block bg-white rounded-xl shadow-sm overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr><th className="p-4">Fecha/Hora</th><th>Cliente</th><th>WhatsApp</th><th>Servicio</th><th>Estado</th><th>Acción</th></tr>
                                </thead>
                                <tbody>
                                    {filteredBookings.map(b => (
                                        <tr key={b.id} className="border-t">
                                            <td className="p-4">{b.fecha} {formatTo12Hour(b.hora_inicio)}</td>
                                            <td>{b.cliente_nombre}</td>
                                            <td>{b.cliente_whatsapp}</td>
                                            <td>{b.servicio}</td>
                                            <td><span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">Confirmado</span></td>
                                            <td><button onClick={() => handleCancel(b.id, b)} className="p-2 bg-red-500 text-white rounded-lg">✗</button></td>
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