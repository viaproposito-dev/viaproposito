// app/test/page.tsx
"use client";
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import InstructionsModal from '@/components/InstructionsModal';
import QuestionForm from '@/components/QuestionForm';
import ResultsDisplay from '@/components/ResultsDisplay';
import LoadingOverlay from '@/components/LoadingOverlay';
import { Question, CategoryResult, TestResult, UserDemographics } from '@/types';

export default function TestPage() {
    const [showInstructions, setShowInstructions] = useState(true);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [showResults, setShowResults] = useState(false);
    const [results, setResults] = useState<CategoryResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [unansweredQuestions, setUnansweredQuestions] = useState<number[]>([]);
    const [isValidationVisible, setIsValidationVisible] = useState(false);
    const [userData, setUserData] = useState<UserDemographics | null>(null);
    const [submitError, setSubmitError] = useState<string>('');
    const [testResultId, setTestResultId] = useState<number | null>(null);
    const [emailSent, setEmailSent] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    const startTest = (userInfo: UserDemographics) => {
        setUserData(userInfo);
        setShowInstructions(false);
    };

    const handleAnswerChange = (questionId: number, value: number) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));

        // Si el usuario responde una pregunta que estaba marcada como no respondida, la quitamos de la lista
        if (unansweredQuestions.includes(questionId)) {
            setUnansweredQuestions(prev => prev.filter(id => id !== questionId));
        }
    };

    const calculateResults = () => {
        // Inicializar contador para cada categoría
        const categoryScores = {
            desenganchados: 0,
            soñadores: 0,
            aficionados: 0,
            comprometidos: 0
        };

        // Categorizar preguntas
        Object.entries(answers).forEach(([questionId, value]) => {
            const qId = parseInt(questionId);

            // Asignar puntos a la categoría correcta basado en el ID de la pregunta
            if (qId >= 1 && qId <= 9) {
                categoryScores.desenganchados += value;
            } else if (qId >= 10 && qId <= 18) {
                categoryScores.soñadores += value;
            } else if (qId >= 19 && qId <= 27) {
                categoryScores.aficionados += value;
            } else if (qId >= 28 && qId <= 37) {
                categoryScores.comprometidos += value;
            }
        });

        // Convertir a array para ordenar
        const resultsArray: CategoryResult[] = [
            { category: "desenganchados", score: categoryScores.desenganchados, order: 1 },
            { category: "soñadores", score: categoryScores.soñadores, order: 2 },
            { category: "aficionados", score: categoryScores.aficionados, order: 3 },
            { category: "comprometidos", score: categoryScores.comprometidos, order: 4 }
        ];

        // Ordenar por puntaje (descendente) y luego por orden (ascendente) en caso de empate
        resultsArray.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return a.order - b.order;
        });

        return resultsArray;
    };

    const saveResults = async (testResults: TestResult) => {
        try {
            const response = await fetch('/api/test-results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testResults),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al guardar los resultados');
            }

            // Guardar el ID del resultado para poder enviar el correo electrónico
            if (data.id) {
                setTestResultId(data.id);
            }

            return true;
        } catch (error) {
            console.error("Error al guardar resultados:", error);
            if (error instanceof Error) {
                setSubmitError(error.message);
            } else {
                setSubmitError('Ocurrió un error al guardar los resultados');
            }
            return false;
        }
    };

    const sendResultEmail = async () => {
        if (!userData || !testResultId) return;

        try {
            setIsLoading(true);

            const response = await fetch('/api/send-result-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: userData.email,
                    resultId: testResultId
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al enviar el correo');
            }

            setEmailSent(true);
        } catch (error) {
            console.error("Error al enviar correo:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Enviar el correo automáticamente cuando tengamos el ID del resultado
    useEffect(() => {
        if (testResultId && userData && !emailSent) {
            sendResultEmail();
        }
    }, [testResultId, userData, emailSent]);

    const checkUnansweredQuestions = (questions: Question[]) => {
        const missingQuestions: number[] = [];

        questions.forEach(question => {
            if (!answers[question.id]) {
                missingQuestions.push(question.id);
            }
        });

        return missingQuestions;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');

        if (!userData) {
            setSubmitError('Error: No se encontraron los datos del usuario');
            return;
        }

        // Verificar que todas las preguntas estén contestadas
        const missing = checkUnansweredQuestions(questions);

        if (missing.length > 0) {
            setUnansweredQuestions(missing);
            setIsValidationVisible(true);

            // Desplazar a la primera pregunta sin responder
            const firstUnansweredId = `question-${missing[0]}`;
            const element = document.getElementById(firstUnansweredId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Mostrar estado de carga
        setIsLoading(true);

        try {
            // Calcular resultados
            const calculatedResults = calculateResults();

            // Crear objeto con todos los datos del test
            const testResult: TestResult = {
                email: userData.email,
                birthYear: userData.birthYear,
                gender: userData.gender,
                occupation: userData.occupation,
                maritalStatus: userData.maritalStatus,
                date: new Date().toISOString(),
                answers: { ...answers },
                categoryScores: {
                    desenganchados: calculatedResults.find(r => r.category === 'desenganchados')?.score || 0,
                    soñadores: calculatedResults.find(r => r.category === 'soñadores')?.score || 0,
                    aficionados: calculatedResults.find(r => r.category === 'aficionados')?.score || 0,
                    comprometidos: calculatedResults.find(r => r.category === 'comprometidos')?.score || 0
                },
                result: calculatedResults[0].category
            };

            // Guardar en la base de datos
            const saveSuccess = await saveResults(testResult);

            if (!saveSuccess) {
                throw new Error("No se pudieron guardar los resultados");
            }

            // Actualizar estado y mostrar resultados
            setResults(calculatedResults);

            // Añadimos un pequeño delay para la experiencia de usuario
            setTimeout(() => {
                setShowResults(true);
                setIsLoading(false);

                // Desplazar a la parte superior para mostrar resultados
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 1000);
        } catch (error) {
            console.error("Error al procesar resultados:", error);
            setIsLoading(false);
            if (error instanceof Error) {
                setSubmitError(error.message);
            } else {
                setSubmitError('Ocurrió un error al procesar los resultados');
            }
        }
    };

    const resetTest = () => {
        setAnswers({});
        setShowResults(false);
        setUnansweredQuestions([]);
        setIsValidationVisible(false);
        setShowInstructions(true);
        setUserData(null);
        setSubmitError('');
        setTestResultId(null);
        setEmailSent(false);
    };

    // Preparar las preguntas con sus categorías
    const questions: Question[] = [
        // Desenganchados (1-9)
        { id: 1, text: "Ayer iba a contarle algo a un familiar cercano y que quiero mucho, pero pensé que no le interesaría y mejor me quedé callado.", category: "desenganchados" },
        { id: 2, text: "Cuando veo que alguien en casa está preocupado, me hago el ocupado para evitar que me cuenten o me pidan algo.", category: "desenganchados" },
        { id: 3, text: "Disfruto mi espacio y evitar discusiones o adaptarme a alguien más me hace sentir más tranquilo.", category: "desenganchados" },
        { id: 4, text: "He aprendido que cuidar a quienes me cuidaron es suficiente. No quiero más compromisos que me distraigan de eso ni complicarme más de lo necesario.", category: "desenganchados" },
        { id: 5, text: "Busco trabajos donde pueda estar solo, sin tener que hablar mucho con otros; así me siento más cómodo y en paz.", category: "desenganchados" },
        { id: 6, text: "Mi participación en la comunidad es irrelevante.", category: "desenganchados" },
        { id: 7, text: "Las responsabilidades podrían limitar mi capacidad de aportar con libertad y enfoque a las necesidades de la sociedad.", category: "desenganchados" },
        { id: 8, text: "Prefiero demostrar mi cariño a mis amigos de otras maneras más espontáneas, sin depender de fechas específicas.", category: "desenganchados" },
        { id: 9, text: "Sé que debería pedir consejo sobre situaciones importantes, pero siempre lo pospongo porque no siento que sea urgente aún.", category: "desenganchados" },

        // Soñadores (10-18)
        { id: 10, text: "Quisiera que en mi familia me apoyen incondicionalmente sin que me impongan reglas o me controlen.", category: "soñadores" },
        { id: 11, text: "Asisto a reuniones familiares para cumplir.", category: "soñadores" },
        { id: 12, text: "Cuando alguien de mi grupo no está de acuerdo conmigo, prefiero alejarme y dejar de hablar con esa persona.", category: "soñadores" },
        { id: 13, text: "Prefiero involucrarme en acciones concretas y cotidianas para mejorar mi entorno, más que en mecanismos formales como votar.", category: "soñadores" },
        { id: 14, text: "Antes de dejarme llevar por el amor, necesito sentir que esa persona encaja con lo que realmente valoro y busco.", category: "soñadores" },
        { id: 15, text: "Sé que aún no tengo claro mi camino profesional, pero estoy tratando de entender qué me mueve y hacia dónde quiero ir.", category: "soñadores" },
        { id: 16, text: "Busco un trabajo flexible, sin horarios estrictos ni metas rígidas, porque sé que el estrés me afecta mucho.", category: "soñadores" },
        { id: 17, text: "Me doy cuenta de que necesito reflexionar más sobre lo que quiero para mi vida; atravieso etapa que me reta a conocerme mejor.", category: "soñadores" },
        { id: 18, text: "Valoro el equilibrio entre el trabajo y el disfrute, por eso busco una forma de vivir donde pueda seguir divirtiéndome sin sentirme limitado económicamente.", category: "soñadores" },

        // Aficionados (19-27)
        { id: 19, text: "Valoro tanto la profundidad de una relación que no me interesa apresurarme; prefiero la soltería a una elección que no sea auténtica.", category: "aficionados" },
        { id: 20, text: "A veces me doy cuenta de que, aunque tengo muchas conexiones, echo de menos vínculos más auténticos y profundos.", category: "aficionados" },
        { id: 21, text: "Me doy cuenta de que me entusiasmo por pertenecer a varios círculos, pero esa misma dispersión me impide profundizar en algunos vínculos.", category: "aficionados" },
        { id: 22, text: "He probado varias áreas profesionales porque me interesan muchas cosas, pero aún no encuentro una con la que comprometerme a largo plazo.", category: "aficionados" },
        { id: 23, text: "Me cuesta estar sin pareja porque suelo organizar mi vida emocional y personal alrededor de la relación.", category: "aficionados" },
        { id: 24, text: "Desde mi infancia, he sentido un llamado profundo a construir una familia; es un ideal que ha guiado muchas de mis decisiones.", category: "aficionados" },
        { id: 25, text: "Me doy cuenta de que tengo muchas figuras que admiro, pero eso a veces me confunde más que aclararme el rumbo.", category: "aficionados" },
        { id: 26, text: "Después de mucha reflexión, decidí qué quiero hacer profesionalmente y ahora me esfuerzo en pulir mis planes para lograrlo.", category: "aficionados" },
        { id: 27, text: "Quisiera estar actualizado en las áreas que más me interesan para eso leo libros, veo videos, etc.", category: "aficionados" },

        // Comprometidos (28-37)
        { id: 28, text: "Valoro mucho a mis amigos y amigas, por eso mantengo una lista y trato de verlos o contactarlos cada 2 o 3 meses.", category: "comprometidos" },
        { id: 29, text: "Participar en lo que necesita mi comunidad me conecta con algo más grande que yo. Ser voluntario me hace sentir útil y parte de algo que vale la pena.", category: "comprometidos" },
        { id: 30, text: "Quiero estar involucrado en una causa que me importe de verdad. Más que una organización, sea una manera de vivir el compromiso con la sociedad.", category: "comprometidos" },
        { id: 31, text: "Creo en la responsabilidad de contribuir activamente al bien común. Por eso, participo como voluntario en espacios donde puedo sumar a la construcción de una mejor sociedad.", category: "comprometidos" },
        { id: 32, text: "He aprendido que la amistad, más que un valor, es una forma de vida que guía muchas de mis decisiones y prioridades.", category: "comprometidos" },
        { id: 33, text: "He imaginado cómo quiero que sea mi familia, pero también estoy abierto(a) a lo que la vida traiga. Comprendo que no todo se puede controlar, y estoy dispuesto(a) a amar y adaptarme a lo que venga, sea cual sea la situación.", category: "comprometidos" },
        { id: 34, text: "He estudiado con atención la vida de algunas personas que considero modelos a seguir. Me han ayudado a tener más claridad y a construir un plan con base sólida.", category: "comprometidos" },
        { id: 35, text: "Mi vocación se definió desde el inicio de mis estudios universitarios; saber qué áreas me llaman me ha dado sentido y motivación para crecer.", category: "comprometidos" },
        { id: 36, text: "Después de reflexionar, he trazado los pasos que quiero dar en mi carrera durante los siguientes cinco años y estoy listo(a) para trabajar en ellos.", category: "comprometidos" },
        { id: 37, text: "Tengo una noción clara de las oportunidades laborales disponibles para mí y el rango salarial acorde a mi formación actual.", category: "comprometidos" }
    ];

    return (
        <main className="min-h-screen bg-via-cream">
            {showInstructions && (
                <InstructionsModal onStart={startTest} />
            )}

            {isLoading && <LoadingOverlay />}

            {showResults ? (
                <ResultsDisplay
                    results={results}
                    onReset={resetTest}
                    email={userData?.email || ''}
                    emailSent={emailSent}
                />
            ) : (
                <div className="h-screen flex flex-col bg-via-cream p-3 sm:p-4">
                    {/* Header con logo */}
                    <div className="text-center py-2 mb-2">
                        <Image
                            src="/logos/logo_295244.png"
                            alt="Vía Propósito"
                            width={150}
                            height={60}
                            className="mx-auto"
                            priority
                        />
                    </div>

                    {/* Alertas de validación */}
                    {isValidationVisible && unansweredQuestions.length > 0 && (
                        <div className="mx-auto max-w-md mb-2 p-3 bg-via-orange/10 border border-via-orange/30 rounded-lg">
                            <div className="flex items-center justify-center">
                                <svg className="h-4 w-4 text-via-orange mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="text-via-orange font-poppins font-medium text-sm">
                                    Por favor responde todas las preguntas
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Alertas de error */}
                    {submitError && (
                        <div className="mx-auto max-w-md mb-2 p-3 bg-red-50 border border-red-300 rounded-lg">
                            <div className="flex items-center justify-center">
                                <svg className="h-4 w-4 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="text-red-700 font-poppins font-medium text-sm">
                                    {submitError}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="flex-1 flex flex-col min-h-0">
                        <QuestionForm
                            ref={formRef}
                            questions={questions}
                            answers={answers}
                            onAnswerChange={handleAnswerChange}
                            onSubmit={handleSubmit}
                            unansweredQuestions={unansweredQuestions}
                        />
                    </div>
                </div>
            )}
        </main>
    );
}