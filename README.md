The dctrl-fobtap repo is designed to run on a raspberry pi which is connected to a rfid fob reader
(ie: 125khz USB Contactless Proximity Card ID Reader RFID EM4100 EM4102 TK4100).

Overview of what each file is doing:

### dispense.js
Contains the code that remembers how many dispenses are owed and ensures that they are spaced out to give time for the users to use the vending machine.

### fobtap.service
Example systemd file that manages the automatic startup.

### index.js
Main file sends fob details from tap.js stream to dctrl-admin

### package.json
Node package configuration.

### README.md
You are here.

### tap.js
Logic that works with the rfid reader and exposes a kefir stream of the fob values.

### vend.js
This file listens on the db event creation creates a dispense event.

### Setting up the Raspberry Pi with Arch Linux
