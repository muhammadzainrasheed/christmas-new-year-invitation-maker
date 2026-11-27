const paths = {
 envelope:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
 arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>', diagonal:'<path d="M5 19 19 5M6 5h13v13"/>',
 play:'<path d="m8 5 11 7-11 7z"/>', menu:'<path d="M3 7h18M3 12h18M3 17h18"/>',
 check:'<path d="m4 12 5 5L20 6"/>', card:'<rect x="6" y="3" width="13" height="17" rx="1.5"/><path d="M3 6v15h13M10 8h5m-5 4h5m-5 4h3"/>',
 pen:'<path d="m4 16-1 5 5-1L21 7l-4-4zM14 6l4 4M3 21h16"/>',
 send:'<path d="m2 11 20-8-6 18-5-7-9-3zm9 3L22 3"/>',
 pin:'<path d="M19 10c0 6-7 11-7 11S5 16 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.4"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6m10-6v6M3 11h18"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
 heart:'<path d="M12 20s-9-5.5-9-11a5 5 0 0 1 9-2 5 5 0 0 1 9 2c0 5.5-9 11-9 11z"/>',
 people:'<circle cx="9" cy="7" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2m1-15a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5"/>',
 down:'<path d="m6 9 6 6 6-6"/>', music:'<path d="M9 17V5l11-2v13M9 8l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2"/><ellipse cx="17" cy="17" rx="3" ry="2"/>',
 lock:'<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
 download:'<path d="M12 3v13m-5-5 5 5 5-5M4 17v4h16v-4"/>', copy:'<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
 star:'<path d="m12 1 2.4 8.6L23 12l-8.6 2.4L12 23l-2.4-8.6L1 12l8.6-2.4z"/>'
};
export const icon = (name,size=20) => '<svg aria-hidden="true" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round">'+paths[name]+'</svg>';
export const logoMark='<svg aria-hidden="true" class="logomark" viewBox="0 0 40 40" fill="none"><g transform="rotate(-8 20 20)" stroke="currentColor" stroke-linejoin="round" stroke-width="1.7"><path d="M5 11h27v21H5z"/><path d="m5 12 13.5 11L32 12M5 32l9-10m18 10-10-10"/><path d="m11 10 1-4 22 5-1 6"/></g><path d="m30 1 1.2 3.8L35 6l-3.8 1.2L30 11l-1.2-3.8L25 6l3.8-1.2z" fill="currentColor"/></svg>';
