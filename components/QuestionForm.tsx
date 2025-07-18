import React, { forwardRef, useState } from 'react';
import { Question } from '../types';

interface QuestionFormProps {
    questions: Question[];
    answers: Record<number, number>;
    onAnswerChange: (questionId: number, value: number) => void;
    onSubmit: (e: React.FormEvent) => void;
    unansweredQuestions: number[];
}

const QuestionForm = forwardRef<HTMLFormElement, QuestionFormProps>(({
    questions,
    answers,
    onAnswerChange,
    onSubmit,
    unansweredQuestions
}, ref) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const options = [
        { value: 1, label: "Totalmente en desacuerdo" },
        { value: 2, label: "En desacuerdo" },
        { value: 3, label: "De acuerdo" },
        { value: 4, label: "Totalmente de acuerdo" }
    ];

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const isFirstQuestion = currentQuestionIndex === 0;

    // Función para obtener el progreso del test
    const getProgress = () => {
        const totalQuestions = questions.length;
        const answeredQuestions = Object.keys(answers).length;
        return Math.round((answeredQuestions / totalQuestions) * 100);
    };

    const handlePrevious = () => {
        if (!isFirstQuestion) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleNext = () => {
        if (!isLastQuestion) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handleAnswerChange = (questionId: number, value: number) => {
        onAnswerChange(questionId, value);
    };

    const handleAnswerAndNext = (questionId: number, value: number) => {
        handleAnswerChange(questionId, value);

        // Force blur any active element to clear touch hover states
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        // Additional cleanup for touch devices - remove hover states from all labels
        const labels = document.querySelectorAll('label');
        labels.forEach(label => {
            label.blur();
            // Force a reflow to ensure hover states are cleared
            label.style.transform = 'scale(1)';
            label.style.boxShadow = 'none';
        });

        // Si no es la última pregunta, avanzar automáticamente después de un breve delay
        if (!isLastQuestion) {
            setTimeout(() => {
                setCurrentQuestionIndex(prev => prev + 1);
                // Additional cleanup after navigation
                setTimeout(() => {
                    const newLabels = document.querySelectorAll('label');
                    newLabels.forEach(label => label.blur());
                }, 100);
            }, 300);
        }
    };

    return (
        <form onSubmit={onSubmit} ref={ref} noValidate className="flex flex-col h-full">
            {/* Indicador de pregunta actual - centrado */}
            <div className="text-center mb-4">
                <h2 className="text-lg sm:text-xl font-poppins font-semibold text-via-primary">
                    Pregunta {currentQuestionIndex + 1} de {questions.length}
                </h2>
            </div>

            {/* Barra de progreso minimalista - centrada */}
            <div className="max-w-md mx-auto w-full mb-4 px-4 sm:px-0">
                <div className="flex justify-between items-center mb-2">
                    <div className="w-full bg-via-sage/20 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-via-primary to-via-secondary h-2 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${getProgress()}%` }}
                        ></div>
                    </div>
                    <span className="text-sm font-poppins font-medium text-via-primary ml-3">
                        {getProgress()}%
                    </span>
                </div>
            </div>

            {/* Pregunta actual - centrada */}
            <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full px-4 sm:px-0">
                <div className={`rounded-xl shadow-lg border-2 transition-all duration-300 ${unansweredQuestions.includes(currentQuestion.id)
                    ? 'bg-via-orange/5 border-via-orange shadow-via-orange/20'
                    : answers[currentQuestion.id]
                        ? 'bg-via-cream border-via-primary/30 shadow-via-primary/10'
                        : 'bg-white border-via-sage/30'
                    }`}>
                    {/* Header de la pregunta */}
                    <div className="p-4 sm:p-6">
                        <div className="mb-4">
                            <p className={`font-poppins text-base sm:text-lg leading-relaxed ${unansweredQuestions.includes(currentQuestion.id)
                                ? 'text-via-orange font-medium'
                                : 'text-via-primary'
                                }`}>
                                {currentQuestion.text}
                            </p>
                        </div>

                        {/* Opciones de respuesta */}
                        <div className="space-y-2 sm:space-y-3" key={`question-${currentQuestion.id}-options`}>
                            {options.map((option) => {
                                // Fix: Check if THIS specific question has been answered with this option value
                                const isSelected = answers[currentQuestion.id] === option.value;

                                return (
                                    <div key={`${currentQuestion.id}-${option.value}`} className="relative">
                                        <input
                                            type="radio"
                                            id={`q${currentQuestion.id}-o${option.value}`}
                                            name={`question-${currentQuestion.id}`}
                                            value={option.value}
                                            checked={isSelected}
                                            onChange={() => handleAnswerAndNext(currentQuestion.id, option.value)}
                                            className="sr-only"
                                        />
                                        <label
                                            htmlFor={`q${currentQuestion.id}-o${option.value}`}
                                            onTouchEnd={(e) => {
                                                // Force remove any hover states on touch devices
                                                const element = e.currentTarget;
                                                element.blur();
                                                setTimeout(() => element.blur(), 50);
                                            }}
                                            className={`
                                                block w-full p-3 sm:p-4 border-2 rounded-lg cursor-pointer 
                                                transition-all duration-200 font-poppins text-left text-sm sm:text-base
                                                transform active:scale-[0.98] focus:outline-none
                                                ${isSelected
                                                    ? unansweredQuestions.includes(currentQuestion.id)
                                                        ? 'border-via-orange bg-via-orange/10 text-via-orange font-semibold shadow-lg scale-[1.02]'
                                                        : 'border-via-primary bg-via-primary/10 text-via-primary font-semibold shadow-lg scale-[1.02]'
                                                    : unansweredQuestions.includes(currentQuestion.id)
                                                        ? 'border-via-orange/30 text-via-primary/80 bg-white'
                                                        : 'border-via-sage/30 text-via-primary/80 bg-white'
                                                }
                                                ${!isSelected ? 'hover:scale-[1.02] hover:shadow-md' : ''}
                                                ${!isSelected && unansweredQuestions.includes(currentQuestion.id) ? 'hover:border-via-orange/60 hover:bg-via-cream/50' : ''}
                                                ${!isSelected && !unansweredQuestions.includes(currentQuestion.id) ? 'hover:border-via-primary/60 hover:bg-via-cream/50' : ''}
                                            `}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="flex-1">
                                                    {option.label}
                                                </span>

                                                {/* Indicador visual de selección */}
                                                {isSelected && (
                                                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-via-primary rounded-full flex items-center justify-center shadow-lg ml-3">
                                                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Navegación - botones anterior, siguiente y finalizar */}
                <div className="mt-6 flex justify-between items-center max-w-2xl mx-auto w-full sm:px-0">
                    <button
                        type="button"
                        onClick={handlePrevious}
                        disabled={isFirstQuestion}
                        className={`px-6 py-3 text-sm rounded-lg font-poppins font-medium transition-all duration-200 ${isFirstQuestion
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-via-sage/20 text-via-primary hover:bg-via-sage/30 hover:shadow-sm'
                            }`}
                    >
                        <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Anterior
                    </button>

                    <div className="flex gap-3">
                        {/* Botón Siguiente - solo si no es la última pregunta */}
                        {!isLastQuestion && (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="px-6 py-3 text-sm bg-via-sage/20 text-via-primary hover:bg-via-sage/30 hover:shadow-sm font-poppins font-medium rounded-lg transition-all duration-200"
                            >
                                Siguiente
                                <svg className="w-4 h-4 inline ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        )}

                        {/* Botón Finalizar - solo en la última pregunta */}
                        {isLastQuestion && (
                            <button
                                type="submit"
                                className="px-6 py-3 text-sm bg-gradient-to-r from-via-primary to-via-secondary hover:from-via-secondary hover:to-via-primary text-white font-poppins font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md active:scale-95"
                            >
                                <span className="flex items-center">
                                    Finalizar
                                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </span>
                            </button>
                        )}
                    </div>
                </div>

            </div>

        </form>
    );
});

QuestionForm.displayName = 'QuestionForm';

export default QuestionForm;