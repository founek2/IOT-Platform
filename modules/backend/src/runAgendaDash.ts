import { loadConfig } from './config.js';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const config = loadConfig()
const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const packageDirectory = path.resolve(moduleDirectory, '..');

let child: any;
const argv = [`--db=${config.dbUri}`, '--collection=agendaJobs', '--port=8089'];

/**
 * StartUp AgendaDash server - webUI dashboard for agenda jobs
 */
function startChild() {
    console.log('STARTING', 'yarn exec agendash', argv);
    child = spawn('yarn', ['exec', 'agendash', ...argv], {
        cwd: packageDirectory,
        env: process.env,
        detached: true,
    });
    child.on('error', function (e: any) {
        console.log(e);
    });
    child.stdout.pipe(process.stdout);
    console.log('STARTED with PID:', child.pid);
}

const callback = function () {
    console.log('Quiting...');
    child.kill();
    process.exit();
};

process.on('SIGQUIT', callback);
process.on('SIGINT', callback);
startChild();
