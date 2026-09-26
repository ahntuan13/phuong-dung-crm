// Tiện ích giao diện nhỏ: thông báo, sao chép, hiển thị sao.

export function toast(text) {
  const el = document.getElementById('toast');
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show'), 2600);
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast('Đã sao chép');
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); toast('Đã sao chép'); }
    catch { toast('Không sao chép được — hãy chọn và copy thủ công'); }
    ta.remove();
  }
}

export function stars(n) {
  n = +n || 0;
  return `<span class="stars" aria-label="${n} sao">${'★'.repeat(n)}<span style="opacity:.25">${'★'.repeat(5 - n)}</span></span>`;
}

export function downloadBlob(filename, text, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
