The dctrl-fobtap repo is designed to run on a raspberry pi which is connected to a rfid fob reader
(ie: 125khz USB Contactless Proximity Card ID Reader RFID EM4100 EM4102 TK4100).

Overview of what each file is doing:

### bountyChecker.js
Logic that manages fob task claiming. Requires two taps, bounty fob then member fob.

### dispense.js
Contains the code that remembers how many dispenses are owed and ensures that they are spaced out to give time for the users to use the vending machine.

### fobtap.service
Example systemd file that manages the automatic startup.

### index.js
Main file, async logic that feeds the bounty check into the vend check/

### package.json
Node package configuration.

### README.md
You are here.

### tap.js
Logic that works with the rfid reader and exposes a kefir stream of the fob values.

### vend.js
This file defines the event creation for vending and listens on the db event creation to create a dispense event.
