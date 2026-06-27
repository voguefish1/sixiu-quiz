const config = require('../../config');
const engine = require('../../utils/engine');

Page({
  data: {
    banks: config.banks,
    currentBank: 0,
    bankInfo: {},
    quizMode: 'practice',
    chapters: [], types: [], diffs: ['易','中','难'],
    filters: { chapters: [], types: [], diffs: ['易','中','难'] },
    questionCount: 0,
    loading: true
  },

  onLoad() {
    this.selectBank(0);
  },

  selectBank(index) {
    const bank = config.banks[index];
    this.setData({ loading: true, currentBank: index });
    wx.request({
      url: config.baseUrl + bank.file,
      success: (res) => {
        const data = res.data;
        const questions = data.questions || data;
        const info = { title: data.title || bank.name, subtitle: data.subtitle || '' };
        const chapters = [...new Set(questions.map(q => q.chapter))];
        const types = [...new Set(questions.map(q => q.type))];
        const app = getApp();
        app.globalData.allQuestions = questions;
        app.globalData.bankInfo = info;
        this.setData({
          bankInfo: info, chapters, types,
          filters: { chapters: chapters.slice(), types: types.slice(), diffs: ['易','中','难'] },
          loading: false
        });
        this.updateCount();
      },
      fail: () => { wx.showToast({ title: '加载失败', icon: 'none' }); this.setData({ loading: false }); }
    });
  },

  setMode(e) { const m = e.currentTarget.dataset.mode; this.setData({ quizMode: m }); },

  toggleFilter(e) {
    const { cat, val } = e.currentTarget.dataset;
    const filters = this.data.filters;
    const idx = filters[cat].indexOf(val);
    if (idx > -1) filters[cat].splice(idx, 1);
    else filters[cat].push(val);
    this.setData({ filters });
    this.updateCount();
  },

  toggleAll(e) {
    const cat = e.currentTarget.dataset.cat;
    const all = cat === 'chapters' ? this.data.chapters : cat === 'types' ? this.data.types : this.data.diffs;
    const filters = this.data.filters;
    filters[cat] = filters[cat].length === all.length ? [] : all.slice();
    this.setData({ filters });
    this.updateCount();
  },

  updateCount() {
    const app = getApp();
    const qs = app.globalData.allQuestions;
    const f = this.data.filters;
    const filtered = qs.filter(q => f.chapters.includes(q.chapter) && f.types.includes(q.type) && f.diffs.includes(q.difficulty));
    this.setData({ questionCount: filtered.length });
  },

  startQuiz() {
    const app = getApp();
    const f = this.data.filters;
    let qs = app.globalData.allQuestions.filter(q => f.chapters.includes(q.chapter) && f.types.includes(q.type) && f.diffs.includes(q.difficulty));
    if (qs.length === 0) { wx.showToast({ title: '请至少选择一题', icon: 'none' }); return; }
    app.globalData.quizMode = this.data.quizMode;
    app.globalData.currentQuestions = engine.shuffle(qs);
    wx.navigateTo({ url: '/pages/quiz/quiz' });
  }
});
