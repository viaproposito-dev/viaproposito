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
const createEmailTemplate = (result: CategoryResult) => {
  const categoryData = getCategoryData(result.category);
  const currentYear = new Date().getFullYear();

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tus Resultados del Test - Vía Propósito</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        
        body {
          font-family: 'Poppins', Arial, sans-serif;
          line-height: 1.6;
          color: #295244;
          margin: 0;
          padding: 0;
          background-color: #FFFBEF;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, ${categoryData.color} 0%, #295244 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
          border-radius: 16px 16px 0 0;
          position: relative;
          overflow: hidden;
        }
        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
          z-index: 1;
        }
        .header-content {
          position: relative;
          z-index: 2;
        }
        .logo {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 10px;
          font-style: italic;
        }
        .logo-sub {
          font-size: 20px;
          font-weight: 500;
          opacity: 0.9;
        }
        .result-badge {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          padding: 20px;
          border-radius: 12px;
          margin-top: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .result-text {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 8px;
          opacity: 0.9;
        }
        .result-title {
          font-size: 28px;
          font-weight: 700;
          margin: 0;
        }
        .content {
          background-color: white;
          padding: 40px 30px;
          border-radius: 0 0 16px 16px;
          box-shadow: 0 10px 30px rgba(41, 82, 68, 0.1);
        }
        .section {
          margin-bottom: 30px;
        }
        .section h2 {
          color: #295244;
          font-size: 22px;
          font-weight: 600;
          margin-top: 0;
          margin-bottom: 15px;
          border-bottom: 2px solid #FFFBEF;
          padding-bottom: 10px;
        }
        .section p {
          font-size: 16px;
          line-height: 1.7;
          margin-bottom: 15px;
        }
        .advice-box {
          background: linear-gradient(135deg, #FFFBEF 0%, #F8F5E9 100%);
          border-left: 4px solid ${categoryData.color};
          padding: 25px;
          border-radius: 12px;
          margin-top: 25px;
          position: relative;
        }
        .advice-box::before {
          content: '💡';
          position: absolute;
          top: 15px;
          right: 20px;
          font-size: 24px;
          opacity: 0.6;
        }
        .advice-box h3 {
          margin-top: 0;
          margin-bottom: 15px;
          color: #295244;
          font-size: 18px;
          font-weight: 600;
        }
        .advice-box p {
          margin-bottom: 0;
          font-weight: 500;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding: 30px;
          background: #295244;
          border-radius: 16px;
          color: white;
        }
        .footer p {
          margin: 8px 0;
          font-size: 14px;
          opacity: 0.8;
        }
        .footer .copyright {
          font-weight: 600;
          opacity: 1;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, ${categoryData.color} 0%, #295244 100%);
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 16px;
          margin-top: 25px;
          transition: transform 0.2s ease;
          box-shadow: 0 4px 15px rgba(41, 82, 68, 0.3);
        }
        .button:hover {
          transform: translateY(-2px);
        }
        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, #A3B7AD 50%, transparent 100%);
          margin: 30px 0;
        }
        .highlight {
          background: linear-gradient(120deg, ${categoryData.color}20 0%, transparent 100%);
          padding: 20px;
          border-radius: 10px;
          border: 1px solid ${categoryData.color}30;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="header-content">
            <div class="logo">vía propósito</div>
            <div class="logo-sub">Test de evaluación personal</div>
            <div class="result-badge">
              <div class="result-text">Tu Perfil es:</div>
              <div class="result-title">${categoryData.title}</div>
            </div>
          </div>
        </div>
        
        <div class="content">
          <div class="section">
            <h2>Tu Resultado Personal</h2>
            <p>${categoryData.description} Es posible que te sientas más cómodo con este enfoque, pero también hay oportunidades para el crecimiento personal explorando otros estilos.</p>
          </div>
          
          <div class="advice-box">
            <h3>Consejo personalizado:</h3>
            <p>${categoryData.advice}</p>
          </div>
          
          <div class="divider"></div>
          
          <div class="section">
            <h2>¿Qué significa esto?</h2>
            <div class="highlight">
              <p><strong>Este resultado refleja tus tendencias actuales</strong> en cómo te relacionas con diferentes aspectos de tu vida. Recuerda que no hay perfiles "buenos" o "malos" - cada uno tiene sus propias fortalezas y áreas de crecimiento.</p>
            </div>
            <p>Puedes usar esta información para reflexionar sobre cómo te acercas a tus relaciones, trabajo, y objetivos personales. Considera este resultado como un punto de partida para tu desarrollo personal.</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://viaproposito.com'}" style="color: white; text-decoration: none;">
              <div class="button">Visitar Vía Propósito</div>
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p class="copyright">&copy; ${currentYear} Vía Propósito. Todos los derechos reservados.</p>
          <p>Este correo fue enviado porque completaste nuestro test de evaluación personal.</p>
          <p>Si no realizaste este test, por favor ignora este correo.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Envía el correo electrónico con los resultados
 */
export async function sendResultEmail(email: string, result: CategoryResult) {
  try {
    const categoryData = getCategoryData(result.category);
    const htmlContent = createEmailTemplate(result);

    // Mejorar el formato del subject y remitente para reducir la probabilidad de spam
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Tu Perfil: ${categoryData.title} - Vía Propósito`,
      text: `Has completado el test de Vía Propósito. Tu perfil es: ${categoryData.title}. ${categoryData.description} ${categoryData.advice}`,
      html: htmlContent,
    };

    console.log('Intentando enviar email a:', email);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    return { success: false, error };
  }
}