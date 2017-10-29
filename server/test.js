"use strict";


// Dependencies
const dht = require('dht-sensor');




    for (let i = 0; i < 10; i++) {
        console.log('reading...');
        const /*SensorData*/ sensorData = dht.read(11, 5); // 11 : DHT11, 18 : BCM GPIO
        console.log(`readed ${JSON.stringify(sensorData)}`);
    }
