// admin-app.js - Bennet Salon (VERSIÓN MÍNIMA)

const SUPABASE_URL = 'https://bjpzdeixwkgpiqdjwclk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqcHpkZWl4d2tncGlxZGp3Y2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NTUxMjIsImV4cCI6MjA4NzAzMTEyMn0.cJXxeKEj47kCir8lC91YWonuo7XN8UytBn58ki_cWoU';

const TABLE_NAME = 'bennet.salon';

function AdminApp() {
    const [bookings, setBookings] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/${TABLE_NAME}?select=*`,
            { headers: { 'apikey': SUPABASE_ANON_KEY } }
        );
        const data = await res.json();
        setBookings(data);
        setLoading(false);
    };

    const cancelBooking = async (id) => {
        if (!confirm('¿Cancelar turno?')) return;
        
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
        
        if (res.ok) {
            alert('✅ Cancelado');
            fetchBookings();
        } else {
            alert('❌ Error ' + res.status);
        }
    };

    if (loading) return <div>Cargando...</div>;

    return (
        <div>
            <h1>Panel Admin</h1>
            {bookings.map(b => (
                <div key={b.id}>
                    {b.fecha} - {b.cliente_nombre} - {b.estado}
                    {b.estado === 'Reservado' && (
                        <button onClick={() => cancelBooking(b.id)}>Cancelar</button>
                    )}
                </div>
            ))}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AdminApp />);