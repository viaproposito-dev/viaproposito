import nodemailer from 'nodemailer';
import { CategoryResult } from '@/types';

// Configuración del transportador de correo electrónico
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_SERVER_PORT || 587),
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD
  },
});

// Interface para datos del usuario
interface UserTestData {
  birthYear: number;
  gender: string;
  occupation: string;
  maritalStatus: string;
  testDate: string;
}

// Función para formatear los datos demográficos para mostrar
const formatDemographicData = (userData: UserTestData) => {
  const formatGender = (gender: string) => {
    switch (gender) {
      case 'masculino': return 'Masculino';
      case 'femenino': return 'Femenino';
      case 'otro': return 'Otro';
      default: return gender;
    }
  };

  const formatOccupation = (occupation: string) => {
    const occupationMap: { [key: string]: string } = {
      'estudiante': 'Estudiante',
      'medico': 'Médico',
      'ingeniero': 'Ingeniero',
      'abogado': 'Abogado',
      'maestro': 'Maestro/Profesor',
      'enfermero': 'Enfermero',
      'contador': 'Contador',
      'arquitecto': 'Arquitecto',
      'psicologo': 'Psicólogo',
      'vendedor': 'Vendedor',
      'empresario': 'Empresario',
      'empleado_publico': 'Empleado Público',
      'trabajador_social': 'Trabajador Social',
      'artista': 'Artista',
      'chef': 'Chef/Cocinero',
      'policia': 'Policía',
      'bombero': 'Bombero',
      'tecnico': 'Técnico',
      'comerciante': 'Comerciante',
      'empleado_domestico': 'Empleado Doméstico',
      'jubilado': 'Jubilado',
      'desempleado': 'Desempleado',
      'otro': 'Otro'
    };
    return occupationMap[occupation] || occupation;
  };

  const formatMaritalStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'soltero': 'Soltero/a',
      'casado': 'Casado/a',
      'union_libre': 'Unión Libre',
      'divorciado': 'Divorciado/a',
      'viudo': 'Viudo/a',
      'separado': 'Separado/a'
    };
    return statusMap[status] || status;
  };

  const formatTestDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Mexico_City'
    });
  };

  return {
    birthYear: userData.birthYear,
    gender: formatGender(userData.gender),
    occupation: formatOccupation(userData.occupation),
    maritalStatus: formatMaritalStatus(userData.maritalStatus),
    testDate: formatTestDate(userData.testDate)
  };
};

// Datos específicos para cada categoría con colores de Vía Propósito
const getCategoryData = (category: string) => {
  switch (category) {
    case 'desenganchados':
      return {
        title: 'Desenganchado',
        color: '#A3B7AD',
        description: 'Tu perfil muestra una tendencia a mantenerte distante de compromisos profundos. Prefieres la independencia y evitas situaciones que requieran involucramiento emocional o social intenso.',
        advice: 'Intenta encontrar un equilibrio entre tu independencia y el establecimiento de vínculos más profundos. Pequeños pasos como dedicar tiempo de calidad a tus relaciones más cercanas pueden marcar una gran diferencia.'
      };
    case 'soñadores':
      return {
        title: 'Soñador',
        color: '#96AC61',
        description: 'Tu perfil refleja que tienes muchas ideas y aspiraciones, pero puede que te falte concreción en tus planes. Tiendes a imaginar escenarios ideales sin dar necesariamente los pasos prácticos para alcanzarlos.',
        advice: 'Canaliza tu creatividad estableciendo metas concretas y alcanzables. Divide tus grandes sueños en pasos pequeños y medibles que puedas ir completando.'
      };
    case 'aficionados':
      return {
        title: 'Aficionado',
        color: '#586E26',
        description: 'Tu perfil indica que exploras muchas áreas de interés sin comprometerte profundamente con ninguna. Disfrutas la variedad y las nuevas experiencias, pero puedes encontrar difícil persistir en un solo camino.',
        advice: 'Identifica qué áreas te apasionan realmente y permite que algunas de ellas evolucionen hacia un compromiso más profundo. La especialización en algunas áreas no significa abandonar tu versatilidad.'
      };
    case 'comprometidos':
      return {
        title: 'Comprometido',
        color: '#295244',
        description: 'Tu perfil demuestra un alto nivel de compromiso con tus relaciones, objetivos y comunidad. Tomas en serio tus responsabilidades y trabajas consistentemente hacia tus metas.',
        advice: 'Tu compromiso es una fortaleza valiosa. Asegúrate de equilibrarlo con momentos de flexibilidad y descanso para evitar el agotamiento y seguir disfrutando de tus proyectos a largo plazo.'
      };
    default:
      return {
        title: 'Resultado',
        color: '#295244',
        description: 'Gracias por completar el test.',
        advice: ''
      };
  }
};

/**
 * Crea una plantilla HTML para el correo electrónico con los resultados
 */
const createEmailTemplate = (result: CategoryResult, userData?: UserTestData) => {
  const categoryData = getCategoryData(result.category);
  const currentYear = new Date().getFullYear();

  let formattedUserData = null;
  if (userData) {
    formattedUserData = formatDemographicData(userData);
  }

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light">
      <meta name="supported-color-schemes" content="light">
      <title>Tus Resultados del Test - Vía Propósito</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        
        /* Force light mode styles */
        * {
          color-scheme: light !important;
          forced-color-adjust: none !important;
        }
        
        /* Dark mode overrides - force light mode appearance */
        @media (prefers-color-scheme: dark) {
          * {
            background-color: initial !important;
            color: initial !important;
          }
        }
        
        body {
          font-family: 'Poppins', Arial, sans-serif !important;
          line-height: 1.6 !important;
          color: #295244 !important;
          margin: 0 !important;
          padding: 0 !important;
          background-color: #FFFBEF !important;
          -webkit-text-size-adjust: 100% !important;
          -ms-text-size-adjust: 100% !important;
        }
        
        /* Ensure all text remains dark */
        body, div, p, h1, h2, h3, h4, h5, h6, span, a, td, th {
          color: #295244 !important;
        }
        
        .container {
          max-width: 600px !important;
          margin: 0 auto !important;
          padding: 20px !important;
          background-color: #FFFBEF !important;
        }
        
        .header {
          background: linear-gradient(135deg, ${categoryData.color} 0%, #295244 100%) !important;
          color: white !important;
          padding: 40px 30px !important;
          text-align: center !important;
          border-radius: 16px 16px 0 0 !important;
          position: relative !important;
          overflow: hidden !important;
        }
        
        .header * {
          color: white !important;
        }
        
        .header::before {
          content: '' !important;
          position: absolute !important;
          top: -50% !important;
          left: -50% !important;
          width: 200% !important;
          height: 200% !important;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat !important;
          z-index: 1 !important;
        }
        
        .header-content {
          position: relative !important;
          z-index: 2 !important;
        }
        
        .logo {
          font-size: 32px !important;
          font-weight: 700 !important;
          margin-bottom: 10px !important;
          font-style: italic !important;
          color: white !important;
        }
        
        .logo-sub {
          font-size: 20px !important;
          font-weight: 500 !important;
          opacity: 0.9 !important;
          color: white !important;
        }
        
        .result-badge {
          background: rgba(255, 255, 255, 0.2) !important;
          backdrop-filter: blur(10px) !important;
          padding: 20px !important;
          border-radius: 12px !important;
          margin-top: 20px !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        
        .result-text {
          font-size: 16px !important;
          font-weight: 500 !important;
          margin-bottom: 8px !important;
          opacity: 0.9 !important;
          color: white !important;
        }
        
        .result-title {
          font-size: 28px !important;
          font-weight: 700 !important;
          margin: 0 !important;
          color: white !important;
        }
        
        .content {
          background-color: white !important;
          padding: 40px 30px !important;
          border-radius: 0 0 16px 16px !important;
          box-shadow: 0 10px 30px rgba(41, 82, 68, 0.1) !important;
        }
        
        .section {
          margin-bottom: 30px !important;
          background-color: white !important;
        }
        
        .section h2 {
          color: #295244 !important;
          font-size: 22px !important;
          font-weight: 600 !important;
          margin-top: 0 !important;
          margin-bottom: 15px !important;
          border-bottom: 2px solid #FFFBEF !important;
          padding-bottom: 10px !important;
        }
        
        .section p {
          font-size: 16px !important;
          line-height: 1.7 !important;
          margin-bottom: 15px !important;
          color: #295244 !important;
        }
        
        .advice-box {
          background: linear-gradient(135deg, #FFFBEF 0%, #F8F5E9 100%) !important;
          border-left: 4px solid ${categoryData.color} !important;
          padding: 25px !important;
          border-radius: 12px !important;
          margin-top: 25px !important;
          position: relative !important;
        }
        
        .advice-box::before {
          content: '💡' !important;
          position: absolute !important;
          top: 15px !important;
          right: 20px !important;
          font-size: 24px !important;
          opacity: 0.6 !important;
        }
        
        .advice-box h3 {
          margin-top: 0 !important;
          margin-bottom: 15px !important;
          color: #295244 !important;
          font-size: 18px !important;
          font-weight: 600 !important;
        }
        
        .advice-box p {
          margin-bottom: 0 !important;
          font-weight: 500 !important;
          color: #295244 !important;
        }
        
        .user-data-section {
          background: #F8F5E9 !important;
          border: 1px solid #E5E0D3 !important;
          padding: 20px !important;
          border-radius: 10px !important;
          margin-top: 30px !important;
        }
        
        .user-data-section h3 {
          color: #295244 !important;
          font-size: 16px !important;
          font-weight: 600 !important;
          margin-top: 0 !important;
          margin-bottom: 15px !important;
          opacity: 0.8 !important;
        }
        
        .user-data-grid {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 12px !important;
        }
        
        .user-data-item {
          font-size: 13px !important;
          color: #295244 !important;
          opacity: 0.7 !important;
        }
        
        .user-data-item strong {
          color: #295244 !important;
          opacity: 1 !important;
          font-weight: 500 !important;
        }
        
        .footer {
          text-align: center !important;
          margin-top: 40px !important;
          padding: 30px !important;
          background: #295244 !important;
          border-radius: 16px !important;
          color: white !important;
        }
        
        .footer * {
          color: white !important;
        }
        
        .footer p {
          margin: 8px 0 !important;
          font-size: 14px !important;
          opacity: 0.8 !important;
          color: white !important;
        }
        
        .footer .copyright {
          font-weight: 600 !important;
          opacity: 1 !important;
          color: white !important;
        }
        
        .button {
          display: inline-block !important;
          background: linear-gradient(135deg, ${categoryData.color} 0%, #295244 100%) !important;
          color: white !important;
          padding: 15px 30px !important;
          text-decoration: none !important;
          border-radius: 10px !important;
          font-weight: 600 !important;
          font-size: 16px !important;
          margin-top: 25px !important;
          transition: transform 0.2s ease !important;
          box-shadow: 0 4px 15px rgba(41, 82, 68, 0.3) !important;
        }
        
        .button:hover {
          transform: translateY(-2px) !important;
        }
        
        .divider {
          height: 1px !important;
          background: linear-gradient(90deg, transparent 0%, #A3B7AD 50%, transparent 100%) !important;
          margin: 30px 0 !important;
        }
        
        .highlight {
          background: linear-gradient(120deg, ${categoryData.color}20 0%, transparent 100%) !important;
          padding: 20px !important;
          border-radius: 10px !important;
          border: 1px solid ${categoryData.color}30 !important;
          margin: 20px 0 !important;
        }
        
        .highlight p {
          color: #295244 !important;
        }
        
        .highlight strong {
          color: #295244 !important;
        }
        
        /* Mobile responsiveness */
        @media (max-width: 600px) {
          .user-data-grid {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }
        }
        
        /* Mobile dark mode specific overrides */
        @media (prefers-color-scheme: dark) {
          .container, .content, .section, .advice-box, .user-data-section, body {
            background-color: #FFFBEF !important;
          }
          
          .header {
            background: linear-gradient(135deg, ${categoryData.color} 0%, #295244 100%) !important;
          }
          
          .footer {
            background: #295244 !important;
          }
        }
        
        /* Additional email client specific fixes */
        [data-ogsc] .container,
        [data-ogsc] .content,
        [data-ogsc] .section,
        [data-ogsc] .advice-box,
        [data-ogsc] .user-data-section {
          background-color: #FFFBEF !important;
        }
        
        [data-ogsc] body {
          background-color: #FFFBEF !important;
        }
        
        [data-ogsc] .header {
          background: linear-gradient(135deg, ${categoryData.color} 0%, #295244 100%) !important;
        }
        
        [data-ogsc] .footer {
          background: #295244 !important;
        }
      </style>
    </head>
    <body style="background-color: #FFFBEF !important; color: #295244 !important;">
      <div class="container" style="background-color: #FFFBEF !important;">
        <div class="header" style="background: linear-gradient(135deg, ${categoryData.color} 0%, #295244 100%) !important;">
          <div class="header-content">
            <div class="logo" style="color: white !important;">vía propósito</div>
            <div class="logo-sub" style="color: white !important;">Test de evaluación personal</div>
            <div class="result-badge">
              <div class="result-text" style="color: white !important;">Tu Perfil es:</div>
              <div class="result-title" style="color: white !important;">${categoryData.title}</div>
            </div>
          </div>
        </div>
        
        <div class="content" style="background-color: white !important;">
          <div class="section" style="background-color: white !important;">
            <h2 style="color: #295244 !important;">Tu Resultado Personal</h2>
            <p style="color: #295244 !important;">${categoryData.description} Es posible que te sientas más cómodo con este enfoque, pero también hay oportunidades para el crecimiento personal explorando otros estilos.</p>
          </div>
          
          <div class="advice-box" style="background: linear-gradient(135deg, #FFFBEF 0%, #F8F5E9 100%) !important;">
            <h3 style="color: #295244 !important;">Consejo personalizado:</h3>
            <p style="color: #295244 !important;">${categoryData.advice}</p>
          </div>
          
          <div class="divider"></div>
          
          <div class="section" style="background-color: white !important;">
            <h2 style="color: #295244 !important;">¿Qué significa esto?</h2>
            <div class="highlight">
              <p style="color: #295244 !important;"><strong style="color: #295244 !important;">Este resultado refleja tus tendencias actuales</strong> en cómo te relacionas con diferentes aspectos de tu vida. Recuerda que no hay perfiles "buenos" o "malos" - cada uno tiene sus propias fortalezas y áreas de crecimiento.</p>
            </div>
            <p style="color: #295244 !important;">Puedes usar esta información para reflexionar sobre cómo te acercas a tus relaciones, trabajo, y objetivos personales. Considera este resultado como un punto de partida para tu desarrollo personal.</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://viaproposito.com'}" style="color: white !important; text-decoration: none;">
              <div class="button" style="background: linear-gradient(135deg, ${categoryData.color} 0%, #295244 100%) !important; color: white !important;">Visitar Vía Propósito</div>
            </a>
          </div>
          
          ${formattedUserData ? `
          <div class="user-data-section" style="background: #F8F5E9 !important;">
            <h3 style="color: #295244 !important;">Resumen de tu información</h3>
            <div class="user-data-grid">
              <div class="user-data-item">
                <strong style="color: #295244 !important;">Año de nacimiento:</strong> ${formattedUserData.birthYear}
              </div>
              <div class="user-data-item">
                <strong style="color: #295244 !important;">Sexo:</strong> ${formattedUserData.gender}
              </div>
              <div class="user-data-item">
                <strong style="color: #295244 !important;">Ocupación:</strong> ${formattedUserData.occupation}
              </div>
              <div class="user-data-item">
                <strong style="color: #295244 !important;">Estado civil:</strong> ${formattedUserData.maritalStatus}
              </div>
            </div>
            <p style="font-size: 12px !important; color: #295244 !important; opacity: 0.6 !important; margin-top: 15px !important; margin-bottom: 0 !important;">
              Test completado el ${formattedUserData.testDate}
            </p>
          </div>
          ` : ''}
        </div>
        
        <div class="footer" style="background: #295244 !important;">
          <p class="copyright" style="color: white !important;">&copy; ${currentYear} Vía Propósito. Todos los derechos reservados.</p>
          <p style="color: white !important;">Este correo fue enviado porque completaste nuestro test de evaluación personal.</p>
          <p style="color: white !important;">Si no realizaste este test, por favor ignora este correo.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Envía el correo electrónico con los resultados
 */
export async function sendResultEmail(email: string, result: CategoryResult, userData?: UserTestData) {
  try {
    const categoryData = getCategoryData(result.category);
    const htmlContent = createEmailTemplate(result, userData);

    // Mejorar el formato del subject y remitente para reducir la probabilidad de spam
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Tu Perfil: ${categoryData.title} - Vía Propósito`,
      text: `Has completado el test de Vía Propósito. Tu perfil es: ${categoryData.title}. ${categoryData.description} ${categoryData.advice}`,
      html: htmlContent,
    };

    // console.log('Intentando enviar email a:', email);
    const info = await transporter.sendMail(mailOptions);
    // console.log('Email enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    return { success: false, error };
  }
}