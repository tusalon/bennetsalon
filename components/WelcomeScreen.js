// components/WelcomeScreen.js - Bennet Salon con imagen de manicura elegante

function WelcomeScreen({ onStart }) {
    return (
        <div className="min-h-screen bg-white flex flex-col relative overflow-hidden animate-fade-in">
            {/* Fondo con imagen de manicura profesional (Opción 1 corregida) */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=2071&auto=format&fit=crop" 
                    alt="Manos con esmaltado rojo elegante" 
                    className="w-full h-full object-cover"
                />
                {/* Gradiente oscuro para que el texto resalte */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
            </div>

            {/* Contenido principal */}
            <div className="relative z-10 flex flex-col justify-end h-full min-h-screen p-8 pb-20 sm:justify-center sm:items-center sm:text-center sm:p-12 sm:pb-12">
                <div className="animate-fade-in space-y-4 max-w-2xl">
                    
                    {/* Lema con diseño de etiqueta */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium mb-2">
                        <span className="text-pink-200">✨</span>
                        <span>Por una mejor versión de ti</span>
                        <span className="text-pink-200">✨</span>
                    </div>
                    
                    {/* Título principal con gradiente brillante */}
                    <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight drop-shadow-lg">
                        Bienvenida a <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-yellow-100 to-pink-200">
                            Bennet Salon
                        </span>
                    </h1>
                    
                    {/* Texto descriptivo mejorado */}
                    <p className="text-white/95 text-lg sm:text-xl max-w-lg mx-auto leading-relaxed drop-shadow">
                        Donde la belleza de tus manos cobra vida. 
                        Un espacio pensado para vos, con servicios exclusivos.
                    </p>

                    {/* Botón de llamada a la acción con diseño moderno */}
                    <div className="pt-6">
                        <button 
                            onClick={onStart}
                            className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-lg font-bold py-4 px-10 rounded-full shadow-xl shadow-black/30 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                        >
                            Reservar Turno
                            <div className="icon-arrow-right text-xl"></div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}