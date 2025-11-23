"use client";

import { Suspense } from 'react';
import QuizCompletion from '@/components/QuizCompletion';

function QuizCompletionPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        }>
            <QuizCompletion />
        </Suspense>
    );
}

export default QuizCompletionPage;
