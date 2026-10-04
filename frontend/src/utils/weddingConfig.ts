/**
 * Configuración central de la boda.
 * Edita este archivo para actualizar textos, fecha, ubicación y pasaje bíblico
 * sin tocar el resto del código. En una futura iteración, estos valores pueden
 * moverse al panel de administración y servirse desde la API.
 */
export const weddingConfig = {
  novios: {
    nombres: "José & Emma",
    fraseHero: "Dos vidas, un solo camino, una historia que comienza para siempre.",
  },

  // Fecha y hora de la boda (formato ISO). Ajusta según la fecha real.
  fechaBoda: "2026-10-22T15:00:00-03:00",

  pasajeBiblico: {
    texto:
      "El amor es paciente, es bondadoso. El amor no es envidioso ni jactancioso ni orgulloso.",
    referencia: "1 Corintios 13:4",
  },

  evento: {
    nombreLugar: "Salón de Eventos Kanka",
    direccion: "Av. Circunvalación Mz.A - Lt.12, Cusco, Perú",
    // Coordenadas aproximadas de Cusco, Perú — ajustar a la ubicación exacta del salón.
    lat: -13.516638,
    lng: -71.957520,
    horaCeremonia: "3:00 p.m.",
  },

historia: [
  {
    titulo: "Cómo nos conocimos",
    texto:
      "Nuestra historia comenzó de la manera más inesperada. Una conversación sobre una película, \"El Castillo ambulante\", fue el punto de partida de algo que ninguno de los dos imaginaba. Entre palabras, risas y conversaciones que poco a poco se hicieron más frecuentes, nació una conexión especial. Sin darnos cuenta, aquella primera conversación fue dando paso a una hermosa historia de amor que hoy nos llena de gratitud.",
  },
  {
    titulo: "Un momento especial",
    texto:
      "Entre tantos momentos que hemos compartido, uno de los más importantes y significativos de nuestra historia fue el nacimiento de nuestro pequeño. Su llegada transformó nuestras vidas y nos enseñó una nueva forma de amar, de cuidar y de caminar juntos. Desde entonces, nuestro vínculo se hizo aún más fuerte y comprendimos que nuestro amor no solo crecía entre nosotros, sino también en la hermosa familia que comenzábamos a construir.",
  },
  {
    titulo: "La decisión de unir nuestras vidas",
    texto:
      "Con el paso del tiempo comprendimos que nuestro amor estaba llamado a algo mucho más grande. Decidimos unir nuestras vidas ante los ojos de Dios, poniendo en sus manos nuestro camino y nuestro futuro. Hoy elegimos caminar juntos, compartir nuestros sueños, sostenernos en los momentos difíciles y celebrar cada bendición, con la certeza de que el amor y la fe serán siempre los pilares de nuestro hogar.",
  },
  {
    titulo: "Hoy, el comienzo de siempre",
    texto:
      "Hoy no termina nuestra historia; comienza una nueva etapa de ella. Frente a Dios y rodeados de las personas que amamos, elegimos decir \"sí\" a una vida compartida, a los sueños que construiremos juntos y a cada nuevo amanecer que nos espera. Desde este día, nuestros caminos se convierten en uno solo y nuestro amor en un compromiso para toda la vida. Con el corazón lleno de ilusión y gratitud, comenzamos juntos el capítulo más hermoso de nuestra historia: nuestro para siempre.",
  },
],


  // Reemplaza estas URLs por las fotografías reales de los novios.
  galeria: [
    { src: "/images/image1.jpeg", alt: "Fotografía 1" },
    { src: "/images/image2.jpg", alt: "Fotografía 2" },
    { src: "/images/image3.jpg", alt: "Fotografía 3" },
    { src: "/images/image4.jpg", alt: "Fotografía 4" },
    { src: "/images/image5.jpg", alt: "Fotografía 5" },
    
  ], 

  fotoPrincipal:
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1200",
};

export type WeddingConfig = typeof weddingConfig;
