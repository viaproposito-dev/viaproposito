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
        const categoryScores = {
            desorientado: 0,
            rebelde: 0,
            explorador: 0,
            constructor: 0,
            guia: 0
        };

        Object.entries(answers).forEach(([questionId, value]) => {
            const qId = parseInt(questionId);
            if (qId >= 1 && qId <= 6) {
                categoryScores.desorientado += value;
            } else if (qId >= 7 && qId <= 12) {
                categoryScores.rebelde += value;
            } else if (qId >= 13 && qId <= 18) {
                categoryScores.explorador += value;
            } else if (qId >= 19 && qId <= 24) {
                categoryScores.constructor += value;
            } else if (qId >= 25 && qId <= 30) {
                categoryScores.guia += value;
            }
        });

        const resultsArray: CategoryResult[] = [
            { category: "desorientado", score: categoryScores.desorientado, order: 1 },
            { category: "rebelde", score: categoryScores.rebelde, order: 2 },
            { category: "explorador", score: categoryScores.explorador, order: 3 },
            { category: "constructor", score: categoryScores.constructor, order: 4 },
            { category: "guia", score: categoryScores.guia, order: 5 }
        ];

        // Ordenar por puntaje (descendente); en empate gana el perfil de menor orden
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
                    desorientado: calculatedResults.find(r => r.category === 'desorientado')?.score || 0,
                    rebelde: calculatedResults.find(r => r.category === 'rebelde')?.score || 0,
                    explorador: calculatedResults.find(r => r.category === 'explorador')?.score || 0,
                    constructor: calculatedResults.find(r => r.category === 'constructor')?.score || 0,
                    guia: calculatedResults.find(r => r.category === 'guia')?.score || 0
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

    const questions: Question[] = [
        // Desorientado (1-6)
        { id: 1, text: "No tengo claro qué quiero hacer con mi vida en este momento.", category: "desorientado" },
        { id: 2, text: "Evito pensar en mi futuro porque me genera ansiedad.", category: "desorientado" },
        { id: 3, text: "Siento que voy atrasado comparado con otros.", category: "desorientado" },
        { id: 4, text: "Me cuesta tomar decisiones sobre mi vida.", category: "desorientado" },
        { id: 5, text: "Siento que estoy viviendo en automático.", category: "desorientado" },
        { id: 6, text: "No sabría explicar cuáles son mis verdaderos intereses.", category: "desorientado" },

        // Rebelde (7-12)
        { id: 7, text: "Siento que el miedo a equivocarme me frena.", category: "rebelde" },
        { id: 8, text: "Me preocupa mucho lo que otros esperan de mí.", category: "rebelde" },
        { id: 9, text: "Me cuesta confiar en mis decisiones.", category: "rebelde" },
        { id: 10, text: "Siento que debería tener mi vida más resuelta.", category: "rebelde" },
        { id: 11, text: "Muchas veces dudo de mis capacidades.", category: "rebelde" },
        { id: 12, text: "Me cuesta soltar ideas o caminos que ya no me hacen sentido.", category: "rebelde" },

        // Explorador (13-18)
        { id: 13, text: "Me interesan muchas cosas, pero no logro elegir una.", category: "explorador" },
        { id: 14, text: "Empiezo cosas nuevas pero rara vez las termino.", category: "explorador" },
        { id: 15, text: "Me cuesta comprometerme con una sola dirección.", category: "explorador" },
        { id: 16, text: "Siento que necesito probar más antes de decidir.", category: "explorador" },
        { id: 17, text: "Tengo varias ideas sobre mi futuro, pero ninguna clara.", category: "explorador" },
        { id: 18, text: "Me da miedo cerrar opciones al tomar una decisión.", category: "explorador" },

        // Constructor (19-24)
        { id: 19, text: "Tengo claridad sobre hacia dónde quiero ir.", category: "constructor" },
        { id: 20, text: "Estoy tomando acciones concretas para construir mi futuro.", category: "constructor" },
        { id: 21, text: "Tengo metas claras en el corto o mediano plazo.", category: "constructor" },
        { id: 22, text: "Dedico tiempo constante a desarrollar mis habilidades.", category: "constructor" },
        { id: 23, text: "Estoy comprometido con mi crecimiento personal.", category: "constructor" },
        { id: 24, text: "Siento que estoy avanzando, aunque sea poco a poco.", category: "constructor" },

        // Guía (25-30)
        { id: 25, text: "Siento que mis decisiones están alineadas con la vida que quiero construir.", category: "guia" },
        { id: 26, text: "Tengo hábitos o sistemas que me ayudan a mantenerme enfocado en mis metas.", category: "guia" },
        { id: 27, text: "Sé cuáles son mis prioridades y actúo en función de ellas.", category: "guia" },
        { id: 28, text: "Siento que lo que hago tiene un impacto o significado más allá de mí mismo.", category: "guia" },
        { id: 29, text: "Incluso cuando pierdo motivación, tengo estructura para seguir avanzando.", category: "guia" },
        { id: 30, text: "He construido una vida que se siente cada vez más alineada conmigo mismo.", category: "guia" },
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