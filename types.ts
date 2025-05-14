// types.ts
export interface Question {
    id: number;
    text: string;
    category: string;
}

export interface CategoryResult {
    category: string;
    score: number;
    order: number;
}

export interface TestResult {
    email: string;
    date: string;
    answers: Record<number, number>;
    categoryScores: {
        desenganchados: number;
        soñadores: number;
        aficionados: number;
        comprometidos: number;
    };
    result: string;
}