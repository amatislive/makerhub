import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  Sparkles,
  Layers,
  Wifi,
  Link,
  Package,
  FileText,
  User,
  Hash,
  Sliders,
  Maximize2,
  RefreshCw,
  Eye,
  AlertCircle,
  Tag,
  Grid,
  Zap,
  Cpu
} from 'lucide-react';
import { InventoryItem, Project } from '../types';

interface QrCodeMakerViewProps {
  inventory?: InventoryItem[];
  projects?: Project[];
  onOpenInventoryItem?: (id: string) => void;
}

type QrType = 'inventory' | 'url' | 'wifi' | 'text' | 'vcard' | 'device';

export const QrCodeMakerView: React.FC<QrCodeMakerViewProps> = ({
  inventory = [],
  projects = [],
}) => {
  // Mode selection
  const [qrType, setQrType] = useState<QrType>('inventory');

  // Input states for various modes
  // Inventory mode
  const [selectedInvId, setSelectedInvId] = useState<string>(inventory.length > 0 ? inventory[0].id : '');
  const [customPartName, setCustomPartName] = useState('ESP32-WROOM-32D Module');
  const [customPartSku, setCustomPartSku] = useState('MCU-ESP32-01');
  const [customPartLocation, setCustomPartLocation] = useState('BIN-A04-R02');
  const [customPartCategory, setCustomPartCategory] = useState('Microcontrollers');
  const [customPartQty, setCustomPartQty] = useState('12');

  // URL mode
  const [urlInput, setUrlInput] = useState('https://github.com/maker/robotics-firmware');
  const [urlLabel, setUrlLabel] = useState('Firmware Repository v2.4');

  // WiFi mode
  const [wifiSsid, setWifiSsid] = useState('MakerWorkshop_IoT');
  const [wifiPassword, setWifiPassword] = useState('makerlab2026!');
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);

  // Raw Text mode
  const [rawText, setRawText] = useState('SERIAL-SN-98421034-REV-B');
  const [rawTextTitle, setRawTextTitle] = useState('Hardware UID Tag');

  // vCard mode
  const [vcardName, setVcardName] = useState('Alex Rivera');
  const [vcardRole, setVcardRole] = useState('Lead Hardware Engineer');
  const [vcardEmail, setVcardEmail] = useState('maker@workshop.lab');
  const [vcardPhone, setVcardPhone] = useState('+1 (555) 349-2810');
  const [vcardOrg, setVcardOrg] = useState('MAKEO Digital Workshop');

  // Device / IoT MAC mode
  const [deviceMac, setDeviceMac] = useState('24:6F:28:B1:C9:4A');
  const [deviceIp, setDeviceIp] = useState('192.168.1.145');
  const [deviceHostname, setDeviceHostname] = useState('esp32-node-sensor-01');

  // QR Style options
  const [fgColor, setFgColor] = useState('#111111');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const [qrSize, setQrSize] = useState<number>(300);
  const [marginSize, setMarginSize] = useState<number>(2);
  const [includeLabelText, setIncludeLabelText] = useState(true);
  const [labelPreset, setLabelPreset] = useState<'bin-50x25' | 'tote-70x36' | 'square-compact' | 'dymo-30334'>('bin-50x25');

  // Generated QR output
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrSvgString, setQrSvgString] = useState<string>('');
  const [encodedPayload, setEncodedPayload] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Batch Print Modal / Sheet state
  const [isBatchMode, setIsBatchMode] = useState(false);

  // Print ref for direct label printing
  const labelPrintRef = useRef<HTMLDivElement>(null);

  // Compute payload string
  useEffect(() => {
    let payload = '';

    if (qrType === 'inventory') {
      const invItem = inventory.find((i) => i.id === selectedInvId);
      if (invItem) {
        payload = JSON.stringify({
          mk_type: 'inventory',
          id: invItem.id,
          name: invItem.name,
          sku: invItem.partNumber || invItem.id,
          location: invItem.storageLocation || 'N/A',
          category: invItem.category,
        });
      } else {
        payload = JSON.stringify({
          mk_type: 'inventory',
          name: customPartName,
          sku: customPartSku,
          location: customPartLocation,
          category: customPartCategory,
          qty: customPartQty,
        });
      }
    } else if (qrType === 'url') {
      payload = urlInput;
    } else if (qrType === 'wifi') {
      // Standard Wi-Fi QR Code string: WIFI:T:WPA;S:MySSID;P:MyPassword;H:false;;
      payload = `WIFI:T:${wifiEncryption};S:${wifiSsid};P:${wifiPassword};H:${wifiHidden ? 'true' : 'false'};;`;
    } else if (qrType === 'text') {
      payload = rawText;
    } else if (qrType === 'vcard') {
      payload = `BEGIN:VCARD\nVERSION:3.0\nN:${vcardName}\nFN:${vcardName}\nORG:${vcardOrg}\nTITLE:${vcardRole}\nEMAIL:${vcardEmail}\nTEL:${vcardPhone}\nEND:VCARD`;
    } else if (qrType === 'device') {
      payload = JSON.stringify({
        device: deviceHostname,
        mac: deviceMac,
        ip: deviceIp,
        lab: 'MAKEO_IOT',
      });
    }

    setEncodedPayload(payload);
  }, [
    qrType,
    selectedInvId,
    inventory,
    customPartName,
    customPartSku,
    customPartLocation,
    customPartCategory,
    customPartQty,
    urlInput,
    wifiSsid,
    wifiPassword,
    wifiEncryption,
    wifiHidden,
    rawText,
    vcardName,
    vcardRole,
    vcardEmail,
    vcardPhone,
    vcardOrg,
    deviceMac,
    deviceIp,
    deviceHostname,
  ]);

  // Generate QR Canvas Data URL & SVG
  useEffect(() => {
    if (!encodedPayload) return;

    // Generate PNG Data URL
    QRCode.toDataURL(encodedPayload, {
      errorCorrectionLevel: errorLevel,
      color: {
        dark: fgColor,
        light: bgColor,
      },
      width: qrSize,
      margin: marginSize,
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR code generation error:', err));

    // Generate SVG string
    QRCode.toString(encodedPayload, {
      type: 'svg',
      errorCorrectionLevel: errorLevel,
      color: {
        dark: fgColor,
        light: bgColor,
      },
      margin: marginSize,
    })
      .then((svg) => setQrSvgString(svg))
      .catch((err) => console.error('QR svg generation error:', err));
  }, [encodedPayload, fgColor, bgColor, errorLevel, qrSize, marginSize]);

  // Copy to clipboard
  const handleCopyPayload = async () => {
    try {
      await navigator.clipboard.writeText(encodedPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  // Download PNG
  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `makeo-qrcode-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Download SVG
  const handleDownloadSvg = () => {
    if (!qrSvgString) return;
    const blob = new Blob([qrSvgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `makeo-qrcode-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Trigger Print dialog for sticker label
  const handlePrintLabel = () => {
    window.print();
  };

  // Helper for active label titles & descriptions
  const getActiveLabelInfo = () => {
    if (qrType === 'inventory') {
      const invItem = inventory.find((i) => i.id === selectedInvId);
      return {
        title: invItem ? invItem.name : customPartName,
        subtitle: invItem ? (invItem.partNumber || invItem.category) : customPartSku,
        loc: invItem ? (invItem.storageLocation || 'UNASSIGNED') : customPartLocation,
        extra: invItem ? `STOCK: ${invItem.quantity} ${invItem.unit || 'pcs'}` : `QTY: ${customPartQty} pcs`,
      };
    } else if (qrType === 'url') {
      return {
        title: urlLabel || 'Web Resource',
        subtitle: urlInput.replace(/^https?:\/\//, ''),
        loc: 'ONLINE DATASHEET',
        extra: 'SCAN TO OPEN LINK',
      };
    } else if (qrType === 'wifi') {
      return {
        title: wifiSsid,
        subtitle: `PASS: ${wifiPassword}`,
        loc: `SECURITY: ${wifiEncryption}`,
        extra: 'WIFI ACCESS POINT',
      };
    } else if (qrType === 'vcard') {
      return {
        title: vcardName,
        subtitle: vcardRole,
        loc: vcardOrg,
        extra: vcardEmail,
      };
    } else if (qrType === 'device') {
      return {
        title: deviceHostname,
        subtitle: `MAC: ${deviceMac}`,
        loc: `IP: ${deviceIp}`,
        extra: 'IOT NODE ID',
      };
    }
    return {
      title: rawTextTitle,
      subtitle: rawText,
      loc: 'RAW PAYLOAD',
      extra: 'TAG',
    };
  };

  const labelInfo = getActiveLabelInfo();

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#111111] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 border border-[#111111] bg-[#111111] text-white flex items-center justify-center shadow-[2px_2px_0px_#fe5029]">
              <QrCode className="w-5 h-5 text-[#fe5029]" />
            </div>
            <h1 className="font-display font-black text-2xl tracking-tight text-[#111111]">
              QR MAKER & BIN LABEL STUDIO
            </h1>
          </div>
          <p className="font-mono-tech text-xs text-[#111111]/70 mt-1 uppercase">
            High-density vector QR codes for workshop inventory, component drawers, Wi-Fi provisioning & hardware tags
          </p>
        </div>

        {/* Quick Top Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsBatchMode(!isBatchMode)}
            className={`px-3 py-1.5 border border-[#111111] font-mono-tech text-xs font-bold uppercase flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] ${
              isBatchMode ? 'bg-[#fe5029] text-white' : 'bg-white text-[#111111] hover:bg-[#eeeeee]'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>{isBatchMode ? 'SINGLE LABEL' : 'BATCH BIN SHEET'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrintLabel}
            className="px-3.5 py-1.5 bg-[#111111] hover:bg-[#333333] text-white border border-[#111111] font-mono-tech text-xs font-bold uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#fe5029] active:translate-x-[1px] active:translate-y-[1px] transition-all"
          >
            <Printer className="w-4 h-4 text-[#75f76e]" />
            <span>PRINT LABELS</span>
          </button>
        </div>
      </div>

      {isBatchMode ? (
        /* Batch Inventory Sheet Generator */
        <div className="space-y-4">
          <div className="p-4 bg-white border border-[#111111] shadow-[3px_3px_0px_#111111] flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-base text-[#111111]">
                BATCH INVENTORY COMPONENT SHEET
              </h2>
              <p className="font-mono-tech text-xs text-[#111111]/70">
                Generating printable grid of {inventory.length} workshop inventory items ready for Avery / Dymo / adhesive label sheets.
              </p>
            </div>
            <button
              type="button"
              onClick={handlePrintLabel}
              className="px-4 py-2 bg-[#fe5029] text-white border border-[#111111] font-mono-tech text-xs font-bold uppercase flex items-center gap-2 shadow-[2px_2px_0px_#111111]"
            >
              <Printer className="w-4 h-4" />
              PRINT FULL SHEET ({inventory.length} ITEMS)
            </button>
          </div>

          {inventory.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-[#111111] bg-white">
              <Package className="w-12 h-12 text-[#111111]/40 mx-auto mb-3" />
              <p className="font-mono-tech font-bold text-sm text-[#111111]">NO INVENTORY ITEMS FOUND</p>
              <p className="font-mono-tech text-xs text-[#111111]/60 mt-1">
                Add parts to your workshop inventory to generate an automatic batch label sheet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-2 print:gap-2">
              {inventory.map((item) => {
                const itemPayload = JSON.stringify({
                  id: item.id,
                  name: item.name,
                  sku: item.partNumber || item.id,
                  loc: item.storageLocation || 'N/A',
                });
                return (
                  <BatchLabelCard
                    key={item.id}
                    item={item}
                    payload={itemPayload}
                    errorLevel={errorLevel}
                  />
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Single QR Studio: Preset Controls + Real-Time Label Preview */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 cols): Mode Selection & Field Inputs */}
          <div className="lg:col-span-7 space-y-5">
            {/* Mode Category Selector */}
            <div className="bg-white border border-[#111111] p-3 shadow-[3px_3px_0px_#111111]">
              <label className="block font-mono-tech text-[11px] font-bold text-[#111111] uppercase mb-2">
                SELECT QR CODE ARCHETYPE //
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'inventory', label: 'INVENTORY BIN', icon: Package, desc: 'Part drawer & SKU labels' },
                  { id: 'wifi', label: 'WI-FI CONNECT', icon: Wifi, desc: 'ESP32 / IoT provisioning' },
                  { id: 'url', label: 'URL / SCHEMATIC', icon: Link, desc: 'Datasheet & GitHub links' },
                  { id: 'device', label: 'IOT DEVICE UID', icon: Cpu, desc: 'MAC, IP & Hostname tags' },
                  { id: 'vcard', label: 'MAKER VCARD', icon: User, desc: 'Workshop contact card' },
                  { id: 'text', label: 'CUSTOM TEXT', icon: FileText, desc: 'Serial keys & notes' },
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = qrType === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setQrType(t.id as QrType)}
                      className={`p-2.5 border border-[#111111] text-left transition-all flex flex-col justify-between ${
                        isActive
                          ? 'bg-[#111111] text-white shadow-[2px_2px_0px_#fe5029]'
                          : 'bg-white hover:bg-[#eeeeee] text-[#111111]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-mono-tech text-xs font-black uppercase">{t.label}</span>
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#fe5029]' : 'text-[#111111]/70'}`} />
                      </div>
                      <span className={`text-[10px] line-clamp-1 ${isActive ? 'text-white/70' : 'text-[#111111]/60'}`}>
                        {t.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mode-Specific Configuration Card */}
            <div className="bg-white border border-[#111111] p-4 shadow-[3px_3px_0px_#111111] space-y-4">
              {/* INVENTORY BIN MODE */}
              {qrType === 'inventory' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#eeeeee] pb-2">
                    <span className="font-mono-tech text-xs font-bold uppercase text-[#111111] flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-[#fe5029]" />
                      COMPONENT BIN & DRAWER CONFIG
                    </span>
                    {inventory.length > 0 && (
                      <span className="font-mono-tech text-[10px] bg-[#75f76e]/30 px-2 py-0.5 border border-[#111111] font-bold">
                        {inventory.length} INVENTORY ITEMS LOADED
                      </span>
                    )}
                  </div>

                  {inventory.length > 0 && (
                    <div>
                      <label className="block font-mono-tech text-xs font-bold text-[#111111] uppercase mb-1">
                        BIND TO EXISTING WORKSHOP INVENTORY ITEM
                      </label>
                      <select
                        value={selectedInvId}
                        onChange={(e) => setSelectedInvId(e.target.value)}
                        className="w-full p-2 border border-[#111111] font-mono-tech text-xs bg-[#f9f9f9] text-[#111111] focus:outline-none"
                      >
                        <option value="">-- Or enter custom part fields below --</option>
                        {inventory.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} | {item.partNumber || item.id} | Loc: {item.storageLocation || 'N/A'} (Qty: {item.quantity})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#111111] uppercase mb-1">
                        COMPONENT / PART NAME
                      </label>
                      <input
                        type="text"
                        value={customPartName}
                        onChange={(e) => setCustomPartName(e.target.value)}
                        disabled={!!selectedInvId}
                        placeholder="e.g. ATmega328P-PU DIP-28"
                        className="w-full p-2 border border-[#111111] font-mono-tech text-xs disabled:bg-[#eeeeee]"
                      />
                    </div>

                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#111111] uppercase mb-1">
                        PART NUMBER / SKU
                      </label>
                      <input
                        type="text"
                        value={customPartSku}
                        onChange={(e) => setCustomPartSku(e.target.value)}
                        disabled={!!selectedInvId}
                        placeholder="e.g. IC-ATM-328P"
                        className="w-full p-2 border border-[#111111] font-mono-tech text-xs disabled:bg-[#eeeeee]"
                      />
                    </div>

                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#111111] uppercase mb-1">
                        DRAWER / BIN LOCATION
                      </label>
                      <input
                        type="text"
                        value={customPartLocation}
                        onChange={(e) => setCustomPartLocation(e.target.value)}
                        disabled={!!selectedInvId}
                        placeholder="e.g. BIN-C03-TRAY-2"
                        className="w-full p-2 border border-[#111111] font-mono-tech text-xs disabled:bg-[#eeeeee]"
                      />
                    </div>

                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#111111] uppercase mb-1">
                        CATEGORY / PACKAGE
                      </label>
                      <input
                        type="text"
                        value={customPartCategory}
                        onChange={(e) => setCustomPartCategory(e.target.value)}
                        disabled={!!selectedInvId}
                        placeholder="e.g. Microcontrollers / DIP-28"
                        className="w-full p-2 border border-[#111111] font-mono-tech text-xs disabled:bg-[#eeeeee]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* WI-FI HOTSPOT MODE */}
              {qrType === 'wifi' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#eeeeee] pb-2">
                    <span className="font-mono-tech text-xs font-bold uppercase text-[#111111] flex items-center gap-1.5">
                      <Wifi className="w-4 h-4 text-[#fe5029]" />
                      WI-FI & ESP32 SOFTAP PROVISIONING
                    </span>
                    <span className="font-mono-tech text-[10px] text-[#111111]/70">
                      Standardized QR code auto-connect
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#111111] uppercase mb-1">
                        NETWORK SSID
                      </label>
                      <input
                        type="text"
                        value={wifiSsid}
                        onChange={(e) => setWifiSsid(e.target.value)}
                        placeholder="e.g. MakerLab_2.4G"
                        className="w-full p-2 border border-[#111111] font-mono-tech text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#111111] uppercase mb-1">
                        PASSWORD
                      </label>
                      <input
                        type="text"
                        value={wifiPassword}
                        onChange={(e) => setWifiPassword(e.target.value)}
                        placeholder="e.g. password123"
                        className="w-full p-2 border border-[#111111] font-mono-tech text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#111111] uppercase mb-1">
                        ENCRYPTION TYPE
                      </label>
                      <select
                        value={wifiEncryption}
                        onChange={(e) => setWifiEncryption(e.target.value as any)}
                        className="w-full p-2 border border-[#111111] font-mono-tech text-xs bg-white"
                      >
                        <option value="WPA">WPA / WPA2 / WPA3 (Default)</option>
                        <option value="WEP">WEP (Legacy)</option>
                        <option value="nopass">None / Open Network</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="wifi-hidden-check"
                        checked={wifiHidden}
                        onChange={(e) => setWifiHidden(e.target.checked)}
                        className="w-4 h-4 accent-[#fe5029]"
                      />
                      <label htmlFor="wifi-hidden-check" className="font-mono-tech text-xs font-bold text-[#111111] cursor-pointer">
                        HIDDEN SSID NETWORK
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* URL MODE */}
              {qrType === 'url' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#eeeeee] pb-2">
                    <span className="font-mono-tech text-xs font-bold uppercase text-[#111111] flex items-center gap-1.5">
                      <Link className="w-4 h-4 text-[#fe5029]" />
                      WEB LINK & DATASHEET PORTAL
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#111111] uppercase mb-1">
                        TARGET URL
                      </label>
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://..."
                        className="w-full p-2 border border-[#111111] font-mono-tech text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#111111] uppercase mb-1">
                        LABEL HEADER TITLE
                      </label>
                      <input
                        type="text"
                        value={urlLabel}
                        onChange={(e) => setUrlLabel(e.target.value)}
                        placeholder="e.g. Raspberry Pi Pico Datasheet"
                        className="w-full p-2 border border-[#111111] font-mono-tech text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* DEVICE / IOT MODE */}
              {qrType === 'device' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#eeeeee] pb-2">
                    <span className="font-mono-tech text-xs font-bold uppercase text-[#111111] flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-[#fe5029]" />
                      IOT NODE & HARDWARE TELEMETRY TAG
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#111111] uppercase mb-1">
                        HOSTNAME / NODE ID
                      </label>
                      <input
                        type="text"
                        value={deviceHostname}
                        onChange={(e) => setDeviceHostname(e.target.value)}
                        placeholder="esp32-sensor-01"
                        className="w-full p-2 border border-[#111111] font-mono-tech text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#111111] uppercase mb-1">
                        MAC ADDRESS
                      </label>
                      <input
                        type="text"
                        value={deviceMac}
                        onChange={(e) => setDeviceMac(e.target.value)}
                        placeholder="AA:BB:CC:11:22:33"
                        className="w-full p-2 border border-[#111111] font-mono-tech text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#111111] uppercase mb-1">
                        STATIC IP ADDRESS
                      </label>
                      <input
                        type="text"
                        value={deviceIp}
                        onChange={(e) => setDeviceIp(e.target.value)}
                        placeholder="192.168.1.50"
                        className="w-full p-2 border border-[#111111] font-mono-tech text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* VCARD MODE */}
              {qrType === 'vcard' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#eeeeee] pb-2">
                    <span className="font-mono-tech text-xs font-bold uppercase text-[#111111] flex items-center gap-1.5">
                      <User className="w-4 h-4 text-[#fe5029]" />
                      MAKER DIGITAL VCARD
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#111111] uppercase mb-1">
                        FULL NAME
                      </label>
                      <input
                        type="text"
                        value={vcardName}
                        onChange={(e) => setVcardName(e.target.value)}
                        className="w-full p-2 border border-[#111111] font-mono-tech text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#111111] uppercase mb-1">
                        TITLE / SPECIALTY
                      </label>
                      <input
                        type="text"
                        value={vcardRole}
                        onChange={(e) => setVcardRole(e.target.value)}
                        className="w-full p-2 border border-[#111111] font-mono-tech text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#111111] uppercase mb-1">
                        ORGANIZATION / LAB
                      </label>
                      <input
                        type="text"
                        value={vcardOrg}
                        onChange={(e) => setVcardOrg(e.target.value)}
                        className="w-full p-2 border border-[#111111] font-mono-tech text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#111111] uppercase mb-1">
                        EMAIL
                      </label>
                      <input
                        type="email"
                        value={vcardEmail}
                        onChange={(e) => setVcardEmail(e.target.value)}
                        className="w-full p-2 border border-[#111111] font-mono-tech text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* RAW TEXT MODE */}
              {qrType === 'text' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#eeeeee] pb-2">
                    <span className="font-mono-tech text-xs font-bold uppercase text-[#111111] flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#fe5029]" />
                      RAW PAYLOAD & SERIAL KEY
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#111111] uppercase mb-1">
                        STICKER HEADER
                      </label>
                      <input
                        type="text"
                        value={rawTextTitle}
                        onChange={(e) => setRawTextTitle(e.target.value)}
                        className="w-full p-2 border border-[#111111] font-mono-tech text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#111111] uppercase mb-1">
                        RAW STRING CONTENT
                      </label>
                      <textarea
                        rows={3}
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        className="w-full p-2 border border-[#111111] font-mono-tech text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* QR Styling & Error Correction Controls */}
            <div className="bg-white border border-[#111111] p-4 shadow-[3px_3px_0px_#111111] space-y-3">
              <span className="font-mono-tech text-xs font-bold uppercase text-[#111111] flex items-center gap-1.5 border-b border-[#eeeeee] pb-2">
                <Sliders className="w-4 h-4 text-[#fe5029]" />
                VECTOR STYLING & ERROR RESILIENCE
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-mono-tech text-[10px] font-bold text-[#111111] uppercase mb-1">
                    ERROR CORRECTION
                  </label>
                  <select
                    value={errorLevel}
                    onChange={(e) => setErrorLevel(e.target.value as any)}
                    className="w-full p-1.5 border border-[#111111] font-mono-tech text-xs bg-white"
                  >
                    <option value="L">L (7% Recovery)</option>
                    <option value="M">M (15% Recovery)</option>
                    <option value="Q">Q (25% Recovery)</option>
                    <option value="H">H (30% Workshop High)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono-tech text-[10px] font-bold text-[#111111] uppercase mb-1">
                    FOREGROUND COLOR
                  </label>
                  <div className="flex items-center gap-1 border border-[#111111] p-1 bg-white">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-6 h-6 border-0 cursor-pointer"
                    />
                    <span className="font-mono-tech text-[10px] font-bold">{fgColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block font-mono-tech text-[10px] font-bold text-[#111111] uppercase mb-1">
                    BACKGROUND COLOR
                  </label>
                  <div className="flex items-center gap-1 border border-[#111111] p-1 bg-white">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-6 h-6 border-0 cursor-pointer"
                    />
                    <span className="font-mono-tech text-[10px] font-bold">{bgColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block font-mono-tech text-[10px] font-bold text-[#111111] uppercase mb-1">
                    LABEL CUT FORMAT
                  </label>
                  <select
                    value={labelPreset}
                    onChange={(e) => setLabelPreset(e.target.value as any)}
                    className="w-full p-1.5 border border-[#111111] font-mono-tech text-xs bg-white"
                  >
                    <option value="bin-50x25">50 × 25 mm (Parts Bin)</option>
                    <option value="tote-70x36">70 × 36 mm (Storage Tote)</option>
                    <option value="square-compact">35 × 35 mm (Compact)</option>
                    <option value="dymo-30334">Dymo 30334 2-1/4" × 1-1/4"</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Live Sticker Preview & Action Panel */}
          <div className="lg:col-span-5 space-y-5">
            {/* Live Physical Label Card Preview */}
            <div className="bg-white border border-[#111111] p-4 shadow-[4px_4px_0px_#111111]">
              <div className="flex items-center justify-between border-b border-[#eeeeee] pb-2 mb-3">
                <span className="font-mono-tech text-xs font-bold uppercase text-[#111111] flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-[#fe5029]" />
                  PHYSICAL STICKER PREVIEW
                </span>
                <span className="font-mono-tech text-[10px] bg-[#111111] text-white px-2 py-0.5 font-bold uppercase">
                  {labelPreset}
                </span>
              </div>

              {/* Printable Component Sticker Frame */}
              <div
                ref={labelPrintRef}
                className="border-2 border-dashed border-[#111111] bg-white p-3 shadow-inner relative flex flex-col justify-between"
                style={{
                  minHeight: labelPreset === 'bin-50x25' ? '180px' : labelPreset === 'tote-70x36' ? '220px' : '200px',
                }}
              >
                {/* Header Strip */}
                <div className="flex items-center justify-between border-b border-[#111111] pb-1.5 mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 bg-[#fe5029] border border-[#111111] flex items-center justify-center text-white text-[8px] font-black">
                      M
                    </div>
                    <span className="font-mono-tech text-[9px] font-black tracking-wider text-[#111111] uppercase">
                      MAKEO DIGITAL WORKSHOP
                    </span>
                  </div>
                  <span className="font-mono-tech text-[8px] font-bold text-[#111111]/70">
                    ID: {Date.now().toString().slice(-6)}
                  </span>
                </div>

                {/* Body Content with QR on Right and Metadata on Left */}
                <div className="flex items-center gap-3">
                  {/* Left Metadata Text */}
                  <div className="flex-1 space-y-1 overflow-hidden">
                    <h3 className="font-display font-black text-sm text-[#111111] leading-tight truncate">
                      {labelInfo.title}
                    </h3>
                    <p className="font-mono-tech text-[10px] font-bold text-[#111111]/80 truncate">
                      {labelInfo.subtitle}
                    </p>
                    <div className="inline-block bg-[#111111] text-white font-mono-tech text-[9px] font-bold px-1.5 py-0.5 uppercase">
                      LOC: {labelInfo.loc}
                    </div>
                    <p className="font-mono-tech text-[8px] text-[#111111]/70 truncate pt-0.5">
                      {labelInfo.extra}
                    </p>
                  </div>

                  {/* QR Image */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 border border-[#111111] p-1 bg-white flex items-center justify-center">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="QR Code"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#eeeeee] flex items-center justify-center font-mono-tech text-[9px]">
                        GENERATING...
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Barcode / Hash indicator */}
                <div className="mt-2 pt-1 border-t border-[#111111] flex items-center justify-between text-[8px] font-mono-tech text-[#111111]/60">
                  <span>QC PASSED</span>
                  <span>ECC: {errorLevel}</span>
                  <span className="truncate max-w-[120px]">FORMAT: {qrType.toUpperCase()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  disabled={!qrDataUrl}
                  className="py-2 px-3 border border-[#111111] bg-white hover:bg-[#eeeeee] text-[#111111] font-mono-tech text-xs font-bold uppercase flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PNG IMAGE</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  disabled={!qrSvgString}
                  className="py-2 px-3 border border-[#111111] bg-white hover:bg-[#eeeeee] text-[#111111] font-mono-tech text-xs font-bold uppercase flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-[#fe5029]" />
                  <span>VECTOR SVG</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyPayload}
                  className="py-2 px-3 border border-[#111111] bg-white hover:bg-[#eeeeee] text-[#111111] font-mono-tech text-xs font-bold uppercase flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'COPIED!' : 'COPY PAYLOAD'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintLabel}
                  className="py-2 px-3 bg-[#fe5029] hover:bg-[#e4421d] text-white border border-[#111111] font-mono-tech text-xs font-bold uppercase flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>PRINT NOW</span>
                </button>
              </div>
            </div>

            {/* Encoded Raw Payload Inspector */}
            <div className="bg-[#f9f9f9] border border-[#111111] p-3 shadow-[2px_2px_0px_#111111]">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono-tech text-[10px] font-bold text-[#111111] uppercase flex items-center gap-1">
                  <Hash className="w-3 h-3 text-[#fe5029]" />
                  RAW QR PAYLOAD ({encodedPayload.length} BYTES)
                </span>
                <span className="font-mono-tech text-[9px] text-[#111111]/60">ISO/IEC 18004</span>
              </div>
              <pre className="p-2 bg-white border border-[#eeeeee] font-mono text-[10px] text-[#111111] break-all whitespace-pre-wrap max-h-24 overflow-y-auto">
                {encodedPayload}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Batch individual label component
const BatchLabelCard: React.FC<{
  item: InventoryItem;
  payload: string;
  errorLevel: 'L' | 'M' | 'Q' | 'H';
}> = ({ item, payload, errorLevel }) => {
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    QRCode.toDataURL(payload, {
      errorCorrectionLevel: errorLevel,
      width: 160,
      margin: 1,
    }).then((url) => setDataUrl(url));
  }, [payload, errorLevel]);

  return (
    <div className="border-2 border-dashed border-[#111111] p-3 bg-white flex items-center justify-between gap-2 shadow-[2px_2px_0px_#111111]">
      <div className="flex-1 space-y-1 min-w-0">
        <span className="font-mono-tech text-[8px] bg-[#111111] text-white px-1 py-0.2 font-bold uppercase">
          {item.category}
        </span>
        <h4 className="font-display font-black text-xs text-[#111111] truncate">{item.name}</h4>
        <p className="font-mono-tech text-[9px] text-[#111111]/70 truncate">
          SKU: {item.partNumber || item.id.slice(0, 8)}
        </p>
        <p className="font-mono-tech text-[9px] font-bold text-[#fe5029]">
          LOC: {item.storageLocation || 'UNASSIGNED'} | QTY: {item.quantity}
        </p>
      </div>

      <div className="w-18 h-18 shrink-0 border border-[#111111] p-0.5 bg-white">
        {dataUrl ? (
          <img src={dataUrl} alt={item.name} className="w-full h-full object-contain" />
        ) : (
          <div className="w-full h-full bg-[#eeeeee]" />
        )}
      </div>
    </div>
  );
};
