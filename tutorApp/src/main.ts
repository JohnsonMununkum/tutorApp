import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
//enablepromode impoves performance in production
import { initializeApp } from 'firebase/app'; 
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';

//initaliising Firebase from  environment.ts
initializeApp(environment.firebaseConfig);

if (environment.production) {
  enableProdMode();
}


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
