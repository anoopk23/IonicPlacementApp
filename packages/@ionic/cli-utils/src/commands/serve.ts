import * as chalk from 'chalk';

import { CommandLineInputs, CommandLineOptions, IonicEnvironment, ServeDetails } from '../definitions';
import { BIND_ALL_ADDRESS, DEFAULT_LIVERELOAD_PORT, DEFAULT_SERVER_PORT, IONIC_LAB_URL } from '../lib/serve';

export async function serve(env: IonicEnvironment, inputs: CommandLineInputs, options: CommandLineOptions): Promise<ServeDetails> {
  const { str2num } = await import('../lib/utils/string');

  await env.hooks.fire('watch:before', { env });

  let [ platform ] = inputs;

  const address = options['address'] ? String(options['address']) : BIND_ALL_ADDRESS;
  const port = str2num(options['port'], DEFAULT_SERVER_PORT);
  const livereloadPort = str2num(options['livereload-port'], DEFAULT_LIVERELOAD_PORT);

  const serveOptions = {
    address,
    port,
    livereloadPort,
    consolelogs: options['consolelogs'] ? true : false,
    serverlogs: options['serverlogs'] ? true : false,
    livereload: options['nolivereload'] ? false : true,
    proxy: options['noproxy'] ? false : true,
    lab: options['lab'] ? true : false,
    browser: options['nobrowser'] ? false : true,
    browserName: options['browser'] ? String(options['browser']) : undefined,
    browserOption: options['browseroption'] ? String(options['browseroption']) : undefined,
    externalAddressRequired: options['externalAddressRequired'] ? true : false,
    iscordovaserve: typeof options['iscordovaserve'] === 'boolean' ? Boolean(options['iscordovaserve']) : false,
  };

  let serverDetails: ServeDetails;

  const project = await env.project.load();

  if (project.type === 'ionic1') {
    const { serve } = await import('../lib/ionic1/serve');
    serverDetails = await serve({ env, options: serveOptions });
  } else if (project.type === 'ionic-angular') {
    const { serve } = await import('../lib/ionic-angular/serve');
    serverDetails = await serve({ env, options: {
      platform,
      target: serveOptions.iscordovaserve ? 'cordova' : undefined,
      ...serveOptions,
    }});
  } else {
    throw new Error('Unknown project.'); // TODO
  }

  const localAddress = 'http://localhost:' + serverDetails.port;
  const externalAddress = 'http://' + serverDetails.externalAddress + ':' + serverDetails.port;

  env.log.info(
    `Development server running\n` +
    `Local: ${chalk.bold(localAddress)}\n` +
    (serverDetails.externallyAccessible ? `External: ${chalk.bold(externalAddress)}\n` : '')
  );

  if (project.type !== 'ionic-angular') { // TODO: app-scripts calls opn internally
    if (serveOptions.browser) {
      const openOptions: string[] = [localAddress]
        .concat(serveOptions.lab ? [IONIC_LAB_URL] : [])
        .concat(serveOptions.browserOption ? [serveOptions.browserOption] : [])
        .concat(platform ? ['?ionicplatform=', platform] : []);

      const opn = await import('opn');
      opn(openOptions.join(''), { app: serveOptions.browserName, wait: false });
    }
  }

  return serverDetails;
}
