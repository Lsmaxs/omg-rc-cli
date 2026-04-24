const fs = require('fs');
const path = require('path');
const {pathConfig} = require('./path');
const { isString } = require('./typeof');
const runCommand = require('./runCommand');
const log = require('../extension/console/log');
const errorlog = require('../extension/console/errorLog');

module.exports = function checkReactRefreshDependencies() {
    return new Promise(async (resolve) => {
        const {appPath} = pathConfig;

        const packageJson = require('../../package.json');
        const { dependencies } = packageJson;
        const curr_v = dependencies['react-refresh'].replace(/(\^|\~)/g, '');

        const targetPackageJsonPath = path.resolve(appPath, 'package.json');
        if ( fs.existsSync(targetPackageJsonPath) ) {
            let appPackageJson = fs.readFileSync(targetPackageJsonPath, 'utf8');
            if (isString(appPackageJson)) appPackageJson = JSON.parse(appPackageJson);
            const { devDependencies, dependencies } = appPackageJson;
            let target_v = devDependencies['react-refresh'] || dependencies['react-refresh'] || null;
            if ( target_v ) {
                target_v = target_v.replace(/(\^|\~)/g, '');
                if ( curr_v === target_v ) {
                    log( { text: `react-refresh@${curr_v}`, emoji: 'white_check_mark' } );
                    resolve(true);
                    return;
                }
            }
        }

        log( { text: `Installing react-refresh@${curr_v}...`, emoji: 'arrows_counterclockwise' } );
        const isDone = await runCommand('npm', ['install', '--save-dev', `react-refresh@${curr_v}`]);
        if ( isDone ) {
            log( { text: `react-refresh@${curr_v} installed`, emoji: 'white_check_mark' } );
            resolve(true);
        } else {
            errorlog( 'install react-refresh failure！ Stop working！' );
            resolve(false);
        }
    });
}
