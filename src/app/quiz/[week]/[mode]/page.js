"use client";

import { useParams, useRouter } from 'next/navigation';
import QuizInterface from '@/components/QuizInterface';

export default function QuizPage() {
    const params = useParams();
    const router = useRouter();
    const week = parseInt(params.week);
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
