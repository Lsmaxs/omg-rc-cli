const fs = require('fs');
const path = require('path');
const {pathConfig} = require('./path');
const { isString } = require('./typeof');
const runCommand = require('./runCommand');
const log = require('../extension/console/log');
const errorlog = require('../extension/console/errorLog');

module.exports = function checkRunDevDependencies() {
    return new Promise(async (resolve) => {
        const {appPath} = pathConfig;

        const packageJson = require('../../package.json');
        const { dependencies } = packageJson;
        const corejs3_V = dependencies['@babel/runtime-corejs3'].replace(/(\^|\~)/g, '');

        const targetPackageJsonPaht = path.resolve(appPath, 'package.json')
        if ( fs.existsSync(targetPackageJsonPaht) ) {
            let appPackageJson = fs.readFileSync(targetPackageJsonPaht, 'utf8');
            if (isString(appPackageJson)) appPackageJson = JSON.parse(appPackageJson);
            const { devDependencies, dependencies } = appPackageJson;
            let target_corejs3_V = (devDependencies && devDependencies['@babel/runtime-corejs3']) || (dependencies && dependencies['@babel/runtime-corejs3']) || null;
            if ( target_corejs3_V ) {
                target_corejs3_V = target_corejs3_V.replace(/(\^|\~)/g, '');
                if ( corejs3_V === target_corejs3_V ) {
                    log( { text: `@babel/runtime-corejs3@${corejs3_V}`, emoji: 'white_check_mark' } );
                    resolve(true);
                    return;
                }
            }
        }

        log( { text: `Installing @babel/runtime-corejs3@${corejs3_V}...`, emoji: 'arrows_counterclockwise' } );
        const isDone = await runCommand('npm', ['install', '--save-dev', `@babel/runtime-corejs3@${corejs3_V}`]);
        if ( isDone ) {
            log( { text: `@babel/runtime-corejs3@${corejs3_V} installed`, emoji: 'white_check_mark' } );
            resolve(true);
        } else {
            errorlog( 'install @babel/runtime-corejs3 failure！ Stop working！' );
            resolve(false);
        }
    });
}