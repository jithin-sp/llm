// Async data fetching from public/questions.json

let cachedData = null;

export const getAllWeeks = async () => {
  if (!cachedData) {
    try {
      const res = await fetch('/questions.json');
      if (!res.ok) throw new Error('Failed to fetch questions');
      cachedData = await res.json();
    } catch (error) {
      console.error("Error loading questions:", error);
      return []; // Return empty array on failure
    }
  }
  return cachedData.weeks || [];
};

export const getWeekById = async (weekNumber) => {
  const weeks = await getAllWeeks();

  const week = weeks.find((w) => w.week_number === weekNumber);
  if (!week && weeks.length > 0) return weeks[0];

  return week;
};

export const getQuestionsForWeek = async (weekNumber) => {
  const week = await getWeekById(weekNumber);
  return week ? week.questions : [];
};
