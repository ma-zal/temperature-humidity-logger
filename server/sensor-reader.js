"use strict";


// Dependencies
const dht = require('dht-sensor');


// Exports
module.exports = { readSensorsData };


function readSensorsData(dhtType, pin) {
    for (let i = 0; i < 10; i++) {
        const /*SensorData*/ sensorData = dht.read(dhtType, pin); // 11 : DHT11, 18 : BCM GPIO
        if (sensorData.humidity !== 0 && sensorData.temperature !== 0 && sensorData.humidity <= 100) {
            return sensorData;
        }
    }
    throw new Error(`Cannot read valid data from sensor DHT${dhtType} on GPIO${pin}.`);
}


/**
 * @typedef {Object} SensorData
 *
 * @property {number} humidity
 * @property {number} temperature
 */