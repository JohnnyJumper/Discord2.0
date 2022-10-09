#!/usr/bin/env node
import { App } from '@deepkit/app';
import { FrameworkModule } from '@deepkit/framework';
import path from 'path';
import { Config } from './config';
import { RootModule } from './modules/Root.module';

const app = new App({
    config: Config,
    imports: [new FrameworkModule, new RootModule],
});

const envPath = path.resolve(__dirname, '..', '.env');
app.loadConfigFromEnv({
    envFilePath: envPath
});

app.run();
