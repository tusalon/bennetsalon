// app.js - Bennet Salon con botón de instalación

function App() {
    const [showWelcome, setShowWelcome] = React.useState(true);
    const [bookingData, setBookingData] = React.useState({
        service: null,
        date: null,
        time: null,
        confirmedBooking: null
    });
    const [showForm, setShowForm] = React.useState(false);
    
    // Estados para conexión
    const [connectionSlow, setConnectionSlow] = React.useState(false);
    const [isOffline, setIsOffline] = React.useState(!navigator.onLine);
    
    // Estado para instalación PWA
    const [deferredPrompt, setDeferredPrompt] = React.useState(null);

    // Detectar cambios en la conexión
    React.useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Detectar si la conexión es lenta
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (!bookingData.service && !showWelcome) {
                setConnectionSlow(true);
            }
        }, 5000);
        
        return () => clearTimeout(timer);
    }, [showWelcome, bookingData.service]);

    // Detectar evento de instalación PWA
    React.useEffect(() => {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            console.log('✅ App lista para instalar');
        });
    }, []);

    const handleServiceSelect = (service) => {
        setBookingData(prev => ({ ...prev, service, time: null }));
    };

    const handleDateSelect = (date) => {
        setBookingData(prev => ({ ...prev, date, time: null }));
    };

    const handleTimeSelect = (time) => {
        setBookingData(prev => ({ ...prev, time }));
        setShowForm(true);
    };

    const handleFormSubmit = (finalBooking) => {
        setShowForm(false);
        setBookingData(prev => ({ ...prev, confirmedBooking: finalBooking }));
    };

    const resetBooking = () => {
        setBookingData({
            service: null,
            date: null,
            time: null,
            confirmedBooking: null
        });
        setShowForm(false);
    };

    if (showWelcome) {
        return (
            <div data-name="app-container">
                <WelcomeScreen onStart={() => setShowWelcome(false)} />
                <WhatsAppButton />
            </div>
        );
    }

    if (bookingData.confirmedBooking) {
        return (
            <div className="min-h-screen bg-[#faf8f7] flex flex-col" data-name="app-container">
                <Header />
                <main className="flex-grow p-4">
                    <div className="max-w-xl mx-auto">
                        <Confirmation booking={bookingData.confirmedBooking} onReset={resetBooking} />
                    </div>
                </main>
                <WhatsAppButton />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#faf8f7] flex flex-col pb-20" data-name="app-container">
            <Header />
            
            {/* Banner de conexión lenta */}
            {connectionSlow && (
                <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 text-sm z-50 shadow-lg animate-fade-in">
                    <div className="flex items-center justify-center gap-2">
                        <div className="icon-alert-triangle"></div>
                        <span>Conexión lenta - La app puede demorar, pero sigue funcionando</span>
                    </div>
                </div>
            )}

            {/* Banner de modo offline */}
            {isOffline && (
                <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white text-center py-2 text-sm z-50 shadow-lg animate-fade-in">
                    <div className="flex items-center justify-center gap-2">
                        <div className="icon-wifi-off"></div>
                        <span>Modo offline - Mostrando información guardada</span>
                    </div>
                </div>
            )}
            
            <main className="flex-grow p-4 space-y-8 max-w-3xl mx-auto w-full">
                {/* Step 1: Service */}
                <ServiceSelection 
                    selectedService={bookingData.service} 
                    onSelect={handleServiceSelect} 
                />

                {/* Step 2: Calendar */}
                {bookingData.service && (
                    <Calendar 
                        selectedDate={bookingData.date} 
                        onDateSelect={handleDateSelect} 
                    />
                )}

                {/* Step 3: Time Slots */}
                {bookingData.service && bookingData.date && (
                    <TimeSlots 
                        service={bookingData.service} 
                        date={bookingData.date}
                        selectedTime={bookingData.time}
                        onTimeSelect={handleTimeSelect}
                    />
                )}
            </main>

            {/* Modal Form */}
            {showForm && (
                <BookingForm 
                    service={bookingData.service}
                    date={bookingData.date}
                    time={bookingData.time}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setShowForm(false)}
                />
            )}
            
            {/* Reset Button */}
            {(bookingData.service || bookingData.date) && (
                <div className="fixed bottom-24 right-6 z-40">
                    <button 
                        onClick={resetBooking}
                        className="bg-white text-gray-600 shadow-lg border border-gray-200 rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors"
                    >
                        <div className="icon-rotate-ccw text-xs"></div>
                        Reiniciar
                    </button>
                </div>
            )}

            {/* Botón de instalación PWA */}
            {deferredPrompt && (
                <button
                    onClick={() => {
                        deferredPrompt.prompt();
                        deferredPrompt.userChoice.then(() => {
                            setDeferredPrompt(null);
                        });
                    }}
                    className="fixed bottom-24 left-6 z-50 bg-blue-600 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all"
                    title="Instalar App"
                >
                    <div className="icon-download text-xl"></div>
                </button>
            )}

            <WhatsAppButton />
        </div>
    );
}

// Detección de conexión lenta
const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
const isSlowConnection = connection && (
    connection.effectiveType === 'slow-2g' || 
    connection.effectiveType === '2g' ||
    connection.downlink < 0.5
);

if (isSlowConnection) {
    document.body.classList.add('slow-connection');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);