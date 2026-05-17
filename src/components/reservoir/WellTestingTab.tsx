/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { InputWithSlider, DataRow } from '../SharedUI';
import {
  calculateDrawdownPwf,
  calculateHornerTime,
  calculateKFromSlope,
  calculateSkinFromHorner,
  calculateBourdetDerivative
} from '../../lib/reservoir';
import {
  LineChart as RechartLine,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';

export function WellTestingTab() {
  const [ptaSubTab, setPtaSubTab] = useState<'horner' | 'derivative' | 'typecurve' | 'multirate'>('horner');

  // Well/Res params
  const [params, setParams] = useState({
    pi: 4500,
    q: 1200,
    b: 1.25,
    mu: 0.8,
    h: 50,
    phi: 0.18,
    ct: 12e-6,
    rw: 0.35,
    tp: 72, // Flowing time
    c: 0.01, // Wellbore storage constant
    targetK: 150,
    targetS: 2.5
  });

  // Calculate simulated pressure data
  const { hornerData, derivativeData, typeCurveData, results } = useMemo(() => {
    // Generate simulated drawdown + buildup
    const drawdownPoints = [];
    
    // Drawdown (0 to tp)
    for (let t = 0.1; t <= params.tp; t *= 1.5) {
      const pwf = calculateDrawdownPwf(
        params.pi, params.q, params.b, params.mu, params.targetK, params.h, 
        params.phi, params.ct, params.rw, params.targetS, t
      );
      drawdownPoints.push({ t, p: pwf });
    }

    const pwf_at_tp = calculateDrawdownPwf(
      params.pi, params.q, params.b, params.mu, params.targetK, params.h, 
      params.phi, params.ct, params.rw, params.targetS, params.tp
    );

    // Buildup (dt > 0)
    const horner = [];
    const t_vals: number[] = [];
    const dp_vals: number[] = [];
    
    for (let dt = 0.01; dt <= 24; dt *= 1.4) {
      const h_time = (params.tp + dt) / dt;
      const slope = (162.6 * params.q * params.b * params.mu) / (params.targetK * params.h);
      const pws = params.pi - slope * Math.log10(h_time);
      
      const dp = pws - pwf_at_tp;
      horner.push({
        dt: dt,
        hornerTime: h_time,
        mdhTime: Math.log10(dt),
        pws: pws,
        dp: dp
      });
      t_vals.push(dt);
      dp_vals.push(dp);
    }

    const derivs = calculateBourdetDerivative(t_vals, dp_vals);
    const derivData = horner.map((h, i) => ({
      dt: h.dt,
      dp: h.dp,
      deriv: derivs[i]
    }));

    // Type Curve Variables (Dimensionless)
    const typeCurve = horner.map((h, i) => {
      const td = (0.0002637 * params.targetK * h.dt) / (params.phi * params.mu * params.ct * params.rw * params.rw);
      const pd = (params.targetK * params.h * h.dp) / (141.2 * params.q * params.b * params.mu);
      const cd = (0.8936 * params.c) / (params.phi * params.h * params.ct * params.rw * params.rw);
      const pd_deriv = (params.targetK * params.h * (derivs[i] || 0)) / (141.2 * params.q * params.b * params.mu);
      
      return {
        td_cd: td / cd,
        pd,
        pd_deriv
      };
    });

    // Perform analysis on simulated points (pseudo-recovery)
    const m = (162.6 * params.q * params.b * params.mu) / (params.targetK * params.h);
    const p1hr = params.pi - m * Math.log10((params.tp + 1) / 1);
    const calcK = calculateKFromSlope(params.q, params.b, params.mu, params.h, m);
    const calcS = calculateSkinFromHorner(p1hr, pwf_at_tp, m, calcK, params.phi, params.mu, params.ct, params.rw);

    return { 
      hornerData: horner, 
      derivativeData: derivData,
      typeCurveData: typeCurve,
      results: { k: calcK, s: calcS, m, p1hr, pwf_at_tp }
    };
  }, [params]);

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Navigation and Tabs */}
      <div className="flex bg-panel-bg p-1 rounded-lg border border-border-subtle inline-flex">
        {[
          { id: 'horner', label: 'Horner Analysis' },
          { id: 'derivative', label: 'Diagnostic Plot' },
          { id: 'typecurve', label: 'Type Curve Match' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setPtaSubTab(tab.id as any)}
            className={cn(
              "px-6 py-1.5 rounded text-[12px] font-semibold transition-all uppercase tracking-wider",
              ptaSubTab === tab.id ? "bg-brand-primary text-white" : "text-industry-label hover:text-white"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex gap-4 flex-col lg:flex-row">
        {/* Sidebar Column (Inputs) */}
        <div className="w-full lg:w-[320px] shrink-0 space-y-4">
          <div className="industry-card p-4 bg-panel-bg">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Test Parameters</h3>
            <div className="space-y-4 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              <section className="space-y-3">
                <h4 className="text-[10px] font-bold text-industry-label uppercase tracking-widest border-b border-border-subtle pb-1">Fluid & Wellbore</h4>
                <InputWithSlider label="Flow Rate (q)" value={params.q} min={100} max={5000} step={100} unit="stb/d" onChange={v => setParams({...params, q: v})} />
                <InputWithSlider label="Shut-in Time (tp)" value={params.tp} min={1} max={500} step={1} unit="hrs" onChange={v => setParams({...params, tp: v})} />
                <InputWithSlider label="Oil FVF (B)" value={params.b} min={1.0} max={2.0} step={0.01} unit="rb/stb" onChange={v => setParams({...params, b: v})} />
                <InputWithSlider label="Viscosity (μ)" value={params.mu} min={0.1} max={50} step={0.1} unit="cP" onChange={v => setParams({...params, mu: v})} />
                <InputWithSlider label="Wellbore (C)" value={params.c} min={0.001} max={0.1} step={0.001} unit="bbl/psi" onChange={v => setParams({...params, c: v})} />
              </section>

              <section className="space-y-3">
                <h4 className="text-[10px] font-bold text-industry-label uppercase tracking-widest border-b border-border-subtle pb-1">Reservoir Model</h4>
                <InputWithSlider label="Initial P (Pi)" value={params.pi} min={500} max={8000} step={50} unit="psi" onChange={v => setParams({...params, pi: v})} />
                <InputWithSlider label="Thickness (h)" value={params.h} min={1} max={200} step={1} unit="ft" onChange={v => setParams({...params, h: v})} />
                <InputWithSlider label="Porosity (ϕ)" value={params.phi} min={0.01} max={0.4} step={0.0001} unit="v/v" onChange={v => setParams({...params, phi: v})} />
                <InputWithSlider label="Compressibility" value={params.ct * 1e6} min={1} max={50} step={1} unit="e-6 1/psi" onChange={v => setParams({...params, ct: v / 1e6})} />
                <InputWithSlider label="Well Radius (rw)" value={params.rw} min={0.1} max={1.0} step={0.01} unit="ft" onChange={v => setParams({...params, rw: v})} />
              </section>

              <section className="space-y-3">
                <h4 className="text-[10px] font-bold text-industry-label uppercase tracking-widest border-b border-border-subtle pb-1">Simulation Truth</h4>
                <InputWithSlider label="Truth Perm (k)" value={params.targetK} min={1} max={2000} step={10} unit="mD" onChange={v => setParams({...params, targetK: v})} />
                <InputWithSlider label="Truth Skin (S)" value={params.targetS} min={-5} max={20} step={0.1} unit="-" onChange={v => setParams({...params, targetS: v})} />
              </section>
            </div>
          </div>
        </div>

        {/* Dynamic Content Column */}
        <div className="flex-1 space-y-4">
          <AnimatePresence mode="wait">
            {ptaSubTab === 'horner' ? (
              <motion.div 
                key="horner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div className="industry-card p-6 bg-panel-bg flex flex-col min-h-[500px]">
                  <div className="flex justify-between items-end mb-6 pb-2 border-b border-border-subtle">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase">Semi-Log Build-up Plot</h3>
                      <p className="text-[10px] text-industry-label font-mono uppercase mt-0.5">Radial Flow Analysis (Horner Plot)</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] text-industry-label uppercase mb-1">Slope (m)</p>
                       <p className="text-xl font-mono text-brand-primary font-bold">{results.m.toFixed(1)} <span className="text-[11px] font-normal text-industry-unit">psi/log</span></p>
                    </div>
                  </div>

                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 5, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#30363D" opacity={0.1} vertical={false} />
                        <XAxis 
                          type="number" 
                          dataKey="hornerTime" 
                          reversed 
                          scale="log" 
                          domain={['auto', 'auto']} 
                          stroke="#8B949E" 
                          fontSize={11} 
                          tick={{ fill: '#8B949E' }}
                          label={{ value: 'Horner Time (tp+dt)/dt', position: 'insideBottom', offset: -10, fill: '#8B949E', fontSize: 11 }} 
                        />
                        <YAxis 
                          type="number" 
                          dataKey="pws" 
                          domain={['auto', 'auto']} 
                          stroke="#8B949E" 
                          fontSize={11} 
                          tick={{ fill: '#8B949E' }}
                          label={{ value: 'Pressure (psi)', angle: -90, position: 'insideLeft', fill: '#8B949E', fontSize: 11 }}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '4px' }}
                          itemStyle={{ fontSize: '11px', color: '#E6EDF3' }}
                        />
                        <Scatter name="Data" data={hornerData} fill="#3182ce" shape="circle" strokeWidth={1} stroke="#3182ce" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-[10px] font-bold text-industry-label uppercase tracking-widest mb-2 border-b border-border-subtle pb-1">Calculated Results</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0.5">
                      {[
                        { label: "Formation Permeability (k)", value: results.k, unit: "mD", source: "Horner Slope", precision: 1 },
                        { label: "Skin Factor (S)", value: results.s, unit: "-", source: "162.6 Correlation", precision: 2 },
                        { label: "P at 1 Hour", value: results.p1hr, unit: "psi", source: "Extrapolated", precision: 1 },
                        { label: "Flowing Pressure", value: results.pwf_at_tp, unit: "psi", source: "Pwf @ Shut-in", precision: 1 }
                      ].map((row, i) => (
                        <DataRow key={i} {...row} />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : ptaSubTab === 'derivative' ? (
              <motion.div 
                key="derivative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div className="industry-card p-6 bg-panel-bg flex flex-col min-h-[500px]">
                  <div className="flex justify-between items-end mb-6 pb-2 border-b border-border-subtle">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase">Diagnostic Diagnostic Plot</h3>
                      <p className="text-[10px] text-industry-label font-mono uppercase mt-0.5">Bourdet Derivative Analysis</p>
                    </div>
                  </div>

                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartLine data={derivativeData} margin={{ top: 5, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#30363D" vertical={false} opacity={0.1} />
                        <XAxis 
                          type="number" 
                          dataKey="dt" 
                          scale="log" 
                          domain={['auto', 'auto']} 
                          stroke="#8B949E" 
                          fontSize={11} 
                          tick={{ fill: '#8B949E' }}
                          label={{ value: 'Time step (dt, hrs)', position: 'insideBottom', offset: -10, fill: '#8B949E', fontSize: 11 }} 
                        />
                        <YAxis 
                          type="number" 
                          scale="log" 
                          domain={['auto', 'auto']} 
                          stroke="#8B949E" 
                          fontSize={11} 
                          tick={{ fill: '#8B949E' }}
                          label={{ value: 'Δp & Δp\' (psi)', angle: -90, position: 'insideLeft', fill: '#8B949E', fontSize: 11 }} 
                        />
                        <Tooltip contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '4px' }} />
                        <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }} />
                        <Line type="monotone" dataKey="dp" stroke="#8B949E" strokeWidth={1} dot={{ r: 2 }} name="Δp" animationDuration={150} />
                        <Line type="monotone" dataKey="deriv" stroke="#3182ce" strokeWidth={2} dot={{ r: 3 }} name="Derivative (P')" animationDuration={150} />
                      </RechartLine>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="typecurve"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div className="industry-card p-6 bg-panel-bg flex flex-col min-h-[500px]">
                  <div className="flex justify-between items-end mb-6 pb-2 border-b border-border-subtle">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase">Dimensionless Matching</h3>
                      <p className="text-[10px] text-industry-label font-mono uppercase mt-0.5">Gringarten Type Curves (Pd vs Td/Cd)</p>
                    </div>
                  </div>

                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartLine data={typeCurveData} margin={{ top: 5, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#30363D" vertical={false} opacity={0.1} />
                        <XAxis 
                          type="number" 
                          dataKey="td_cd" 
                          scale="log" 
                          domain={[0.1, 1000]} 
                          stroke="#8B949E" 
                          fontSize={11} 
                          tick={{ fill: '#8B949E' }}
                          label={{ value: 'Td / Cd', position: 'insideBottom', offset: -10, fill: '#8B949E', fontSize: 11 }} 
                        />
                        <YAxis 
                          type="number" 
                          scale="log" 
                          domain={[0.01, 100]} 
                          stroke="#8B949E" 
                          fontSize={11} 
                          tick={{ fill: '#8B949E' }}
                          label={{ value: 'Pd (Dimensionless Pressure)', angle: -90, position: 'insideLeft', fill: '#8B949E', fontSize: 11 }} 
                        />
                        <Tooltip contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '4px' }} />
                        <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px' }} />
                        <Line type="monotone" dataKey="pd" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} name="Pd" animationDuration={150} />
                        <Line type="monotone" dataKey="pd_deriv" stroke="#3182ce" strokeWidth={2} dot={{ r: 2 }} name="Pd'" animationDuration={150} />
                      </RechartLine>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Computed Data Table Always Visible at Bottom */}
          <div className="industry-card p-4 bg-panel-bg">
            <h4 className="text-[10px] font-bold text-industry-label uppercase tracking-widest mb-3 border-b border-border-subtle pb-1">Pressure Survey History</h4>
            <div className="overflow-x-auto">
              <table className="industry-table text-[11px] font-mono">
                <thead>
                  <tr>
                    <th>dt (hr)</th>
                    <th>Pressure (psi)</th>
                    <th>Δp (psi)</th>
                    <th>Horner Time</th>
                  </tr>
                </thead>
                <tbody>
                  {hornerData.slice(0, 10).map((h, i) => (
                    <tr key={i}>
                      <td className="text-industry-value">{h.dt.toFixed(3)}</td>
                      <td className="text-brand-primary">{h.pws.toFixed(1)}</td>
                      <td className="text-industry-label">{h.dp.toFixed(1)}</td>
                      <td className="text-industry-unit">{h.hornerTime.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}
