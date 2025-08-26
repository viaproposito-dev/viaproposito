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
    birthYear: number;
    gender: string;
    occupation: string;
    maritalStatus: string;
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

export interface UserDemographics {
    email: string;
    birthYear: number;
    gender: string;
    occupation: string;
    maritalStatus: string;
}