The dctrl-fobtap repo is designed to run on a raspberry pi which is connected to a rfid fob reader
(ie: 125khz USB Contactless Proximity Card ID Reader RFID EM4100 EM4102 TK4100).

### UPDATE FOBTAP Resource commands

In Arch Linux use the `alarm@alarmpi gpio]$ echo "17" | sudo tee /sys/class/gpio/export` command for exporting the GPIO pin you are using. We use 17.

### Configuration File
`module.exports = {
        resourceId: 'f3e0a850-9f31-11e7-b78b-75fa56fec78b',
        brainLocation:'192.168.0.110:8003/',
        charged:0,
        rethink: {
                db: 'dctrl',
                host: '192.168.0.110'
        },
        fobReader: "/dev/input/by-id/usb-Sycreader_USB_Reader_08FF20150112-event-kbd"
}`




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

### Operating the Raspberry Pi with Arch Linux
Always update Arch's dedicated package manager 'pacman' with
`pacman -Syu`

