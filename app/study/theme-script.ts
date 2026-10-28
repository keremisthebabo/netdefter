// Sunucu bileşeni (layout) de kullandığı için "use client" dosyasından ayrı tutulur
export const THEME_KEY='nd-theme';
export const themeScript=`try{var t=localStorage.getItem('${THEME_KEY}');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}`;
