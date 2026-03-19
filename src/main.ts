import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppModule} from './app/app.module';
import {AppConfig} from "./app/app.config";

AppConfig._initialize().then(() => {
    platformBrowserDynamic().bootstrapModule(AppModule)
        .catch(err => console.error(err));
});
