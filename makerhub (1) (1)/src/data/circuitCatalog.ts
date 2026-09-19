// src/data/circuitCatalog.ts
// Comprehensive 200+ maker component library with accurate physical pins, electrical models, and descriptions

export type ComponentCategory = 'basic' | 'power' | 'output' | 'sensors' | 'boards' | 'modules' | 'ics' | 'electromechanical';

export interface CatalogItem {
  type: string;
  category: ComponentCategory;
  name: string;
  defaultVal: string;
  unit: string;
  description: string;
  spiceSupported: boolean;
  pinCount: number;
  iconName: string;
  width?: number;
  height?: number;
}

export const EXTENDED_COMPONENT_CATALOG: CatalogItem[] = [
  // ==========================================
  // 1. FULL SIZE DEVELOPMENT BOARDS & MCUS (25 boards)
  // ==========================================
  {
    type: 'arduino_uno',
    category: 'boards',
    name: 'Arduino Uno R3',
    defaultVal: 'ATmega328P 16MHz',
    unit: '5V',
    description: 'Full-size flagship dev board: 14 digital I/O (6 PWM), 6 analog inputs, 5V/3.3V power rails, USB type-B & DC barrel jack.',
    spiceSupported: true,
    pinCount: 28,
    iconName: 'Cpu',
    width: 280,
    height: 210
  },
  {
    type: 'arduino_mega',
    category: 'boards',
    name: 'Arduino Mega 2560',
    defaultVal: 'ATmega2560 16MHz',
    unit: '5V',
    description: 'Full-size extended board: 54 digital I/O pins, 16 analog inputs, 4 hardware UART serial ports, 256KB flash for complex robotics.',
    spiceSupported: true,
    pinCount: 40,
    iconName: 'Cpu',
    width: 280,
    height: 150
  },
  {
    type: 'esp32_devkit',
    category: 'boards',
    name: 'ESP32 DevKit V1 (30-pin)',
    defaultVal: 'Dual-Core 240MHz',
    unit: '3.3V',
    description: 'Full-size ESP32-WROOM-32 module with Wi-Fi + Bluetooth BLE, dual-core Tensilica Xtensa, 30 DIP header pins, onboard micro-USB CP2102.',
    spiceSupported: true,
    pinCount: 30,
    iconName: 'Cpu',
    width: 140,
    height: 200
  },
  {
    type: 'esp32_s3',
    category: 'boards',
    name: 'ESP32-S3 DevKitC-1',
    defaultVal: 'Dual-Core LX7 240MHz',
    unit: '3.3V',
    description: 'High-performance AI/Vector acceleration board with native USB OTG, 44 GPIOs, 8MB PSRAM, Bluetooth 5 (LE) + Mesh, and Wi-Fi.',
    spiceSupported: true,
    pinCount: 32,
    iconName: 'Cpu',
    width: 150,
    height: 210
  },
  {
    type: 'esp8266_nodemcu',
    category: 'boards',
    name: 'ESP8266 NodeMCU v3',
    defaultVal: 'ESP-12E 80MHz',
    unit: '3.3V',
    description: 'Full-size IoT workhorse with onboard Wi-Fi 802.11 b/g/n, 30 breadboard-friendly pins, CH340 USB-UART, and deep sleep low-power mode.',
    spiceSupported: true,
    pinCount: 30,
    iconName: 'Cpu',
    width: 140,
    height: 190
  },
  {
    type: 'raspberry_pi_pico',
    category: 'boards',
    name: 'Raspberry Pi Pico (RP2040)',
    defaultVal: 'Dual ARM Cortex-M0+ 133MHz',
    unit: '3.3V',
    description: 'Full 40-pin DIP layout featuring dual Cortex-M0+ cores, 264KB SRAM, 8 programmable I/O (PIO) state machines, and micro-USB.',
    spiceSupported: true,
    pinCount: 40,
    iconName: 'Cpu',
    width: 130,
    height: 230
  },
  {
    type: 'raspberry_pi_pico_w',
    category: 'boards',
    name: 'Raspberry Pi Pico W',
    defaultVal: 'RP2040 + CYW43439 Wi-Fi',
    unit: '3.3V',
    description: 'Official Raspberry Pi Pico board upgraded with 2.4GHz 802.11n wireless LAN and Bluetooth 5.2 connectivity.',
    spiceSupported: true,
    pinCount: 40,
    iconName: 'Cpu',
    width: 130,
    height: 230
  },
  {
    type: 'arduino_nano',
    category: 'boards',
    name: 'Arduino Nano V3',
    defaultVal: 'ATmega328P 16MHz',
    unit: '5V',
    description: 'Compact 30-pin breadboard-dockable Arduino with 8 analog inputs (A0-A7), 14 digital pins, ICSP header, and mini-USB.',
    spiceSupported: true,
    pinCount: 30,
    iconName: 'Cpu',
    width: 110,
    height: 180
  },
  {
    type: 'arduino_nano_every',
    category: 'boards',
    name: 'Arduino Nano Every',
    defaultVal: 'ATmega4809 20MHz',
    unit: '5V',
    description: 'Next-gen compact powerhouse with 48KB Flash, 6KB RAM, native hardware UART, and high-efficiency MPM3610 step-down converter.',
    spiceSupported: true,
    pinCount: 30,
    iconName: 'Cpu',
    width: 110,
    height: 180
  },
  {
    type: 'stm32_bluepill',
    category: 'boards',
    name: 'STM32 Blue Pill (STM32F103C8T6)',
    defaultVal: 'ARM Cortex-M3 72MHz',
    unit: '3.3V',
    description: 'Full 40-pin ARM microcontroller board with 64KB Flash, 20KB SRAM, USB port, 2x SPI, 2x I2C, 3x USART, and 37 GPIO lines.',
    spiceSupported: true,
    pinCount: 40,
    iconName: 'Cpu',
    width: 120,
    height: 220
  },
  {
    type: 'stm32_blackpill',
    category: 'boards',
    name: 'STM32 Black Pill (STM32F401/F411)',
    defaultVal: 'ARM Cortex-M4F 100MHz',
    unit: '3.3V',
    description: 'High-speed DSP & hardware FPU floating point development board with USB-C connector and 512KB flash memory.',
    spiceSupported: true,
    pinCount: 40,
    iconName: 'Cpu',
    width: 120,
    height: 220
  },
  {
    type: 'teensy_40',
    category: 'boards',
    name: 'Teensy 4.0',
    defaultVal: 'ARM Cortex-M7 600MHz',
    unit: '3.3V',
    description: 'Extreme speed 600MHz microcontroller by PJRC featuring NXP i.MX RT1062, 1024K RAM, 2048K Flash, and ultra-fast floating point.',
    spiceSupported: true,
    pinCount: 28,
    iconName: 'Cpu',
    width: 110,
    height: 170
  },
  {
    type: 'teensy_41',
    category: 'boards',
    name: 'Teensy 4.1 (with Ethernet)',
    defaultVal: 'ARM Cortex-M7 600MHz',
    unit: '3.3V',
    description: 'Full-length 55-pin flagship Teensy with onboard 100Mbit Ethernet PHY, SD card socket, and 42 breadboard-friendly I/O pins.',
    spiceSupported: true,
    pinCount: 42,
    iconName: 'Cpu',
    width: 130,
    height: 260
  },
  {
    type: 'seeed_xiao_samd21',
    category: 'boards',
    name: 'Seeed Studio XIAO SAMD21',
    defaultVal: 'ARM Cortex-M0+ 48MHz',
    unit: '3.3V',
    description: 'Tiny thumb-sized 14-pin dev board with USB-C interface, 11 digital/analog pins with 10-bit DAC, and 256KB flash.',
    spiceSupported: true,
    pinCount: 14,
    iconName: 'Cpu',
    width: 90,
    height: 110
  },
  {
    type: 'seeed_xiao_esp32c3',
    category: 'boards',
    name: 'Seeed Studio XIAO ESP32-C3',
    defaultVal: 'RISC-V 160MHz',
    unit: '3.3V',
    description: 'Compact single-core 32-bit RISC-V board with complete Wi-Fi and Bluetooth 5 (LE) subsystem, battery charging management.',
    spiceSupported: true,
    pinCount: 14,
    iconName: 'Cpu',
    width: 90,
    height: 110
  },
  {
    type: 'seeed_xiao_rp2040',
    category: 'boards',
    name: 'Seeed Studio XIAO RP2040',
    defaultVal: 'Dual M0+ 133MHz',
    unit: '3.3V',
    description: 'Miniature RP2040 board with RGB NeoPixel, reset button, and USB Type-C interface.',
    spiceSupported: true,
    pinCount: 14,
    iconName: 'Cpu',
    width: 90,
    height: 110
  },
  {
    type: 'adafruit_feather_m4',
    category: 'boards',
    name: 'Adafruit Feather M4 Express',
    defaultVal: 'ATSAMD51 120MHz',
    unit: '3.3V',
    description: 'Feather format development board with 120MHz Cortex-M4, hardware DSP/FPU, 2MB SPI flash for CircuitPython, and LiPo charger.',
    spiceSupported: true,
    pinCount: 28,
    iconName: 'Cpu',
    width: 130,
    height: 190
  },
  {
    type: 'adafruit_feather_esp32',
    category: 'boards',
    name: 'Adafruit HUZZAH32 ESP32 Feather',
    defaultVal: 'ESP32 240MHz',
    unit: '3.3V',
    description: 'All-in-one Feather board with integrated USB-to-Serial converter, LiPo battery charging, and 21 GPIO pins.',
    spiceSupported: true,
    pinCount: 28,
    iconName: 'Cpu',
    width: 130,
    height: 190
  },
  {
    type: 'microbit_v2',
    category: 'boards',
    name: 'BBC micro:bit v2',
    defaultVal: 'Nordic nRF52833 64MHz',
    unit: '3.3V',
    description: 'Educational microcontroller board with 5x5 LED matrix, MEMS microphone, speaker, touch sensor, accelerometer, and magnetometer.',
    spiceSupported: true,
    pinCount: 20,
    iconName: 'Cpu',
    width: 180,
    height: 160
  },
  {
    type: 'attiny85_digispark',
    category: 'boards',
    name: 'Digispark ATtiny85 Board',
    defaultVal: 'ATtiny85 16.5MHz',
    unit: '5V',
    description: 'Ultra-small direct-USB board with 6 I/O pins, 8KB Flash, 512 bytes SRAM, and built-in 5V regulator.',
    spiceSupported: true,
    pinCount: 6,
    iconName: 'Cpu',
    width: 80,
    height: 110
  },
  {
    type: 'esp32_cam',
    category: 'boards',
    name: 'ESP32-CAM AI-Thinker',
    defaultVal: 'ESP32 + OV2640',
    unit: '5V/3.3V',
    description: 'Complete camera development board with 2MP OV2640 CMOS sensor, TF card slot, and high-brightness flash LED.',
    spiceSupported: true,
    pinCount: 16,
    iconName: 'Cpu',
    width: 140,
    height: 160
  },
  {
    type: 'arduino_promini_5v',
    category: 'boards',
    name: 'Arduino Pro Mini (5V/16MHz)',
    defaultVal: 'ATmega328P',
    unit: '5V',
    description: 'Ultra-light barebones Arduino for embedded installations with FTDI programming header pins.',
    spiceSupported: true,
    pinCount: 24,
    iconName: 'Cpu',
    width: 100,
    height: 160
  },
  {
    type: 'arduino_promini_3v3',
    category: 'boards',
    name: 'Arduino Pro Mini (3.3V/8MHz)',
    defaultVal: 'ATmega328P low-power',
    unit: '3.3V',
    description: 'Low-voltage 3.3V 8MHz version ideal for direct battery powered projects and 3.3V SPI/I2C sensor integration.',
    spiceSupported: true,
    pinCount: 24,
    iconName: 'Cpu',
    width: 100,
    height: 160
  },
  {
    type: 'sparkfun_promicro',
    category: 'boards',
    name: 'SparkFun Pro Micro 5V',
    defaultVal: 'ATmega32U4 16MHz',
    unit: '5V',
    description: 'Native USB HID keyboard/mouse emulation board with 12 digital pins, 5 PWM channels, and 4 ADC channels.',
    spiceSupported: true,
    pinCount: 24,
    iconName: 'Cpu',
    width: 100,
    height: 170
  },
  {
    type: 'raspberry_pi_zero2w',
    category: 'boards',
    name: 'Raspberry Pi Zero 2 W',
    defaultVal: 'Quad-core 64-bit ARM 1GHz',
    unit: '5V',
    description: 'Single-board computer header: 40-pin GPIO pinout, 512MB RAM, Wi-Fi, Bluetooth 4.2 BLE, Mini HDMI, and dual micro-USB.',
    spiceSupported: true,
    pinCount: 40,
    iconName: 'Cpu',
    width: 160,
    height: 240
  },

  // ==========================================
  // 2. PASSIVE RESISTORS (E12 & Precision Range) (28 values)
  // ==========================================
  { type: 'resistor', category: 'basic', name: 'Resistor 10Ω', defaultVal: '10', unit: 'Ω', description: 'Current sense & soft-start resistor 1/4W 5%', spiceSupported: true, pinCount: 2, iconName: 'Activity' },
  { type: 'resistor', category: 'basic', name: 'Resistor 22Ω', defaultVal: '22', unit: 'Ω', description: 'USB D+/D- impedance matching series damping resistor', spiceSupported: true, pinCount: 2, iconName: 'Activity' },
  { type: 'resistor', category: 'basic', name: 'Resistor 47Ω', defaultVal: '47', unit: 'Ω', description: 'Low impedance line termination resistor', spiceSupported: true, pinCount: 2, iconName: 'Activity' },
  { type: 'resistor', category: 'basic', name: 'Resistor 100Ω', defaultVal: '100', unit: 'Ω', description: 'Gate drive / low-drop LED current limiting resistor', spiceSupported: true, pinCount: 2, iconName: 'Activity' },
  { type: 'resistor', category: 'basic', name: 'Resistor 150Ω', defaultVal: '150', unit: 'Ω', description: 'Current limiter for high-efficiency blue/white LEDs (5V)', spiceSupported: true, pinCount: 2, iconName: 'Activity' },
  { type: 'resistor', category: 'basic', name: 'Resistor 220Ω', defaultVal: '220', unit: 'Ω', description: 'Standard 5V red LED current limiter (approx 15mA)', spiceSupported: true, pinCount: 2, iconName: 'Activity' },
  { type: 'resistor', category: 'basic', name: 'Resistor 270Ω', defaultVal: '270', unit: 'Ω', description: 'Current limiting resistor for 5V microcontroller outputs', spiceSupported: true, pinCount: 2, iconName: 'Activity' },
  { type: 'resistor', category: 'basic', name: 'Resistor 330Ω', defaultVal: '330', unit: 'Ω', description: 'Common current limiter for 3.3V/5V indicator LEDs', spiceSupported: true, pinCount: 2, iconName: 'Activity' },
  { type: 'resistor', category: 'basic', name: 'Resistor 470Ω', defaultVal: '470', unit: 'Ω', description: 'Medium current limiter and analog filter resistor', spiceSupported: true, pinCount: 2, iconName: 'Activity' },
  { type: 'resistor', category: 'basic', name: 'Resistor 680Ω', defaultVal: '680', unit: 'Ω', description: 'Optocoupler IR diode driver current limiter', spiceSupported: true, pinCount: 2, iconName: 'Activity' },
  { type: 'resistor', category: 'basic', name: 'Resistor 1kΩ', defaultVal: '1k', unit: 'Ω', description: 'Base resistor for NPN/PNP switching transistors', spiceSupported: true, pinCount: 2, iconName: 'Activity' },
  { type: 'resistor', category: 'basic', name: 'Resistor 1.5kΩ', defaultVal: '1.5k', unit: 'Ω', description: 'USB D+ speed pull-up resistor (Full Speed 12Mbps)', spiceSupported: true, pinCount: 2, iconName: 'Activity' },
  { type: 'resistor', category: 'basic', name: 'Resistor 2.2kΩ', defaultVal: '2.2k', unit: 'Ω', description: 'Fast-mode 400kHz I2C bus pull-up resistor', spiceSupported: true, pinCount: 2, iconName: 'Activity' },
  { type: 'resistor', category: 'basic', name: 'Resistor 3.3kΩ', defaultVal: '3.3k', unit: 'Ω', description: 'Voltage divider lower leg (5V to 3.3V logic level shifting)', spiceSupported: true, pinCount: 2, iconName: 'Activity' },
  { type: 'resistor', category: 'basic', name: 'Resistor 4.7kΩ', defaultVal: '4.7k', unit: 'Ω', description: 'Standard I2C bus (SDA/SCL) and 1-Wire (DS18B20) pull-up resistor', spiceSupported: true, pinCount: 2, iconName: 'Activity' },
  { type: 'resistor', category: 'basic', name: 'Resistor 5.1kΩ', defaultVal: '5.1k', unit: 'Ω', description: 'USB Type-C CC1/CC2 configuration channel pull-down resistor', spiceSupported: true, pinCount: 2, iconName: 'Activity' },
  { type: 'resistor', category: 'basic', name: 'Resistor 6.8kΩ', defaultVal: '6.8k', unit: 'Ω', description: 'Biasing and operational amplifier feedback resistor', spiceSupported: true, pinCount: 2, iconName: 'Activity' },
  { type: 'resistor', category: 'basic', name: 'Resistor 10kΩ', defaultVal: '10k', unit: 'Ω', description: 'Standard digital logic pull-up / pull-down resistor', spiceSupported: true, pinCount: 2, iconName: 'Activity' },
  { type: 'resistor', category: 'basic', name: 'Resistor 15kΩ', defaultVal: '15k', unit: 'Ω', description: 'High-impedance sensor divider resistor', spiceSupported: true, pinCount: 2, iconName: 'Activity' },
  { type: 'resistor', category: 'basic', name: 'Resistor 22kΩ', defaultVal: '22k', unit: 'Ω', description: 'Audio pre-amp and audio line filter passive resistor', spiceSupported: true, pinCount: 2, iconName: 'Activity' },
  { type: 'resistor', category: 'basic', name: 'Resistor 33kΩ', defaultVal: '33k', unit: 'Ω', description: '555 timer timing circuit resistor', spiceSupported: true, pinCount: 2, iconName: 'Activity' },
  { type: 'resistor', category: 'basic', name: 'Resistor 47kΩ', defaultVal: '47k', unit: 'Ω', description: 'Op-amp non-inverting gain setting resistor', spiceSupported: true, pinCount: 2, iconName: 'Activity' },
  { type: 'resistor', category: 'basic', name: 'Resistor 68kΩ', defaultVal: '68k', unit: 'Ω', description: 'Comparator hysteresis feedback resistor', spiceSupported: true, pinCount: 2, iconName: 'Activity' },
  { type: 'resistor', category: 'basic', name: 'Resistor 100kΩ', defaultVal: '100k', unit: 'Ω', description: 'High-value pull-up / low current battery monitor resistor', spiceSupported: true, pinCount: 2, iconName: 'Activity' },
  { type: 'resistor', category: 'basic', name: 'Resistor 220kΩ', defaultVal: '220k', unit: 'Ω', description: 'Oscillator bias and high-input impedance stage resistor', spiceSupported: true, pinCount: 2, iconName: 'Activity' },
  { type: 'resistor', category: 'basic', name: 'Resistor 470kΩ', defaultVal: '470k', unit: 'Ω', description: 'Sub-microamp ultra low power pull-up resistor', spiceSupported: true, pinCount: 2, iconName: 'Activity' },
  { type: 'resistor', category: 'basic', name: 'Resistor 1MΩ', defaultVal: '1meg', unit: 'Ω', description: '1 Megohm crystal oscillator feedback & ESD bleed resistor', spiceSupported: true, pinCount: 2, iconName: 'Activity' },
  { type: 'resistor', category: 'basic', name: 'Resistor 10MΩ', defaultVal: '10meg', unit: 'Ω', description: '10 Megohm high voltage discharge / ionization sensor resistor', spiceSupported: true, pinCount: 2, iconName: 'Activity' },

  // ==========================================
  // 3. CAPACITORS (Ceramic, Film, Electrolytic) (20 values)
  // ==========================================
  { type: 'capacitor', category: 'basic', name: 'Ceramic Cap 22pF', defaultVal: '22p', unit: 'F', description: '16MHz crystal load capacitor (pair with crystal)', spiceSupported: true, pinCount: 2, iconName: 'Zap' },
  { type: 'capacitor', category: 'basic', name: 'Ceramic Cap 100pF', defaultVal: '100p', unit: 'F', description: 'RF high-frequency bypass and snubber capacitor', spiceSupported: true, pinCount: 2, iconName: 'Zap' },
  { type: 'capacitor', category: 'basic', name: 'Ceramic Cap 1nF', defaultVal: '1n', unit: 'F', description: 'Audio frequency active filter ceramic capacitor', spiceSupported: true, pinCount: 2, iconName: 'Zap' },
  { type: 'capacitor', category: 'basic', name: 'Ceramic Cap 10nF', defaultVal: '10n', unit: 'F', description: 'High-frequency noise decoupling capacitor', spiceSupported: true, pinCount: 2, iconName: 'Zap' },
  { type: 'capacitor', category: 'basic', name: 'Ceramic Cap 47nF', defaultVal: '47n', unit: 'F', description: 'Tone control and AC coupling capacitor', spiceSupported: true, pinCount: 2, iconName: 'Zap' },
  { type: 'capacitor', category: 'basic', name: 'Ceramic Cap 100nF (0.1µF)', defaultVal: '100n', unit: 'F', description: 'Essential digital IC supply rail bypass capacitor', spiceSupported: true, pinCount: 2, iconName: 'Zap' },
  { type: 'capacitor', category: 'basic', name: 'Ceramic Cap 220nF', defaultVal: '220n', unit: 'F', description: 'Charge pump capacitor for MAX232 RS232 driver', spiceSupported: true, pinCount: 2, iconName: 'Zap' },
  { type: 'capacitor', category: 'basic', name: 'Ceramic Cap 470nF', defaultVal: '470n', unit: 'F', description: 'Low-dropout voltage regulator stability capacitor', spiceSupported: true, pinCount: 2, iconName: 'Zap' },
  { type: 'capacitor', category: 'basic', name: 'Ceramic Cap 1µF', defaultVal: '1u', unit: 'F', description: 'Multilayer ceramic (MLCC) decoupling capacitor', spiceSupported: true, pinCount: 2, iconName: 'Zap' },
  { type: 'capacitor', category: 'basic', name: 'Ceramic Cap 2.2µF', defaultVal: '2.2u', unit: 'F', description: 'Compact filtering MLCC for 3.3V LDO regulators', spiceSupported: true, pinCount: 2, iconName: 'Zap' },
  { type: 'capacitor', category: 'basic', name: 'Ceramic Cap 4.7µF', defaultVal: '4.7u', unit: 'F', description: 'High capacity ceramic capacitor for power rail filtering', spiceSupported: true, pinCount: 2, iconName: 'Zap' },
  { type: 'capacitor', category: 'basic', name: 'Electrolytic Cap 10µF', defaultVal: '10u', unit: 'F', description: 'Radial polarized electrolytic bulk filter capacitor 25V', spiceSupported: true, pinCount: 2, iconName: 'Zap' },
  { type: 'capacitor', category: 'basic', name: 'Electrolytic Cap 22µF', defaultVal: '22u', unit: 'F', description: 'Audio output AC coupling capacitor', spiceSupported: true, pinCount: 2, iconName: 'Zap' },
  { type: 'capacitor', category: 'basic', name: 'Electrolytic Cap 47µF', defaultVal: '47u', unit: 'F', description: 'Intermediate power smoothing capacitor 35V', spiceSupported: true, pinCount: 2, iconName: 'Zap' },
  { type: 'capacitor', category: 'basic', name: 'Electrolytic Cap 100µF', defaultVal: '100u', unit: 'F', description: 'Standard power supply output ripple filter capacitor', spiceSupported: true, pinCount: 2, iconName: 'Zap' },
  { type: 'capacitor', category: 'basic', name: 'Electrolytic Cap 220µF', defaultVal: '220u', unit: 'F', description: 'Bulk storage for servo and motor driver spikes', spiceSupported: true, pinCount: 2, iconName: 'Zap' },
  { type: 'capacitor', category: 'basic', name: 'Electrolytic Cap 470µF', defaultVal: '470u', unit: 'F', description: 'Heavy current reservoir capacitor for audio power amps', spiceSupported: true, pinCount: 2, iconName: 'Zap' },
  { type: 'capacitor', category: 'basic', name: 'Electrolytic Cap 1000µF', defaultVal: '1000u', unit: 'F', description: 'High-capacity 1000µF smoothing capacitor for 5V/12V rails', spiceSupported: true, pinCount: 2, iconName: 'Zap' },
  { type: 'capacitor', category: 'basic', name: 'Electrolytic Cap 2200µF', defaultVal: '2200u', unit: 'F', description: 'Rectifier filter capacitor for linear transformers', spiceSupported: true, pinCount: 2, iconName: 'Zap' },
  { type: 'capacitor', category: 'basic', name: 'Supercapacitor 1F 5.5V', defaultVal: '1.0', unit: 'F', description: 'Coin cell supercapacitor for RTC backup power', spiceSupported: true, pinCount: 2, iconName: 'Zap' },

  // ==========================================
  // 4. POTENTIOMETERS & VARIABLE PASSIVES (7 items)
  // ==========================================
  { type: 'potentiometer', category: 'basic', name: 'Trim Pot 1kΩ', defaultVal: '1k', unit: 'Ω', description: 'Precision multi-turn 3-pin cermet trimming potentiometer', spiceSupported: true, pinCount: 3, iconName: 'Sliders' },
  { type: 'potentiometer', category: 'basic', name: 'Potentiometer 10kΩ', defaultVal: '10k', unit: 'Ω', description: 'Standard rotary panel potentiometer with center wiper', spiceSupported: true, pinCount: 3, iconName: 'Sliders' },
  { type: 'potentiometer', category: 'basic', name: 'Potentiometer 50kΩ', defaultVal: '50k', unit: 'Ω', description: 'Audio volume control rotary potentiometer', spiceSupported: true, pinCount: 3, iconName: 'Sliders' },
  { type: 'potentiometer', category: 'basic', name: 'Potentiometer 100kΩ', defaultVal: '100k', unit: 'Ω', description: 'Wide range threshold tuning potentiometer', spiceSupported: true, pinCount: 3, iconName: 'Sliders' },
  { type: 'ldr', category: 'sensors', name: 'Photoresistor (LDR GL5528)', defaultVal: '10k-1M', unit: 'Ω', description: 'Light dependent resistor; resistance drops from 1MΩ in dark to 1kΩ in bright light', spiceSupported: true, pinCount: 2, iconName: 'Sun' },
  { type: 'thermistor', category: 'sensors', name: 'NTC Thermistor 10k', defaultVal: '10k', unit: 'Ω', description: 'Negative temperature coefficient resistor B=3950K', spiceSupported: true, pinCount: 2, iconName: 'Activity' },
  { type: 'inductor', category: 'basic', name: 'Power Inductor 100µH', defaultVal: '100u', unit: 'H', description: 'Toroidal wirewound power inductor for buck/boost switching circuits', spiceSupported: true, pinCount: 2, iconName: 'Zap' },

  // ==========================================
  // 5. DIODES & RECTIFIERS (10 items)
  // ==========================================
  { type: 'diode', category: 'basic', name: '1N4148 Fast Switching Diode', defaultVal: '1N4148', unit: '', description: 'Small-signal high speed switching diode (4ns recovery, 100V, 300mA)', spiceSupported: true, pinCount: 2, iconName: 'ArrowRight' },
  { type: 'diode', category: 'basic', name: '1N4001 Power Rectifier (50V 1A)', defaultVal: '1N4001', unit: '', description: 'Standard silicon rectifier diode for AC/DC conversion', spiceSupported: true, pinCount: 2, iconName: 'ArrowRight' },
  { type: 'diode', category: 'basic', name: '1N4007 High Voltage Diode (1000V 1A)', defaultVal: '1N4007', unit: '', description: 'General purpose 1000V reverse breakdown rectifier diode', spiceSupported: true, pinCount: 2, iconName: 'ArrowRight' },
  { type: 'diode', category: 'basic', name: '1N5819 Schottky Diode (40V 1A)', defaultVal: '1N5819', unit: '', description: 'Low forward voltage drop diode (~0.3V) for high efficiency polarity protection', spiceSupported: true, pinCount: 2, iconName: 'ArrowRight' },
  { type: 'diode', category: 'basic', name: '1N5822 Schottky Diode (40V 3A)', defaultVal: '1N5822', unit: '', description: 'Heavy duty 3A low drop Schottky rectifier for solar & switching regulators', spiceSupported: true, pinCount: 2, iconName: 'ArrowRight' },
  { type: 'zener', category: 'basic', name: 'Zener Diode 3.3V (1N4728A)', defaultVal: '3.3V', unit: 'V', description: '3.3V precision reverse breakdown voltage reference shunt diode', spiceSupported: true, pinCount: 2, iconName: 'ArrowRight' },
  { type: 'zener', category: 'basic', name: 'Zener Diode 5.1V (1N4733A)', defaultVal: '5.1V', unit: 'V', description: '5.1V clamping diode for overvoltage protection on ADC lines', spiceSupported: true, pinCount: 2, iconName: 'ArrowRight' },
  { type: 'zener', category: 'basic', name: 'Zener Diode 12V (1N4742A)', defaultVal: '12V', unit: 'V', description: '12V voltage clamp and regulation diode', spiceSupported: true, pinCount: 2, iconName: 'ArrowRight' },
  { type: 'diode', category: 'basic', name: 'Flyback Suppression Diode', defaultVal: 'FR107', unit: '', description: 'Fast recovery diode placed antiparallel across inductive relay coils and DC motors', spiceSupported: true, pinCount: 2, iconName: 'ArrowRight' },
  { type: 'bridge_rectifier', category: 'power', name: 'Bridge Rectifier 2A (DB107)', defaultVal: '1000V 2A', unit: '', description: 'Full-wave 4-pin bridge rectifier for converting AC transformer secondary to DC', spiceSupported: true, pinCount: 4, iconName: 'Zap' },

  // ==========================================
  // 6. LEDS & OPTICAL OUTPUTS (16 items)
  // ==========================================
  { type: 'led', category: 'output', name: 'Standard Red LED (5mm)', defaultVal: '1.8V / 20mA', unit: '', description: 'V_f = 1.8V, peak wavelength 630nm, high brightness diffused lens', spiceSupported: true, pinCount: 2, iconName: 'Sun' },
  { type: 'led_green', category: 'output', name: 'Standard Green LED (5mm)', defaultVal: '2.1V / 20mA', unit: '', description: 'V_f = 2.1V, peak wavelength 525nm pure green', spiceSupported: true, pinCount: 2, iconName: 'Sun' },
  { type: 'led_blue', category: 'output', name: 'Standard Blue LED (5mm)', defaultVal: '3.0V / 20mA', unit: '', description: 'V_f = 3.0V InGaN high-intensity blue light emitter', spiceSupported: true, pinCount: 2, iconName: 'Sun' },
  { type: 'led_yellow', category: 'output', name: 'Standard Yellow LED (5mm)', defaultVal: '2.0V / 20mA', unit: '', description: 'V_f = 2.0V diffused amber-yellow indicator diode', spiceSupported: true, pinCount: 2, iconName: 'Sun' },
  { type: 'led_white', category: 'output', name: 'Standard White LED (5mm)', defaultVal: '3.2V / 20mA', unit: '', description: 'V_f = 3.2V ultra-bright cool white (6000K) phosphor LED', spiceSupported: true, pinCount: 2, iconName: 'Sun' },
  { type: 'led_orange', category: 'output', name: 'Standard Orange LED (5mm)', defaultVal: '1.9V / 20mA', unit: '', description: 'V_f = 1.9V Maker orange indicator LED', spiceSupported: true, pinCount: 2, iconName: 'Sun' },
  { type: 'led_rgb_ca', category: 'output', name: 'RGB LED (Common Anode)', defaultVal: '4-pin RGB', unit: '', description: 'Tri-color 5mm LED with shared positive VCC terminal and separate R, G, B cathode pins', spiceSupported: true, pinCount: 4, iconName: 'Sun' },
  { type: 'led_rgb_cc', category: 'output', name: 'RGB LED (Common Cathode)', defaultVal: '4-pin RGB', unit: '', description: 'Tri-color 5mm LED with shared GND pin and individual R, G, B control anodes', spiceSupported: true, pinCount: 4, iconName: 'Sun' },
  { type: 'neopixel_ws2812b', category: 'output', name: 'WS2812B Addressable NeoPixel', defaultVal: '5V Single-Wire', unit: '', description: 'Intelligent digital RGB LED with integrated constant-current driver chip and cascade data out', spiceSupported: true, pinCount: 4, iconName: 'Sun' },
  { type: 'seven_segment', category: 'output', name: '7-Segment Display (1-Digit)', defaultVal: 'Common Cathode', unit: '', description: 'Numeric LED display with segments A-G and decimal point DP (10-pin package)', spiceSupported: true, pinCount: 10, iconName: 'Sliders' },
  { type: 'seven_segment_4digit', category: 'output', name: '7-Segment Display (4-Digit Multiplexed)', defaultVal: 'Common Cathode', unit: '', description: '4-digit clock display with multiplexed segment lines and 4 digit select pins', spiceSupported: true, pinCount: 12, iconName: 'Sliders' },
  { type: 'led_bar_graph', category: 'output', name: '10-Segment LED Bar Graph', defaultVal: '10 LEDs Array', unit: '', description: 'Linear 10-LED array display for audio VU meters and battery charge indicators', spiceSupported: true, pinCount: 20, iconName: 'Activity' },
  { type: 'ir_emitter', category: 'output', name: 'Infrared LED Emitter (940nm)', defaultVal: '1.3V / 50mA', unit: '', description: 'High-power 940nm IR diode for TV remote control transmitters and optical barriers', spiceSupported: true, pinCount: 2, iconName: 'Sun' },
  { type: 'laser_diode', category: 'output', name: '650nm Red Laser Diode Module', defaultVal: '5V 5mW', unit: '', description: 'Red dot laser pointer module with integrated current limiting resistor and focus lens', spiceSupported: true, pinCount: 3, iconName: 'Sun' },
  { type: 'uv_led', category: 'output', name: 'Ultraviolet UV LED (395nm)', defaultVal: '3.4V / 20mA', unit: '', description: 'Blacklight 395nm UV emitter for fluorescence detection and resin curing', spiceSupported: true, pinCount: 2, iconName: 'Sun' },
  { type: 'optocoupler_4n35', category: 'ics', name: '4N35 Optoisolator', defaultVal: 'Galvanic 3550V', unit: '', description: 'Optocoupler with GaAs infrared LED optically coupled to a phototransistor (6-pin DIP)', spiceSupported: true, pinCount: 6, iconName: 'Zap' },

  // ==========================================
  // 7. TRANSISTORS & MOSFETS & POWER SWITCHES (16 items)
  // ==========================================
  { type: 'bjt_npn_2n2222', category: 'basic', name: '2N2222A NPN Transistor', defaultVal: '40V 800mA', unit: '', description: 'Classic general purpose high-speed NPN switching and amplifier transistor in TO-92 package', spiceSupported: true, pinCount: 3, iconName: 'Zap' },
  { type: 'bjt_npn_bc547', category: 'basic', name: 'BC547 NPN Transistor', defaultVal: '45V 100mA', unit: '', description: 'Low-noise audio pre-amp and digital logic inverter NPN transistor (TO-92)', spiceSupported: true, pinCount: 3, iconName: 'Zap' },
  { type: 'bjt_pnp_2n3906', category: 'basic', name: '2N3906 PNP Transistor', defaultVal: '-40V 200mA', unit: '', description: 'Complementary PNP small-signal transistor for high-side switching and H-bridges', spiceSupported: true, pinCount: 3, iconName: 'Zap' },
  { type: 'bjt_pnp_bc557', category: 'basic', name: 'BC557 PNP Transistor', defaultVal: '-45V 100mA', unit: '', description: 'General purpose European pinout PNP transistor', spiceSupported: true, pinCount: 3, iconName: 'Zap' },
  { type: 'darlington_tip120', category: 'basic', name: 'TIP120 NPN Darlington Power Transistor', defaultVal: '60V 5A', unit: '', description: 'High gain (h_FE > 1000) Darlington pair capable of driving 5A motors, solenoids, and valves', spiceSupported: true, pinCount: 3, iconName: 'Zap' },
  { type: 'darlington_tip127', category: 'basic', name: 'TIP127 PNP Darlington Power Transistor', defaultVal: '-60V 5A', unit: '', description: 'High-side 5A complementary power Darlington transistor (TO-220)', spiceSupported: true, pinCount: 3, iconName: 'Zap' },
  { type: 'mosfet_n_2n7000', category: 'basic', name: '2N7000 N-Channel Small Signal MOSFET', defaultVal: '60V 200mA', unit: '', description: 'Logic-level N-channel enhancement mode field effect transistor (TO-92)', spiceSupported: true, pinCount: 3, iconName: 'Zap' },
  { type: 'mosfet_n_irlz44n', category: 'basic', name: 'IRLZ44N Logic-Level Power MOSFET', defaultVal: '55V 47A', unit: '', description: 'Ultra-low R_DS(on) (0.022Ω) MOSFET fully saturated with 3.3V or 5V MCU logic signals', spiceSupported: true, pinCount: 3, iconName: 'Zap' },
  { type: 'mosfet_n_irf540n', category: 'basic', name: 'IRF540N N-Channel Power MOSFET', defaultVal: '100V 33A', unit: '', description: 'High voltage switching power MOSFET for 12V-48V motor PWM controllers (TO-220)', spiceSupported: true, pinCount: 3, iconName: 'Zap' },
  { type: 'mosfet_p_irf9540n', category: 'basic', name: 'IRF9540N P-Channel Power MOSFET', defaultVal: '-100V 23A', unit: '', description: 'P-channel high-side power switch with low ON-resistance', spiceSupported: true, pinCount: 3, iconName: 'Zap' },
  { type: 'mosfet_p_bs250', category: 'basic', name: 'BS250 P-Channel Small Signal MOSFET', defaultVal: '-45V 180mA', unit: '', description: 'Small-signal P-MOSFET for reverse polarity cut-off switches', spiceSupported: true, pinCount: 3, iconName: 'Zap' },
  { type: 'scr_c106d', category: 'basic', name: 'C106D Silicon Controlled Rectifier (SCR)', defaultVal: '400V 4A', unit: '', description: 'Thyristor latching switch triggered by gate current for crowbar overvoltage protection', spiceSupported: true, pinCount: 3, iconName: 'Zap' },
  { type: 'triac_bt136', category: 'basic', name: 'BT136-600E Sensitive Gate TRIAC', defaultVal: '600V 4A', unit: '', description: 'Bidirectional AC mains switch for solid state lamp dimmers and AC fan speed regulators', spiceSupported: true, pinCount: 3, iconName: 'Zap' },
  { type: 'uln2003_darlington', category: 'ics', name: 'ULN2003A 7-Channel Darlington Array', defaultVal: '50V 500mA', unit: '', description: '16-pin IC with 7 open-collector Darlington pairs and internal flyback clamp diodes for stepper motors', spiceSupported: true, pinCount: 16, iconName: 'Cpu' },
  { type: 'l293d_motor_driver', category: 'ics', name: 'L293D Dual H-Bridge Motor Driver', defaultVal: '36V 600mA', unit: '', description: 'Dual full-bridge driver IC with internal diodes to drive 2 DC motors bidirectional or 1 4-wire stepper', spiceSupported: true, pinCount: 16, iconName: 'Cpu' },
  { type: 'tb6612fng_module', category: 'modules', name: 'TB6612FNG Dual Motor Driver Carrier', defaultVal: '15V 1.2A', unit: '', description: 'High-efficiency MOSFET H-bridge driver with standby mode and minimal voltage drop', spiceSupported: true, pinCount: 16, iconName: 'Cpu' },

  // ==========================================
  // 8. POWER SUPPLIES & BATTERIES & VOLTAGE REGULATORS (16 items)
  // ==========================================
  { type: 'dc_source_5v', category: 'power', name: 'Regulated DC 5V Power Supply', defaultVal: '5.0', unit: 'V', description: 'Clean laboratory regulated 5.0V DC bench power source', spiceSupported: true, pinCount: 2, iconName: 'BatteryCharging' },
  { type: 'dc_source_3v3', category: 'power', name: 'Regulated DC 3.3V Power Supply', defaultVal: '3.3', unit: 'V', description: 'Clean laboratory regulated 3.3V DC logic power rail', spiceSupported: true, pinCount: 2, iconName: 'BatteryCharging' },
  { type: 'dc_source_12v', category: 'power', name: '12V DC Adapter / Power Supply', defaultVal: '12.0', unit: 'V', description: '12V DC power brick for motors, relays, and LED strips', spiceSupported: true, pinCount: 2, iconName: 'BatteryCharging' },
  { type: 'battery_9v', category: 'power', name: '9V Alkaline Battery (PP3)', defaultVal: '9.0', unit: 'V', description: 'Standard 9-volt alkaline battery block with snap connector', spiceSupported: true, pinCount: 2, iconName: 'Battery' },
  { type: 'battery_aa_single', category: 'power', name: '1x AA 1.5V Alkaline Cell', defaultVal: '1.5', unit: 'V', description: 'Single 1.5V AA cylindrical electrochemical cell', spiceSupported: true, pinCount: 2, iconName: 'Battery' },
  { type: 'battery_aa_dual', category: 'power', name: '2x AA Battery Pack (3.0V)', defaultVal: '3.0', unit: 'V', description: '2x AA batteries in series producing 3.0V nominal', spiceSupported: true, pinCount: 2, iconName: 'Battery' },
  { type: 'battery_aa_quad', category: 'power', name: '4x AA Battery Pack (6.0V)', defaultVal: '6.0', unit: 'V', description: '4x AA battery holder with lead wires supplying 6V for servo motors', spiceSupported: true, pinCount: 2, iconName: 'Battery' },
  { type: 'battery_18650', category: 'power', name: '18650 Li-ion Cell (3.7V 2600mAh)', defaultVal: '3.7', unit: 'V', description: 'Rechargeable 3.7V Lithium-Ion cell (charges to 4.2V)', spiceSupported: true, pinCount: 2, iconName: 'Battery' },
  { type: 'battery_lipo_2s', category: 'power', name: '2S LiPo Battery Pack (7.4V)', defaultVal: '7.4', unit: 'V', description: '2-cell Lithium Polymer battery pack with JST-XH balance lead and XT30', spiceSupported: true, pinCount: 2, iconName: 'Battery' },
  { type: 'battery_coin_cr2032', category: 'power', name: 'CR2032 3V Lithium Coin Cell', defaultVal: '3.0', unit: 'V', description: 'Compact 3V 220mAh coin battery for Real-Time Clocks and low power beacons', spiceSupported: true, pinCount: 2, iconName: 'Battery' },
  { type: 'ground', category: 'power', name: 'Earth Ground / Common Net 0', defaultVal: '0', unit: 'V', description: '0V Reference Ground net required for SPICE nodal potential matrix', spiceSupported: true, pinCount: 1, iconName: 'Anchor' },
  { type: 'regulator_lm7805', category: 'power', name: 'LM7805 Linear Regulator (+5V 1.5A)', defaultVal: '5.0V Out', unit: 'V', description: 'Standard 3-pin TO-220 positive linear voltage regulator (Input: 7V-25V)', spiceSupported: true, pinCount: 3, iconName: 'BatteryCharging' },
  { type: 'regulator_lm7812', category: 'power', name: 'LM7812 Linear Regulator (+12V 1.5A)', defaultVal: '12.0V Out', unit: 'V', description: '12V positive voltage regulator for analog circuits', spiceSupported: true, pinCount: 3, iconName: 'BatteryCharging' },
  { type: 'regulator_lm317', category: 'power', name: 'LM317 Adjustable Regulator (1.2V-37V)', defaultVal: 'Adj Out', unit: 'V', description: 'Variable output positive regulator programmed by two external resistors', spiceSupported: true, pinCount: 3, iconName: 'BatteryCharging' },
  { type: 'regulator_ams1117_3v3', category: 'power', name: 'AMS1117-3.3 Low Dropout Regulator', defaultVal: '3.3V Out', unit: 'V', description: 'Popular 3.3V 800mA low dropout regulator (LDO) with internal thermal overload protection', spiceSupported: true, pinCount: 3, iconName: 'BatteryCharging' },
  { type: 'module_lm2596_buck', category: 'power', name: 'LM2596 DC-DC Buck Step-Down Converter', defaultVal: 'Adj 1.25V-35V', unit: 'V', description: 'High-efficiency switching step-down converter board with multiturn potentiometer', spiceSupported: true, pinCount: 4, iconName: 'BatteryCharging' },

  // ==========================================
  // 9. SWITCHES, BUTTONS & RELAYS (12 items)
  // ==========================================
  { type: 'pushbutton', category: 'basic', name: 'Tactile Momentary Pushbutton', defaultVal: 'open', unit: '', description: 'Standard 6x6mm momentary SPST tactile button with clean snap action', spiceSupported: true, pinCount: 2, iconName: 'CircleDot' },
  { type: 'spst_switch', category: 'basic', name: 'SPST Slide Switch', defaultVal: 'open', unit: '', description: 'Single-pole single-throw latching miniature slide switch for power on/off', spiceSupported: true, pinCount: 2, iconName: 'CircleDot' },
  { type: 'spdt_toggle', category: 'basic', name: 'SPDT Miniature Toggle Switch', defaultVal: 'pos1', unit: '', description: 'Single-pole double-throw 3-terminal toggle switch for A/B path routing', spiceSupported: true, pinCount: 3, iconName: 'CircleDot' },
  { type: 'dpdt_rocker', category: 'basic', name: 'DPDT Rocker Switch', defaultVal: 'center', unit: '', description: 'Double-pole double-throw 6-pin switch for motor forward/reverse polarity reversal', spiceSupported: true, pinCount: 6, iconName: 'CircleDot' },
  { type: 'dip_switch_4', category: 'basic', name: '4-Position DIP Switch', defaultVal: '0000', unit: '', description: '4-way slide configuration DIP switch package for hardware addressing', spiceSupported: true, pinCount: 8, iconName: 'Sliders' },
  { type: 'dip_switch_8', category: 'basic', name: '8-Position DIP Switch', defaultVal: '00000000', unit: '', description: '8-position DIP switch module for 8-bit bus configuration', spiceSupported: true, pinCount: 16, iconName: 'Sliders' },
  { type: 'reed_switch', category: 'sensors', name: 'Magnetic Reed Switch (Normally Open)', defaultVal: 'open', unit: '', description: 'Glass encapsulated magnetic proximity switch activated by nearby permanent magnet', spiceSupported: true, pinCount: 2, iconName: 'CircleDot' },
  { type: 'limit_switch', category: 'electromechanical', name: 'Microswitch / Endstop with Lever', defaultVal: 'NO/NC', unit: '', description: '3-pin industrial snap-action limit switch with roller lever for 3D printer axis zeroing', spiceSupported: true, pinCount: 3, iconName: 'CircleDot' },
  { type: 'relay_5v_spdt', category: 'electromechanical', name: '5V Electromagnetic Relay (SRD-05VDC-SL-C)', defaultVal: '250VAC 10A', unit: '', description: '5-pin SPDT mechanical relay with 5V coil and isolated Common, NO, NC high-power contacts', spiceSupported: true, pinCount: 5, iconName: 'Zap' },
  { type: 'relay_12v_spdt', category: 'electromechanical', name: '12V Automotive Relay', defaultVal: '14VDC 30A', unit: '', description: 'High current automotive cube relay for heavy DC motors, pumps, and heaters', spiceSupported: true, pinCount: 5, iconName: 'Zap' },
  { type: 'ssr_solid_state_relay', category: 'electromechanical', name: 'Solid State Relay SSR-25DA', defaultVal: '24-380VAC 25A', unit: '', description: 'Optically isolated zero-cross AC solid-state relay triggered by 3-32V DC logic without moving parts', spiceSupported: true, pinCount: 4, iconName: 'Zap' },
  { type: 'mercury_tilt_switch', category: 'sensors', name: 'Tilt Ball Switch Sensor', defaultVal: 'open', unit: '', description: 'Conductive rolling metal ball in tube that closes contact when tilted beyond angle', spiceSupported: true, pinCount: 2, iconName: 'CircleDot' },

  // ==========================================
  // 10. MOTORS, ACTUATORS & BUZZERS (14 items)
  // ==========================================
  { type: 'servo_sg90', category: 'electromechanical', name: 'Micro Servo Motor SG90 (9g)', defaultVal: '4.8V-6.0V PWM', unit: '', description: '180-degree position control servo motor with 3-wire interface: Signal (PWM), VCC (5V), GND', spiceSupported: true, pinCount: 3, iconName: 'Activity' },
  { type: 'servo_mg996r', category: 'electromechanical', name: 'Metal Gear High-Torque Servo MG996R', defaultVal: '10kg-cm @ 6V', unit: '', description: 'High torque metal geared continuous or 180° servo for heavy robotics and steering', spiceSupported: true, pinCount: 3, iconName: 'Activity' },
  { type: 'dc_motor_toy', category: 'electromechanical', name: 'Hobby DC Toy Motor (130-size)', defaultVal: '3V-6V DC', unit: '', description: 'Small brushed permanent magnet DC electric motor spinning at ~10,000 RPM', spiceSupported: true, pinCount: 2, iconName: 'Activity' },
  { type: 'dc_motor_gear_tt', category: 'electromechanical', name: 'TT Gear Motor (1:48 Yellow)', defaultVal: '3V-6V Bi-directional', unit: '', description: 'Geared DC motor popular for 2WD / 4WD smart robot car chassis with dual output shafts', spiceSupported: true, pinCount: 2, iconName: 'Activity' },
  { type: 'stepper_28byj48', category: 'electromechanical', name: 'Stepper Motor 28BYJ-48 (5V Unipolar)', defaultVal: '5V 64:1 Gear', unit: '', description: '5-wire 4-phase unipolar stepper motor with internal reduction gearbox (pair with ULN2003)', spiceSupported: true, pinCount: 5, iconName: 'Activity' },
  { type: 'stepper_nema17', category: 'electromechanical', name: 'NEMA 17 Bipolar Stepper Motor', defaultVal: '1.8° 1.5A/Phase', unit: '', description: 'Industry standard 4-wire bipolar hybrid stepper motor for 3D printers, CNC routers, and sliders', spiceSupported: true, pinCount: 4, iconName: 'Activity' },
  { type: 'solenoid_5v', category: 'electromechanical', name: 'Mini Push-Pull Solenoid (5V)', defaultVal: '5V 1A Coil', unit: '', description: 'Electromagnetic linear actuator with spring return plunger for door locks and latches', spiceSupported: true, pinCount: 2, iconName: 'Zap' },
  { type: 'piezo_buzzer_active', category: 'output', name: 'Active Buzzer 5V', defaultVal: '2.5kHz Tone', unit: '', description: 'Self-oscillating piezoelectric buzzer that generates a fixed audible beep when powered with 5V DC', spiceSupported: true, pinCount: 2, iconName: 'Zap' },
  { type: 'piezo_buzzer_passive', category: 'output', name: 'Passive Piezo Speaker Transducer', defaultVal: 'PWM Sound', unit: '', description: 'AC piezo element that produces musical frequencies and melodies when driven with PWM square waves', spiceSupported: true, pinCount: 2, iconName: 'Zap' },
  { type: 'vibration_motor', category: 'electromechanical', name: 'Coin Vibration Motor (10mm 3V)', defaultVal: '3V 70mA', unit: '', description: 'Eccentric rotating mass (ERM) pancake motor for haptic tactile feedback in wearables', spiceSupported: true, pinCount: 2, iconName: 'Activity' },
  { type: 'speaker_8ohm', category: 'output', name: 'Miniature Dynamic Speaker 8Ω 0.5W', defaultVal: '8Ω 0.5W', unit: '', description: 'Moving coil permanent magnet speaker for voice prompts and retro chime sounds', spiceSupported: true, pinCount: 2, iconName: 'Activity' },
  { type: 'linear_actuator_micro', category: 'electromechanical', name: 'Micro Linear Actuator (12V 50mm)', defaultVal: '12V DC Gear', unit: '', description: 'Lead-screw motorized linear piston with built-in endstop limit switches', spiceSupported: true, pinCount: 2, iconName: 'Activity' },
  { type: 'brushless_esc_motor', category: 'electromechanical', name: 'BLDC Drone Motor + ESC (3-Phase)', defaultVal: '1000KV + 30A ESC', unit: '', description: 'Outrunner brushless 3-phase motor driven via standard electronic speed controller (ESC)', spiceSupported: true, pinCount: 3, iconName: 'Activity' },
  { type: 'electromagnet_5v', category: 'electromechanical', name: 'Holding Electromagnet (5V 2.5kg)', defaultVal: '5V 0.33A', unit: '', description: 'Strong magnetic holding suction cup powered by DC solenoid coil', spiceSupported: true, pinCount: 2, iconName: 'Zap' },

  // ==========================================
  // 11. SENSORS (Environmental, Motion, Optical, Touch) (30 items)
  // ==========================================
  { type: 'sensor_dht11', category: 'sensors', name: 'DHT11 Temperature & Humidity Sensor', defaultVal: 'Single-Bus Digital', unit: '', description: 'Basic digital temperature (0-50°C ±2°C) and relative humidity (20-90% ±5%) sensor', spiceSupported: true, pinCount: 3, iconName: 'Activity' },
  { type: 'sensor_dht22', category: 'sensors', name: 'DHT22 / AM2302 High-Precision Temp/Humidity', defaultVal: '-40 to 80°C ±0.5°C', unit: '', description: 'Calibrated digital sensor reading -40 to 80°C and 0-100% RH with 0.1 resolution', spiceSupported: true, pinCount: 3, iconName: 'Activity' },
  { type: 'sensor_bme280', category: 'sensors', name: 'BME280 Pressure, Humidity & Temp (I2C/SPI)', defaultVal: 'I2C 0x76/0x77', unit: '', description: 'Bosch Sensortec high precision barometric pressure altimeter, temperature, and humidity module', spiceSupported: true, pinCount: 4, iconName: 'Activity' },
  { type: 'sensor_bmp180', category: 'sensors', name: 'BMP180 Digital Barometric Pressure Sensor', defaultVal: 'I2C 0x77', unit: '', description: 'Precision atmospheric pressure sensor for weather monitoring and altitude calculation', spiceSupported: true, pinCount: 4, iconName: 'Activity' },
  { type: 'sensor_ds18b20', category: 'sensors', name: 'DS18B20 1-Wire Waterproof Temp Probe', defaultVal: '1-Wire Dallas', unit: '', description: '9 to 12-bit Celsius digital thermometer on a shared single-wire multidrop bus with unique 64-bit ROM ID', spiceSupported: true, pinCount: 3, iconName: 'Activity' },
  { type: 'sensor_hcsr04', category: 'sensors', name: 'HC-SR04 Ultrasonic Distance Sensor', defaultVal: 'Trigger & Echo 2-400cm', unit: '', description: 'Dual ultrasonic transducer module measuring distance by emitting 40kHz ultrasound bursts (VCC, Trig, Echo, GND)', spiceSupported: true, pinCount: 4, iconName: 'Activity' },
  { type: 'sensor_pir_hc_sr501', category: 'sensors', name: 'PIR Motion Sensor (HC-SR501)', defaultVal: 'Digital Output 3.3V', unit: '', description: 'Passive infrared sensor with Fresnel lens detecting moving human thermal radiation (3-7m range)', spiceSupported: true, pinCount: 3, iconName: 'Activity' },
  { type: 'sensor_rcwl0516', category: 'sensors', name: 'RCWL-0516 Microwave Radar Motion Detector', defaultVal: '3GHz Doppler Radar', unit: '', description: 'Doppler radar sensor detecting movement through walls, acrylic, and glass up to 7 meters', spiceSupported: true, pinCount: 3, iconName: 'Activity' },
  { type: 'sensor_mpu6050', category: 'sensors', name: 'MPU-6050 6-Axis Gyroscope & Accelerometer', defaultVal: 'I2C 0x68 DMP', unit: '', description: 'Triple-axis MEMS accelerometer (±16g) and angular rate gyroscope (±2000°/s) with onboard Digital Motion Processor', spiceSupported: true, pinCount: 4, iconName: 'Activity' },
  { type: 'sensor_adxl345', category: 'sensors', name: 'ADXL345 3-Axis Digital Accelerometer', defaultVal: 'I2C/SPI ±16g', unit: '', description: 'Ultra-low power 13-bit accelerometer with free-fall and tap detection interrupts', spiceSupported: true, pinCount: 4, iconName: 'Activity' },
  { type: 'sensor_vl53l0x', category: 'sensors', name: 'VL53L0X Time-of-Flight (ToF) Laser Distance', defaultVal: 'I2C 940nm VCSEL', unit: '', description: 'Laser ranging module measuring time of flight up to 2 meters with millimeter accuracy independent of target color', spiceSupported: true, pinCount: 4, iconName: 'Activity' },
  { type: 'sensor_tcs34725', category: 'sensors', name: 'TCS34725 RGB Color Light Sensor', defaultVal: 'I2C with White LED', unit: '', description: 'Color light-to-digital converter with IR blocking filter for accurate chromaticity and lux calculations', spiceSupported: true, pinCount: 4, iconName: 'Activity' },
  { type: 'sensor_bh1750', category: 'sensors', name: 'BH1750 Digital Ambient Light Intensity (Lux)', defaultVal: 'I2C 1-65535 lx', unit: '', description: 'Calibrated ambient illuminance sensor matching human eye spectral sensitivity response', spiceSupported: true, pinCount: 4, iconName: 'Activity' },
  { type: 'sensor_mq2', category: 'sensors', name: 'MQ-2 Gas Sensor (Smoke / LPG / Propane)', defaultVal: 'Analog + Digital Comp', unit: '', description: 'Tin dioxide semiconductor gas sensor sensitive to combustible gas, methane, smoke, and alcohol', spiceSupported: true, pinCount: 4, iconName: 'Activity' },
  { type: 'sensor_mq135', category: 'sensors', name: 'MQ-135 Air Quality & Hazardous Gas Sensor', defaultVal: 'Air Quality (CO2/NH3)', unit: '', description: 'Air pollution monitor sensitive to ammonia, benzene, smoke, and carbon dioxide', spiceSupported: true, pinCount: 4, iconName: 'Activity' },
  { type: 'sensor_soil_moisture', category: 'sensors', name: 'Capacitive Soil Moisture Sensor v1.2', defaultVal: 'Analog Voltage 1.2V-3.0V', unit: '', description: 'Corrosion-resistant capacitive moisture sensor immune to electrolysis oxidation in plant soil', spiceSupported: true, pinCount: 3, iconName: 'Activity' },
  { type: 'sensor_water_level', category: 'sensors', name: 'Raindrops & Water Level Contact Sensor', defaultVal: 'Analog Conductive Grid', unit: '', description: 'Parallel trace circuit board measuring water droplet coverage via conductivity bridge', spiceSupported: true, pinCount: 3, iconName: 'Activity' },
  { type: 'sensor_flame_ir', category: 'sensors', name: 'Flame Sensor (760nm-1100nm IR)', defaultVal: 'Analog + Digital Trig', unit: '', description: 'Infrared receiver phototransistor tuned to open hydrocarbon fire flicker wavelengths', spiceSupported: true, pinCount: 4, iconName: 'Activity' },
  { type: 'sensor_sound_mic', category: 'sensors', name: 'Electret Microphone Sound Detector Module', defaultVal: 'LM393 Comparator + AO', unit: '', description: 'Audio sensor with electret capsule, analog output, and digital threshold potentiometer comparator', spiceSupported: true, pinCount: 4, iconName: 'Activity' },
  { type: 'sensor_touch_ttp223', category: 'sensors', name: 'TTP223 Capacitive Touch Switch Sensor', defaultVal: 'Digital High/Low Output', unit: '', description: 'Capacitive touch detector pad triggered through plastic, glass, or paper overlay', spiceSupported: true, pinCount: 3, iconName: 'CircleDot' },
  { type: 'sensor_rotary_encoder', category: 'sensors', name: 'KY-040 Incremental Rotary Encoder', defaultVal: 'Quadrature CLK/DT + SW', unit: '', description: '360° continuous rotary encoder with push button switch for menu scrolling and dial tuning', spiceSupported: true, pinCount: 5, iconName: 'Sliders' },
  { type: 'sensor_joystick', category: 'sensors', name: 'Dual-Axis Analog Joystick Module (PS2)', defaultVal: '2x 10k Pot + Button', unit: '', description: 'Thumb joystick featuring dual analog axes (X, Y) and momentary push-down tact switch (VRx, VRy, SW)', spiceSupported: true, pinCount: 5, iconName: 'Sliders' },
  { type: 'sensor_hall_effect_49e', category: 'sensors', name: 'Linear Hall Effect Sensor (49E)', defaultVal: 'Analog Magnetic Field', unit: '', description: 'Magnetic flux sensor measuring North/South magnetic strength and polarity in millivolts', spiceSupported: true, pinCount: 3, iconName: 'Activity' },
  { type: 'sensor_hall_switch_3144', category: 'sensors', name: 'A3144 Hall Effect Digital Switch', defaultVal: 'Open-Collector Output', unit: '', description: 'Digital latching switch activated by South pole magnetic field; used for motor tachometer RPM counting', spiceSupported: true, pinCount: 3, iconName: 'Activity' },
  { type: 'sensor_tcrt5000', category: 'sensors', name: 'TCRT5000 Reflective Optical Infrared Sensor', defaultVal: 'Line Following IR', unit: '', description: 'Reflective optical phototransistor pair used for robot line tracking and optical edge detection', spiceSupported: true, pinCount: 4, iconName: 'Activity' },
  { type: 'sensor_load_cell_hx711', category: 'sensors', name: 'HX711 24-Bit ADC + Weight Load Cell', defaultVal: '24-bit Differential ADC', unit: '', description: 'Precision strain-gauge wheatstone bridge instrumentation amplifier for digital kitchen/shipping scales', spiceSupported: true, pinCount: 4, iconName: 'Activity' },
  { type: 'sensor_max6675_k_thermocouple', category: 'sensors', name: 'MAX6675 K-Type Thermocouple Converter', defaultVal: 'SPI 0 to 1024°C', unit: '', description: 'Cold-junction compensated 12-bit SPI thermocouple digitizer for 3D printer hotends and kilns', spiceSupported: true, pinCount: 5, iconName: 'Activity' },
  { type: 'sensor_ina219', category: 'sensors', name: 'INA219 I2C Current & Voltage Monitor', defaultVal: '0-26V 3.2A 12-bit', unit: '', description: 'Bidirectional high-side power monitor measuring bus voltage and shunt voltage across 0.1Ω resistor', spiceSupported: true, pinCount: 4, iconName: 'Activity' },
  { type: 'sensor_hck04_flow', category: 'sensors', name: 'YF-S201 Water Flow Meter Sensor', defaultVal: 'Pulse Output 1-30L/min', unit: '', description: 'Inline turbine rotor water pipe sensor with Hall effect pulse generator output (450 pulses/liter)', spiceSupported: true, pinCount: 3, iconName: 'Activity' },
  { type: 'sensor_heart_rate_max30102', category: 'sensors', name: 'MAX30102 Pulse Oximeter & Heart Rate', defaultVal: 'I2C Red + IR LED', unit: '', description: 'High sensitivity optical sensor for non-invasive SpO2 blood oxygen saturation and pulse detection', spiceSupported: true, pinCount: 4, iconName: 'Activity' },

  // ==========================================
  // 12. INTEGRATED CIRCUITS (LOGIC, TIMERS, OP-AMPS) (20 items)
  // ==========================================
  { type: 'ic_ne555_timer', category: 'ics', name: 'NE555 Precision Timer IC (8-pin DIP)', defaultVal: 'Astable/Monostable', unit: '', description: 'Legendary timer IC capable of generating precision clock pulses, PWM, and delayed triggers (8-pin)', spiceSupported: true, pinCount: 8, iconName: 'Cpu' },
  { type: 'ic_lm358_opamp', category: 'ics', name: 'LM358 Dual Operational Amplifier', defaultVal: 'Dual Op-Amp 3V-32V', unit: '', description: 'Dual low-power operational amplifier with single-supply capability and rail-to-rail ground sensing (8-pin DIP)', spiceSupported: true, pinCount: 8, iconName: 'Cpu' },
  { type: 'ic_lm324_opamp', category: 'ics', name: 'LM324 Quad Operational Amplifier', defaultVal: 'Quad Op-Amp', unit: '', description: 'Four independent, high-gain, internally frequency compensated operational amplifiers (14-pin DIP)', spiceSupported: true, pinCount: 14, iconName: 'Cpu' },
  { type: 'ic_lm393_comparator', category: 'ics', name: 'LM393 Dual Differential Comparator', defaultVal: 'Dual Open-Collector', unit: '', description: 'Dual voltage comparator designed to operate from single or dual power supplies with fast response time', spiceSupported: true, pinCount: 8, iconName: 'Cpu' },
  { type: 'ic_lm339_comparator', category: 'ics', name: 'LM339 Quad Voltage Comparator', defaultVal: 'Quad Open-Collector', unit: '', description: 'Four independent precision voltage comparators with low input offset voltage (14-pin DIP)', spiceSupported: true, pinCount: 14, iconName: 'Cpu' },
  { type: 'ic_sn74hc595_shift', category: 'ics', name: '74HC595 8-Bit Shift Register (3-wire to 8-pin)', defaultVal: 'Serial-In Parallel-Out', unit: '', description: '8-bit storage register and 3-state outputs; expands 3 microcontroller GPIOs into 8 digital output lines', spiceSupported: true, pinCount: 16, iconName: 'Cpu' },
  { type: 'ic_sn74hc165_shift', category: 'ics', name: '74HC165 8-Bit Parallel-In Shift Register', defaultVal: 'Parallel-In Serial-Out', unit: '', description: 'Reads 8 digital pushbuttons or switches into a microcontroller using only 3 SPI/clock lines', spiceSupported: true, pinCount: 16, iconName: 'Cpu' },
  { type: 'ic_cd4017_decade', category: 'ics', name: 'CD4017 Decade Counter / Divider', defaultVal: '10 Decoded Outputs', unit: '', description: '5-stage Johnson decade counter that turns on 1 of 10 output pins sequentially on each clock pulse', spiceSupported: true, pinCount: 16, iconName: 'Cpu' },
  { type: 'ic_74hc00_nand', category: 'ics', name: '74HC00 Quad 2-Input NAND Gate', defaultVal: 'Quad NAND', unit: '', description: 'Universal logic building block containing four independent 2-input CMOS NAND gates (14-pin DIP)', spiceSupported: true, pinCount: 14, iconName: 'Cpu' },
  { type: 'ic_74hc04_inverter', category: 'ics', name: '74HC04 Hex Inverter (NOT Gates)', defaultVal: '6x NOT Gates', unit: '', description: 'Six independent high-speed logic NOT inverters (14-pin DIP)', spiceSupported: true, pinCount: 14, iconName: 'Cpu' },
  { type: 'ic_74hc08_and', category: 'ics', name: '74HC08 Quad 2-Input AND Gate', defaultVal: 'Quad AND', unit: '', description: 'Four independent 2-input AND logic gates with standard CMOS thresholds (14-pin DIP)', spiceSupported: true, pinCount: 14, iconName: 'Cpu' },
  { type: 'ic_74hc32_or', category: 'ics', name: '74HC32 Quad 2-Input OR Gate', defaultVal: 'Quad OR', unit: '', description: 'Four independent 2-input positive OR logic gates (14-pin DIP)', spiceSupported: true, pinCount: 14, iconName: 'Cpu' },
  { type: 'ic_74hc86_xor', category: 'ics', name: '74HC86 Quad 2-Input XOR Gate', defaultVal: 'Quad XOR', unit: '', description: 'Four independent 2-input Exclusive-OR gates for half-adders and parity check circuits', spiceSupported: true, pinCount: 14, iconName: 'Cpu' },
  { type: 'ic_cd4051_multiplexer', category: 'ics', name: 'CD4051 8-Channel Analog Multiplexer / Demux', defaultVal: '8:1 Analog MUX', unit: '', description: 'Digitally controlled 8-channel analog switch allowing one MCU ADC pin to read 8 separate sensors', spiceSupported: true, pinCount: 16, iconName: 'Cpu' },
  { type: 'ic_pcf8574_io_expander', category: 'ics', name: 'PCF8574 Remote 8-Bit I2C I/O Expander', defaultVal: 'I2C 8-bit GPIO', unit: '', description: '8-bit quasi-bidirectional I/O port expander communicating over 2-wire I2C bus (16-pin DIP)', spiceSupported: true, pinCount: 16, iconName: 'Cpu' },
  { type: 'ic_mcp23017_io_expander', category: 'ics', name: 'MCP23017 16-Bit I2C I/O Expander', defaultVal: '16-bit I2C Port', unit: '', description: 'Adds 16 individual GPIO pins with configurable pull-up resistors and interrupt pins over I2C (28-pin DIP)', spiceSupported: true, pinCount: 28, iconName: 'Cpu' },
  { type: 'ic_mcp3008_adc', category: 'ics', name: 'MCP3008 8-Channel 10-Bit SPI ADC', defaultVal: '10-bit SPI ADC', unit: '', description: 'Analog-to-digital converter chip providing 8 analog input channels to Raspberry Pi via SPI bus', spiceSupported: true, pinCount: 16, iconName: 'Cpu' },
  { type: 'ic_mcp4725_dac', category: 'ics', name: 'MCP4725 12-Bit I2C Digital-to-Analog (DAC)', defaultVal: '12-bit DAC with EEPROM', unit: '', description: 'True analog output voltage generator with non-volatile internal EEPROM for storing calibration', spiceSupported: true, pinCount: 6, iconName: 'Cpu' },
  { type: 'ic_ds1307_rtc', category: 'ics', name: 'DS1307 Serial Real-Time Clock (RTC)', defaultVal: 'I2C RTC 56-byte NV RAM', unit: '', description: 'Low power binary-coded decimal clock/calendar with 56 bytes of battery-backed SRAM', spiceSupported: true, pinCount: 8, iconName: 'Cpu' },
  { type: 'ic_ds3231_rtc', category: 'ics', name: 'DS3231 Extremely Accurate I2C RTC Module', defaultVal: 'TCXO ±2ppm RTC', unit: '', description: 'Real-time clock with integrated temperature-compensated crystal oscillator (TCXO) and coin battery holder', spiceSupported: true, pinCount: 6, iconName: 'Cpu' },

  // ==========================================
  // 13. DISPLAYS, WIRELESS & COMM MODULES (18 items)
  // ==========================================
  { type: 'display_lcd1602_i2c', category: 'modules', name: 'LCD 1602 Alphanumeric Display (with I2C Backpack)', defaultVal: '16x2 Characters I2C', unit: '', description: 'HD44780 compatible 16-character by 2-line liquid crystal display with PCF8574 4-wire I2C interface', spiceSupported: true, pinCount: 4, iconName: 'Sliders' },
  { type: 'display_lcd2004_i2c', category: 'modules', name: 'LCD 2004 Alphanumeric Display (I2C)', defaultVal: '20x4 Characters I2C', unit: '', description: 'Large 4-line by 20-character backlit display for CNC and 3D printer status readout', spiceSupported: true, pinCount: 4, iconName: 'Sliders' },
  { type: 'display_oled_ssd1306', category: 'modules', name: 'OLED Display 0.96" 128x64 (I2C SSD1306)', defaultVal: 'I2C 0x3C 128x64', unit: '', description: 'High-contrast self-illuminating monochrome graphic OLED screen with wide 160° viewing angle (4-pin)', spiceSupported: true, pinCount: 4, iconName: 'Sliders' },
  { type: 'display_oled_sh1106', category: 'modules', name: 'OLED Display 1.3" 128x64 (SH1106 I2C)', defaultVal: '1.3-inch I2C OLED', unit: '', description: '1.3-inch diagonal high-contrast blue/white graphic OLED display', spiceSupported: true, pinCount: 4, iconName: 'Sliders' },
  { type: 'display_tft_st7789', category: 'modules', name: 'TFT IPS Display 1.14" 240x135 (ST7789 SPI)', defaultVal: 'SPI Full-Color IPS', unit: '', description: 'Vibrant 65K color IPS display panel driven via high-speed SPI bus (8-pin)', spiceSupported: true, pinCount: 8, iconName: 'Sliders' },
  { type: 'display_eink_29', category: 'modules', name: 'Waveshare 2.9" E-Paper Display (SPI)', defaultVal: 'SPI Ultra-Low Power', unit: '', description: 'Bistable electronic paper screen that retains image indefinitely without power consumption', spiceSupported: true, pinCount: 8, iconName: 'Sliders' },
  { type: 'module_max7219_matrix', category: 'modules', name: 'MAX7219 8x8 LED Dot Matrix Module', defaultVal: 'SPI 8x8 Red Matrix', unit: '', description: 'Serially driven 64-LED red dot matrix with cascadable 5-pin input/output headers', spiceSupported: true, pinCount: 5, iconName: 'Activity' },
  { type: 'module_nrf24l01', category: 'modules', name: 'nRF24L01+ 2.4GHz RF Transceiver', defaultVal: '2.4GHz GFSK 2Mbps', unit: '', description: 'Ultra-low power 2.4GHz wireless transceiver module with onboard PCB trace antenna (8-pin)', spiceSupported: true, pinCount: 8, iconName: 'Zap' },
  { type: 'module_hc05_bluetooth', category: 'modules', name: 'HC-05 Bluetooth Classic SPP Serial Module', defaultVal: 'UART 9600 Baud 3.3V/5V', unit: '', description: 'Transparent wireless serial UART bridge with master/slave mode selection and AT command interface', spiceSupported: true, pinCount: 6, iconName: 'Zap' },
  { type: 'module_hm10_ble', category: 'modules', name: 'HM-10 Bluetooth 4.0 BLE Module', defaultVal: 'BLE 4.0 CC2541', unit: '', description: 'Bluetooth Low Energy serial module compatible with iOS and Android mobile apps', spiceSupported: true, pinCount: 6, iconName: 'Zap' },
  { type: 'module_lora_sx1278', category: 'modules', name: 'SX1278 Ra-02 LoRa 433MHz Module', defaultVal: 'LoRa SPI +20dBm', unit: '', description: 'Ultra-long range spread spectrum wireless data transmission up to 10km in rural areas', spiceSupported: true, pinCount: 16, iconName: 'Zap' },
  { type: 'module_neo6m_gps', category: 'modules', name: 'NEO-6M GPS Receiver Module with Ceramic Antenna', defaultVal: 'UART 9600 NMEA 50-Ch', unit: '', description: 'Satellite positioning receiver with 1PPS time pulse, battery backup, and serial NMEA output', spiceSupported: true, pinCount: 4, iconName: 'Activity' },
  { type: 'module_rc522_rfid', category: 'modules', name: 'RC522 RFID 13.56MHz Reader & Key Fob', defaultVal: 'SPI Mifare One 13.56MHz', unit: '', description: 'Contactless smart card and key tag transceiver module for access control systems (8-pin)', spiceSupported: true, pinCount: 8, iconName: 'Activity' },
  { type: 'module_sd_card_spi', category: 'modules', name: 'MicroSD Card Adapter Module (SPI Interface)', defaultVal: 'SPI 3.3V Level Shifted', unit: '', description: 'Storage card socket with onboard 3.3V LDO regulator and 74LVC125 buffer chip for 5V Arduinos', spiceSupported: true, pinCount: 6, iconName: 'Sliders' },
  { type: 'module_logic_level_shifter', category: 'modules', name: '4-Channel Bidirectional Logic Level Converter', defaultVal: '5V <-> 3.3V I2C/SPI', unit: '', description: 'MOSFET-based bidirectional voltage shifter safely bridging 5V and 3.3V data lines (HV, LV, GND)', spiceSupported: true, pinCount: 12, iconName: 'Zap' },
  { type: 'module_tp4056_charger', category: 'power', name: 'TP4056 1A Li-Ion Battery Charger (USB-C)', defaultVal: '4.2V 1A CC/CV', unit: '', description: 'Lithium battery constant-current / constant-voltage charging board with DW01A protection IC', spiceSupported: true, pinCount: 6, iconName: 'BatteryCharging' },
  { type: 'module_cp2102_usb_uart', category: 'modules', name: 'CP2102 USB to TTL Serial Adapter', defaultVal: 'USB-UART 3.3V/5V', unit: '', description: 'Silicon Labs USB bridge providing TX, RX, DTR, RTS for programming Pro Mini and bare MCUs', spiceSupported: true, pinCount: 6, iconName: 'Cpu' },
  { type: 'module_ftdi_ft232rl', category: 'modules', name: 'FTDI FT232RL USB Serial Programmer', defaultVal: 'FTDI USB-TTL', unit: '', description: 'Reliable industrial USB-to-UART converter with auto-reset capacitor line for Arduino bootloaders', spiceSupported: true, pinCount: 6, iconName: 'Cpu' }
];

// Helper to retrieve catalog item by type
export function findCatalogItem(type: string): CatalogItem | undefined {
  return EXTENDED_COMPONENT_CATALOG.find(c => c.type === type);
}
