import React, { useState } from 'react';
import {
  Cpu,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Trash2,
  Edit2,
  ExternalLink,
  MapPin,
  Tag,
  DollarSign,
  PackageCheck,
  PackageX
} from 'lucide-react';
import { InventoryItem, ComponentCategory } from '../types';
import { EmptyState } from './EmptyState';

interface InventoryViewProps {
  inventory: InventoryItem[];
  onOpenCreateItem: () => void;
  onDeleteItem: (id: string) => void;
  onUpdateQuantity: (id: string, newQty: number) => void;
  onImportCsv: (csvData: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  onOpenCreateItem,
  onDeleteItem,
  onUpdateQuantity,
  onImportCsv,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvText, setCsvText] = useState('');

  const filteredItems = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.partNumber && item.partNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.manufacturer && item.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.storageLocation && item.storageLocation.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

    let matchesStock = true;
    const isOut = item.quantity <= 0;
    const isLow =
      !isOut && item.minStockLevel !== null && item.minStockLevel !== undefined && item.quantity <= item.minStockLevel;

    if (stockFilter === 'in_stock') matchesStock = !isOut && !isLow;
    if (stockFilter === 'low_stock') matchesStock = isLow;
    if (stockFilter === 'out_of_stock') matchesStock = isOut;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const getStockBadge = (item: InventoryItem) => {
    if (item.quantity <= 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
          <PackageX className="w-3 h-3" />
          <span>Out of stock</span>
        </span>
      );
    }
    if (
      item.minStockLevel !== null &&
      item.minStockLevel !== undefined &&
      item.quantity <= item.minStockLevel
    ) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-3 h-3" />
          <span>Low stock ({item.quantity}/{item.minStockLevel})</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
        <PackageCheck className="w-3 h-3" />
        <span>In stock</span>
      </span>
    );
  };

  const handleExportCsv = () => {
    if (inventory.length === 0) return;
    const headers = ['Name', 'Category', 'Quantity', 'Unit', 'Storage Location', 'Manufacturer', 'Part Number', 'Unit Cost', 'Min Stock'];
    const rows = inventory.map((i) => [
      `"${i.name.replace(/"/g, '""')}"`,
      i.category,
      i.quantity,
      i.unit,
      `"${(i.storageLocation || '').replace(/"/g, '""')}"`,
      `"${(i.manufacturer || '').replace(/"/g, '""')}"`,
      `"${(i.partNumber || '').replace(/"/g, '""')}"`,
      i.purchaseCost !== null && i.purchaseCost !== undefined ? i.purchaseCost : '',
      i.minStockLevel !== null && i.minStockLevel !== undefined ? i.minStockLevel : '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `makerhub-inventory-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleProcessImport = () => {
    if (!csvText.trim()) return;
    onImportCsv(csvText);
    setCsvText('');
    setShowImportModal(false);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Inventory & Components
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500">
            Track microcontrollers, sensors, passive components, filaments, and workshop tools.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {inventory.length > 0 && (
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}

          <button
            id="inventory-import-btn"
            type="button"
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>

          <button
            id="inventory-add-btn"
            type="button"
            onClick={onOpenCreateItem}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-[#fe5029] text-white hover:bg-[#e4421d] transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Component</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      {inventory.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-3 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              id="inventory-search-input"
              type="text"
              placeholder="Search components by name, part number, bin location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-neutral-200 rounded-lg focus:outline-hidden focus:border-[#fe5029]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-neutral-200 rounded-lg bg-white text-neutral-700"
            >
              <option value="all">All Categories</option>
              <option value="microcontroller">Microcontrollers</option>
              <option value="sensor">Sensors</option>
              <option value="resistor">Resistors</option>
              <option value="capacitor">Capacitors</option>
              <option value="motor">Motors</option>
              <option value="display">Displays</option>
              <option value="connector">Connectors</option>
              <option value="wire">Wires</option>
              <option value="filament">Filaments</option>
              <option value="tool">Tools</option>
              <option value="custom">Custom</option>
            </select>

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-neutral-200 rounded-lg bg-white text-neutral-700"
            >
              <option value="all">All Stock Levels</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>
      )}

      {/* Inventory List or Contextual Empty State */}
      {inventory.length === 0 ? (
        <EmptyState
          icon={Cpu}
          title="Your inventory is empty."
          description="Add your electronic components, microcontrollers, sensors, 3D filaments, and workshop tools to keep track of stock levels."
          primaryAction={{
            label: 'Add Component',
            onClick: onOpenCreateItem,
            icon: Plus,
          }}
          secondaryAction={{
            label: 'Import CSV',
            onClick: () => setShowImportModal(true),
            icon: FileSpreadsheet,
          }}
          accentColor="green"
        />
      ) : filteredItems.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-neutral-200">
          <p className="text-sm font-medium text-neutral-700">No components match your filter.</p>
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setCategoryFilter('all'); setStockFilter('all'); }}
            className="mt-2 text-xs text-[#fe5029] font-medium hover:underline"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/75 text-neutral-500 font-semibold uppercase text-[10px]">
                  <th className="p-3">Component / Part</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Stock Level</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Unit Cost</th>
                  <th className="p-3">Datasheet</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="p-3">
                      <div className="font-semibold text-neutral-900 text-sm">{item.name}</div>
                      <div className="text-[11px] text-neutral-400">
                        {item.manufacturer ? `${item.manufacturer} • ` : ''}
                        {item.partNumber || 'No part number'}
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600">
                        {item.category.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-neutral-900">
                          {item.quantity} {item.unit}
                        </span>
                        {getStockBadge(item)}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                          className="w-5 h-5 rounded-sm border border-neutral-200 text-neutral-600 hover:bg-neutral-100 flex items-center justify-center font-bold text-xs"
                          title="Decrease 1"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-5 h-5 rounded-sm border border-neutral-200 text-neutral-600 hover:bg-neutral-100 flex items-center justify-center font-bold text-xs"
                          title="Increase 1"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td className="p-3">
                      {item.storageLocation ? (
                        <span className="inline-flex items-center gap-1 text-neutral-700">
                          <MapPin className="w-3 h-3 text-neutral-400" />
                          <span>{item.storageLocation}</span>
                        </span>
                      ) : (
                        <span className="text-neutral-400 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="p-3 text-neutral-700 font-medium">
                      {item.purchaseCost !== null && item.purchaseCost !== undefined
                        ? `$${item.purchaseCost.toFixed(2)}`
                        : <span className="text-neutral-400 italic">Cost not entered</span>}
                    </td>

                    <td className="p-3">
                      {item.datasheetUrl ? (
                        <a
                          href={item.datasheetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <span>PDF / Doc</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>

                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                        title="Delete component"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CSV Import Dialog */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-neutral-200 p-6 space-y-4">
            <h3 className="text-base font-semibold text-neutral-900">Import Components (CSV)</h3>
            <p className="text-xs text-neutral-500">
              Paste CSV records below. Format: <code>Name, Category, Quantity, Unit, Location, Cost</code>
            </p>
            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="ESP32 DevKit, microcontroller, 4, pcs, Bin A1, 5.50&#10;10k Resistor 1/4W, resistor, 100, pcs, Drawer 3, 0.02"
              className="w-full p-3 font-mono text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-[#fe5029]"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessImport}
                disabled={!csvText.trim()}
                className="px-4 py-1.5 text-xs font-semibold bg-[#fe5029] text-white rounded-lg hover:bg-[#e4421d] disabled:opacity-50"
              >
                Import Items
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
