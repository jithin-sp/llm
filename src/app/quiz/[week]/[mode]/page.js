"use client";

import { useParams, useRouter } from 'next/navigation';
import QuizInterface from '@/components/QuizInterface';

export default function QuizPage() {
    const params = useParams();
    const router = useRouter();
    
    // Handle "ultimate" as a special case, otherwise parse as integer
    const week = params.week === 'ultimate' ? 'ultimate' : parseInt(params.week, 10);
    const mode = params.mode;

    const handleClose = () => {
        router.push('/home');
    };

    return (
        <QuizInterface
            weekNumber={week}
            onClose={handleClose}
            initialMode={mode}
        />
    );
}
