const engine = require('../../utils/engine');

Page({
  data: {
    questions: [],
    currentIndex: 0,
    userAnswers: {},
    quizMode: 'practice',
    isMulti: false,
    multiSelected: [],
    showFeedback: false,
    feedbackText: '',
    feedbackCorrect: false,
    isLast: false,
    examMode: false,
    navDots: [],
    navAnswered: 0,
    navUnanswered: 0
  },

  onLoad() {
    const app = getApp();
    const questions = app.globalData.currentQuestions;
    this.setData({
      questions, quizMode: app.globalData.quizMode,
      examMode: app.globalData.quizMode === 'exam',
      navUnanswered: questions.length
    });
    this.renderQuestion();
  },

  renderQuestion() {
    const { questions, currentIndex, userAnswers } = this.data;
    if (currentIndex >= questions.length) {
      wx.redirectTo({ url: '/pages/result/result' });
      return;
    }
    const q = questions[currentIndex];
    const prev = userAnswers[q.id];
    const isAnswered = !!prev;
    const showFeedback = !this.data.examMode && isAnswered;
    let feedbackText = '', feedbackCorrect = false;

    if (showFeedback) {
      feedbackCorrect = engine.isAnswerCorrect(q, prev);
      feedbackText = feedbackCorrect ? '✅ 回答正确！' : '❌ 回答错误！正确答案：' + q.answer;
    }

    // 导航点
    const navDots = questions.map((_, i) => ({
      index: i, current: i === currentIndex,
      answered: !!userAnswers[questions[i].id]
    }));
    const navAnswered = questions.filter(qq => !!userAnswers[qq.id]).length;

    this.setData({
      currentQuestion: q,
      isMulti: q.type === '多选题',
      multiSelected: prev || [],
      showFeedback, feedbackText, feedbackCorrect,
      isAnswered, navDots, navAnswered,
      navUnanswered: questions.length - navAnswered,
      isLast: currentIndex === questions.length - 1
    });
  },

  selectOption(e) {
    if (this.data.showFeedback || (this.data.examMode && this.data.isAnswered)) return;
    const label = e.currentTarget.dataset.label;

    if (this.data.isMulti) {
      let sel = [...this.data.multiSelected];
      const idx = sel.indexOf(label);
      if (idx > -1) sel.splice(idx, 1); else sel.push(label);
      this.setData({ multiSelected: sel });
    } else {
      this.submitAnswer([label]);
    }
  },

  submitMulti() {
    if (this.data.multiSelected.length === 0) {
      wx.showToast({ title: '请至少选一个', icon: 'none' }); return;
    }
    this.submitAnswer(this.data.multiSelected);
  },

  submitAnswer(labels) {
    const q = this.data.questions[this.data.currentIndex];
    const userAnswers = { ...this.data.userAnswers, [q.id]: labels };
    this.setData({ userAnswers });

    if (this.data.examMode) {
      this.nextQuestion();
    } else {
      this.renderQuestion();
    }
  },

  nextQuestion() {
    if (this.data.currentIndex >= this.data.questions.length - 1) {
      wx.redirectTo({ url: '/pages/result/result' });
    } else {
      this.setData({ currentIndex: this.data.currentIndex + 1, multiSelected: [] }, () => this.renderQuestion());
    }
  },

  prevQuestion() {
    if (this.data.currentIndex > 0) {
      this.setData({ currentIndex: this.data.currentIndex - 1, multiSelected: [] }, () => this.renderQuestion());
    }
  },

  jumpTo(e) {
    this.setData({ currentIndex: e.currentTarget.dataset.index, multiSelected: [] }, () => this.renderQuestion());
  },

  submitExam() {
    const unanswered = this.data.questions.filter(q => !this.data.userAnswers[q.id]).length;
    const msg = unanswered > 0 ? `还有${unanswered}题未答，确定交卷？` : '确定交卷？';
    wx.showModal({ title: '交卷', content: msg, success: (res) => {
      if (res.confirm) wx.redirectTo({ url: '/pages/result/result' });
    }});
  }
});
