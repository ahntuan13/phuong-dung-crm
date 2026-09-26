// Hình minh họa SVG vẽ tay (hoa anh đào, lá, chân dung) — không cần file ảnh ngoài.
// Màu lấy từ biến CSS nên tự đổi theo theme sáng/tối.

/** Bộ symbol dùng lại qua <use href="#bl|#lf|#bud"> */
export const SPRITE = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<symbol id="bl" viewBox="-12 -12 24 24"><g fill="var(--petal)"><ellipse cy="-5" rx="3.7" ry="5.4"/><ellipse cy="-5" rx="3.7" ry="5.4" transform="rotate(72)"/><ellipse cy="-5" rx="3.7" ry="5.4" transform="rotate(144)"/><ellipse cy="-5" rx="3.7" ry="5.4" transform="rotate(216)"/><ellipse cy="-5" rx="3.7" ry="5.4" transform="rotate(288)"/></g><g fill="var(--petal-2)"><ellipse cy="-4" rx="1.6" ry="3" /><ellipse cy="-4" rx="1.6" ry="3" transform="rotate(72)"/><ellipse cy="-4" rx="1.6" ry="3" transform="rotate(144)"/><ellipse cy="-4" rx="1.6" ry="3" transform="rotate(216)"/><ellipse cy="-4" rx="1.6" ry="3" transform="rotate(288)"/></g><circle r="1.9" fill="var(--gold)"/></symbol>
<symbol id="lf" viewBox="-6 -12 12 24"><path d="M0 12 C-6 4,-6 -6,0 -12 C6 -6,6 4,0 12Z" fill="var(--leaf)"/><path d="M0 11 L0 -10" stroke="var(--surface)" stroke-width=".7" opacity=".6"/></symbol>
<symbol id="bud" viewBox="-6 -8 12 16"><path d="M0 -8 C5 -4,4 4,0 8 C-4 4,-5 -4,0 -8Z" fill="var(--brand)" opacity=".75"/></symbol>
</defs></svg>`;

export const LOGO = `<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="19" fill="var(--rose-soft)"/><use href="#bl" x="7" y="7" width="26" height="26"/></svg>`;

/** Cành hoa ở chân thanh menu */
export const SPRIG = `<svg viewBox="0 0 240 170" preserveAspectRatio="xMidYMax slice">
      <path d="M-10 175 C 40 140, 70 120, 110 108 S 190 70, 250 40" stroke="var(--leaf)" stroke-width="2" fill="none"/>
      <path d="M60 132 C 70 110, 88 100, 100 96" stroke="var(--leaf)" stroke-width="1.5" fill="none"/>
      <path d="M150 88 C 160 70, 176 62, 190 60" stroke="var(--leaf)" stroke-width="1.5" fill="none"/>
      <use href="#lf" x="30" y="128" width="14" height="28" transform="rotate(-60 37 142)"/>
      <use href="#lf" x="120" y="92" width="12" height="24" transform="rotate(50 126 104)"/>
      <use href="#lf" x="200" y="46" width="12" height="24" transform="rotate(-40 206 58)"/>
      <use href="#bl" x="84" y="76" width="36" height="36"/>
      <use href="#bl" x="176" y="42" width="30" height="30"/>
      <use href="#bl" x="138" y="96" width="22" height="22"/>
      <use href="#bl" x="40" y="118" width="24" height="24"/>
      <use href="#bud" x="222" y="22" width="10" height="14"/>
      <use href="#bud" x="60" y="100" width="9" height="12"/>
    </svg>`;

/** Tranh chân dung + hoa trên banner trang Tổng quan */
export const HERO_ART = `<svg viewBox="0 0 420 230" preserveAspectRatio="xMaxYMid meet" aria-hidden="true">
<circle cx="300" cy="118" r="96" fill="var(--rose-soft)"/>
<circle cx="300" cy="118" r="96" fill="none" stroke="var(--petal)" stroke-width="1" stroke-dasharray="2 5"/>
<g fill="none" stroke="var(--brand-deep)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" transform="translate(150 6)">
<path d="M150 30 C 110 18, 76 48, 80 96 C 83 132, 68 162, 90 214"/>
<path d="M150 30 C 170 34, 179 52, 176 71 C 175 79, 180 85, 186 93 C 188 96, 186 98, 181 99 C 183 103, 181 106, 178 107 C 180 110, 179 113, 176 114 C 176 121, 170 127, 162 128 C 154 129, 150 133, 148 141 L 147 172 C 152 186, 172 192, 196 202"/>
<path d="M160 83 C 164 87, 170 87, 174 84"/><path d="M163 86 l-2 3 M167 87 l-1 3 M171 86 l0 3"/>
<path d="M163 75 C 167 72, 172 72, 176 74" opacity=".7"/>
<path d="M140 38 C 118 52, 104 82, 110 120"/><path d="M128 34 C 100 62, 96 112, 106 152"/>
<path d="M124 130 C 122 150, 120 166, 110 182"/><path d="M110 182 C 95 192, 80 198, 58 208"/>
<circle cx="140" cy="112" r="2.4"/><path d="M140 114.4 v6"/><circle cx="140" cy="123" r="2" fill="var(--gold)" stroke="none"/>
</g>
<use href="#lf" x="236" y="16" width="14" height="28" transform="rotate(-30 243 30)"/>
<use href="#lf" x="286" y="4" width="12" height="24" transform="rotate(40 292 16)"/>
<use href="#bl" x="252" y="14" width="40" height="40"/>
<use href="#bl" x="232" y="44" width="28" height="28"/>
<use href="#bl" x="282" y="0" width="24" height="24"/>
<use href="#bud" x="228" y="26" width="10" height="14"/>
<use href="#lf" x="380" y="150" width="14" height="28" transform="rotate(30 387 164)"/>
<use href="#bl" x="364" y="170" width="34" height="34"/>
<use href="#bl" x="392" y="150" width="20" height="20"/>
<use href="#bl" x="170" y="176" width="22" height="22"/>
<use href="#lf" x="150" y="182" width="10" height="20" transform="rotate(-50 155 192)"/>
<g fill="var(--petal)" opacity=".8"><ellipse cx="200" cy="40" rx="3" ry="5" transform="rotate(30 200 40)"/><ellipse cx="350" cy="30" rx="2.5" ry="4.5" transform="rotate(-20 350 30)"/><ellipse cx="215" cy="130" rx="2.5" ry="4" transform="rotate(60 215 130)"/></g>
</svg>`;

const ic = (d) => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${d}</svg>`;
export const ICONS = {
  idcard: ic(`<rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="9" cy="11" r="2.2"/><path d="M5.8 16c.6-1.6 1.7-2.4 3.2-2.4s2.6.8 3.2 2.4M14.5 10h4M14.5 13.5h3"/>`),
  home: ic(`<path d="M3 12l9-8 9 8M5 10v10h14V10"/>`),
  users: ic(`<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5M16 4.8a3.3 3.3 0 010 6.4M18 14.8c2 .6 3.1 2.4 3.5 5.2"/>`),
  search: ic(`<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>`),
  vial: ic(`<rect x="7" y="3" width="10" height="18" rx="3"/><path d="M7 10h10"/>`),
  heart: ic(`<path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"/>`),
  ticket: ic(`<path d="M3 8a2 2 0 002-2h14a2 2 0 002 2v2a2 2 0 000 4v2a2 2 0 00-2 2H5a2 2 0 00-2-2v-2a2 2 0 000-4z"/><path d="M10 6v12" stroke-dasharray="2 2"/>`)
};
