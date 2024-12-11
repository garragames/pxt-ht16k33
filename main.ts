/**
 * makecode HT16K33 led backpack Package
 */

enum HT16K33_I2C_ADDRESSES {
    //% block="0x70 (Default)"
    ADD_0x70 = 0x70,
    //% block="0x71"
    ADD_0x71 = 0x71,
    //% block="0x72"
    ADD_0x72 = 0x72,
    //% block="0x73"
    ADD_0x73 = 0x73,
    //% block="0x74"
    ADD_0x74 = 0x74,
    //% block="0x75"
    ADD_0x75 = 0x75,
    //% block="0x76"
    ADD_0x76 = 0x76,
    //% block="0x77"
    ADD_0x77 = 0x77,
}

enum HT16K33_COMMANDS {
    TURN_OSCILLATOR_ON = 0x21,
    TURN_DISPLAY_ON = 0x81,
    SET_BRIGHTNESS = 0xE0
}

enum HT16K33_CONSTANTS {
    DEFAULT_ADDRESS = HT16K33_I2C_ADDRESSES.ADD_0x70,
    MAX_BRIGHTNESS = 15,
    MAX_BLINK_RATE = 3
}

/**
 * HT16K33 block
 */
//% weight=100 color=#00a7e9 icon="\uf26c" block="HT16K33"
namespace ht16k33 {
    let matrixAddress = 0;

    const NEUTRAL  = 0;
    const ANGER    = 1;
    const SAD      = 2;
    const LOVE     = 3;
    const CONFUSED = 4;
    const DEAD     = 5;
    const HAPPY    = 6;
    const SLEEP    = 7;
    const WAVES    = 8;
    const CRAZY    = 9;
    const SURPRISE = 10;
    const MAGIC    = 11;

    export enum Eyes {
        //% block="neutral"
        //% jres=eyes.neutral
        neutral = NEUTRAL,
        //% block="anger"
        //% jres=eyes.anger
        anger = ANGER,
        //% block="sad"
        //% jres=eyes.sad
        sad = SAD,
        //% block="love"
        //% jres=eyes.love
        love = LOVE,
        //% block="confused"
        //% jres=eyes.confused
        confused = CONFUSED,
        //% block="dead"
        //% jres=eyes.dead
        dead = DEAD,
        //% block="happy"
        //% jres=eyes.happy
        happy = HAPPY,
        //% block="sleep"
        //% jres=eyes.sleep
        sleep = SLEEP,
        //% block="waves"
        //% jres=eyes.waves
        waves = WAVES,
        //% block="crazy"
        //% jres=eyes.crazy
        crazy = CRAZY,
        //% block="surprise"
        //% jres=eyes.surprise
        surprise = SURPRISE,
        //% block="magic"
        //% jres=icons.magic
        magic = MAGIC       
    }

    function sendCommand(command: HT16K33_COMMANDS) {
        pins.i2cWriteNumber(
            matrixAddress,
            0,
            NumberFormat.Int8LE,
            false
        )
        pins.i2cWriteNumber(
            matrixAddress,
            command,
            NumberFormat.Int8LE,
            false
        )
    }

    //% blockId="HT16K33_RENDER_BITMAP" block="render bitmap %bitmap"
    export function render(bitmap: number[]) {
        const formattedBitmap = formatBimap(bitmap)
        const buff = pins.createBufferFromArray(formattedBitmap);
        pins.i2cWriteBuffer(matrixAddress, buff, true);
    }

    function reverseBits(num: number, bitLength: number = 8): number {
        let reversed = 0;
        for (let i = 0; i < bitLength; i++) {
            // Toma el bit menos significativo de 'num'
            const bit = (num >> i) & 1;
            // Desplaza 'reversed' a la izquierda y agrega el bit extraído
            reversed = (reversed << 1) | bit;
        }
        return reversed;
    }

    function formatBimap(bitmap: Array<number>) {
        const formattedBitmap: Array<number> = [];
        // Initialize memory (2 bytes)
        formattedBitmap.push(15);
        formattedBitmap.push(0);
        for (let i = 0; i < bitmap.length; i += 2) {
            // bitmap[i] = byte para la mitad izquierda (columnas 0-7)
            // bitmap[i+1] = byte para la mitad derecha (columnas 8-15)
            formattedBitmap.push(reverseBits(bitmap[i]));
            formattedBitmap.push(reverseBits(bitmap[i + 1]));
        }
        return formattedBitmap;
    }
    
    function initializeDisplay() {
        /** 
         * Required to initialize I2C 
         * Issue: https://github.com/lancaster-university/codal-samd/issues/13
         **/
        pins.setPull(DigitalPin.P20, PinPullMode.PullNone) // SDA
        pins.setPull(DigitalPin.P19, PinPullMode.PullNone) // SCL
        sendCommand(HT16K33_COMMANDS.TURN_OSCILLATOR_ON)
        sendCommand(HT16K33_COMMANDS.TURN_DISPLAY_ON)
    }

    /**
    * Set Icon
    * @param icon
    */
    //% blockId=setIcon
    //% block="set icon $icon"
    //% icon.defl=Eyes.neutral
    //% icon.fieldEditor="imagedropdown" 
    //% icon.fieldOptions.columns=3
    //% icon.fieldOptions.width="300"
    //% icon.fieldOptions.maxRows=3
    //% group="Emotions"
    //% weight=240
    export function setEmotion(icon: Eyes): void {
        //basic.showNumber(icon)
        render(Emotions.icons[icon])
    }

    //% blockId="HT16K33_SET_ADDRESS" block="set address %address"
    export function setAddress(address: HT16K33_I2C_ADDRESSES) {
        if (matrixAddress != address) {
            matrixAddress = address;
            initializeDisplay();
        }
    }

    //% blockId="HT16K33_SET_BRIGHTNESS" block="set brightness %brightness"
    //% brightness.min=0 brightness.max=15
    export function setBrightness(brightness: number) {
        sendCommand(HT16K33_COMMANDS.SET_BRIGHTNESS | brightness & HT16K33_CONSTANTS.MAX_BRIGHTNESS);
        sendCommand(brightness);
    }
    //% blockId="HT16K33_SET_BLINK_RATE" block="set blink rate %rate"
    //% rate.min=0 rate.max=3
    export function setBlinkRate(rate: number) {
        sendCommand(HT16K33_COMMANDS.TURN_DISPLAY_ON | (rate & HT16K33_CONSTANTS.MAX_BLINK_RATE) << 1);
    }
}
