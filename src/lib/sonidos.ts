// Notificaciones sonoras
export function reproducirSonido(tipo: 'cambio-estado' | 'listo' | 'entregado') {
  // Crear oscilador para un sonido simple
  if (typeof window === 'undefined') return;

  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscilador = audioContext.createOscillator();
    const ganancia = audioContext.createGain();

    oscilador.connect(ganancia);
    ganancia.connect(audioContext.destination);

    const ahora = audioContext.currentTime;

    if (tipo === 'cambio-estado') {
      // Sonido de cambio: 2 notas cortas
      oscilador.frequency.setValueAtTime(800, ahora);
      oscilador.frequency.setValueAtTime(1000, ahora + 0.1);
      ganancia.gain.setValueAtTime(0.3, ahora);
      ganancia.gain.setValueAtTime(0, ahora + 0.2);

      oscilador.start(ahora);
      oscilador.stop(ahora + 0.2);
    } else if (tipo === 'listo') {
      // Sonido de listo: 3 notas ascendentes
      oscilador.frequency.setValueAtTime(800, ahora);
      oscilador.frequency.setValueAtTime(1000, ahora + 0.15);
      oscilador.frequency.setValueAtTime(1200, ahora + 0.3);
      ganancia.gain.setValueAtTime(0.3, ahora);
      ganancia.gain.setValueAtTime(0, ahora + 0.45);

      oscilador.start(ahora);
      oscilador.stop(ahora + 0.45);
    } else if (tipo === 'entregado') {
      // Sonido de entrega: 4 notas ascendentes
      oscilador.frequency.setValueAtTime(1000, ahora);
      oscilador.frequency.setValueAtTime(1200, ahora + 0.1);
      oscilador.frequency.setValueAtTime(1400, ahora + 0.2);
      oscilador.frequency.setValueAtTime(1600, ahora + 0.3);
      ganancia.gain.setValueAtTime(0.3, ahora);
      ganancia.gain.setValueAtTime(0, ahora + 0.4);

      oscilador.start(ahora);
      oscilador.stop(ahora + 0.4);
    }
  } catch (error) {
    console.log('Sonido no disponible en este navegador');
  }
}

export function estáActivadoSonido(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('lavaauto_sonidos') !== 'desactivado';
}

export function alternarSonidos(): void {
  const actual = estáActivadoSonido();
  localStorage.setItem('lavaauto_sonidos', actual ? 'desactivado' : 'activado');
}
