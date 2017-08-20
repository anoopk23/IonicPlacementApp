import * as path from 'path';
import * as util from 'util';

import * as chalk from 'chalk';

import {
  IHookEngine,
  InfoHookItem,
  IonicEnvironment,
  generateIonicEnvironment,
} from '@ionic/cli-utils';

import { mapLegacyCommand, modifyArguments, parseArgs } from '@ionic/cli-utils/lib/init';
import { pathExists } from '@ionic/cli-utils/lib/utils/fs';

import { IonicNamespace } from './commands';

const name = 'ionic';
export const namespace = new IonicNamespace();

const BUILD_BEFORE_HOOK = 'build:before';
const BUILD_BEFORE_SCRIPT = `ionic:${BUILD_BEFORE_HOOK}`;
const BUILD_AFTER_HOOK = 'build:after';
const BUILD_AFTER_SCRIPT = `ionic:${BUILD_AFTER_HOOK}`;

const WATCH_BEFORE_HOOK = 'watch:before';
const WATCH_BEFORE_SCRIPT = `ionic:${WATCH_BEFORE_HOOK}`;

export function registerHooks(hooks: IHookEngine) {
  const detectAndWarnAboutDeprecatedPlugin = async (env: IonicEnvironment, plugin: string) => {
    const packageJson = await env.project.loadPackageJson();

    if (packageJson.devDependencies && packageJson.devDependencies[plugin]) {
      const { pkgManagerArgs } = await import('@ionic/cli-utils/lib/utils/npm');
      const args = await pkgManagerArgs(env, { pkg: plugin, command: 'uninstall', saveDev: true });

      env.log.warn(
        `Detected ${chalk.bold(plugin)} in your ${chalk.bold('package.json')}.\n` +
        `As of CLI 3.8, it is no longer needed. You can uninstall it:\n\n${chalk.green(args.join(' '))}\n`
      );
    }
  };

  hooks.register(name, BUILD_BEFORE_HOOK, async ({ env }) => {
    const packageJson = await env.project.loadPackageJson();

    if (packageJson.scripts && packageJson.scripts[BUILD_BEFORE_SCRIPT]) {
      env.log.debug(() => `Invoking ${chalk.cyan(BUILD_BEFORE_SCRIPT)} npm script.`);
      await env.shell.run('npm', ['run', BUILD_BEFORE_SCRIPT], { showExecution: true });
    }

    if (packageJson.devDependencies) {
      if (packageJson.devDependencies['gulp']) {
        const { checkGulp, runTask } = await import('@ionic/cli-utils/lib/gulp');
        await checkGulp(env);
        await runTask(env, BUILD_BEFORE_SCRIPT);
      }

      await detectAndWarnAboutDeprecatedPlugin(env, '@ionic/cli-plugin-cordova');
      await detectAndWarnAboutDeprecatedPlugin(env, '@ionic/cli-plugin-ionic-angular');
      await detectAndWarnAboutDeprecatedPlugin(env, '@ionic/cli-plugin-ionic1');
      await detectAndWarnAboutDeprecatedPlugin(env, '@ionic/cli-plugin-gulp');

      if (packageJson.devDependencies['@ionic/cli-plugin-cordova']) {
        const { checkCordova } = await import('@ionic/cli-utils/lib/cordova/utils');
        await checkCordova(env);
      }
    }
  });

  hooks.register(name, BUILD_AFTER_HOOK, async ({ env }) => {
    const [ project, packageJson ] = await Promise.all([env.project.load(), env.project.loadPackageJson()]);

    if (packageJson.scripts && packageJson.scripts[BUILD_AFTER_SCRIPT]) {
      env.log.debug(() => `Invoking ${chalk.cyan(BUILD_AFTER_SCRIPT)} npm script.`);
      await env.shell.run('npm', ['run', BUILD_AFTER_SCRIPT], { showExecution: true });
    }

    if (packageJson.devDependencies) {
      if (packageJson.devDependencies['gulp']) {
        const { checkGulp, runTask } = await import('@ionic/cli-utils/lib/gulp');
        await checkGulp(env);
        await runTask(env, BUILD_AFTER_SCRIPT);
      }
    }

    if (project.integrations.cordova && project.integrations.cordova.enabled !== false) {
      await env.runcmd(['cordova', 'prepare']);
    }
  });

  hooks.register(name, WATCH_BEFORE_HOOK, async ({ env }) => {
    const packageJson = await env.project.loadPackageJson();

    if (packageJson.scripts && packageJson.scripts[WATCH_BEFORE_SCRIPT]) {
      env.log.debug(() => `Invoking ${chalk.cyan(WATCH_BEFORE_SCRIPT)} npm script.`);
      await env.shell.run('npm', ['run', WATCH_BEFORE_SCRIPT], { showExecution: true });
    }

    if (packageJson.devDependencies) {
      if (packageJson.devDependencies['gulp']) {
        const { checkGulp, registerWatchEvents, runTask } = await import('@ionic/cli-utils/lib/gulp');
        await checkGulp(env);
        await registerWatchEvents(env);
        await runTask(env, WATCH_BEFORE_SCRIPT);
      }

      await detectAndWarnAboutDeprecatedPlugin(env, '@ionic/cli-plugin-cordova');
      await detectAndWarnAboutDeprecatedPlugin(env, '@ionic/cli-plugin-ionic-angular');
      await detectAndWarnAboutDeprecatedPlugin(env, '@ionic/cli-plugin-ionic1');
      await detectAndWarnAboutDeprecatedPlugin(env, '@ionic/cli-plugin-gulp');

      if (packageJson.devDependencies['@ionic/cli-plugin-cordova']) {
        const { checkCordova } = await import('@ionic/cli-utils/lib/cordova/utils');
        await checkCordova(env);
      }
    }
  });

  hooks.register(name, 'info', async ({ env }) => {
    const osName = await import('os-name');
    const os = osName();
    const node = process.version;

    const { getCommandInfo } = await import('@ionic/cli-utils/lib/utils/shell');

    const npm = await getCommandInfo('npm', ['-v']);

    const info: InfoHookItem[] = [ // TODO: why must I be explicit?
      { type: 'cli-packages', name: `${name} ${chalk.dim('(Ionic CLI)')}`, version: env.plugins.ionic.meta.version, path: path.dirname(path.dirname(env.plugins.ionic.meta.filePath)) },
      { type: 'system', name: 'Node', version: node },
      { type: 'system', name: 'npm', version: npm || 'not installed' },
      { type: 'system', name: 'OS', version: os },
    ];

    const project = env.project.directory ? await env.project.load() : undefined;

    if (project) {
      if (project.type === 'ionic1') {
        const { getIonic1Version } = await import('@ionic/cli-utils/lib/ionic1/utils');
        const ionic1Version = await getIonic1Version(env);
        info.push({ type: 'local-packages', name: 'Ionic Framework', version: ionic1Version ? `ionic1 ${ionic1Version}` : 'unknown' });
      } else if (project.type === 'ionic-angular') {
        const { getIonicAngularVersion, getAppScriptsVersion } = await import('@ionic/cli-utils/lib/ionic-angular/utils');
        const [ ionicAngularVersion, appScriptsVersion ] = await Promise.all([getIonicAngularVersion(env), getAppScriptsVersion(env)]);
        info.push({ type: 'local-packages', name: 'Ionic Framework', version: ionicAngularVersion ? `ionic-angular ${ionicAngularVersion}` : 'not installed' });
        info.push({ type: 'local-packages', name: '@ionic/app-scripts', version: appScriptsVersion ? appScriptsVersion : 'not installed' });
      }

      if (project.integrations.cordova && project.integrations.cordova.enabled !== false) {
        const { getAndroidSdkToolsVersion } = await import('@ionic/cli-utils/lib/android');
        const { getCordovaCLIVersion, getCordovaPlatformVersions } = await import('@ionic/cli-utils/lib/cordova/utils');

        const [
          cordovaVersion,
          cordovaPlatforms,
          xcode,
          iosDeploy,
          iosSim,
          androidSdkToolsVersion,
        ] = await Promise.all([
          getCordovaCLIVersion(),
          getCordovaPlatformVersions(),
          getCommandInfo('/usr/bin/xcodebuild', ['-version']),
          getCommandInfo('ios-deploy', ['--version']),
          getCommandInfo('ios-sim', ['--version']),
          getAndroidSdkToolsVersion(),
        ]);

        info.push({ type: 'global-packages', name: 'Cordova CLI', version: cordovaVersion || 'not installed' });
        info.push({ type: 'local-packages', name: 'Cordova Platforms', version: cordovaPlatforms || 'none' });

        if (xcode) {
          info.push({ type: 'system', name: 'Xcode', version: xcode });
        }

        if (iosDeploy) {
          info.push({ type: 'system', name: 'ios-deploy', version: iosDeploy });
        }

        if (iosSim) {
          info.push({ type: 'system', name: 'ios-sim', version: iosSim });
        }

        if (androidSdkToolsVersion) {
          info.push({ type: 'system', name: 'Android SDK Tools', version: androidSdkToolsVersion });
        }
      }

      if (project.integrations.gulp && project.integrations.gulp.enabled !== false) {
        const { getGulpVersion } = await import('@ionic/cli-utils/lib/gulp');
        const gulpVersion = await getGulpVersion();
        info.push({ type: 'global-packages', name: 'Gulp CLI', version: gulpVersion || 'not installed globally' });
      }
    }

    return info;
  });

  hooks.register(name, 'cordova:project:info', async ({ env }) => {
    const { ConfigXml } = await import('@ionic/cli-utils/lib/cordova/config');
    const conf = await ConfigXml.load(env.project.directory);
    return conf.getProjectInfo();
  });
}


export async function run(pargv: string[], env: { [k: string]: string; }) {
  const now = new Date();
  let exitCode = 0;
  let err: any;

  pargv = modifyArguments(pargv.slice(2));
  env['IONIC_CLI_LIB'] = __filename;

  const { isSuperAgentError, isValidationErrorArray } = await import('@ionic/cli-utils/guards');
  const { getPluginMeta } = await import('@ionic/cli-utils/lib/plugins');

  const plugin = {
    namespace,
    registerHooks,
    meta: await getPluginMeta(__filename),
  };

  const ienv = await generateIonicEnvironment(plugin, pargv, env);

  try {
    const config = await ienv.config.load();

    if (!config.version) {
      ienv.log.announce(
        `${chalk.bold('Hi! Welcome to CLI 3.9.')}\n` +
        `We decided to merge core plugins back into the main ${chalk.bold('ionic')} CLI package. The ${chalk.bold('@ionic/cli-plugin-ionic-angular')}, ${chalk.bold('@ionic/cli-plugin-ionic1')}, ${chalk.bold('@ionic/cli-plugin-cordova')}, and ${chalk.bold('@ionic/cli-plugin-gulp')} plugins have all been deprecated and won't be loaded by the CLI anymore. We listened to devs and determined they added unnecessary complexity. You can uninstall them from your project(s).\n\n` +
        `No functionality was removed and all commands will continue working normally. You may wish to review the CHANGELOG: ${chalk.bold('https://github.com/ionic-team/ionic-cli/blob/master/CHANGELOG.md#changelog')}\n\n` +
        `Thanks,\nThe Ionic Team\n\n`
      );
    }

    config.version = plugin.meta.version;

    registerHooks(ienv.hooks);

    ienv.log.debug(() => util.inspect(ienv.meta, { breakLength: Infinity, colors: chalk.enabled }));

    if (env['IONIC_EMAIL'] && env['IONIC_PASSWORD']) {
      ienv.log.debug(() => `${chalk.bold('IONIC_EMAIL')} / ${chalk.bold('IONIC_PASSWORD')} environment variables detected`);

      if (config.user.email !== env['IONIC_EMAIL']) {
        ienv.log.debug(() => `${chalk.bold('IONIC_EMAIL')} mismatch with current session--attempting login`);

        try {
          await ienv.session.login(env['IONIC_EMAIL'], env['IONIC_PASSWORD']);
        } catch (e) {
          ienv.log.error(`Error occurred during automatic login via ${chalk.bold('IONIC_EMAIL')} / ${chalk.bold('IONIC_PASSWORD')} environment variables.`);
          throw e;
        }
      }
    }

    if (ienv.project.directory) {
      const nodeModulesExists = await pathExists(path.join(ienv.project.directory, 'node_modules'));

      if (!nodeModulesExists) {
        const confirm = await ienv.prompt({
          type: 'confirm',
          name: 'confirm',
          message: `Looks like a fresh checkout! No ${chalk.green('./node_modules')} directory found. Would you like to install project dependencies?`,
        });

        if (confirm) {
          ienv.log.info('Installing dependencies may take several minutes!');
          const { pkgManagerArgs } = await import('@ionic/cli-utils/lib/utils/npm');
          const [ installer, ...installerArgs ] = await pkgManagerArgs(ienv, { command: 'install' });
          await ienv.shell.run(installer, installerArgs, {});
        }
      }
    }

    const argv = parseArgs(pargv, { boolean: true, string: '_' });

    // If an legacy command is being executed inform the user that there is a new command available
    const foundCommand = mapLegacyCommand(argv._[0]);
    if (foundCommand) {
      ienv.log.msg(`The ${chalk.green(argv._[0])} command has been renamed. To find out more, run:\n\n` +
                   `  ${chalk.green(`ionic ${foundCommand} --help`)}\n\n`);
    } else {
      const { loadPlugins } = await import ('@ionic/cli-utils/lib/plugins');

      try {
        await loadPlugins(ienv);
      } catch (e) {
        if (e.fatal) {
          throw e;
        }

        ienv.log.error(chalk.red.bold('Error occurred while loading plugins. CLI functionality may be limited.'));
        ienv.log.debug(() => chalk.red(chalk.bold('Plugin error: ') + (e.stack ? e.stack : e)));
      }

      if (ienv.flags.interactive) {
        if (typeof config.daemon.updates === 'undefined') {
          const confirm = await ienv.prompt({
            type: 'confirm',
            name: 'confirm',
            message: `The Ionic CLI can automatically check for CLI updates in the background. Would you like to enable this?`,
          });

          config.daemon.updates = confirm;
          await ienv.config.save();
        }

        if (await ienv.config.isUpdatingEnabled()) {
          const { checkForDaemon } = await import('@ionic/cli-utils/lib/daemon');
          await checkForDaemon(ienv);

          const { checkForUpdates, getLatestPluginVersion, versionNeedsUpdating } = await import('@ionic/cli-utils/lib/plugins');
          const latestVersion = await getLatestPluginVersion(ienv, plugin.meta.name, plugin.meta.version);

          if (latestVersion) {
            plugin.meta.latestVersion = latestVersion;
            plugin.meta.updateAvailable = await versionNeedsUpdating(plugin.meta.version, latestVersion);

            await checkForUpdates(ienv);
          }
        }
      }

      await ienv.hooks.fire('plugins:init', { env: ienv });

      const r = await namespace.runCommand(ienv, pargv);

      if (typeof r === 'number') {
        exitCode = r;
      }

      config.state.lastCommand = now.toISOString();
    }

  } catch (e) {
    err = e;
  }

  try {
    await Promise.all([
      ienv.config.save(),
      ienv.project.save(),
      ienv.daemon.save(),
    ]);
  } catch (e) {
    ienv.log.error(e);
  }

  if (err) {
    ienv.tasks.fail();
    exitCode = 1;

    if (isValidationErrorArray(err)) {
      for (let e of err) {
        ienv.log.error(e.message);
      }
      ienv.log.msg(`Use the ${chalk.green('--help')} flag for more details.`);
    } else if (isSuperAgentError(err)) {
      const { formatSuperAgentError } = await import('@ionic/cli-utils/lib/http');
      ienv.log.msg(formatSuperAgentError(err));
    } else if (err.fatal) {
      exitCode = typeof err.exitCode === 'number' ? err.exitCode : 1;

      if (err.message) {
        if (exitCode > 0) {
          ienv.log.error(err.message);
        } else {
          ienv.log.msg(err.message);
        }
      }
    } else {
      ienv.log.msg(chalk.red(String(err)));

      if (err.stack) {
        ienv.log.debug(() => chalk.red(err.stack));
      }
    }
  }

  ienv.close();

  if (exitCode > 0) {
    process.exit(exitCode);
  }
}
