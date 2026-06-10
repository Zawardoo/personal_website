// ============================================================
// main.js — Entry point: imports and initializes all modules
// ============================================================

import { initRouter }    from './router.js';
import { initNav }       from './nav.js';
import { initParallax }  from './parallax.js';
import { initReveal }    from './reveal.js';
import { initSpotlight } from './spotlight.js';
import { initForms }     from './forms.js';
import { initI18n }      from './i18n.js';
initRouter();
initNav();
initParallax();
initReveal();
initSpotlight();
initForms();
initI18n();
