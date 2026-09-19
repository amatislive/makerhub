import React, { useState } from 'react';
import {
  SimulationOutput,
  PlacedComponent,
} from '../../types/circuit';
import {
  Terminal,
  Activity,
  Layers,
  FileCode,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Cpu
} from 'lucide-react';

interface SimulationInspectorProps {
  simulation: SimulationOutput | null;
  components: PlacedComponent[];
  onSelectNet?: (netId: string) => void;
  onSelectComponent?: (compName: string) => void;
}

export const SimulationInspector: React.FC<SimulationInspectorProps> = ({
  simulation,
  components,
  onSelectNet,
  onSelectComponent,
}) => {
  const [tab, setTab] = useState<'dc' | 'transient' | 'netlist' | 'logs'>('dc');

  if (!simulation) {
    return (
      <div className="p-6 text-center font-mono-tech text-[11px] text-[#111111]/50 border border-dashed border-[#111111]/30">
        SIMULATION IDLE // RUN SPICE TO INSPECT NODES & CURRENTS
      </div>
    );
  }

  const { dc, transient, sweep, netlistText, logs, warnings, errors, unsupportedComponents } = simulation;

  return (
    <div className="flex flex-col h-full bg-white border border-[#111111] shadow-[2px_2px_0px_#111111]">
      {/* Sub Tabs */}
      <div className="flex items-center border-b border-[#111111] bg-[#eeeeee]/60 overflow-x-auto scrollbar-thin">
        <button
          type="button"
          onClick={() => setTab('dc')}
          className={`px-3 py-2 text-[10px] font-mono-tech font-bold uppercase border-r border-[#111111] transition-colors ${
            tab === 'dc' ? 'bg-white text-[#111111] border-b-2 border-b-[#fe5029]' : 'text-[#111111]/60 hover:text-[#111111]'
          }`}
        >
          DC OPERATING POINT
        </button>

        <button
          type="button"
          onClick={() => setTab('transient')}
          className={`px-3 py-2 text-[10px] font-mono-tech font-bold uppercase border-r border-[#111111] transition-colors ${
            tab === 'transient' ? 'bg-white text-[#111111] border-b-2 border-b-[#fe5029]' : 'text-[#111111]/60 hover:text-[#111111]'
          }`}
        >
          WAVEFORMS / TIME
        </button>

        <button
          type="button"
          onClick={() => setTab('netlist')}
          className={`px-3 py-2 text-[10px] font-mono-tech font-bold uppercase border-r border-[#111111] transition-colors ${
            tab === 'netlist' ? 'bg-white text-[#111111] border-b-2 border-b-[#fe5029]' : 'text-[#111111]/60 hover:text-[#111111]'
          }`}
        >
          SPICE NETLIST
        </button>

        <button
          type="button"
          onClick={() => setTab('logs')}
          className={`px-3 py-2 text-[10px] font-mono-tech font-bold uppercase transition-colors ${
            tab === 'logs' ? 'bg-white text-[#111111] border-b-2 border-b-[#fe5029]' : 'text-[#111111]/60 hover:text-[#111111]'
          }`}
        >
          SOLVER LOGS ({logs.length})
        </button>
      </div>

      {/* Warnings & Errors Banner */}
      {(errors.length > 0 || warnings.length > 0 || unsupportedComponents.length > 0) && (
        <div className="p-2 border-b border-[#111111] bg-[#f7e96e]/30 space-y-1 text-[10px] font-mono-tech">
          {errors.map((err, i) => (
            <div key={`err-${i}`} className="flex items-center gap-1.5 text-red-700 font-bold">
              <XCircle className="w-3.5 h-3.5 text-red-600" />
              <span>{err}</span>
            </div>
          ))}
          {warnings.map((warn, i) => (
            <div key={`warn-${i}`} className="flex items-center gap-1.5 text-amber-900">
              <AlertTriangle className="w-3.5 h-3.5 text-[#fe5029]" />
              <span>{warn}</span>
            </div>
          ))}
          {unsupportedComponents.map((item, i) => (
            <div key={`unsup-${i}`} className="flex items-center gap-1.5 text-[#111111]/80">
              <Cpu className="w-3.5 h-3.5 text-purple-600" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
        {tab === 'dc' && dc && (
          <div className="space-y-4">
            {/* Node Voltages Table */}
            <div>
              <div className="font-mono-tech text-[10px] font-bold uppercase text-[#111111] mb-1.5 flex items-center justify-between">
                <span>// NODE VOLTAGES (V_NODE RELATIVE TO 0V GROUND)</span>
                <span className="text-[#111111]/50 text-[9px]">{Object.keys(dc.nodeVoltages).length} NODES</span>
              </div>
              <div className="border border-[#111111]">
                <table className="w-full text-[11px] font-mono-tech">
                  <thead className="bg-[#eeeeee] border-b border-[#111111] text-[9px] text-[#111111]/70">
                    <tr>
                      <th className="p-2 text-left">NODE ID</th>
                      <th className="p-2 text-right">VOLTAGE (V)</th>
                      <th className="p-2 text-right">POTENTIAL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eeeeee]">
                    {Object.entries(dc.nodeVoltages).map(([node, volt]) => (
                      <tr
                        key={node}
                        onClick={() => onSelectNet && onSelectNet(node)}
                        className="hover:bg-[#eeeeee]/50 cursor-pointer"
                      >
                        <td className="p-2 font-bold text-[#111111]">
                          {node === '0' ? 'Node 0 (GND)' : `Node ${node}`}
                        </td>
                        <td className="p-2 text-right font-bold text-[#fe5029]">
                          {volt.toFixed(4)} V
                        </td>
                        <td className="p-2 text-right text-[10px] text-[#111111]/60">
                          {(volt * 1000).toFixed(1)} mV
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Branch Currents Table */}
            <div>
              <div className="font-mono-tech text-[10px] font-bold uppercase text-[#111111] mb-1.5 flex items-center justify-between">
                <span>// BRANCH CURRENTS & DISSIPATION</span>
                <span className="text-[#111111]/50 text-[9px]">{Object.keys(dc.branchCurrents).length} BRANCHES</span>
              </div>
              <div className="border border-[#111111]">
                <table className="w-full text-[11px] font-mono-tech">
                  <thead className="bg-[#eeeeee] border-b border-[#111111] text-[9px] text-[#111111]/70">
                    <tr>
                      <th className="p-2 text-left">BRANCH / COMPONENT</th>
                      <th className="p-2 text-right">CURRENT</th>
                      <th className="p-2 text-right">POWER (W)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eeeeee]">
                    {Object.entries(dc.branchCurrents).map(([branch, curr]) => {
                      const compName = branch.replace('I(', '').replace(')', '');
                      const power = dc.componentPowers[compName] || 0;
                      return (
                        <tr
                          key={branch}
                          onClick={() => onSelectComponent && onSelectComponent(compName)}
                          className="hover:bg-[#eeeeee]/50 cursor-pointer"
                        >
                          <td className="p-2 font-bold text-[#111111]">{branch}</td>
                          <td className="p-2 text-right font-bold text-blue-600">
                            {Math.abs(curr) < 0.001
                              ? `${(curr * 1e6).toFixed(2)} µA`
                              : `${(curr * 1e3).toFixed(2)} mA`}
                          </td>
                          <td className="p-2 text-right text-[#111111]/70">
                            {power < 0.001
                              ? `${(power * 1e6).toFixed(1)} µW`
                              : `${(power * 1000).toFixed(2)} mW`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'transient' && (
          <div className="space-y-3 font-mono-tech">
            {transient ? (
              <div>
                <div className="font-mono-tech text-[10px] font-bold uppercase text-[#111111] mb-2 flex items-center justify-between">
                  <span>// TRANSIENT TIME-DOMAIN WAVEFORM OSCILLOSCOPE</span>
                  <span className="text-[#fe5029] text-[9px]">STEP: {transient.timeRange.step * 1000} ms</span>
                </div>

                {/* SVG Oscilloscope Graph */}
                <div className="border border-[#111111] bg-[#111111] p-3 shadow-[2px_2px_0px_#111111] text-white">
                  <div className="flex items-center justify-between text-[9px] text-gray-400 mb-2">
                    <span className="text-[#75f76e]">CH1: V(Capacitor)</span>
                    <span className="text-[#6ebdf7]">CH2: V(Supply)</span>
                    <span>T_STOP: {transient.timeRange.stop * 1000} ms</span>
                  </div>

                  <svg viewBox="0 0 500 160" className="w-full h-40 bg-[#161616] border border-gray-800">
                    {/* Grid lines */}
                    <line x1={0} y1={40} x2={500} y2={40} stroke="#222222" strokeDasharray="2 2" />
                    <line x1={0} y1={80} x2={500} y2={80} stroke="#222222" strokeDasharray="2 2" />
                    <line x1={0} y1={120} x2={500} y2={120} stroke="#222222" strokeDasharray="2 2" />
                    <line x1={125} y1={0} x2={125} y2={160} stroke="#222222" strokeDasharray="2 2" />
                    <line x1={250} y1={0} x2={250} y2={160} stroke="#222222" strokeDasharray="2 2" />
                    <line x1={375} y1={0} x2={375} y2={160} stroke="#222222" strokeDasharray="2 2" />

                    {/* Waveform polyline */}
                    {Object.entries(transient.signals).map(([sigName, vals], sigIdx) => {
                      if (!sigName.startsWith('V(') || sigName === 'V(0)') return null;
                      const maxV = Math.max(5.0, ...vals);
                      const points = vals
                        .map((v, idx) => {
                          const x = (idx / (vals.length - 1)) * 480 + 10;
                          const y = 145 - (v / maxV) * 130;
                          return `${x},${y}`;
                        })
                        .join(' ');

                      const strokeColor = sigIdx === 0 ? '#75f76e' : sigIdx === 1 ? '#6ebdf7' : '#f7e96e';

                      return (
                        <polyline
                          key={sigName}
                          points={points}
                          fill="none"
                          stroke={strokeColor}
                          strokeWidth={2}
                          strokeLinecap="round"
                        />
                      );
                    })}
                  </svg>

                  <div className="flex items-center justify-between text-[9px] text-gray-400 mt-2 font-mono-tech">
                    <span>0 ms</span>
                    <span>12.5 ms</span>
                    <span>25.0 ms</span>
                    <span>37.5 ms</span>
                    <span>50.0 ms</span>
                  </div>
                </div>

                {/* Peak metrics summary */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                  {Object.entries(transient.peaks).slice(0, 6).map(([sig, peak]) => (
                    <div key={sig} className="p-2 border border-[#111111] bg-white">
                      <div className="text-[9px] text-[#111111]/60 uppercase">{sig}</div>
                      <div className="text-[11px] font-bold text-[#fe5029]">{peak.toFixed(3)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-[#111111]/60 border border-dashed border-[#111111]/30">
                Switch simulation mode to "TRANSIENT" and run SPICE to plot time-domain RC curves.
              </div>
            )}
          </div>
        )}

        {tab === 'netlist' && (
          <div>
            <div className="font-mono-tech text-[10px] font-bold uppercase text-[#111111] mb-1.5 flex items-center justify-between">
              <span>// GENERATED SPICE NETLIST</span>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(netlistText)}
                className="px-2 py-0.5 border border-[#111111] bg-white text-[9px] hover:bg-[#eeeeee]"
              >
                COPY NETLIST
              </button>
            </div>
            <pre className="p-3 bg-[#111111] text-[#75f76e] font-mono-tech text-[10px] overflow-x-auto border border-[#111111] leading-relaxed shadow-[2px_2px_0px_#111111]">
              {netlistText}
            </pre>
          </div>
        )}

        {tab === 'logs' && (
          <div className="space-y-1">
            <div className="font-mono-tech text-[10px] font-bold uppercase text-[#111111] mb-1.5">
              // SOLVER EXECUTION TELEMETRY
            </div>
            <div className="p-2.5 bg-white border border-[#111111] space-y-1 font-mono-tech text-[10px]">
              {logs.map((log, i) => (
                <div key={i} className="text-[#111111]/80">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
