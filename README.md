# NodeJS temperature & humidity logger

This project Raspberry PI 3 based temperature+humidity logger.

Logger measures every 1 minute. 5-minutes averaged values are stored into RRD database.

NOTE: This software is DRAFT / PRE-ALFA, not final product. But you are welcome to be inpired. :-)

## Requirements

 -  System datetime must be synchronized (until year < 2017 the app is waiting and doing nothing)
 -  App must run under root permission.


## Installation

 -  Connect DHT11 sensor to GPIO-4.

    ![](http://www.circuitbasics.com/wp-content/uploads/2015/12/How-to-Setup-the-DHT11-on-the-Raspberry-Pi-Four-pin-DHT11-Wiring-Diagram.png)

    ![](http://www.circuitbasics.com/wp-content/uploads/2015/12/How-to-Setup-the-DHT11-on-the-Raspberry-Pi-Three-pin-DHT11-Wiring-Diagram.png)

    See: [SET UP THE DHT11 HUMIDITY SENSOR ON THE RASPBERRY PI](http://www.circuitbasics.com/how-to-set-up-the-dht11-humidity-sensor-on-the-raspberry-pi/)


 -  Install PM2 as global NPM module

 -  Add PM2 as system service
 
     -  Add `/etc/pm2/pm2.conf` config file
     -  Register service
     
            sudo systemctl daemon-reload
            sudo systemctl enable pm2.service
            sudo systemctl start pm2.service
            # Check service's log
            sudo journalctl -f -u pm2.service

## Manual run

    cd server
    node app.js
 
 
## Usage

 -  Graphs is available on `http://raspberry-hostname:3000/`
