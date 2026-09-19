// src/data/pinGenerators.ts
// Pin generators for all 200+ components ensuring accurate geometry, pin labels, and electrical types

import { PinDefinition } from '../types/circuit';
import { FULL_SIZE_BOARDS } from './boardDimensions';

export function createComponentPinsExtended(type: string, compId: string): PinDefinition[] {
  // Check if it's a full-sized development board
  if (FULL_SIZE_BOARDS[type]) {
    const spec = FULL_SIZE_BOARDS[type];
    return spec.pins.map(p => ({
      ...p,
      id: `${compId}_${p.id}`
    }));
  }

  // Handle legacy board aliases
  if (type === 'esp32') {
    return FULL_SIZE_BOARDS.esp32_devkit.pins.map(p => ({
      ...p,
      id: `${compId}_${p.id}`
    }));
  }

  // Categorized standard pin definitions
  switch (type) {
    // 2-PIN PASSIVES & DIODES (x: 0, y: 15) and (x: 60, y: 15)
    case 'resistor':
    case 'capacitor':
    case 'inductor':
    case 'diode':
    case 'zener':
    case 'ldr':
    case 'thermistor':
    case 'pushbutton':
    case 'spst_switch':
    case 'reed_switch':
    case 'mercury_tilt_switch':
    case 'solenoid_5v':
    case 'piezo_buzzer_active':
    case 'piezo_buzzer_passive':
    case 'vibration_motor':
    case 'speaker_8ohm':
    case 'dc_motor_toy':
    case 'dc_motor_gear_tt':
    case 'linear_actuator_micro':
    case 'electromagnet_5v':
      return [
        { id: `${compId}_p1`, name: 'Terminal 1 / Anode', label: '1', type: 'passive', x: 0, y: 15 },
        { id: `${compId}_p2`, name: 'Terminal 2 / Cathode', label: '2', type: 'passive', x: 60, y: 15 }
      ];

    // LEDS (Anode + and Cathode -)
    case 'led':
    case 'led_green':
    case 'led_blue':
    case 'led_yellow':
    case 'led_white':
    case 'led_orange':
    case 'ir_emitter':
    case 'uv_led':
      return [
        { id: `${compId}_anode`, name: 'Anode (+)', label: '+', type: 'passive', x: 0, y: 15 },
        { id: `${compId}_cathode`, name: 'Cathode (-)', label: '-', type: 'passive', x: 60, y: 15 }
      ];

    // 2-PIN POWER SOURCES
    case 'dc_source':
    case 'dc_source_5v':
    case 'dc_source_3v3':
    case 'dc_source_12v':
    case 'battery':
    case 'battery_9v':
    case 'battery_aa_single':
    case 'battery_aa_dual':
    case 'battery_aa_quad':
    case 'battery_18650':
    case 'battery_lipo_2s':
    case 'battery_coin_cr2032':
      return [
        { id: `${compId}_pos`, name: 'Positive (+)', label: '+', type: 'power', x: 0, y: 15 },
        { id: `${compId}_neg`, name: 'Negative (-)', label: '-', type: 'ground', x: 60, y: 15 }
      ];

    // 1-PIN GROUND REFERENCE
    case 'ground':
      return [
        { id: `${compId}_gnd`, name: 'GND (0V)', label: 'GND', type: 'ground', x: 20, y: 30 }
      ];

    // 3-PIN POTENTIOMETERS
    case 'potentiometer':
      return [
        { id: `${compId}_p1`, name: 'Terminal 1', label: '1', type: 'passive', x: 0, y: 15 },
        { id: `${compId}_wiper`, name: 'Wiper', label: 'W', type: 'analog', x: 30, y: 35 },
        { id: `${compId}_p2`, name: 'Terminal 2', label: '2', type: 'passive', x: 60, y: 15 }
      ];

    // 3-PIN TRANSISTORS & MOSFETS (Collector/Drain, Base/Gate, Emitter/Source)
    case 'bjt_npn_2n2222':
    case 'bjt_npn_bc547':
    case 'darlington_tip120':
      return [
        { id: `${compId}_c`, name: 'Collector (C)', label: 'C', type: 'passive', x: 10, y: 15 },
        { id: `${compId}_b`, name: 'Base (B)', label: 'B', type: 'passive', x: 35, y: 35 },
        { id: `${compId}_e`, name: 'Emitter (E)', label: 'E', type: 'passive', x: 60, y: 15 }
      ];

    case 'bjt_pnp_2n3906':
    case 'bjt_pnp_bc557':
    case 'darlington_tip127':
      return [
        { id: `${compId}_e`, name: 'Emitter (E)', label: 'E', type: 'passive', x: 10, y: 15 },
        { id: `${compId}_b`, name: 'Base (B)', label: 'B', type: 'passive', x: 35, y: 35 },
        { id: `${compId}_c`, name: 'Collector (C)', label: 'C', type: 'passive', x: 60, y: 15 }
      ];

    case 'mosfet_n_2n7000':
    case 'mosfet_n_irlz44n':
    case 'mosfet_n_irf540n':
      return [
        { id: `${compId}_g`, name: 'Gate (G)', label: 'G', type: 'digital', x: 10, y: 35 },
        { id: `${compId}_d`, name: 'Drain (D)', label: 'D', type: 'passive', x: 35, y: 15 },
        { id: `${compId}_s`, name: 'Source (S)', label: 'S', type: 'ground', x: 60, y: 35 }
      ];

    case 'mosfet_p_irf9540n':
    case 'mosfet_p_bs250':
      return [
        { id: `${compId}_g`, name: 'Gate (G)', label: 'G', type: 'digital', x: 10, y: 35 },
        { id: `${compId}_s`, name: 'Source (S)', label: 'S', type: 'power', x: 35, y: 15 },
        { id: `${compId}_d`, name: 'Drain (D)', label: 'D', type: 'passive', x: 60, y: 35 }
      ];

    case 'scr_c106d':
    case 'triac_bt136':
      return [
        { id: `${compId}_a1`, name: 'Anode / MT1', label: 'A', type: 'passive', x: 10, y: 15 },
        { id: `${compId}_g`, name: 'Gate', label: 'G', type: 'digital', x: 35, y: 35 },
        { id: `${compId}_k2`, name: 'Cathode / MT2', label: 'K', type: 'passive', x: 60, y: 15 }
      ];

    // 3-PIN VOLTAGE REGULATORS (LM7805, LM7812, LM317, AMS1117)
    case 'regulator_lm7805':
    case 'regulator_lm7812':
      return [
        { id: `${compId}_vin`, name: 'Input (VIN 7-25V)', label: 'IN', type: 'power', x: 10, y: 35 },
        { id: `${compId}_gnd`, name: 'Ground (GND)', label: 'GND', type: 'ground', x: 35, y: 35 },
        { id: `${compId}_vout`, name: 'Output (+V Regulated)', label: 'OUT', type: 'power', x: 60, y: 35 }
      ];

    case 'regulator_lm317':
      return [
        { id: `${compId}_adj`, name: 'Adjust (ADJ)', label: 'ADJ', type: 'passive', x: 10, y: 35 },
        { id: `${compId}_vout`, name: 'Output (VOUT)', label: 'OUT', type: 'power', x: 35, y: 35 },
        { id: `${compId}_vin`, name: 'Input (VIN)', label: 'IN', type: 'power', x: 60, y: 35 }
      ];

    case 'regulator_ams1117_3v3':
      return [
        { id: `${compId}_gnd`, name: 'Ground (GND)', label: 'GND', type: 'ground', x: 10, y: 35 },
        { id: `${compId}_vout`, name: 'Output (3.3V)', label: 'OUT', type: 'power', x: 35, y: 35 },
        { id: `${compId}_vin`, name: 'Input (VIN 5V)', label: 'IN', type: 'power', x: 60, y: 35 }
      ];

    // 3-PIN SWITCHES
    case 'spdt_toggle':
    case 'limit_switch':
      return [
        { id: `${compId}_no`, name: 'Normally Open (NO)', label: 'NO', type: 'passive', x: 10, y: 15 },
        { id: `${compId}_com`, name: 'Common (COM)', label: 'COM', type: 'passive', x: 35, y: 35 },
        { id: `${compId}_nc`, name: 'Normally Closed (NC)', label: 'NC', type: 'passive', x: 60, y: 15 }
      ];

    // 3-PIN SERVOS & MOTORS
    case 'servo_sg90':
    case 'servo_mg996r':
      return [
        { id: `${compId}_gnd`, name: 'GND (Brown)', label: 'GND', type: 'ground', x: 15, y: 35 },
        { id: `${compId}_vcc`, name: 'VCC 5V (Red)', label: '5V', type: 'power', x: 35, y: 35 },
        { id: `${compId}_sig`, name: 'PWM Signal (Orange)', label: 'SIG', type: 'digital', x: 55, y: 35 }
      ];

    case 'brushless_esc_motor':
      return [
        { id: `${compId}_u`, name: 'Phase U (Yellow)', label: 'U', type: 'passive', x: 15, y: 35 },
        { id: `${compId}_v`, name: 'Phase V (Black)', label: 'V', type: 'passive', x: 35, y: 35 },
        { id: `${compId}_w`, name: 'Phase W (Red)', label: 'W', type: 'passive', x: 55, y: 35 }
      ];

    // 3-PIN SENSORS
    case 'sensor_dht11':
    case 'sensor_dht22':
    case 'sensor_ds18b20':
    case 'sensor_pir_hc_sr501':
    case 'sensor_rcwl0516':
    case 'sensor_soil_moisture':
    case 'sensor_water_level':
    case 'sensor_touch_ttp223':
    case 'sensor_hall_effect_49e':
    case 'sensor_hall_switch_3144':
    case 'sensor_hck04_flow':
      return [
        { id: `${compId}_vcc`, name: 'VCC (3.3V-5V)', label: 'VCC', type: 'power', x: 15, y: 35 },
        { id: `${compId}_data`, name: 'Data / Out', label: 'OUT', type: 'digital', x: 35, y: 35 },
        { id: `${compId}_gnd`, name: 'GND', label: 'GND', type: 'ground', x: 55, y: 35 }
      ];

    // 4-PIN COMPONENTS (RGB LEDs, I2C Modules, Ultrasonic)
    case 'led_rgb_ca':
    case 'led_rgb_cc':
      return [
        { id: `${compId}_red`, name: 'Red', label: 'R', type: 'passive', x: 10, y: 35 },
        { id: `${compId}_com`, name: 'Common (Anode/Cathode)', label: 'COM', type: 'passive', x: 25, y: 35 },
        { id: `${compId}_green`, name: 'Green', label: 'G', type: 'passive', x: 40, y: 35 },
        { id: `${compId}_blue`, name: 'Blue', label: 'B', type: 'passive', x: 55, y: 35 }
      ];

    case 'neopixel_ws2812b':
      return [
        { id: `${compId}_5v`, name: '5V Power', label: '5V', type: 'power', x: 10, y: 35 },
        { id: `${compId}_din`, name: 'Data In (DIN)', label: 'DIN', type: 'digital', x: 25, y: 35 },
        { id: `${compId}_gnd`, name: 'Ground (GND)', label: 'GND', type: 'ground', x: 40, y: 35 },
        { id: `${compId}_dout`, name: 'Data Out (DOUT)', label: 'DOUT', type: 'digital', x: 55, y: 35 }
      ];

    case 'bridge_rectifier':
      return [
        { id: `${compId}_ac1`, name: 'AC Input 1', label: '~', type: 'passive', x: 10, y: 15 },
        { id: `${compId}_pos`, name: 'DC Positive (+)', label: '+', type: 'power', x: 25, y: 35 },
        { id: `${compId}_neg`, name: 'DC Negative (-)', label: '-', type: 'ground', x: 40, y: 35 },
        { id: `${compId}_ac2`, name: 'AC Input 2', label: '~', type: 'passive', x: 55, y: 15 }
      ];

    case 'sensor_hcsr04':
      return [
        { id: `${compId}_vcc`, name: 'VCC (5V)', label: 'VCC', type: 'power', x: 15, y: 35 },
        { id: `${compId}_trig`, name: 'Trigger Pulse', label: 'TRIG', type: 'digital', x: 30, y: 35 },
        { id: `${compId}_echo`, name: 'Echo Pulse Return', label: 'ECHO', type: 'digital', x: 45, y: 35 },
        { id: `${compId}_gnd`, name: 'GND', label: 'GND', type: 'ground', x: 60, y: 35 }
      ];

    // Standard I2C 4-Pin Sensors / Displays
    case 'sensor_bme280':
    case 'sensor_bmp180':
    case 'sensor_mpu6050':
    case 'sensor_adxl345':
    case 'sensor_vl53l0x':
    case 'sensor_tcs34725':
    case 'sensor_bh1750':
    case 'sensor_ina219':
    case 'sensor_heart_rate_max30102':
    case 'display_oled_ssd1306':
    case 'display_oled_sh1106':
    case 'display_lcd1602_i2c':
    case 'display_lcd2004_i2c':
      return [
        { id: `${compId}_gnd`, name: 'GND', label: 'GND', type: 'ground', x: 15, y: 35 },
        { id: `${compId}_vcc`, name: 'VCC (3.3V/5V)', label: 'VCC', type: 'power', x: 30, y: 35 },
        { id: `${compId}_scl`, name: 'SCL (I2C Clock)', label: 'SCL', type: 'digital', x: 45, y: 35 },
        { id: `${compId}_sda`, name: 'SDA (I2C Data)', label: 'SDA', type: 'digital', x: 60, y: 35 }
      ];

    // Analog + Digital 4-Pin Modules (MQ Gas, Flame, Sound, TCRT5000)
    case 'sensor_mq2':
    case 'sensor_mq135':
    case 'sensor_flame_ir':
    case 'sensor_sound_mic':
    case 'sensor_tcrt5000':
      return [
        { id: `${compId}_vcc`, name: 'VCC (5V)', label: 'VCC', type: 'power', x: 15, y: 35 },
        { id: `${compId}_gnd`, name: 'GND', label: 'GND', type: 'ground', x: 30, y: 35 },
        { id: `${compId}_do`, name: 'Digital Out (DO)', label: 'DO', type: 'digital', x: 45, y: 35 },
        { id: `${compId}_ao`, name: 'Analog Out (AO)', label: 'AO', type: 'analog', x: 60, y: 35 }
      ];

    // Bipolar Stepper (NEMA 17 4-wire: A+, A-, B+, B-)
    case 'stepper_nema17':
      return [
        { id: `${compId}_ap`, name: 'Phase A+ (Black)', label: 'A+', type: 'passive', x: 15, y: 35 },
        { id: `${compId}_am`, name: 'Phase A- (Green)', label: 'A-', type: 'passive', x: 30, y: 35 },
        { id: `${compId}_bp`, name: 'Phase B+ (Red)', label: 'B+', type: 'passive', x: 45, y: 35 },
        { id: `${compId}_bm`, name: 'Phase B- (Blue)', label: 'B-', type: 'passive', x: 60, y: 35 }
      ];

    // 4-Pin Buck Converter (IN+, IN-, OUT+, OUT-)
    case 'module_lm2596_buck':
      return [
        { id: `${compId}_inp`, name: 'IN+ (Input DC)', label: 'IN+', type: 'power', x: 10, y: 15 },
        { id: `${compId}_inm`, name: 'IN- (Ground)', label: 'IN-', type: 'ground', x: 10, y: 35 },
        { id: `${compId}_outp`, name: 'OUT+ (Step Down DC)', label: 'OUT+', type: 'power', x: 65, y: 15 },
        { id: `${compId}_outm`, name: 'OUT- (Ground)', label: 'OUT-', type: 'ground', x: 65, y: 35 }
      ];

    // 4-Pin SSR Relay
    case 'ssr_solid_state_relay':
      return [
        { id: `${compId}_ctrl_pos`, name: 'Input DC (+)', label: 'IN+', type: 'digital', x: 15, y: 15 },
        { id: `${compId}_ctrl_neg`, name: 'Input DC (-)', label: 'IN-', type: 'ground', x: 15, y: 35 },
        { id: `${compId}_load_1`, name: 'AC Load Term 1', label: 'AC1', type: 'passive', x: 60, y: 15 },
        { id: `${compId}_load_2`, name: 'AC Load Term 2', label: 'AC2', type: 'passive', x: 60, y: 35 }
      ];

    // 4-Pin GPS (VCC, RX, TX, GND)
    case 'module_neo6m_gps':
      return [
        { id: `${compId}_vcc`, name: 'VCC (3.3V-5V)', label: 'VCC', type: 'power', x: 15, y: 35 },
        { id: `${compId}_rx`, name: 'RX Data In', label: 'RX', type: 'digital', x: 30, y: 35 },
        { id: `${compId}_tx`, name: 'TX Data Out', label: 'TX', type: 'digital', x: 45, y: 35 },
        { id: `${compId}_gnd`, name: 'GND', label: 'GND', type: 'ground', x: 60, y: 35 }
      ];

    // 5-PIN ELECTROMECHANICAL RELAYS (Coil 1, Coil 2, COM, NO, NC)
    case 'relay_5v_spdt':
    case 'relay_12v_spdt':
      return [
        { id: `${compId}_coil1`, name: 'Coil (+)', label: 'C1', type: 'passive', x: 10, y: 15 },
        { id: `${compId}_coil2`, name: 'Coil (-)', label: 'C2', type: 'passive', x: 10, y: 35 },
        { id: `${compId}_com`, name: 'Common (COM)', label: 'COM', type: 'passive', x: 35, y: 25 },
        { id: `${compId}_no`, name: 'Normally Open (NO)', label: 'NO', type: 'passive', x: 60, y: 15 },
        { id: `${compId}_nc`, name: 'Normally Closed (NC)', label: 'NC', type: 'passive', x: 60, y: 35 }
      ];

    // 5-Pin Joystick Module
    case 'sensor_joystick':
      return [
        { id: `${compId}_gnd`, name: 'GND', label: 'GND', type: 'ground', x: 15, y: 35 },
        { id: `${compId}_vcc`, name: 'VCC (+5V)', label: '5V', type: 'power', x: 28, y: 35 },
        { id: `${compId}_vrx`, name: 'X-Axis Pot (VRx)', label: 'VRX', type: 'analog', x: 41, y: 35 },
        { id: `${compId}_vry`, name: 'Y-Axis Pot (VRy)', label: 'VRY', type: 'analog', x: 54, y: 35 },
        { id: `${compId}_sw`, name: 'Push Switch (SW)', label: 'SW', type: 'digital', x: 67, y: 35 }
      ];

    // 5-Pin Rotary Encoder
    case 'sensor_rotary_encoder':
      return [
        { id: `${compId}_gnd`, name: 'GND', label: 'GND', type: 'ground', x: 15, y: 35 },
        { id: `${compId}_vcc`, name: 'VCC (+5V)', label: 'VCC', type: 'power', x: 28, y: 35 },
        { id: `${compId}_sw`, name: 'Switch (SW)', label: 'SW', type: 'digital', x: 41, y: 35 },
        { id: `${compId}_dt`, name: 'Direction (DT)', label: 'DT', type: 'digital', x: 54, y: 35 },
        { id: `${compId}_clk`, name: 'Clock (CLK)', label: 'CLK', type: 'digital', x: 67, y: 35 }
      ];

    // 5-Pin Unipolar Stepper 28BYJ-48
    case 'stepper_28byj48':
      return [
        { id: `${compId}_vcc`, name: 'VCC (+5V Common Red)', label: '5V', type: 'power', x: 15, y: 35 },
        { id: `${compId}_in1`, name: 'Phase 1 (Blue)', label: '1', type: 'digital', x: 28, y: 35 },
        { id: `${compId}_in2`, name: 'Phase 2 (Pink)', label: '2', type: 'digital', x: 41, y: 35 },
        { id: `${compId}_in3`, name: 'Phase 3 (Yellow)', label: '3', type: 'digital', x: 54, y: 35 },
        { id: `${compId}_in4`, name: 'Phase 4 (Orange)', label: '4', type: 'digital', x: 67, y: 35 }
      ];

    // 6-PIN MODULES (Bluetooth HC-05, MicroSD, Optocoupler 4N35, DAC MCP4725)
    case 'module_hc05_bluetooth':
    case 'module_hm10_ble':
      return [
        { id: `${compId}_state`, name: 'State Output', label: 'STA', type: 'digital', x: 10, y: 35 },
        { id: `${compId}_rx`, name: 'RXD In (3.3V)', label: 'RX', type: 'digital', x: 22, y: 35 },
        { id: `${compId}_tx`, name: 'TXD Out (3.3V)', label: 'TX', type: 'digital', x: 34, y: 35 },
        { id: `${compId}_gnd`, name: 'GND', label: 'GND', type: 'ground', x: 46, y: 35 },
        { id: `${compId}_vcc`, name: 'VCC (3.6V-6V)', label: 'VCC', type: 'power', x: 58, y: 35 },
        { id: `${compId}_en`, name: 'Key / Enable', label: 'EN', type: 'digital', x: 70, y: 35 }
      ];

    case 'optocoupler_4n35':
      return [
        { id: `${compId}_anode`, name: 'LED Anode (Pin 1)', label: 'A', type: 'passive', x: 10, y: 15 },
        { id: `${compId}_cathode`, name: 'LED Cathode (Pin 2)', label: 'K', type: 'passive', x: 25, y: 15 },
        { id: `${compId}_nc`, name: 'No Connection (Pin 3)', label: 'NC', type: 'passive', x: 40, y: 15 },
        { id: `${compId}_emitter`, name: 'Phototransistor Emitter (Pin 4)', label: 'E', type: 'passive', x: 40, y: 35 },
        { id: `${compId}_collector`, name: 'Phototransistor Collector (Pin 5)', label: 'C', type: 'passive', x: 25, y: 35 },
        { id: `${compId}_base`, name: 'Phototransistor Base (Pin 6)', label: 'B', type: 'passive', x: 10, y: 35 }
      ];

    // 8-PIN DIP ICs (NE555, LM358, LM393, DS1307)
    case 'ic_ne555_timer':
      return [
        // Left side (1..4)
        { id: `${compId}_pin1_gnd`, name: 'GND (Pin 1)', label: '1:GND', type: 'ground', x: 10, y: 15 },
        { id: `${compId}_pin2_trig`, name: 'Trigger (Pin 2)', label: '2:TRIG', type: 'analog', x: 25, y: 15 },
        { id: `${compId}_pin3_out`, name: 'Output (Pin 3)', label: '3:OUT', type: 'digital', x: 40, y: 15 },
        { id: `${compId}_pin4_rst`, name: 'Reset (Pin 4)', label: '4:RST', type: 'digital', x: 55, y: 15 },
        // Right side (8..5)
        { id: `${compId}_pin8_vcc`, name: 'VCC 4.5-15V (Pin 8)', label: '8:VCC', type: 'power', x: 55, y: 35 },
        { id: `${compId}_pin7_disch`, name: 'Discharge (Pin 7)', label: '7:DIS', type: 'passive', x: 40, y: 35 },
        { id: `${compId}_pin6_thresh`, name: 'Threshold (Pin 6)', label: '6:THR', type: 'analog', x: 25, y: 35 },
        { id: `${compId}_pin5_ctrl`, name: 'Control Voltage (Pin 5)', label: '5:CV', type: 'analog', x: 10, y: 35 }
      ];

    case 'ic_lm358_opamp':
    case 'ic_lm393_comparator':
      return [
        { id: `${compId}_out1`, name: 'Out 1 (Pin 1)', label: '1:OUT1', type: 'analog', x: 10, y: 15 },
        { id: `${compId}_in1_neg`, name: 'In 1- (Pin 2)', label: '2:IN1-', type: 'analog', x: 25, y: 15 },
        { id: `${compId}_in1_pos`, name: 'In 1+ (Pin 3)', label: '3:IN1+', type: 'analog', x: 40, y: 15 },
        { id: `${compId}_gnd`, name: 'GND / V- (Pin 4)', label: '4:GND', type: 'ground', x: 55, y: 15 },
        { id: `${compId}_vcc`, name: 'VCC / V+ (Pin 8)', label: '8:VCC', type: 'power', x: 55, y: 35 },
        { id: `${compId}_out2`, name: 'Out 2 (Pin 7)', label: '7:OUT2', type: 'analog', x: 40, y: 35 },
        { id: `${compId}_in2_neg`, name: 'In 2- (Pin 6)', label: '6:IN2-', type: 'analog', x: 25, y: 35 },
        { id: `${compId}_in2_pos`, name: 'In 2+ (Pin 5)', label: '5:IN2+', type: 'analog', x: 10, y: 35 }
      ];

    // 8-PIN SPI Modules (nRF24L01+, RC522 RFID)
    case 'module_nrf24l01':
      return [
        { id: `${compId}_gnd`, name: 'GND', label: 'GND', type: 'ground', x: 10, y: 15 },
        { id: `${compId}_vcc`, name: 'VCC 3.3V ONLY', label: '3V3', type: 'power', x: 25, y: 15 },
        { id: `${compId}_ce`, name: 'Chip Enable (CE)', label: 'CE', type: 'digital', x: 40, y: 15 },
        { id: `${compId}_csn`, name: 'SPI CSN', label: 'CSN', type: 'digital', x: 55, y: 15 },
        { id: `${compId}_sck`, name: 'SPI SCK', label: 'SCK', type: 'digital', x: 55, y: 35 },
        { id: `${compId}_mosi`, name: 'SPI MOSI', label: 'MOSI', type: 'digital', x: 40, y: 35 },
        { id: `${compId}_miso`, name: 'SPI MISO', label: 'MISO', type: 'digital', x: 25, y: 35 },
        { id: `${compId}_irq`, name: 'Interrupt (IRQ)', label: 'IRQ', type: 'digital', x: 10, y: 35 }
      ];

    // 14-PIN DIP LOGIC GATES (74HC00, 74HC04, 74HC08, 74HC32, 74HC86, LM324)
    case 'ic_74hc00_nand':
    case 'ic_74hc04_inverter':
    case 'ic_74hc08_and':
    case 'ic_74hc32_or':
    case 'ic_74hc86_xor':
    case 'ic_lm324_opamp':
    case 'ic_lm339_comparator':
      return [
        { id: `${compId}_p1`, name: 'Pin 1 (1A / 1OUT)', label: '1', type: 'passive', x: 10, y: 15 },
        { id: `${compId}_p2`, name: 'Pin 2 (1B / 1IN-)', label: '2', type: 'passive', x: 22, y: 15 },
        { id: `${compId}_p3`, name: 'Pin 3 (1Y / 1IN+)', label: '3', type: 'passive', x: 34, y: 15 },
        { id: `${compId}_p4`, name: 'Pin 4 (2A / V+)', label: '4', type: 'power', x: 46, y: 15 },
        { id: `${compId}_p5`, name: 'Pin 5 (2B / 2IN+)', label: '5', type: 'passive', x: 58, y: 15 },
        { id: `${compId}_p6`, name: 'Pin 6 (2Y / 2IN-)', label: '6', type: 'passive', x: 70, y: 15 },
        { id: `${compId}_p7`, name: 'Pin 7 (GND)', label: '7:GND', type: 'ground', x: 82, y: 15 },
        // Top row pins 14..8
        { id: `${compId}_p14`, name: 'Pin 14 (VCC)', label: '14:VCC', type: 'power', x: 82, y: 40 },
        { id: `${compId}_p13`, name: 'Pin 13 (4B / 4OUT)', label: '13', type: 'passive', x: 70, y: 40 },
        { id: `${compId}_p12`, name: 'Pin 12 (4A / 4IN-)', label: '12', type: 'passive', x: 58, y: 40 },
        { id: `${compId}_p11`, name: 'Pin 11 (4Y / V-)', label: '11', type: 'passive', x: 46, y: 40 },
        { id: `${compId}_p10`, name: 'Pin 10 (3B / 3IN+)', label: '10', type: 'passive', x: 34, y: 40 },
        { id: `${compId}_p9`, name: 'Pin 9 (3A / 3IN-)', label: '9', type: 'passive', x: 22, y: 40 },
        { id: `${compId}_p8`, name: 'Pin 8 (3Y / 3OUT)', label: '8', type: 'passive', x: 10, y: 40 }
      ];

    // 16-PIN DIP ICs (74HC595, ULN2003, L293D, CD4017, PCF8574)
    case 'ic_sn74hc595_shift':
    case 'ic_sn74hc165_shift':
    case 'ic_cd4017_decade':
    case 'uln2003_darlington':
    case 'l293d_motor_driver':
    case 'ic_cd4051_multiplexer':
    case 'ic_pcf8574_io_expander':
    case 'ic_mcp3008_adc':
      return [
        { id: `${compId}_p1`, name: 'Pin 1', label: '1', type: 'passive', x: 10, y: 15 },
        { id: `${compId}_p2`, name: 'Pin 2', label: '2', type: 'passive', x: 20, y: 15 },
        { id: `${compId}_p3`, name: 'Pin 3', label: '3', type: 'passive', x: 30, y: 15 },
        { id: `${compId}_p4`, name: 'Pin 4', label: '4', type: 'passive', x: 40, y: 15 },
        { id: `${compId}_p5`, name: 'Pin 5', label: '5', type: 'passive', x: 50, y: 15 },
        { id: `${compId}_p6`, name: 'Pin 6', label: '6', type: 'passive', x: 60, y: 15 },
        { id: `${compId}_p7`, name: 'Pin 7', label: '7', type: 'passive', x: 70, y: 15 },
        { id: `${compId}_p8`, name: 'Pin 8 (GND)', label: '8:GND', type: 'ground', x: 80, y: 15 },
        // Top row (16..9)
        { id: `${compId}_p16`, name: 'Pin 16 (VCC)', label: '16:VCC', type: 'power', x: 80, y: 40 },
        { id: `${compId}_p15`, name: 'Pin 15', label: '15', type: 'passive', x: 70, y: 40 },
        { id: `${compId}_p14`, name: 'Pin 14', label: '14', type: 'passive', x: 60, y: 40 },
        { id: `${compId}_p13`, name: 'Pin 13', label: '13', type: 'passive', x: 50, y: 40 },
        { id: `${compId}_p12`, name: 'Pin 12', label: '12', type: 'passive', x: 40, y: 40 },
        { id: `${compId}_p11`, name: 'Pin 11', label: '11', type: 'passive', x: 30, y: 40 },
        { id: `${compId}_p10`, name: 'Pin 10', label: '10', type: 'passive', x: 20, y: 40 },
        { id: `${compId}_p9`, name: 'Pin 9', label: '9', type: 'passive', x: 10, y: 40 }
      ];

    // 10-PIN 7-SEGMENT DISPLAY
    case 'seven_segment':
      return [
        { id: `${compId}_e`, name: 'Segment E (Pin 1)', label: 'E', type: 'passive', x: 10, y: 15 },
        { id: `${compId}_d`, name: 'Segment D (Pin 2)', label: 'D', type: 'passive', x: 22, y: 15 },
        { id: `${compId}_cc1`, name: 'Common Cathode (Pin 3)', label: 'CC', type: 'ground', x: 34, y: 15 },
        { id: `${compId}_c`, name: 'Segment C (Pin 4)', label: 'C', type: 'passive', x: 46, y: 15 },
        { id: `${compId}_dp`, name: 'Decimal Point (Pin 5)', label: 'DP', type: 'passive', x: 58, y: 15 },
        { id: `${compId}_b`, name: 'Segment B (Pin 6)', label: 'B', type: 'passive', x: 58, y: 40 },
        { id: `${compId}_a`, name: 'Segment A (Pin 7)', label: 'A', type: 'passive', x: 46, y: 40 },
        { id: `${compId}_cc2`, name: 'Common Cathode (Pin 8)', label: 'CC', type: 'ground', x: 34, y: 40 },
        { id: `${compId}_f`, name: 'Segment F (Pin 9)', label: 'F', type: 'passive', x: 22, y: 40 },
        { id: `${compId}_g`, name: 'Segment G (Pin 10)', label: 'G', type: 'passive', x: 10, y: 40 }
      ];

    // Default 2 pins for any other component
    default:
      return [
        { id: `${compId}_p1`, name: 'Pin 1', label: '1', type: 'passive', x: 0, y: 15 },
        { id: `${compId}_p2`, name: 'Pin 2', label: '2', type: 'passive', x: 60, y: 15 }
      ];
  }
}
