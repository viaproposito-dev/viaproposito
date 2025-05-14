// app/test/page.tsx
// Movemos todo el contenido actual de app/page.tsx a app/test/page.tsx
"use client";
import React, { useState, useEffect, useRef } from 'react';
import InstructionsModal from '@/components/InstructionsModal';
import QuestionForm from '@/components/QuestionForm';
import ResultsDisplay from '@/components/ResultsDisplay';
import LoadingOverlay from '@/components/LoadingOverlay';
import { Question, CategoryResult, TestResult } from '@/types';

export default function TestPage() {
    const [showInstructions, setShowInstructions] = useState(true);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [showResults, setShowResults] = useState(false);
    const [results, setResults] = useState<CategoryResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [unansweredQuestions, setUnansweredQuestions] = useState<number[]>([]);
    const [isValidationVisible, setIsValidationVisible] = useState(false);
    const [userEmail, setUserEmail] = useState<string>('');
    const [submitError, setSubmitError] = useState<string>('');
    const [testResultId, setTestResultId] = useState<number | null>(null);
    const [emailSent, setEmailSent] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    const startTest = (email: string) => {
        setUserEmail(email);
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
        if (!userEmail || !testResultId) return;

        try {
            setIsLoading(true);

            const response = await fetch('/api/send-result-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: userEmail,
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
        if (testResultId && userEmail && !emailSent) {
            sendResultEmail();
        }
    }, [testResultId, userEmail, emailSent]);

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
                email: userEmail,
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
        setUserEmail('');
        setSubmitError('');
        setTestResultId(null);
        setEmailSent(false);
    };

    // Preparar las preguntas con sus categorías
    const questions: Question[] = [
        // Desenganchados (1-9)
        { id: 1, text: "Hablo poco con mi mamá, porque no le interesan mis temas.", category: "desenganchados" },
        { id: 2, text: "Prefiero estar tranquilo y que los de mi familia no me cuenten sus problemas o me pidan ayuda.", category: "desenganchados" },
        { id: 3, text: "Es más cómodo y confortable vivir sólo que en pareja.", category: "desenganchados" },
        { id: 4, text: "Cuidar a mis papás es el motivo por el que trabajo y me esfuerzo desde hace años.", category: "desenganchados" },
        { id: 5, text: "Preferiría un trabajo donde no haya interacciones sociales, para mantenerme aislado de los demás.", category: "desenganchados" },
        { id: 6, text: "Evito las actividades de participación en mi comunidad porque no tiene un impacto real.", category: "desenganchados" },
        { id: 7, text: "Es una prioridad para mí ayudar a mi país, a mi estado, a mi municipio con mi esfuerzo y mi trabajo.", category: "desenganchados" },
        { id: 8, text: "Tengo formas de recordar los cumpleaños y aniversarios de mis amigos.", category: "desenganchados" },
        { id: 9, text: "Tendría que pedir consejo sobre mi vida profesional pero me falta urgencia para hacerlo.", category: "desenganchados" },

        // Soñadores (10-18)
        { id: 10, text: "Lo que espero de mis papás es que me apoyen económicamente sin que me exijan con pongan reglas.", category: "soñadores" },
        { id: 11, text: "Estoy en las actividades familiares exclusivamente para que mis papás me sigan apoyando económicamente.", category: "soñadores" },
        { id: 12, text: "Cuando mis amigos o amigas me contradicen los dejo de frecuentar.", category: "soñadores" },
        { id: 13, text: "No creo que votar tenga un impacto real en la sociedad.", category: "soñadores" },
        { id: 14, text: "Tengo hecha una lista de cuestiones que debe cumplir una persona con la que comienzo a salir antes de plantearme la posibilidad de enamorarme.", category: "soñadores" },
        { id: 15, text: "Tengo ideas sobre mi futuro profesional pero no he tomado aún ninguna acción concreta.", category: "soñadores" },
        { id: 16, text: "Necesito un trabajo en el que no haya horario fijo, ni objetivos específicos, para no estresarme.", category: "soñadores" },
        { id: 17, text: "No tengo un plan concreto después de terminar mis estudios.", category: "soñadores" },
        { id: 18, text: "Me gustaría que mi sueldo me diera para seguirme divirtiendo.", category: "soñadores" },

        // Aficionados (19-27)
        { id: 19, text: "Podría quedarme solter@ con tal de no equivocarme al elegir pareja.", category: "aficionados" },
        { id: 20, text: "Tengo muchos conocidos, casi no tengo amigos.", category: "aficionados" },
        { id: 21, text: "Tengo varios grupos de amigos con los que me comprometo a reunirme, al final termino viendo a muy pocos porque son demasiados.", category: "aficionados" },
        { id: 22, text: "Me gusta explorar muchas áreas profesionales, pero no me comprometo a largo plazo con ninguna.", category: "aficionados" },
        { id: 23, text: "Sufro cuando no tengo novi@, siento que todo lo demás se acomoda en función de la relación.", category: "aficionados" },
        { id: 24, text: "Desde mi niñez siempre he tenido claro que quiero formar una familia.", category: "aficionados" },
        { id: 25, text: "Haciendo cuentas tengo muchos modelos a seguir en mi vida profesional.", category: "aficionados" },
        { id: 26, text: "Ya decidí qué quiero hacer profesionalmente y dedico tiempo específico a afinar mis planes profesionales.", category: "aficionados" },
        { id: 27, text: "Procuro leer semanalmente sobre mis áreas de especialización.", category: "aficionados" },

        // Comprometidos (28-37)
        { id: 28, text: "Mis amigos y mis amigas son parte importante de mi felicidad: tengo una lista de amigos, y a cada uno le dedico un tiempo cada 2 o 3 meses.", category: "comprometidos" },
        { id: 29, text: "Estoy convencido de la necesidad de la participación ciudadana, procuro ayudar en lo que me piden en mi municipio como voluntario.", category: "comprometidos" },
        { id: 30, text: "Pertenezco a una asociación cívica y me siento muy comprometido a seguir ayudando.", category: "comprometidos" },
        { id: 31, text: "Me interesa mucho la política y participo como voluntario en la campaña de quien me parece mejor candidato. Creo que es un modo de hacer una mejor ciudad y un mejor estado.", category: "comprometidos" },
        { id: 32, text: "Para mí la amistad es un valor que está prácticamente encima de cualquier otro.", category: "comprometidos" },
        { id: 33, text: "He pensado cuántos hijos tener, dónde quiero educarlos, pero entiendo que eso no puedo controlarlo. Por ejemplo, si mi esposa o esposo no puede tener hijos, o si tengo un hijo o hija con alguna condición.", category: "comprometidos" },
        { id: 34, text: "He profundizado en la vida de dos o tres personas que considero modelos a seguir para poder elaborar mi plan profesional.", category: "comprometidos" },
        { id: 35, text: "Tengo claras mis áreas de especialización desde que comencé la universidad.", category: "comprometidos" },
        { id: 36, text: "Ya decidí cuáles serían los siguientes pasos que dar en mi vida profesional en los siguientes cinco años.", category: "comprometidos" },
        { id: 37, text: "Tengo claro dónde podría trabajar y qué sueldo podría obtener con la preparación que tengo actualmente.", category: "comprometidos" }
    ];

    return (
        <main className="min-h-screen bg-gray-50">
            {showInstructions && (
                <InstructionsModal onStart={startTest} />
            )}

            {isLoading && <LoadingOverlay />}

            {showResults ? (
                <ResultsDisplay
                    results={results}
                    onReset={resetTest}
                    email={userEmail}
                    emailSent={emailSent}
                />
            ) : (
                <div className="container mx-auto px-4 py-8">
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Via Propósito</h1>
                        <p className="text-center text-gray-600 mb-6">Test de evaluación personal</p>

                        {isValidationVisible && unansweredQuestions.length > 0 && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700 font-medium">
                                            Por favor responde las siguientes preguntas para continuar:
                                        </p>
                                        <div className="mt-2 text-sm text-red-600 flex flex-wrap gap-2">
                                            {unansweredQuestions.map(id => (
                                                <span key={id} className="bg-red-100 px-2 py-1 rounded">
                                                    {id}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {submitError && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700 font-medium">
                                            Error al guardar los resultados:
                                        </p>
                                        <p className="text-sm text-red-600 mt-1">
                                            {submitError}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

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