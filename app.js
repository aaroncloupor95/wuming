// ===== 无名 A股分析 — 纯展示引擎 v3.0 =====
// 零模型逻辑，只从 data.json 读取 + 渲染

let DATA = null;
let curDate = null;
let curTab = 'daily';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const r = await fetch('data.json');
    DATA = await r.json();
  } catch(e) {
    document.getElementById('main-content').innerHTML =
      '<div class="error-msg">❌ 数据加载失败，请确认 data.json 已部署。</div>';
    return;
  }
  curDate = Object.keys(DATA.daily).sort().pop();
  renderAll();
  document.getElementById('footer-update').textContent =
    '数据更新: ' + DATA.meta.last_update + ' · v' + DATA.meta.version;
});

function renderAll() {
  // 导航
  document.getElementById('navbar').innerHTML =
    '<a href="#" class="navbar-brand" onclick="switchTab(\'daily\');return false">' +
    '<span class="logo">📊</span>无名·A股科技股分析</a>' +
    '<ul class="navbar-links">' +
    '<li><a href="#" class="active" onclick="switchTab(\'daily\');return false">日报</a></li>' +
    '<li><a href="#" onclick="switchTab(\'tracking\');return false">追踪</a></li>' +
    '<li><a href="#" onclick="switchTab(\'stats\');return false">统计</a></li>' +
    '</ul>';
  switchTab('daily');
}

function switchTab(tab) {
  curTab = tab;
  document.querySelectorAll('.navbar-links a').forEach(a => a.classList.remove('active'));
  const navLink = document.querySelector('.navbar-links a[onclick*="'+tab+'"]');
  if (navLink) navLink.classList.add('active');
  if (tab === 'daily') renderDaily();
  else if (tab === 'tracking') renderTracking();
  else if (tab === 'stats') renderStats();
}

// ==================== 日报 ====================
function renderDaily() {
  const dates = Object.keys(DATA.daily).sort().reverse();
  const d = DATA.daily[curDate];
  const preds = d.predictions || [];
  const replay = d.replay || {};
  const hasReplay = Object.keys(replay).length > 0;

  let h = '<div class="page-header">' +
    '<h1>🔮 日报 <span class="version-tag">v' + DATA.meta.version + '</span></h1>' +
    '<div class="subtitle">' +
    '<select id="date-select" class="date-select" onchange="curDate=this.value;renderDaily()">' +
    dates.map(dt => '<option value="'+dt+'"'+(dt===curDate?' selected':'')+'>'+dt+'</option>').join('') +
    '</select> · d1/d3/d5 三层独立预测</div></div>';

  // 复盘区
  if (hasReplay) {
    h += '<div class="section"><h2>📋 复盘 (' + curDate + ')</h2><div class="replay-grid">';
    for (const [code, r] of Object.entries(replay)) {
      const ok = r.correct;
      h += '<div class="replay-card '+(ok?'correct':'wrong')+'">' +
        '<span class="stock-code">'+code+'</span>' +
        '<span>'+ (r.name||'') +'</span>' +
        '<span>预测 <strong>'+ dirEmoji(r.predicted_dir) +'</strong></span>' +
        '<span>实际 <strong>'+ dirEmoji(r.actual_dir) +'</strong> ('+ fmtPct(r.pct_change) +')</span>' +
        '<span>'+(ok?'✅':'❌')+'</span></div>';
    }
    h += '</div></div>';
  }

  // 预测卡片
  h += '<div class="section"><h2>📈 预测 <span class="sub">'+curDate+'</span></h2><div class="cards-grid">';
  for (const p of preds) {
    const d1dir = (p.d1.direction||'neutral').toLowerCase();
    const cls = d1dir==='up'?'signal-up':d1dir==='down'?'signal-down':'signal-neutral';
    const s = DATA.stocks.find(x=>x.code===p.code) || {};
    h += '<div class="stock-card '+cls+'">' +
      '<div class="card-header">' +
      '<span class="stock-code">'+p.code+'</span>' +
      '<span class="stock-name">'+p.name+'</span>' +
      '<span class="stock-type">'+ (s.personality||s.type||'') +'</span></div>' +
      '<div class="card-body">' +
      '<div class="card-close">收盘价 <strong>'+p.close+'</strong> · '+curDate+'</div>' +
      '<table class="horizon-table"><thead><tr><th>周期</th><th>方向</th><th>评分</th><th>置信度</th></tr></thead><tbody>' +
      predRow('d1', p.d1) + predRow('d3', p.d3) + predRow('d5', p.d5) +
      '</tbody></table>' +
      '<div class="card-tech">' +
      (p.rsi!=null?'<span>RSI <span class="'+(p.rsi<30?'up':p.rsi>70?'down':'')+'">'+fmtNum(p.rsi)+'</span></span>':'') +
      (p.bb_pos!=null?'<span>BB <span class="'+(p.bb_pos<0?'down':'up')+'">'+fmtNum(p.bb_pos)+'</span></span>':'') +
      (p.kdj_k!=null?'<span>KDJ<sub>K</sub> '+fmtNum(p.kdj_k)+'</span>':'') +
      (p.roc5!=null?'<span>ROC5 <span class="'+(p.roc5>0?'up':'down')+'">'+fmtPct(p.roc5)+'</span></span>':'') +
      (p.roc10!=null?'<span>ROC10 <span class="'+(p.roc10>0?'up':'down')+'">'+fmtPct(p.roc10)+'</span></span>':'') +
      '</div>' +
      '<div class="card-sr"><span>🛡 支撑 '+ (p.support||p.d1.support||'?') +'</span>' +
      '<span>🎯 压力 '+ (p.resistance||p.d1.resistance||'?') +'</span></div>' +
      '</div></div>';
  }
  h += '</div></div>';
  document.getElementById('main-content').innerHTML = h;
}

function predRow(hz, p) {
  const dir = (p.direction||'neutral').toLowerCase();
  const rcls = dir==='up'?'h-up':dir==='down'?'h-down':'h-neutral';
  const dcls = dir==='up'?'up':dir==='down'?'down':'neutral';
  const emoji = dir==='up'?'📈':dir==='down'?'📉':'➖';
  const bolt = p.signal?' ⚡':'';
  const score = p.score!=null?(p.score>0?'+':'')+p.score.toFixed(2):'-';
  return '<tr class="'+rcls+'"><td class="h-label">'+hz+'</td>' +
    '<td><span class="signal-dot '+dcls+'"></span>'+emoji+' '+dir.toUpperCase()+bolt+'</td>' +
    '<td class="h-score">'+score+'</td>' +
    '<td class="h-conf">'+(p.confidence||0)+'%</td></tr>';
}

// ==================== 追踪 ====================
function renderTracking() {
  let h = '<div class="page-header"><h1>🎯 预测追踪</h1></div>';
  const active = DATA.tracking.active || [];
  const history = DATA.tracking.history || [];

  if (active.length) {
    h += '<div class="section"><h2>⏳ 活跃预测</h2><div class="cards-grid">';
    for (const p of active) h += trackCard(p, true);
    h += '</div></div>';
  }
  if (history.length) {
    h += '<div class="section"><h2>📚 历史记录</h2><div class="cards-grid">';
    for (const p of history) h += trackCard(p, false);
    h += '</div></div>';
  }
  document.getElementById('main-content').innerHTML = h;
}

function trackCard(p, isActive) {
  const dir = (p.d1.direction||'neutral').toLowerCase();
  const cls = dir==='up'?'signal-up':dir==='down'?'signal-down':'signal-neutral';
  let resultHtml = '';
  if (!isActive && p.result) {
    const r = p.result;
    const ok = r.correct;
    resultHtml = '<div class="tracking-result '+(ok?'correct':'wrong')+'">' +
      '<span>实际收盘: <strong>'+ (r.actual_close||'?') +'</strong> ('+ fmtPct(r.pct_change) +')</span>' +
      '<span>'+(ok?'✅ 正确':'❌ 偏差')+'</span></div>';
  } else {
    resultHtml = '<div class="tracking-result pending">⏳ 等待结算...</div>';
  }
  return '<div class="stock-card '+cls+'">' +
    '<div class="card-header">' +
    '<span class="stock-code">'+p.code+'</span>' +
    '<span class="stock-name">'+p.name+'</span>' +
    '<span class="tracking-date">'+p.date+' → '+p.target+'</span></div>' +
    '<div class="card-body">' +
    '<div class="card-close">预测 ' + dirEmoji(p.d1.direction) + ' · 评分 '+fmtNum(p.d1.score)+'</div>' +
    '<div class="card-tech">' +
    (p.rsi!=null?'<span>RSI '+fmtNum(p.rsi)+'</span>':'') +
    (p.bb_pos!=null?'<span>BB '+fmtNum(p.bb_pos)+'</span>':'') +
    (p.kdj_k!=null?'<span>KDJ<sub>K</sub> '+fmtNum(p.kdj_k)+'</span>':'') +
    '</div>' +
    resultHtml +
    '</div></div>';
}

// ==================== 统计 ====================
function renderStats() {
  let h = '<div class="page-header"><h1>📈 回测统计</h1></div>' +
    '<div class="section"><div class="stats-grid">';
  let tc = 0, tp = 0;
  for (const [code, bt] of Object.entries(DATA.backtest)) {
    tc += bt.correct||0; tp += bt.total||0;
    const acc = bt.accuracy||0;
    const barCls = acc>=60?'bar-green':acc>=45?'bar-yellow':'bar-red';
    h += '<div class="stat-card">' +
      '<div class="stat-header"><span class="stock-code">'+code+'</span><span>'+bt.name+'</span></div>' +
      '<div class="stat-acc">'+acc+'%</div>' +
      '<div class="stat-bar"><div class="stat-bar-fill '+barCls+'" style="width:'+Math.min(acc,100)+'%"></div></div>' +
      '<div class="stat-detail">'+(bt.correct||0)+' / '+(bt.total||0)+' 正确</div></div>';
  }
  const overall = tp>0?(tc/tp*100).toFixed(1):0;
  h += '</div><div class="overall-stat">整体准确率: <strong>'+overall+'%</strong> ('+tc+'/'+tp+')</div></div>';
  document.getElementById('main-content').innerHTML = h;
}

// ==================== 工具 ====================
function dirEmoji(d) {
  const dir = (d||'neutral').toLowerCase();
  return dir==='up'?'📈 UP':dir==='down'?'📉 DOWN':'➖ FLAT';
}
function fmtNum(n) { return n!=null&&!isNaN(n)?(Math.abs(n)<10?n.toFixed(2):n.toFixed(1)):'-'; }
function fmtPct(n) { return n!=null&&!isNaN(n)?(n>0?'+':'')+n.toFixed(2)+'%':'-'; }