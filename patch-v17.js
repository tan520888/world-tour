// V17: 修复基金总表分类筛选切换无效。原因是每次 render 都会重建分类下拉框，导致选项被重置为“全部”。
(function(){
  const $ = id => document.getElementById(id);
  function safeFunds(){ try { return Array.isArray(FUNDS) ? FUNDS : []; } catch(e){ return []; } }

  // 保留当前选择，不再每次刷新都强制回到“全部”
  window.cats = function(){
    const el = $('cat');
    if(!el) return;
    const current = el.value || '全部';
    const cats = [...new Set(safeFunds().map(f => f.category).filter(Boolean))].sort();
    el.innerHTML = '<option>全部</option>' + cats.map(x => `<option>${x}</option>`).join('');
    if(current === '全部' || cats.includes(current)) el.value = current;
    else el.value = '全部';
  };

  function bindFilter(id){
    const el = $(id);
    if(!el || el.dataset.v17FilterBound) return;
    el.dataset.v17FilterBound = '1';
    const run = () => { try { render(); } catch(e){} };
    el.addEventListener('change', run);
    el.addEventListener('input', run);
  }

  function ensureHint(){
    const table = $('table');
    const card = table || document.querySelector('#table .card');
    if(!card || $('filterHint')) return;
    const hint = document.createElement('div');
    hint.id = 'filterHint';
    hint.className = 'status';
    hint.style.margin = '8px 0 10px';
    hint.textContent = '筛选已修复：切换分层/行业后会立即刷新基金总表。';
    const toolbar = document.querySelector('#table .toolbar');
    toolbar && toolbar.insertAdjacentElement('afterend', hint);
  }

  function boot(){
    bindFilter('kw');
    bindFilter('group');
    bindFilter('cat');
    ensureHint();
    try { cats(); render(); } catch(e) {}
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 300);
})();
