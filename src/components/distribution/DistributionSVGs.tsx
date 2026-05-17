import React from 'react';

/** 7.1 Supply Chain Network Diagram */
export const SupplyChainNetworkSVG: React.FC<{ width?: number; height?: number }> = ({ width = 500, height = 400 }) => (
    <svg viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Refinery */}
        <rect x={30} y={160} width={80} height={80} rx={8} fill="#1a1a2e" stroke="#e94560" strokeWidth={2} />
        <text x={70} y={195} textAnchor="middle" fill="#e94560" fontSize={11} fontWeight="bold">REFINERY</text>
        <text x={70} y={215} textAnchor="middle" fill="#8ab3ff" fontSize={9}>Gate</text>

        {/* Pipeline */}
        <line x1={110} y1={185} x2={180} y2={135} stroke="#00d2ff" strokeWidth={3} markerEnd="url(#arrowCyan)" />
        {/* Terminal Hub */}
        <rect x={180} y={95} width={100} height={80} rx={8} fill="#1a1a2e" stroke="#00d2ff" strokeWidth={2} />
        <text x={230} y={130} textAnchor="middle" fill="#00d2ff" fontSize={11} fontWeight="bold">TERMINAL</text>
        <text x={230} y={150} textAnchor="middle" fill="#8ab3ff" fontSize={9}>Hub</text>

        {/* Pipeline down */}
        <line x1={110} y1={215} x2={180} y2={265} stroke="#00d2ff" strokeWidth={3} markerEnd="url(#arrowCyan)" />
        {/* Terminal 2 */}
        <rect x={180} y={225} width={100} height={80} rx={8} fill="#1a1a2e" stroke="#00d2ff" strokeWidth={2} />
        <text x={230} y={260} textAnchor="middle" fill="#00d2ff" fontSize={11} fontWeight="bold">TERMINAL</text>
        <text x={230} y={280} textAnchor="middle" fill="#8ab3ff" fontSize={9}>Spoke</text>

        {/* Marine to port */}
        <line x1={280} y1={120} x2={350} y2={50} stroke="#ffd700" strokeWidth={2} strokeDasharray="6,3" markerEnd="url(#arrowGold)" />
        <rect x={350} y={20} width={80} height={60} rx={8} fill="#1a1a2e" stroke="#ffd700" strokeWidth={2} />
        <text x={390} y={48} textAnchor="middle" fill="#ffd700" fontSize={10} fontWeight="bold">PORT</text>
        <text x={390} y={64} textAnchor="middle" fill="#8ab3ff" fontSize={8}>Marine</text>

        {/* Rail */}
        <line x1={230} y1={175} x2={310} y2={175} stroke="#ff6b6b" strokeWidth={2} strokeDasharray="4,2" markerEnd="url(#arrowRed)" />
        <rect x={310} y={145} width={70} height={55} rx={8} fill="#1a1a2e" stroke="#ff6b6b" strokeWidth={2} />
        <text x={345} y={170} textAnchor="middle" fill="#ff6b6b" fontSize={10} fontWeight="bold">RAIL</text>
        <text x={345} y={186} textAnchor="middle" fill="#8ab3ff" fontSize={8}>Rack</text>

        {/* Truck */}
        <line x1={280} y1={260} x2={350} y2={310} stroke="#00bcd4" strokeWidth={2} markerEnd="url(#arrowTeal)" />
        <rect x={350} y={280} width={80} height={60} rx={8} fill="#1a1a2e" stroke="#00bcd4" strokeWidth={2} />
        <text x={390} y={308} textAnchor="middle" fill="#00bcd4" fontSize={10} fontWeight="bold">TRUCK</text>
        <text x={390} y={324} textAnchor="middle" fill="#8ab3ff" fontSize={8}>Fleet</text>

        {/* Aviation */}
        <line x1={230} y1={295} x2={310} y2={345} stroke="#c084fc" strokeWidth={2} markerEnd="url(#arrowPurple)" />
        <rect x={310} y={320} width={80} height={55} rx={8} fill="#1a1a2e" stroke="#c084fc" strokeWidth={2} />
        <text x={350} y={345} textAnchor="middle" fill="#c084fc" fontSize={10} fontWeight="bold">AVIATION</text>
        <text x={350} y={361} textAnchor="middle" fill="#8ab3ff" fontSize={8}>Airport</text>

        {/* Arrow markers */}
        <defs>
            <marker id="arrowCyan" viewBox="0 0 10 10" refX="9" refY="5" markerWidth={6} markerHeight={6} orient="auto">
                <path d="M0,0 L10,5 L0,10 Z" fill="#00d2ff" />
            </marker>
            <marker id="arrowGold" viewBox="0 0 10 10" refX="9" refY="5" markerWidth={6} markerHeight={6} orient="auto">
                <path d="M0,0 L10,5 L0,10 Z" fill="#ffd700" />
            </marker>
            <marker id="arrowRed" viewBox="0 0 10 10" refX="9" refY="5" markerWidth={6} markerHeight={6} orient="auto">
                <path d="M0,0 L10,5 L0,10 Z" fill="#ff6b6b" />
            </marker>
            <marker id="arrowTeal" viewBox="0 0 10 10" refX="9" refY="5" markerWidth={6} markerHeight={6} orient="auto">
                <path d="M0,0 L10,5 L0,10 Z" fill="#00bcd4" />
            </marker>
            <marker id="arrowPurple" viewBox="0 0 10 10" refX="9" refY="5" markerWidth={6} markerHeight={6} orient="auto">
                <path d="M0,0 L10,5 L0,10 Z" fill="#c084fc" />
            </marker>
        </defs>
    </svg>
);

/** 7.2 Pipeline Cross-Section */
export const PipelineBatchSVG: React.FC<{ width?: number; height?: number }> = ({ width = 500, height = 200 }) => (
    <svg viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Pipe outline */}
        <rect x={20} y={60} width={460} height={80} rx={40} fill="#0a0a1a" stroke="#00d2ff" strokeWidth={2} />
        {/* Product batches */}
        <circle cx={80} cy={100} r={28} fill="#e94560" stroke="#ff6b6b" strokeWidth={1} opacity={0.8} />
        <text x={80} y={104} textAnchor="middle" fill="white" fontSize={9} fontWeight="bold">GAS</text>
        <circle cx={180} cy={100} r={28} fill="#ffd700" stroke="#f0c000" strokeWidth={1} opacity={0.8} />
        <text x={180} y={104} textAnchor="middle" fill="#1a1a2e" fontSize={9} fontWeight="bold">DIESEL</text>
        <circle cx={280} cy={100} r={28} fill="#00bcd4" stroke="#0097a7" strokeWidth={1} opacity={0.8} />
        <text x={280} y={104} textAnchor="middle" fill="white" fontSize={9} fontWeight="bold">JET</text>
        <circle cx={380} cy={100} r={28} fill="#c084fc" stroke="#9333ea" strokeWidth={1} opacity={0.8} />
        <text x={380} y={104} textAnchor="middle" fill="white" fontSize={9} fontWeight="bold">DIESEL</text>
        {/* Interface zones */}
        <rect x={108} y={72} width={8} height={56} fill="none" stroke="#ff6b6b" strokeWidth={1} strokeDasharray="2,2" />
        <rect x={208} y={72} width={8} height={56} fill="none" stroke="#ff6b6b" strokeWidth={1} strokeDasharray="2,2" />
        <rect x={308} y={72} width={8} height={56} fill="none" stroke="#ff6b6b" strokeWidth={1} strokeDasharray="2,2" />
        {/* Flow direction */}
        <path d="M430,100 L450,100" stroke="#00d2ff" strokeWidth={2} markerEnd="url(#arrowCyan2)" />
        <text x={460} y={155} textAnchor="middle" fill="#8ab3ff" fontSize={10}>FLOW →</text>
        <defs>
            <marker id="arrowCyan2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth={6} markerHeight={6} orient="auto">
                <path d="M0,0 L10,5 L0,10 Z" fill="#00d2ff" />
            </marker>
        </defs>
    </svg>
);

/** 7.3 Marine Tanker */
export const MarineTankerSVG: React.FC<{ width?: number; height?: number }> = ({ width = 500, height = 300 }) => (
    <svg viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Hull */}
        <path d="M80,160 L120,110 L380,110 L440,160 L420,180 L80,180 Z" fill="#1a1a2e" stroke="#ffd700" strokeWidth={2} />
        {/* Water line */}
        <line x1={60} y1={175} x2={430} y2={175} stroke="#0077b6" strokeWidth={2} strokeDasharray="10,5" />
        {/* Tank compartments */}
        <line x1={140} y1={115} x2={130} y2={175} stroke="#ffd700" strokeWidth={1} opacity={0.5} />
        <line x1={220} y1={115} x2={215} y2={175} stroke="#ffd700" strokeWidth={1} opacity={0.5} />
        <line x1={300} y1={115} x2={300} y2={175} stroke="#ffd700" strokeWidth={1} opacity={0.5} />
        <line x1={380} y1={115} x2={385} y2={175} stroke="#ffd700" strokeWidth={1} opacity={0.5} />
        {/* Labels */}
        <text x={170} y={150} textAnchor="middle" fill="#ffd700" fontSize={9}>C.O. 1</text>
        <text x={255} y={150} textAnchor="middle" fill="#ffd700" fontSize={9}>C.O. 2</text>
        <text x={340} y={150} textAnchor="middle" fill="#ffd700" fontSize={9}>C.O. 3</text>
        {/* Superstructure */}
        <rect x={380} y={70} width={45} height={40} rx={3} fill="#1a1a2e" stroke="#8ab3ff" strokeWidth={1.5} />
        <text x={402} y={94} textAnchor="middle" fill="#8ab3ff" fontSize={8}>BRIDGE</text>
        {/* Funnel */}
        <rect x={390} y={50} width={15} height={20} rx={2} fill="#e94560" stroke="#ff6b6b" strokeWidth={1} />
        {/* Cargo boom */}
        <line x1={250} y1={110} x2={320} y2={30} stroke="#8ab3ff" strokeWidth={1.5} />
        <line x1={320} y1={30} x2={320} y2={80} stroke="#8ab3ff" strokeWidth={1.5} />
        <text x={320} y={25} textAnchor="middle" fill="#8ab3ff" fontSize={8}>Manifold</text>
        {/* Anchors */}
        <circle cx={90} cy={168} r={4} fill="#888" />
        <text x={90} y={190} textAnchor="middle" fill="#8ab3ff" fontSize={8}>Anchor</text>
        {/* Wave decoration */}
        <path d="M50,178 Q70,172 90,178 Q110,184 130,178 Q150,172 170,178 Q190,184 210,178" stroke="#0077b6" strokeWidth={1} fill="none" opacity={0.4} />
    </svg>
);

/** 7.4 Rail Loading Diagram */
export const RailLoadingSVG: React.FC<{ width?: number; height?: number }> = ({ width = 500, height = 250 }) => (
    <svg viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Track */}
        <line x1={30} y1={190} x2={470} y2={190} stroke="#888" strokeWidth={3} />
        <line x1={30} y1={200} x2={470} y2={200} stroke="#888" strokeWidth={1} />
        {/* Ties */}
        {[50, 80, 110, 140, 170, 200, 230, 260, 290, 320, 350, 380, 410, 440].map(x => (
            <rect key={x} x={x} y={186} width={6} height={18} fill="#666" />
        ))}
        {/* Tank cars */}
        {[90, 180, 270, 360].map((x, i) => (
            <g key={x}>
                <rect x={x} y={130} width={60} height={55} rx={5} fill="#1a1a2e" stroke="#ff6b6b" strokeWidth={1.5} />
                <text x={x + 30} y={155} textAnchor="middle" fill="#ff6b6b" fontSize={8} fontWeight="bold">
                    DOT-{i === 0 ? '117J' : '111A'}
                </text>
                <text x={x + 30} y={172} textAnchor="middle" fill="#8ab3ff" fontSize={7}>
                    {600 + i * 20} bbl
                </text>
                {/* Wheels */}
                <circle cx={x + 12} cy={198} r={6} fill="#444" stroke="#888" strokeWidth={1} />
                <circle cx={x + 48} cy={198} r={6} fill="#444" stroke="#888" strokeWidth={1} />
                {/* Connectors */}
                {i < 3 && <line x1={x + 60} y1={195} x2={x + 90} y2={195} stroke="#888" strokeWidth={2} />}
            </g>
        ))}
        {/* Loading arms */}
        {[90, 180, 270, 360].map((x, i) => (
            <g key={`arm-${i}`}>
                <line x1={x + 30} y1={60} x2={x + 30} y2={130} stroke="#00bcd4" strokeWidth={2} />
                <circle cx={x + 30} cy={60} r={4} fill="#00bcd4" />
            </g>
        ))}
        {/* Top header */}
        <rect x={75} y={40} width={350} height={16} rx={4} fill="#0a0a1a" stroke="#00bcd4" strokeWidth={1} />
        <text x={250} y={52} textAnchor="middle" fill="#00bcd4" fontSize={9}>LOADING RACK — 4 SPOTS</text>
        <text x={250} y={230} textAnchor="middle" fill="#8ab3ff" fontSize={9}>Unit Train: 100-car manifest</text>
    </svg>
);

/** 7.5 Truck Distribution Route */
export const TruckRouteSVG: React.FC<{ width?: number; height?: number }> = ({ width = 500, height = 300 }) => (
    <svg viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Terminal */}
        <rect x={20} y={120} width={70} height={60} rx={6} fill="#1a1a2e" stroke="#00d2ff" strokeWidth={2} />
        <text x={55} y={148} textAnchor="middle" fill="#00d2ff" fontSize={9} fontWeight="bold">TERMINAL</text>
        <text x={55} y={164} textAnchor="middle" fill="#8ab3ff" fontSize={8}>Origin</text>

        {/* Route path */}
        <path d="M90,150 Q150,80 220,130 Q280,170 350,100 Q400,50 440,120" stroke="#00bcd4" strokeWidth={2} fill="none" markerEnd="url(#arrowTruck)" />

        {/* Truck */}
        <rect x={195} y={108} width={50} height={25} rx={4} fill="#00bcd4" stroke="#0097a7" strokeWidth={1.5} />
        <text x={220} y={124} textAnchor="middle" fill="white" fontSize={8} fontWeight="bold">TRUCK</text>
        <circle cx={205} cy={136} r={4} fill="#333" stroke="#00bcd4" strokeWidth={1} />
        <circle cx={235} cy={136} r={4} fill="#333" stroke="#00bcd4" strokeWidth={1} />

        {/* Stop 1 */}
        <circle cx={220} cy={130} r={10} fill="#e94560" opacity={0.7} />
        <text x={220} y={100} textAnchor="middle" fill="#e94560" fontSize={8}>Stop 1</text>
        <text x={220} y={90} textAnchor="middle" fill="#8ab3ff" fontSize={7}>Gas Station</text>

        {/* Stop 2 */}
        <circle cx={350} cy={100} r={10} fill="#e94560" opacity={0.7} />
        <text x={350} y={75} textAnchor="middle" fill="#e94560" fontSize={8}>Stop 2</text>
        <text x={350} y={65} textAnchor="middle" fill="#8ab3ff" fontSize={7}>Retail</text>

        {/* Destination */}
        <rect x={440} y={90} width={55} height={50} rx={6} fill="#1a1a2e" stroke="#c084fc" strokeWidth={2} />
        <text x={467} y={113} textAnchor="middle" fill="#c084fc" fontSize={8} fontWeight="bold">FUEL</text>
        <text x={467} y={128} textAnchor="middle" fill="#8ab3ff" fontSize={7}>Station</text>

        {/* Mile markers */}
        <text x={150} y={190} textAnchor="middle" fill="#666" fontSize={7}>15 mi</text>
        <text x={280} y={185} textAnchor="middle" fill="#666" fontSize={7}>32 mi</text>
        <text x={400} y={185} textAnchor="middle" fill="#666" fontSize={7}>48 mi</text>

        <defs>
            <marker id="arrowTruck" viewBox="0 0 10 10" refX="9" refY="5" markerWidth={6} markerHeight={6} orient="auto">
                <path d="M0,0 L10,5 L0,10 Z" fill="#00bcd4" />
            </marker>
        </defs>
    </svg>
);

/** 7.6 Terminal Tank Farm */
export const TerminalTankFarmSVG: React.FC<{ width?: number; height?: number }> = ({ width = 500, height = 350 }) => (
    <svg viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Tank 1 - Gasoline */}
        <rect x={40} y={60} width={90} height={110} rx={8} fill="#1a1a2e" stroke="#e94560" strokeWidth={2} />
        <text x={85} y={85} textAnchor="middle" fill="#e94560" fontSize={10} fontWeight="bold">GAS</text>
        <text x={85} y={100} textAnchor="middle" fill="#8ab3ff" fontSize={8}>80k bbl</text>
        <rect x={45} y={110} width={80} height={55} fill="#e94560" opacity={0.15} />
        <text x={85} y={140} textAnchor="middle" fill="#e94560" fontSize={9} fontWeight="bold">65%</text>

        {/* Tank 2 - Diesel */}
        <rect x={155} y={60} width={90} height={110} rx={8} fill="#1a1a2e" stroke="#ffd700" strokeWidth={2} />
        <text x={200} y={85} textAnchor="middle" fill="#ffd700" fontSize={10} fontWeight="bold">DIESEL</text>
        <text x={200} y={100} textAnchor="middle" fill="#8ab3ff" fontSize={8}>80k bbl</text>
        <rect x={160} y={135} width={80} height={30} fill="#ffd700" opacity={0.15} />
        <text x={200} y={155} textAnchor="middle" fill="#ffd700" fontSize={9} fontWeight="bold">40%</text>

        {/* Tank 3 - Jet */}
        <rect x={270} y={60} width={90} height={110} rx={8} fill="#1a1a2e" stroke="#00bcd4" strokeWidth={2} />
        <text x={315} y={85} textAnchor="middle" fill="#00bcd4" fontSize={10} fontWeight="bold">JET-A</text>
        <text x={315} y={100} textAnchor="middle" fill="#8ab3ff" fontSize={8}>50k bbl</text>
        <rect x={275} y={120} width={80} height={45} fill="#00bcd4" opacity={0.15} />
        <text x={315} y={145} textAnchor="middle" fill="#00bcd4" fontSize={9} fontWeight="bold">55%</text>

        {/* Tank 4 - Ethanol */}
        <rect x={385} y={60} width={90} height={110} rx={8} fill="#1a1a2e" stroke="#c084fc" strokeWidth={2} />
        <text x={430} y={85} textAnchor="middle" fill="#c084fc" fontSize={10} fontWeight="bold">EtOH</text>
        <text x={430} y={100} textAnchor="middle" fill="#8ab3ff" fontSize={8}>30k bbl</text>
        <rect x={390} y={110} width={80} height={55} fill="#c084fc" opacity={0.15} />
        <text x={430} y={140} textAnchor="middle" fill="#c084fc" fontSize={9} fontWeight="bold">70%</text>

        {/* Piping network */}
        <line x1={85} y1={170} x2={85} y2={240} stroke="#00d2ff" strokeWidth={1.5} />
        <line x1={200} y1={170} x2={200} y2={240} stroke="#00d2ff" strokeWidth={1.5} />
        <line x1={315} y1={170} x2={315} y2={270} stroke="#00d2ff" strokeWidth={1.5} />
        <line x1={430} y1={170} x2={430} y2={240} stroke="#00d2ff" strokeWidth={1.5} />
        <line x1={85} y1={240} x2={430} y2={240} stroke="#00d2ff" strokeWidth={2} />

        {/* Loading rack */}
        <rect x={150} y={255} width={200} height={40} rx={6} fill="#0a0a1a" stroke="#00bcd4" strokeWidth={2} />
        <text x={250} y={273} textAnchor="middle" fill="#00bcd4" fontSize={9} fontWeight="bold">TRUCK LOADING RACK</text>
        <text x={250} y={288} textAnchor="middle" fill="#8ab3ff" fontSize={8}>4 Bays • 600 bph each</text>

        {/* Jet fuel line (dedicated) */}
        <line x1={315} y1={270} x2={315} y2={310} stroke="#00bcd4" strokeWidth={1.5} strokeDasharray="5,3" />
        <rect x={270} y={310} width={90} height={25} rx={4} fill="#0a0a1a" stroke="#c084fc" strokeWidth={1} />
        <text x={315} y={327} textAnchor="middle" fill="#c084fc" fontSize={8}>Fuel Farm</text>

        {/* Containment dike */}
        <rect x={20} y={45} width={475} height={155} rx={4} fill="none" stroke="#ff6b6b" strokeWidth={1} strokeDasharray="8,4" opacity={0.5} />
        <text x={260} y={38} textAnchor="middle" fill="#ff6b6b" fontSize={7}>Secondary Containment</text>
    </svg>
);

/** 7.7 Airport Fuel Farm */
export const AirportFuelFarmSVG: React.FC<{ width?: number; height?: number }> = ({ width = 500, height = 300 }) => (
    <svg viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Jet fuel tanks */}
        <circle cx={120} cy={120} r={45} fill="#1a1a2e" stroke="#00bcd4" strokeWidth={2} />
        <text x={120} y={115} textAnchor="middle" fill="#00bcd4" fontSize={10} fontWeight="bold">JET-A</text>
        <text x={120} y={130} textAnchor="middle" fill="#8ab3ff" fontSize={8}>40k bbl</text>
        <text x={120} y={145} textAnchor="middle" fill="#00bcd4" fontSize={9}>78%</text>

        <circle cx={240} cy={120} r={45} fill="#1a1a2e" stroke="#00bcd4" strokeWidth={2} />
        <text x={240} y={115} textAnchor="middle" fill="#00bcd4" fontSize={10} fontWeight="bold">JET-A</text>
        <text x={240} y={130} textAnchor="middle" fill="#8ab3ff" fontSize={8}>40k bbl</text>
        <text x={240} y={145} textAnchor="middle" fill="#00bcd4" fontSize={9}>62%</text>

        {/* SAF tank */}
        <circle cx={380} cy={120} r={40} fill="#1a1a2e" stroke="#10b981" strokeWidth={2} />
        <text x={380} y={115} textAnchor="middle" fill="#10b981" fontSize={9} fontWeight="bold">SAF</text>
        <text x={380} y={130} textAnchor="middle" fill="#8ab3ff" fontSize={8}>15k bbl</text>

        {/* Hydrant system */}
        <rect x={20} y={200} width={460} height={12} rx={3} fill="#0a0a1a" stroke="#00d2ff" strokeWidth={2} />
        <text x={250} y={210} textAnchor="middle" fill="#00d2ff" fontSize={7}>HYDRANT SYSTEM — 500 gpm</text>

        {/* Hydrant branches */}
        {[80, 160, 240, 320, 400].map((x, i) => (
            <g key={`hydrant-${i}`}>
                <line x1={x} y1={120} x2={x} y2={200} stroke="#00bcd4" strokeWidth={1} opacity={0.5} />
                <rect x={x - 6} y={212} width={12} height={18} rx={3} fill="#00d2ff" stroke="#0097a7" strokeWidth={1} />
                <text x={x} y={225} textAnchor="middle" fill="white" fontSize={6}>HYD-{i + 1}</text>
                {/* Aircraft at gate */}
                <rect x={x - 15} y={240} width={30} height={15} rx={3} fill="#1a1a2e" stroke="#c084fc" strokeWidth={1} />
                <text x={x} y={251} textAnchor="middle" fill="#c084fc" fontSize={6}>A/C</text>
            </g>
        ))}

        {/* Filtration skid */}
        <rect x={395} y={60} width={70} height={35} rx={4} fill="#0a0a1a" stroke="#ffd700" strokeWidth={1.5} />
        <text x={430} y={80} textAnchor="middle" fill="#ffd700" fontSize={7}>COALESCER</text>
        <text x={430} y={90} textAnchor="middle" fill="#8ab3ff" fontSize={6}>99.9% Eff.</text>
    </svg>
);

/** 7.8 Commercial — Price Build-up Chart */
export const PriceBuildUpSVG: React.FC<{ width?: number; height?: number }> = ({ width = 500, height = 350 }) => (
    <svg viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Axes */}
        <line x1={80} y1={30} x2={80} y2={310} stroke="#8ab3ff" strokeWidth={1.5} />
        <line x1={80} y1={310} x2={470} y2={310} stroke="#8ab3ff" strokeWidth={1.5} />
        <text x={40} y={170} textAnchor="middle" fill="#8ab3ff" fontSize={9} transform="rotate(-90,40,170)">Price ($/bbl)</text>
        <text x={275} y={335} textAnchor="middle" fill="#8ab3ff" fontSize={9}>Cost Component</text>

        {/* Bars — Waterfall */}
        <rect x={100} y={185} width={45} height={125} fill="#e94560" rx={3} />
        <text x={122} y={178} textAnchor="middle" fill="#e94560" fontSize={8}>Spot</text>
        <text x={122} y={315} textAnchor="middle" fill="#8ab3ff" fontSize={7}>$78.50</text>

        <rect x={160} y={160} width={45} height={150} fill="#ff6b6b" rx={3} />
        <text x={182} y={153} textAnchor="middle" fill="#ff6b6b" fontSize={8}>Pipeline</text>
        <text x={182} y={315} textAnchor="middle" fill="#8ab3ff" fontSize={7}>$82.50</text>

        <rect x={220} y={140} width={45} height={170} fill="#ffd700" rx={3} />
        <text x={242} y={133} textAnchor="middle" fill="#ffd700" fontSize={8}>Terminal</text>
        <text x={242} y={315} textAnchor="middle" fill="#8ab3ff" fontSize={7}>$85.00</text>

        <rect x={280} y={115} width={45} height={195} fill="#00bcd4" rx={3} />
        <text x={302} y={108} textAnchor="middle" fill="#00bcd4" fontSize={8}>Taxes</text>
        <text x={302} y={315} textAnchor="middle" fill="#8ab3ff" fontSize={7}>$92.00</text>

        <rect x={340} y={100} width={45} height={210} fill="#c084fc" rx={3} />
        <text x={362} y={93} textAnchor="middle" fill="#c084fc" fontSize={8}>Truck</text>
        <text x={362} y={315} textAnchor="middle" fill="#8ab3ff" fontSize={7}>$95.50</text>

        <rect x={400} y={85} width={45} height={225} fill="#10b981" rx={3} />
        <text x={422} y={78} textAnchor="middle" fill="#10b981" fontSize={8}>Retail</text>
        <text x={422} y={315} textAnchor="middle" fill="#8ab3ff" fontSize={7}>$98.00</text>

        {/* Y-axis labels */}
        {[0, 20, 40, 60, 80, 100].map(v => {
            const y = 310 - (v * 2.25);
            return (
                <g key={`y-${v}`}>
                    <line x1={75} y1={y} x2={80} y2={y} stroke="#8ab3ff" strokeWidth={1} />
                    <text x={70} y={y + 4} textAnchor="end" fill="#8ab3ff" fontSize={7}>{v}</text>
                </g>
            );
        })}
    </svg>
);

/** 7.9 Supply Chain Optimization — EOQ Graph */
export const EOQGraphSVG: React.FC<{ width?: number; height?: number }> = ({ width = 500, height = 300 }) => (
    <svg viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Axes */}
        <line x1={60} y1={260} x2={460} y2={260} stroke="#8ab3ff" strokeWidth={1.5} />
        <line x1={60} y1={20} x2={60} y2={260} stroke="#8ab3ff" strokeWidth={1.5} />
        <text x={250} y={290} textAnchor="middle" fill="#8ab3ff" fontSize={10}>Order Quantity (bbl)</text>
        <text x={20} y={140} textAnchor="middle" fill="#8ab3ff" fontSize={10} transform="rotate(-90,20,140)">Cost ($)</text>

        {/* Holding cost curve (increasing) */}
        <path d="M100,240 Q200,180 300,100 Q350,60 400,40" stroke="#e94560" strokeWidth={2} fill="none" />
        <text x={410} y={48} fill="#e94560" fontSize={8}>Holding</text>

        {/* Ordering cost curve (decreasing) */}
        <path d="M100,40 Q200,80 300,100 Q350,110 400,120" stroke="#00bcd4" strokeWidth={2} fill="none" />
        <text x={410} y={128} fill="#00bcd4" fontSize={8}>Ordering</text>

        {/* Total cost curve */}
        <path d="M100,170 Q200,120 300,110 Q340,115 400,130" stroke="#ffd700" strokeWidth={2.5} fill="none" />
        <text x={410} y={138} fill="#ffd700" fontSize={9} fontWeight="bold">Total Cost</text>

        {/* Optimal EOQ point */}
        <circle cx={260} cy={115} r={6} fill="#10b981" stroke="white" strokeWidth={2} />
        <line x1={260} y1={115} x2={260} y2={260} stroke="#10b981" strokeWidth={1} strokeDasharray="4,3" />
        <text x={260} y={275} textAnchor="middle" fill="#10b981" fontSize={9} fontWeight="bold">EOQ = 12,400 bbl</text>
    </svg>
);

// ─────────────────────────────────────────────────────────
// Default export: wrapper that routes type → named SVG
// ─────────────────────────────────────────────────────────

export type DistributionSvgType =
    | 'supply-chain' | 'pipelines' | 'marine' | 'rail' | 'truck'
    | 'terminal' | 'aviation' | 'commercial' | 'references';

interface DistributionSVGsProps {
    type: DistributionSvgType;
    data?: Record<string, unknown>;
}

const DistributionSVGs: React.FC<DistributionSVGsProps> = ({ type }) => {
    switch (type) {
        case 'supply-chain': return <SupplyChainNetworkSVG />;
        case 'pipelines': return <PipelineBatchSVG />;
        case 'marine': return <MarineTankerSVG />;
        case 'rail': return <RailLoadingSVG />;
        case 'truck': return <TruckRouteSVG />;
        case 'terminal': return <TerminalTankFarmSVG />;
        case 'aviation': return <AirportFuelFarmSVG />;
        case 'commercial': return <PriceBuildUpSVG />;
        case 'references': return <EOQGraphSVG />;
        default: return null;
    }
};

export default DistributionSVGs;
