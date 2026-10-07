import { enableProdMode, provideZoneChangeDetection } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { register } from 'swiper/element/bundle';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

register();

if (environment.production) {
  enableProdMode();
  window.console.log = () => { }
  window.console.warn = () => { }
  window.console.error = () => { }
}

platformBrowserDynamic().bootstrapModule(AppModule, { applicationProviders: [provideZoneChangeDetection()], })
  .catch(err => console.error(err));
