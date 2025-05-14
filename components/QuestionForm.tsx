// components/QuestionForm.tsx
import React, { forwardRef } from 'react';
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
    const options = [
        { value: 1, label: "Totalmente en desacuerdo" },
        { value: 2, label: "En desacuerdo" },
        { value: 3, label: "De acuerdo" },
        { value: 4, label: "Totalmente de acuerdo" }
    ];

    return (
        <form onSubmit={onSubmit} ref={ref} noValidate>
            <div className="space-y-8">
                {questions.map((question) => {
                    const isUnanswered = unansweredQuestions.includes(question.id);

                    return (
                        <div
                            key={question.id}
                            id={`question-${question.id}`}
                            className={`p-4 rounded-lg transition-colors duration-300 ${isUnanswered ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                                }`}
                        >
                            <div className="flex items-start mb-4">
                                <span className={`flex-shrink-0 w-8 h-8 rounded-full text-white flex items-center justify-center mr-3 font-medium ${isUnanswered ? 'bg-red-500' : 'bg-blue-600'
                                    }`}>
                                    {question.id}
                                </span>
                                <p className={`${isUnanswered ? 'text-red-800' : 'text-gray-800'}`}>
                                    {question.text}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4">
                                {options.map((option) => (
                                    <div key={`${question.id}-${option.value}`} className="relative">
                                        <input
                                            type="radio"
                                            id={`q${question.id}-o${option.value}`}
                                            name={`question-${question.id}`}
                                            value={option.value}
                                            checked={answers[question.id] === option.value}
                                            onChange={() => onAnswerChange(question.id, option.value)}
                                            className="sr-only" // Usamos sr-only en lugar de hidden
                                        />
                                        <label
                                            htmlFor={`q${question.id}-o${option.value}`}
                                            className={`
                        block w-full p-3 border rounded-lg cursor-pointer 
                        transition-all duration-200 text-sm text-center
                        ${isUnanswered
                                                    ? 'border-red-300 hover:border-red-400'
                                                    : 'border-gray-300 hover:border-gray-400'}
                        ${answers[question.id] === option.value
                                                    ? isUnanswered
                                                        ? 'border-red-500 bg-red-50 text-red-800 font-medium'
                                                        : 'border-blue-600 bg-blue-50 text-blue-800 font-medium'
                                                    : 'text-gray-700'}
                      `}
                                        >
                                            {option.label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-10 pt-6 border-t border-gray-200">
                <button
                    type="submit"
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-lg transition duration-200"
                >
                    Finalizar Test
                </button>
            </div>
        </form>
    );
});

QuestionForm.displayName = 'QuestionForm';

export default QuestionForm;