import React, { useState } from 'react';
import { PlacedComponent } from '../../types/circuit';
import { X, Copy, Download, Check, Layers, AlertCircle, Package } from 'lucide-react';

interface CircuitBomModalProps {
  isOpen: boolean;
  onClose: () => void;
  components: PlacedComponent[];
  inventoryItems?: Array<{ id: string; name: string; quantity: number; location?: string }>;
}

export const CircuitBomModal: React.FC<CircuitBomModalProps> = ({
  isOpen,
  onClose,
  components,
  inventoryItems = [],
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Aggregate BOM items
  interface BomItem {
    key: string;
    type: string;
    value: string;
    unit: string;
    designators: string[];
    quantity: number;
    category: string;
    inStockQty?: number;
    stockLocation?: string;
  }

  const bomMap: Record<string, BomItem> = {};

  components.forEach((comp) => {
    const key = `${comp.type}_${comp.value}_${comp.unit || ''}`;
    if (!bomMap[key]) {
      // Find matching inventory
      const matchedInv = inventoryItems.find(
        (inv) =>
          inv.name.toLowerCase().includes(comp.name.toLowerCase()) ||
          inv.name.toLowerCase().includes(comp.type.toLowerCase())
      );

      bomMap[key] = {
        key,
        type: comp.type.replace(/_/g, ' ').toUpperCase(),
        value: comp.value,
        unit: comp.unit || '',
        designators: [comp.name],
        quantity: 1,
        category: comp.category,
        inStockQty: matchedInv ? matchedInv.quantity : undefined,
        stockLocation: matchedInv ? matchedInv.location : undefined,
      };
    } else {
      bomMap[key].designators.push(comp.name);
      bomMap[key].quantity += 1;
    }
  });

  const bomList = Object.values(bomMap);

  const handleCopy = () => {
    const text = [
      'ITEM,DESIGNATORS,TYPE,VALUE,QTY,CATEGORY',
      ...bomList.map(
        (item, i) =>
          `${i + 1},"${item.designators.join(', ')}",${item.type},${item.value}${item.unit ? ' ' + item.unit : ''},${item.quantity},${item.category}`
      ),
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        'Item,Designators,Type,Value,Quantity,Category',
        ...bomList.map(
          (item, i) =>
            `${i + 1},"${item.designators.join(', ')}",${item.type},${item.value}${item.unit ? ' ' + item.unit : ''},${item.quantity},${item.category}`
        ),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'circuit_bom.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border-2 border-[#111111] shadow-[6px_6px_0px_#111111] w-full max-w-3xl flex flex-col max-h-[85vh] font-mono-tech">
        {/* Header */}
        <div className="p-3 bg-[#111111] text-white flex items-center justify-between border-b border-[#111111]">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#fe5029]" />
            <span className="font-black text-sm uppercase tracking-wide">
              BILL OF MATERIALS (BOM) // COMPONENT REPORT
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action bar */}
        <div className="p-3 bg-[#f5f5f5] border-b border-[#111111] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#111111]">
              TOTAL UNIQUE PARTS: {bomList.length}
            </span>
            <span className="text-[#111111]/50">//</span>
            <span className="text-[#111111]/70">
              TOTAL COMPONENT COUNT: {components.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 border border-[#111111] bg-white hover:bg-[#eeeeee] flex items-center gap-1.5 font-bold shadow-[2px_2px_0px_#111111] transition-transform active:translate-x-0.5 active:translate-y-0.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'COPIED CSV' : 'COPY BOM'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="px-3 py-1.5 border border-[#111111] bg-[#fe5029] text-white hover:bg-[#e0431f] flex items-center gap-1.5 font-bold shadow-[2px_2px_0px_#111111] transition-transform active:translate-x-0.5 active:translate-y-0.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>EXPORT CSV</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {bomList.length === 0 ? (
            <div className="p-8 text-center text-[#111111]/50 border border-dashed border-[#111111]/20">
              No components placed in circuit yet. Add components from the palette to generate BOM.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-[#111111] bg-[#eeeeee] text-[10px] uppercase font-bold text-[#111111]">
                  <th className="p-2 w-10">#</th>
                  <th className="p-2">Designator(s)</th>
                  <th className="p-2">Component Type</th>
                  <th className="p-2">Value / Spec</th>
                  <th className="p-2 text-center w-16">Qty</th>
                  <th className="p-2">Workshop Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeeeee]">
                {bomList.map((item, idx) => (
                  <tr key={item.key} className="hover:bg-[#fafafa] transition-colors">
                    <td className="p-2 font-bold text-[#111111]/60">{idx + 1}</td>
                    <td className="p-2 font-black text-[#111111]">
                      {item.designators.join(', ')}
                    </td>
                    <td className="p-2 text-[#111111]/80">{item.type}</td>
                    <td className="p-2 font-bold text-[#fe5029]">
                      {item.value} {item.unit}
                    </td>
                    <td className="p-2 text-center font-black bg-[#eeeeee]/40">
                      {item.quantity}
                    </td>
                    <td className="p-2">
                      {item.inStockQty !== undefined ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-green-700 font-bold">
                          <Package className="w-3 h-3" />
                          {item.inStockQty} in stock {item.stockLocation && `(${item.stockLocation})`}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400">Available in catalog</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-2 bg-[#f5f5f5] border-t border-[#111111] text-[10px] text-[#111111]/60 flex items-center justify-between">
          <span>MAKEO CIRCUIT LAB // INVENTORY INTEGRATION</span>
          <span>STANDARD EIA / IEC NUMBERING</span>
        </div>
      </div>
    </div>
  );
};
