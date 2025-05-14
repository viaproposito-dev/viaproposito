// lib/email.ts
import nodemailer from 'nodemailer';
import { CategoryResult } from '@/types';

// Configuración del transportador de correo electrónico usando las mismas variables que en tu otro proyecto
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_SERVER_PORT || 587),
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD
  },
});

// Datos específicos para cada categoría
const getCategoryData = (category: string) => {
  switch (category) {
    case 'desenganchados':
      return {
        title: 'Desenganchado',
        color: '#EF4444', // Red-500
        description: 'Tu perfil muestra una tendencia a mantenerte distante de compromisos profundos. Prefieres la independencia y evitas situaciones que requieran involucramiento emocional o social intenso.',
        advice: 'Intenta encontrar un equilibrio entre tu independencia y el establecimiento de vínculos más profundos. Pequeños pasos como dedicar tiempo de calidad a tus relaciones más cercanas pueden marcar una gran diferencia.'
      };
    case 'soñadores':
      return {
        title: 'Soñador',
        color: '#EAB308', // Yellow-500
        description: 'Tu perfil refleja que tienes muchas ideas y aspiraciones, pero puede que te falte concreción en tus planes. Tiendes a imaginar escenarios ideales sin dar necesariamente los pasos prácticos para alcanzarlos.',
        advice: 'Canaliza tu creatividad estableciendo metas concretas y alcanzables. Divide tus grandes sueños en pasos pequeños y medibles que puedas ir completando.'
      };
    case 'aficionados':
      return {
        title: 'Aficionado',
        color: '#22C55E', // Green-500
        description: 'Tu perfil indica que exploras muchas áreas de interés sin comprometerte profundamente con ninguna. Disfrutas la variedad y las nuevas experiencias, pero puedes encontrar difícil persistir en un solo camino.',
        advice: 'Identifica qué áreas te apasionan realmente y permite que algunas de ellas evolucionen hacia un compromiso más profundo. La especialización en algunas áreas no significa abandonar tu versatilidad.'
      };
    case 'comprometidos':
      return {
        title: 'Comprometido',
        color: '#3B82F6', // Blue-500
        description: 'Tu perfil demuestra un alto nivel de compromiso con tus relaciones, objetivos y comunidad. Tomas en serio tus responsabilidades y trabajas consistentemente hacia tus metas.',
        advice: 'Tu compromiso es una fortaleza valiosa. Asegúrate de equilibrarlo con momentos de flexibilidad y descanso para evitar el agotamiento y seguir disfrutando de tus proyectos a largo plazo.'
      };
    default:
      return {
        title: 'Resultado',
        color: '#8B5CF6', // Purple-500
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
      <title>Tus Resultados del Test - Via Propósito</title>
      <style>
        body {
          font-family: Arial, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f9fafb;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: ${categoryData.color};
          color: white;
          padding: 30px 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }
        .header p {
          margin: 10px 0 0;
          font-size: 18px;
          opacity: 0.9;
        }
        .content {
          background-color: white;
          padding: 30px;
          border-radius: 0 0 8px 8px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        .section {
          margin-bottom: 25px;
        }
        .section h2 {
          color: #1f2937;
          font-size: 20px;
          margin-top: 0;
          margin-bottom: 15px;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 10px;
        }
        .advice-box {
          background-color: #f3f4f6;
          border-left: 4px solid ${categoryData.color};
          padding: 15px;
          border-radius: 4px;
          margin-top: 20px;
        }
        .advice-box h3 {
          margin-top: 0;
          color: #1f2937;
          font-size: 16px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          color: #6b7280;
          font-size: 14px;
        }
        .button {
          display: inline-block;
          background-color: ${categoryData.color};
          color: white;
          padding: 12px 25px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Via Propósito</h1>
          <p>Tus Resultados del Test</p>
        </div>
        <div class="content">
          <div class="section">
            <h2>Tu Perfil: ${categoryData.title}</h2>
            <p>${categoryData.description} Es posible que te sientas más cómodo con este enfoque, pero también hay oportunidades para el crecimiento personal explorando otros estilos.</p>
          </div>
          
          <div class="advice-box">
            <h3>Consejo personalizado:</h3>
            <p>${categoryData.advice}</p>
          </div>
          
          <div class="section">
            <h2>¿Qué significa esto?</h2>
            <p>Este resultado refleja tus tendencias actuales en cómo te relacionas con diferentes aspectos de tu vida. Recuerda que no hay perfiles "buenos" o "malos" - cada uno tiene sus propias fortalezas y áreas de crecimiento.</p>
            <p>Puedes usar esta información para reflexionar sobre cómo te acercas a tus relaciones, trabajo, y objetivos personales.</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: white; text-decoration: none;">
              <div class="button">Visitar Via Propósito</div>
            </a>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${currentYear} Via Propósito. Todos los derechos reservados.</p>
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
      from: process.env.EMAIL_SERVER_USER,
      to: email,
      subject: `Tus Resultados: Perfil ${categoryData.title} - Via Propósito`,
      text: `Has completado el test de Via Propósito. Tu perfil es: ${categoryData.title}. ${categoryData.description} ${categoryData.advice}`,
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