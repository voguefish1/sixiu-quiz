const engine = require('../../utils/engine');

Page({
  data: { stats: {}, wrongQuestions: [], activeTab: 'summary' },

  onLoad() {
    const app = getApp();
    const questions = app.globalData.currentQuestions;
    const userAnswers = app.globalData.userAnswers || {};
    questions.forEach(q => { if (!userAnswers[q.id]) userAnswers[q.id] = []; });
    const stats = engine.calcStats(questions, userAnswers);
    const wrong = engine.getWrongQuestions(questions, userAnswers).map(q => ({
      ...q,
      userAns: (userAnswers[q.id] || []).join('') || '未作答'
    }));
    this.setData({ stats, wrongQuestions: wrong, allQuestions: questions, userAnswers });
  },

  switchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab });
  },

  retryWrong() {
    const app = getApp();
    app.globalData.currentQuestions = engine.shuffle(this.data.wrongQuestions);
    app.globalData.quizMode = 'practice';
    wx.redirectTo({ url: '/pages/quiz/quiz' });
  },

  goHome() {
    wx.redirectTo({ url: '/pages/index/index' });
  }
});
