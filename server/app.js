"use strict";

// Dependency
const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const rrdtool = require('rrdtool');
const schedule = require('node-schedule');
const sensorReader = require('./sensor-reader');

const HTTP_PORT = 3000;

// SENSORS DEFINITIONS
const sensorDefinitions = [
    {
        dhtType: 11,
        gpio: 4,
        rrdDb: '../rrd/sensor-in.rrd',
    },
    {
        dhtType: 11,
        gpio: 22,
        rrdDb: '../rrd/sensor-out.rrd',
    },
];

let rrdDbs = {};


process.title = 'tem-hum-logger';


waitForDatetimeSync().then(function() {
    startGraphsUpdating();

    sensorDefinitions.map(sensorDefinition => {
        // Start periodicaly measuring and logging.
        startLogging(sensorDefinition).catch(err => {
            console.error(`Start logging of ${sensorDefinition.rrdDb} failed. ${err}`);
        });
    });

    startWebServer();
});

exec('bash ./mount-ramdisk.sh', (error, ignore_stdout, ignore_stderr) => {
    if (error) {
        console.error(`Exec error of mount-ramdisk.sh: ${error}`);
    }
});



function getRrdDb(filename) {
    // Cache rrdtool instances (do not create the new one on each call).
    if (rrdDbs[filename]) {
        return rrdDbs[filename];
    }

    // New rrdtool instance
    let rrdDb;

    if (fs.existsSync(filename)) {
        // console.log(`Opening RRD ${filename}`);
        rrdDb = rrdtool.open(filename);
    } else {

        // Create parent dir
        if (!fs.existsSync(path.dirname(filename))) {
            console.log('Creating directory for rrd db files.');
            fs.mkdirSync(path.dirname(filename));
        }

        // Create rrd db with 5 minutes steps
        console.log(`Creating new RRD ${filename}`);
        const step = 300;
        const start = rrdtool.now();
        rrdDb = rrdtool.create(filename, { start: start, step: step }, [
            `DS:temperature:GAUGE:${step*2}:-30:50`,
            `DS:humidity:GAUGE:${step*2}:0:100`,
            'RRA:AVERAGE:0.5:1:864', // 1 = keep all measured values (5 min); store for 3 days = 864 = 12recordPerHour (1 per 5 minutes) * 24hours * 3days
            'RRA:AVERAGE:0.5:6:384', // 6 = averaged every  30 minutes;  store for 8 days
            'RRA:AVERAGE:0.5:24:420', // 24 = every 2 hours, 5 weeks
            'RRA:AVERAGE:0.5:288:760', // 288 = every 24 hours, 25 months
        ]);
    }
    rrdDbs[filename] = rrdDb;
    return rrdDb;
}


async function startLogging(sensorDefinition) {

    // Initialize RRDtool DB instances
    const rrdDb = getRrdDb(sensorDefinition.rrdDb);

    console.log(`Waiting for cron job for sensor ${sensorDefinition.rrdDb}.`);

    let measuedData = [];

    schedule.scheduleJob('*/1 * * * *', function() {
        try {
            const sensorData = sensorReader.readSensorsData(sensorDefinition.dhtType, sensorDefinition.gpio);
            console.log(`${(new Date()).toISOString()}: DHT${sensorDefinition.dhtType} on GPIO${sensorDefinition.gpio}: Measured ${(new Date()).toISOString()}: ${sensorData.temperature}°C, ${sensorData.humidity}%.`);
            measuedData.push(sensorData);
        } catch (err) {
            console.error(`${(new Date()).toISOString()}: ${err.message}`);

        }
    });

    schedule.scheduleJob('*/5 * * * *', function() {

        if (measuedData.length > 0) {
            const sumarizedSensorData = measuedData.reduce((sumarizedSensorData, currentSensorData) => {
                return {
                    temperature: sumarizedSensorData.temperature + currentSensorData.temperature,
                    humidity: sumarizedSensorData.humidity + currentSensorData.humidity,
                }
            }, { temperature: 0, humidity: 0});

            const averagedSensorData = {
                temperature: sumarizedSensorData.temperature / measuedData.length,
                humidity: sumarizedSensorData.humidity / measuedData.length,
            };
            rrdDb.update(rrdtool.now(), averagedSensorData);

            console.log(`${(new Date()).toISOString()}: DHT${sensorDefinition.dhtType} on GPIO${sensorDefinition.gpio}: ${averagedSensorData.temperature}°C, ${averagedSensorData.humidity}% (${measuedData.length} measurements) => ${sensorDefinition.rrdDb}.`);
            measuedData = [];

        } else {
            // No data to store
            console.warn(`${(new Date()).toISOString()}: No valid data from DHT${sensorDefinition.dhtType} on GPIO${sensorDefinition.gpio} for ${sensorDefinition.rrdDb}.`);
        }

    });

}


async function waitForDatetimeSync() {
    return new Promise(function(resolve) {
        function wait() {
            let now = new Date();
            if (now.getFullYear() >= 2017) {
                resolve();
            } else {
                setTimeout(wait, 1000);
            }
        }
        wait();
    });
}


function generateGraphs() {
    exec('bash ./graph-generator.sh', (error, ignore_stdout, ignore_stderr) => {
        if (error) {
            console.error(`Exec error of graph-generator.sh: ${error}`);
        }
    });
}

function startGraphsUpdating() {
    // Generate graphs on start
    generateGraphs();

    schedule.scheduleJob('1,6,11,16,21,26,31,36,41,46,51,56 * * * *', function() {
        // Update graphs
        console.log('RRD graphs images updating ...');
        generateGraphs();
    });
}


function startWebServer() {
    // Start web server
    const app = express();
    app.use('/api/delete-history', deleteHistoryHttp);
    app.use('/api/shutdown-os', shutdownOsHttp);
    app.use('/api/reboot-os', rebootOsHttp);
    app.use('^/$', function(req,res) { res.redirect('/client/'); });
    app.use('/client', express.static('../client'));
    console.log(`App will start on HTTP port ${HTTP_PORT} ...`);
    app.listen(HTTP_PORT);

}

function deleteHistoryHttp(ignore_req, res) {

    console.log(`History deletion requested. ${JSON.stringify(Object.keys(rrdDbs))})`);
    Object.keys(rrdDbs).map(filename => {
        // Do not delete, only rename.
        const newFilename = filename + '__' + (new Date()).toISOString().replace(/[TZ\-:.]/g,'');
        console.log(`Renaming ${filename} into ${newFilename}`);
        fs.renameSync(filename, newFilename);
        // Cache clean
        rrdDbs[filename] = null;
        // Generate new RRD file
        rrdDbs[filename] = getRrdDb(filename);
    });
    // Clear graph images
    generateGraphs();

    res.send(`History deleted (files ${JSON.stringify(Object.keys(rrdDbs))}). Press back in browser.`);
    res.end();
}

function rebootOsHttp(ignore_req, res) {

    exec('reboot', (error, ignore_stdout, ignore_stderr) => {
        if (error) {
            console.error(`Exec error.: ${error}`);
        }
    });

    res.send(`Rebooting PI ...`);
    res.end();
}


function shutdownOsHttp(ignore_req, res) {

    exec('shutdown', (error, ignore_stdout, ignore_stderr) => {
        if (error) {
            console.error(`Exec error.: ${error}`);
        }
    });

    res.send(`Shutting down PI ...`);
    res.end();
}

