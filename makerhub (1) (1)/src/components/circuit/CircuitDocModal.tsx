import React from 'react';
import { PlacedComponent, WireConnection, SimulationOutput } from '../../types/circuit';
import { CircuitGraph } from '../../utils/spiceEngine';
import { X, Printer, FileText, CheckCircle2, ShieldAlert, Cpu, Zap, Download } from 'lucide-react';

interface CircuitDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  circuitName: string;
  circuitDescription: string;
  components: PlacedComponent[];
  wires: WireConnection[];
  graph?: CircuitGraph | null;
  simulation: SimulationOutput | null;
}

export const CircuitDocModal: React.FC<CircuitDocModalProps> = ({
  isOpen,
  onClose,
  circuitName,
  circuitDescription,
  components,
  wires,
  graph,
  simulation,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const totalPowerW = simulation?.dc
    ? Object.values(simulation.dc.componentPowers).reduce((sum, p) => sum + (p || 0), 0)
    : 0;

  const maxVolt = simulation?.dc
    ? Math.max(...Object.values(simulation.dc.nodeVoltages), 5)
    : 5;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:bg-white">
      <div className="bg-white border-2 border-[#111111] shadow-[6px_6px_0px_#111111] w-full max-w-4xl flex flex-col max-h-[90vh] font-mono-tech print:border-none print:shadow-none print:max-h-none">
        {/* Modal Header */}
        <div className="p-3 bg-[#111111] text-white flex items-center justify-between border-b border-[#111111] print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#fe5029]" />
            <span className="font-black text-sm uppercase tracking-wide">
              CIRCUIT DESIGN SPECIFICATION &amp; DATASHEET
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1 bg-[#fe5029] text-white hover:bg-[#e0431f] flex items-center gap-1.5 font-bold text-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PRINT DATASHEET</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Datasheet Page Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-[#111111] bg-white">
          {/* Engineering Title Block */}
          <div className="border-2 border-[#111111] p-4 flex justify-between items-start">
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-[#fe5029] uppercase tracking-wider">
                MAKEO HARDWARE ENGINEERING LAB
              </div>
              <h1 className="text-xl font-black uppercase text-[#111111]">
                {circuitName || 'CIRCUIT WORKBENCH DESIGN'}
              </h1>
              <p className="text-[11px] text-[#111111]/70 max-w-md">
                {circuitDescription || 'Interactive hardware prototyping and SPICE-validated circuit blueprint.'}
              </p>
            </div>

            <div className="text-right space-y-0.5 text-[10px] text-[#111111]/80">
              <div><span className="font-bold">DOC ID:</span> MK-ELEC-{Date.now().toString().slice(-6)}</div>
              <div><span className="font-bold">DATE:</span> {new Date().toLocaleDateString()}</div>
              <div><span className="font-bold">STATUS:</span> {simulation?.status === 'complete' ? 'SPICE VERIFIED' : 'PROTOTYPE'}</div>
              <div><span className="font-bold">REVISION:</span> 1.0.0</div>
            </div>
          </div>

          {/* Section 1: Electrical Specifications */}
          <div className="space-y-2">
            <h2 className="text-xs font-black uppercase text-[#111111] border-b border-[#111111] pb-1 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#fe5029]" />
              1. ELECTRICAL RATINGS &amp; OPERATING CHARACTERISTICS
            </h2>
            <table className="w-full text-left text-xs border border-[#111111]">
              <thead className="bg-[#eeeeee] border-b border-[#111111] text-[10px]">
                <tr>
                  <th className="p-1.5 border-r border-[#111111]">PARAMETER</th>
                  <th className="p-1.5 border-r border-[#111111]">MIN</th>
                  <th className="p-1.5 border-r border-[#111111]">TYPICAL</th>
                  <th className="p-1.5 border-r border-[#111111]">MAX</th>
                  <th className="p-1.5">UNIT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeeeee]">
                <tr>
                  <td className="p-1.5 font-bold border-r border-[#111111]">Supply Voltage (VCC)</td>
                  <td className="p-1.5 border-r border-[#111111]">3.3</td>
                  <td className="p-1.5 border-r border-[#111111]">5.0</td>
                  <td className="p-1.5 border-r border-[#111111]">{maxVolt.toFixed(1)}</td>
                  <td className="p-1.5">V</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-bold border-r border-[#111111]">Total Power Dissipation</td>
                  <td className="p-1.5 border-r border-[#111111]">--</td>
                  <td className="p-1.5 border-r border-[#111111]">{(totalPowerW * 1000).toFixed(1)}</td>
                  <td className="p-1.5 border-r border-[#111111]">500.0</td>
                  <td className="p-1.5">mW</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-bold border-r border-[#111111]">Operating Temperature</td>
                  <td className="p-1.5 border-r border-[#111111]">-20</td>
                  <td className="p-1.5 border-r border-[#111111]">25</td>
                  <td className="p-1.5 border-r border-[#111111]">+70</td>
                  <td className="p-1.5">°C</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-bold border-r border-[#111111]">Electrical Nets Count</td>
                  <td className="p-1.5 border-r border-[#111111]">--</td>
                  <td className="p-1.5 border-r border-[#111111]">{graph?.nets.length || 0}</td>
                  <td className="p-1.5 border-r border-[#111111]">--</td>
                  <td className="p-1.5">nets</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 2: Component Designator Table */}
          <div className="space-y-2">
            <h2 className="text-xs font-black uppercase text-[#111111] border-b border-[#111111] pb-1 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#fe5029]" />
              2. BILL OF MATERIALS &amp; COMPONENT LIST
            </h2>
            <table className="w-full text-left text-xs border border-[#111111]">
              <thead className="bg-[#eeeeee] border-b border-[#111111] text-[10px]">
                <tr>
                  <th className="p-1.5 border-r border-[#111111]">DESIGNATOR</th>
                  <th className="p-1.5 border-r border-[#111111]">TYPE</th>
                  <th className="p-1.5 border-r border-[#111111]">VALUE / RATING</th>
                  <th className="p-1.5 border-r border-[#111111]">PINS</th>
                  <th className="p-1.5">POWER DISSIPATION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeeeee]">
                {components.map((comp) => {
                  const pwr = simulation?.dc?.componentPowers[comp.name] || 0;
                  return (
                    <tr key={comp.id}>
                      <td className="p-1.5 font-bold border-r border-[#111111]">{comp.name}</td>
                      <td className="p-1.5 border-r border-[#111111] text-[#111111]/80">{comp.type}</td>
                      <td className="p-1.5 font-bold text-[#fe5029] border-r border-[#111111]">
                        {comp.value} {comp.unit || ''}
                      </td>
                      <td className="p-1.5 border-r border-[#111111]">{comp.pins.length} pins</td>
                      <td className="p-1.5">{(pwr * 1000).toFixed(2)} mW</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Section 3: SPICE Simulation Results & Nodal Voltages */}
          <div className="space-y-2">
            <h2 className="text-xs font-black uppercase text-[#111111] border-b border-[#111111] pb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              3. SPICE ENGINE NODAL VOLTAGES &amp; BRANCH ANALYSIS
            </h2>
            {simulation?.dc ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-[#111111] p-2 bg-[#fcfcfc]">
                  <div className="font-bold text-[10px] text-[#111111]/70 mb-1">NODE VOLTAGES:</div>
                  <div className="space-y-0.5 text-[10px]">
                    {Object.entries(simulation.dc.nodeVoltages).map(([node, volt]) => (
                      <div key={node} className="flex justify-between">
                        <span>{node === '0' ? 'Node 0 (GND)' : `Node ${node}`}:</span>
                        <span className="font-bold font-mono">{volt.toFixed(3)} V</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-[#111111] p-2 bg-[#fcfcfc]">
                  <div className="font-bold text-[10px] text-[#111111]/70 mb-1">BRANCH CURRENTS:</div>
                  <div className="space-y-0.5 text-[10px]">
                    {Object.entries(simulation.dc.branchCurrents).map(([branch, curr]) => (
                      <div key={branch} className="flex justify-between">
                        <span>{branch}:</span>
                        <span className="font-bold font-mono text-[#fe5029]">{(curr * 1000).toFixed(3)} mA</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 border border-dashed border-[#111111]/30 text-[#111111]/50 text-center">
                Simulation has not been run yet. Run SPICE in Circuit Lab to generate nodal verification data.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#f5f5f5] border-t border-[#111111] text-[10px] text-[#111111]/60 flex items-center justify-between print:hidden">
          <span>MAKEO HARDWARE DOCUMENTATION GENERATOR</span>
          <span>CONFIDENTIAL // HARDWARE ENGINEERING</span>
        </div>
      </div>
    </div>
  );
};
