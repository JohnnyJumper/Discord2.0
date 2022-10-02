#!/usr/bin/env ts-node-script
import { App } from '@deepkit/app';
import { Logger } from '@deepkit/logger';
import { cli, Command } from '@deepkit/app';
import { FrameworkModule } from '@deepkit/framework';

@cli.controller('test')
export class TestCommand implements Command {
    constructor(protected logger: Logger) {
    }

    async execute() {
        this.logger.log('Hello World!');
    }
}

new App({
    controllers: [TestCommand],
    imports: [new FrameworkModule]
}).run();