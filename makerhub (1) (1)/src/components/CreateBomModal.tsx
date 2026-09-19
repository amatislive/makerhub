import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { BomItem, BomStatus, InventoryItem } from '../types';

interface CreateBomModalProps {
  isOpen: boolean;
  projectId: string;
  inventory: InventoryItem[];
  onClose: () => void;
  onSubmit: (data: Partial<BomItem>) => void;
}

export const CreateBomModal: React.FC<CreateBomModalProps> = ({
  isOpen,
  projectId,
  inventory,
  onClose,
  onSubmit,
}) => {
  const [selectedInventoryId, setSelectedInventoryId] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Hardware');
  const [quantity, setQuantity] = useState(1);
  const [unitCost, setUnitCost] = useState('');
  const [status, setStatus] = useState<BomStatus>('needed');
  const [supplier, setSupplier] = useState('');
  const [partNumber, setPartNumber] = useState('');

  if (!isOpen) return null;

  const handleSelectInventory = (invId: string) => {
    setSelectedInventoryId(invId);
    if (!invId) return;
    const inv = inventory.find((i) => i.id === invId);
    if (inv) {
      setName(inv.name);
      setCategory(inv.category);
      if (inv.purchaseCost !== null && inv.purchaseCost !== undefined) {
        setUnitCost(inv.purchaseCost.toString());
      }
      if (inv.partNumber) setPartNumber(inv.partNumber);
      if (inv.manufacturer) setSupplier(inv.manufacturer);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      projectId,
      inventoryId: selectedInventoryId || undefined,
      name,
      category,
      quantity: Number(quantity) || 1,
      unitCost: unitCost ? parseFloat(unitCost) : null,
      status,
      supplier: supplier || undefined,
      partNumber: partNumber || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden text-xs">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-neutral-900">Add Bill of Materials Component</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {inventory.length > 0 && (
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Pick from Workshop Inventory (Optional)</label>
              <select
                value={selectedInventoryId}
                onChange={(e) => handleSelectInventory(e.target.value)}
                className="w-full p-2 border border-neutral-200 rounded-lg bg-white"
              >
                <option value="">-- Manual Entry or Select Part --</option>
                {inventory.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.name} ({inv.quantity} in stock)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="font-semibold text-neutral-700 block mb-1">Part / Component Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. NEMA 17 Stepper Motor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-neutral-200 rounded-lg text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Quantity Required</label>
              <input
                type="number"
                min={1}
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full p-2 border border-neutral-200 rounded-lg"
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Unit Cost ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Leave blank if not entered"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                className="w-full p-2 border border-neutral-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BomStatus)}
                className="w-full p-2 border border-neutral-200 rounded-lg bg-white"
              >
                <option value="needed">Needed</option>
                <option value="ordered">Ordered</option>
                <option value="in_stock">In Stock</option>
                <option value="used">Used / Installed</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border border-neutral-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Supplier / Store</label>
              <input
                type="text"
                placeholder="DigiKey, Adafruit, Mouser"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full p-2 border border-neutral-200 rounded-lg"
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Part Number</label>
              <input
                type="text"
                placeholder="MPN / SKU"
                value={partNumber}
                onChange={(e) => setPartNumber(e.target.value)}
                className="w-full p-2 border border-neutral-200 rounded-lg"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-[#fe5029] text-white rounded-lg hover:bg-[#e4421d]"
            >
              Add to BOM
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
