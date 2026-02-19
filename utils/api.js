// utils/api.js - Bennet Salon (CON TABLA bennet.salon)

const SUPABASE_URL = 'https://bjpzdeixwkgpiqdjwclk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqcHpkZWl4d2tncGlxZGp3Y2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NTUxMjIsImV4cCI6MjA4NzAzMTEyMn0.cJXxeKEj47kCir8lC91YWonuo7XN8UytBn58ki_cWoU';

// 🔥 NUEVA TABLA (con punto)
const TABLE_NAME = 'bennet.salon';

// Cache en memoria
const cache = {
    bookingsByDate: new Map(),
    allBookings: null,
    allBookingsTimestamp: null
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const STORAGE_CACHE_KEY = 'turnos_cache_v1';

/**
 * Obtener turnos por fecha
 */
async function getBookingsByDate(dateStr) {
    const cached = cache.bookingsByDate.get(dateStr);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        console.log('🗂️ Usando cache en memoria para', dateStr);
        return cached.data;
    }

    const stored = localStorage.getItem(`${STORAGE_CACHE_KEY}_${dateStr}`);
    if (stored) {
        const { data, timestamp } = JSON.parse(stored);
        if (Date.now() - timestamp < 60 * 60 * 1000) {
            console.log('💾 Usando cache localStorage para', dateStr);
            cache.bookingsByDate.set(dateStr, { data, timestamp: Date.now() });
            return data;
        }
    }

    try {
        console.log('🌐 Solicitando turnos para', dateStr);
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/${encodeURIComponent(TABLE_NAME)}?fecha=eq.${dateStr}&estado=neq.Cancelado&select=*`,
            {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Accept-Encoding': 'gzip, deflate'
                }
            }
        );
        
        if (!response.ok) throw new Error('Error fetching bookings');
        
        const data = await response.json();
        
        cache.bookingsByDate.set(dateStr, {
            data: data,
            timestamp: Date.now()
        });
        
        localStorage.setItem(`${STORAGE_CACHE_KEY}_${dateStr}`, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
        
        return data;
    } catch (error) {
        console.error('Error fetching bookings:', error);
        
        if (stored) {
            console.log('⚠️ Usando localStorage por error de red');
            const { data } = JSON.parse(stored);
            return data;
        }
        
        if (cached) {
            console.log('⚠️ Usando cache memoria viejo por error de red');
            return cached.data;
        }
        
        return [];
    }
}

/**
 * Crear una nueva reserva
 */
async function createBooking(bookingData) {
    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/${encodeURIComponent(TABLE_NAME)}`,
            {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(bookingData)
            }
        );
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error('Error creating booking');
        }
        
        cache.bookingsByDate.delete(bookingData.fecha);
        localStorage.removeItem(`${STORAGE_CACHE_KEY}_${bookingData.fecha}`);
        cache.allBookings = null;
        
        return { success: true };
    } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
    }
}

/**
 * Obtener todos los turnos (para admin)
 */
async function getAllBookings() {
    if (cache.allBookings && (Date.now() - cache.allBookingsTimestamp) < CACHE_DURATION) {
        return cache.allBookings;
    }

    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/${encodeURIComponent(TABLE_NAME)}?select=*&order=fecha.desc,hora_inicio.asc`,
            {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Accept-Encoding': 'gzip, deflate'
                }
            }
        );
        
        if (!response.ok) throw new Error('Error fetching all bookings');
        
        const data = await response.json();
        
        cache.allBookings = data;
        cache.allBookingsTimestamp = Date.now();
        
        return data;
    } catch (error) {
        console.error('Error fetching all bookings:', error);
        return cache.allBookings || [];
    }
}

/**
 * Actualizar estado de un turno
 */
async function updateBookingStatus(id, newStatus) {
    try {
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
        
        if (!response.ok) throw new Error('Error updating booking');
        
        cache.bookingsByDate.clear();
        cache.allBookings = null;
        
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(STORAGE_CACHE_KEY)) {
                localStorage.removeItem(key);
            }
        });
        
        return { success: true };
    } catch (error) {
        console.error('Error updating booking:', error);
        throw error;
    }
}