import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

import '@lottiefiles/lottie-player';

import { defineCustomElements as jeepSqliteDefineCustomElements } from 'jeep-sqlite/loader';

jeepSqliteDefineCustomElements(window);

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
