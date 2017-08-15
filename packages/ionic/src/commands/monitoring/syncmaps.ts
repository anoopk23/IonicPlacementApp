//import * as path from 'path';

//import * as chalk from 'chalk';

import { BACKEND_PRO, CommandLineInputs, CommandLineOptions } from '@ionic/cli-utils';
import { Command, CommandMetadata } from '@ionic/cli-utils/lib/command';
//import { pathExists } from '@ionic/cli-utils/lib/utils/fs';

@CommandMetadata({
  name: 'syncmaps',
  type: 'project',
  backends: [BACKEND_PRO],
  description: 'Sync Source Maps to Ionic Pro Error Monitoring service'
})
export class MonitoringSyncSourcemapsCommand extends Command {
  async run(inputs: CommandLineInputs, options: CommandLineOptions): Promise<void>  {
    console.log('Syncing sourcemaps', inputs, options);
    const { App } = await import('@ionic/cli-utils/lib/app');

    const token = await this.env.session.getUserToken();
    const appId = await this.env.project.loadAppId();
    const appLoader = new App(token, this.env.client);
    const app = await appLoader.load(appId)

    console.log('Loaded data', app, token, appId, appLoader);
  }
}
