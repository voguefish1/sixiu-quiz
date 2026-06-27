function getAnswerLabels(q) {
  if (/^[A-E]+$/.test(q.answer)) return q.answer.split('');
  for (const opt of q.options) {
    if (opt.text === q.answer) return [opt.label];
  }
  return q.answer.split('').filter(c => c.trim());
}

function isAnswerCorrect(q, userAns) {
  if (!userAns || userAns.length === 0) return false;
  const correctLabels = getAnswerLabels(q);
  const user = [...userAns].sort();
  return JSON.stringify(correctLabels.sort()) === JSON.stringify(user);
}

function calcStats(questions, userAnswers) {
  let correct = 0;
  const chapterStats = {}, typeStats = {}, diffStats = {};
  questions.forEach(q => {
    const ok = isAnswerCorrect(q, userAnswers[q.id] || []);
    if (ok) correct++;
    if (!chapterStats[q.chapter]) chapterStats[q.chapter] = { total: 0, correct: 0 };
    chapterStats[q.chapter].total++; if (ok) chapterStats[q.chapter].correct++;
    if (!typeStats[q.type]) typeStats[q.type] = { total: 0, correct: 0 };
    typeStats[q.type].total++; if (ok) typeStats[q.type].correct++;
    if (!diffStats[q.difficulty]) diffStats[q.difficulty] = { total: 0, correct: 0 };
    diffStats[q.difficulty].total++; if (ok) diffStats[q.difficulty].correct++;
  });
  return { total: questions.length, correct, wrong: questions.length - correct, rate: questions.length > 0 ? Math.round(correct / questions.length * 100) : 0, chapterStats, typeStats, diffStats };
}

function getWrongQuestions(questions, userAnswers) {
  return questions.filter(q => !isAnswerCorrect(q, userAnswers[q.id] || []));
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

module.exports = { getAnswerLabels, isAnswerCorrect, calcStats, getWrongQuestions, shuffle };
