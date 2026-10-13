import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import {
  Activity, ArrowDownToLine, ArrowRight, BookOpen, Check, ChevronDown, CircleHelp,
  Clipboard, Code2, Cpu, FileText, FlaskConical, Gauge, GitBranch, Info, Layers3,
  Lightbulb, Menu, Minus, Monitor, Play, Plus, Radio, RotateCcw, Search, Settings2,
  ShieldCheck, Sparkles, Terminal, Vote, X,
} from 'lucide-react';
import { circuits, expected, experiments, gates, inputRows, moduleTemplate, modules, testbenchTemplate, vivaQuestions, type Circuit } from './lab-data';

const STORE = {
  progress: 'iverilog-lab-progress',
  quiz: 'iverilog-lab-quiz-score',
  details: 'iverilog-lab-student-details',
  vote: 'iverilog-lab-evm-vote',
  votes: 'iverilog-lab-evm-counts',
  circuit: 'iverilog-lab-selected-circuit',
  gate: 'iverilog-lab-selected-gate',
};
const readStore = <T,>(key: string, fallback: T): T => {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; } catch { return fallback; }
};
const writeStore = (key: string, value: unknown) => localStorage.setItem(key, JSON.stringify(value));
function useCircuitSelection(scope: 'gates' | 'lab' = 'lab') {
  const key = scope === 'gates' ? STORE.gate : STORE.circuit;
  const [circuit, setCircuitState] = useState<Circuit>(() => {
    const saved = readStore<Circuit | null>(key, null);
    return saved && circuits.includes(saved) && (scope !== 'gates' || gates.includes(saved)) ? saved : 'AND';
  });
  const setCircuit = (next: Circuit) => {
    if (scope === 'gates' && !gates.includes(next)) return;
    setCircuitState(next);
    writeStore(key, next);
  };
  return [circuit, setCircuit] as const;
}

const navSections = [
  { group: 'LAB BENCH', items: [
    { to: '/', label: 'Dashboard', icon: Gauge },
    { to: '/logic-gates', label: 'Logic gates', icon: GitBranch },
    { to: '/code-editor', label: 'Code editor', icon: Code2 },
    { to: '/testbench', label: 'Testbench', icon: Check },
    { to: '/simulation', label: 'Demo simulation', icon: Activity },
    { to: '/waveform', label: 'Waveform viewer', icon: Radio },
  ] },
  { group: 'LEARN & PRACTISE', items: [
    { to: '/experiments', label: 'Experiments', icon: FlaskConical },
    { to: '/evm', label: 'EVM demo', icon: Vote },
    { to: '/learning', label: 'Learning modules', icon: BookOpen },
    { to: '/viva', label: 'Viva practice', icon: CircleHelp },
    { to: '/documentation', label: 'Project report', icon: FileText },
    { to: '/about', label: 'About & student', icon: Info },
  ] },
];
const navItems = navSections.flatMap((section) => section.items);

function AppShell() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [progress, setProgress] = useState<string[]>(() => readStore(STORE.progress, []));
  const current = navItems.find((item) => item.to === location.pathname);
  useEffect(() => {
    document.title = 'IVerilog Digital Logic Lab: Interactive Verilog Simulator & Learning Platform';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.setAttribute('name', 'description'); document.head.appendChild(meta); }
    meta.setAttribute('content', 'A practical digital-logic classroom for truth tables, Verilog examples, and transparent demo simulation.');
  }, []);
  useEffect(() => setMobileOpen(false), [location.pathname]);
  useEffect(() => {
    setProgress((previous) => {
      const next = previous.includes(location.pathname) ? previous : [...previous, location.pathname];
      writeStore(STORE.progress, next);
      return next;
    });
  }, [location.pathname]);
  return <div className="min-h-[100dvh]">
    <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-[258px] flex-col border-r border-[#20394b] bg-[#08131f] lg:flex">
      <Brand />
      <div className="px-3 pb-5 pt-4">
        {navSections.map((section) => <div key={section.group} className="mb-6">
          <div className="px-3 pb-2 text-[9px] font-extrabold tracking-[.17em] text-[#667d90]">{section.group}</div>
          <nav aria-label={section.group} className="space-y-1">
            {section.items.map(({ to, label, icon: Icon }) => <Link key={to} to={to} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`} aria-current={location.pathname === to ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-[10px] text-[12px] font-semibold transition ${location.pathname === to ? 'border border-[#194458] bg-[#102b3b] text-[#6de2f0]' : 'text-[#9aabba] hover:bg-[#132333] hover:text-[#dce7ed]'}`}>
              <Icon size={15} strokeWidth={1.8} /><span>{label}</span>
              {to === '/simulation' && <span className="ml-auto rounded border border-[#41566a] px-1.5 py-[2px] text-[8px] tracking-wide text-[#a9bac6]">DEMO</span>}
            </Link>)}
          </nav>
        </div>)}
      </div>
      <div className="mt-auto p-3">
        <div className="rounded-xl border border-[#1b3a4b] bg-[#0d202e] p-3">
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#d9e7ec]"><span className="live-dot" /> BROWSER LAB</div>
          <p className="mb-2 mt-2 text-[10px] leading-relaxed text-[#8da2b2]">Logic is evaluated with a built-in oracle. No HDL compiler is connected.</p>
          <div className="mono text-[9px] text-[#5ac9db]">iverilog · unavailable here</div>
        </div>
        <div className="mt-3 px-2 text-[9px] text-[#718697]">{progress.length} of {navItems.length} sections visited</div>
      </div>
    </aside>
    <header className="no-print sticky top-0 z-20 flex h-[62px] items-center justify-between border-b border-[#20394b] bg-[#091521]/95 px-4 backdrop-blur lg:ml-[258px] lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" aria-label="Open navigation" data-testid="button-mobile-menu" className="btn btn-quiet !p-2 lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X size={18} /> : <Menu size={18} />}</button>
        <div className="hidden items-center gap-2 text-[11px] text-[#718697] sm:flex"><span>Digital logic lab</span><span className="text-[#3c5668]">/</span><span className="text-[#c0ced6]">{current?.label ?? 'Not found'}</span></div>
        <div className="sm:hidden text-[12px] font-bold text-[#cfdee7]">{current?.label ?? 'IVerilog Lab'}</div>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden items-center gap-2 rounded-full border border-[#295044] bg-[#12281f] px-3 py-1.5 text-[10px] font-bold text-[#8ce0bd] sm:inline-flex"><span className="live-dot" /> Demo mode</span>
        <Link to="/about" className="flex h-8 w-8 items-center justify-center rounded-full border border-[#355168] bg-[#142737] text-[10px] font-extrabold text-[#65d9e9]" aria-label="Student settings" data-testid="link-student-settings">DL</Link>
      </div>
    </header>
    {mobileOpen && <div className="no-print fixed inset-0 z-40 bg-[#06101a]/80 lg:hidden" onClick={() => setMobileOpen(false)}>
      <aside className="h-full w-[280px] overflow-y-auto border-r border-[#294456] bg-[#08131f] p-3" onClick={(event) => event.stopPropagation()}><Brand />{navSections.map((section) => <div key={section.group} className="mb-5">
        <div className="px-3 pb-2 pt-3 text-[9px] font-extrabold tracking-[.17em] text-[#667d90]">{section.group}</div>
        {section.items.map(({ to, label, icon: Icon }) => <Link key={to} to={to} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-xs ${location.pathname === to ? 'bg-[#102b3b] text-[#6de2f0]' : 'text-[#a4b3bf]'}`}><Icon size={16} />{label}</Link>)}
      </div>)}</aside>
    </div>}
    <main className="lab-grid min-h-[calc(100dvh-62px)] px-4 py-6 sm:px-6 lg:ml-[258px] lg:px-9 lg:py-8">
      <div className="mx-auto max-w-[1280px]">
        <Routes>
          <Route path="/" element={<Dashboard progress={progress} />} />
          <Route path="/logic-gates" element={<LogicGates />} />
          <Route path="/code-editor" element={<CodeEditor />} />
          <Route path="/testbench" element={<Testbench />} />
          <Route path="/simulation" element={<Simulation />} />
          <Route path="/waveform" element={<Waveform />} />
          <Route path="/experiments" element={<Experiments />} />
          <Route path="/evm" element={<Evm />} />
          <Route path="/learning" element={<Learning />} />
          <Route path="/viva" element={<Viva />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <footer className="no-print mt-12 flex flex-col justify-between gap-2 border-t border-[#20394b] py-5 text-[10px] text-[#738899] sm:flex-row">
          <span>IVerilog Digital Logic Lab <span className="text-[#3c586a]">·</span> Browser learning environment</span>
          <span>Truth-table oracle only · no compiler execution</span>
        </footer>
      </div>
    </main>
  </div>;
}

function Brand() {
  return <Link to="/" className="flex items-center gap-3 border-b border-[#1d3546] px-4 py-[19px]">
    <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#287087] bg-[#102e3e] text-[#57d9eb]"><Cpu size={20} /></span>
    <span><span className="block text-[13px] font-extrabold tracking-[-.03em] text-[#e6f0f4]">IVerilog <span className="text-[#59d5e8]">Lab</span></span><span className="mt-0.5 block text-[9px] tracking-[.08em] text-[#7890a2]">DIGITAL LOGIC STUDIO</span></span>
  </Link>;
}

function Heading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
    <div><div className="eyebrow mb-2">{eyebrow}</div><h1 className="page-title">{title}</h1><p className="muted mt-2 max-w-2xl text-[13px] leading-relaxed">{description}</p></div>
    {action}
  </div>;
}
function Panel({ children, className = '' }: { children: ReactNode; className?: string }) { return <section className={`panel ${className}`}>{children}</section>; }
function SectionLabel({ children }: { children: ReactNode }) { return <h2 className="text-[13px] font-extrabold tracking-[-.01em] text-[#e4edf1]">{children}</h2>; }
function Pill({ children, color = 'blue' }: { children: ReactNode; color?: 'blue' | 'green' | 'amber' }) {
  const palette = color === 'green' ? 'border-[#27634f] bg-[#11291f] text-[#86deb8]' : color === 'amber' ? 'border-[#68542b] bg-[#2a2315] text-[#e7bf6b]' : 'border-[#255168] bg-[#112637] text-[#71d6e7]';
  return <span className={`inline-flex items-center rounded-full border px-2 py-1 text-[9px] font-extrabold uppercase tracking-[.09em] ${palette}`}>{children}</span>;
}
function StatusNote({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'success' | 'warning' }) {
  const c = tone === 'success' ? 'border-[#285845] bg-[#10241e] text-[#a3ddc2]' : tone === 'warning' ? 'border-[#65532d] bg-[#292214] text-[#ead091]' : 'border-[#254558] bg-[#102330] text-[#a7c6d4]';
  return <div className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-[11px] leading-relaxed ${c}`}><Info size={14} className="mt-[1px] shrink-0" />{children}</div>;
}
function GateTable({ circuit, interactive = false }: { circuit: Circuit; interactive?: boolean }) {
  const rows = inputRows(circuit);
  const labels = circuit === 'Full Adder' ? ['A', 'B', 'CIN'] : circuit === '2:1 MUX' ? ['D0', 'D1', 'SEL'] : circuit === 'Counter' ? ['CURRENT Q'] : circuit === 'NOT' ? ['A'] : ['A', 'B'];
  const outLabels = Object.keys(expected(circuit, ...rows[0] as [number, number, number]));
  return <div className="table-wrap" data-testid={`table-truth-${circuit.toLowerCase().replaceAll(' ', '-')}`}><table><thead><tr>{labels.map((label) => <th key={label}>{label}</th>)}{outLabels.map((label) => <th key={label} className="text-[#58d4e7]">{circuit === 'Counter' ? 'NEXT Q' : label}</th>)}</tr></thead><tbody>{rows.map((row, index) => {
    const result = expected(circuit, row[0] ?? 0, row[1] ?? 0, row[2] ?? 0);
    return <tr key={index} data-testid={`row-vector-${index}`} className="mono text-[12px]"><td>{row[0]}</td>{row.slice(1).map((bit, bi) => <td key={bi}>{bit}</td>)}{outLabels.map((out) => <td key={out} className="font-bold text-[#5bd9e8]">{result[out]}</td>)}</tr>;
  })}</tbody></table>{interactive && <p className="px-3 py-2 text-[10px] text-[#8298a8]">{circuit === 'Counter' ? 'Four-bit next-state vectors with reset inactive: Q increments on each rising edge; reset asynchronously clears Q to 0.' : 'Combinational truth table · calculated locally by the lab oracle.'}</p>}</div>;
}
function CircuitSelect({ value, onChange }: { value: Circuit; onChange: (value: Circuit) => void }) {
  return <label className="flex items-center gap-2 text-[10px] font-bold text-[#90a6b5]">CIRCUIT
    <select className="field !w-auto !py-2 text-[11px]" aria-label="Select circuit" data-testid="select-circuit" value={value} onChange={(e) => onChange(e.target.value as Circuit)}>{circuits.map((c) => <option key={c}>{c}</option>)}</select>
  </label>;
}

function GateSymbol({ gate }: { gate: Circuit }) {
  const inverter = gate === 'NOT';
  const orShape = gate === 'OR' || gate === 'NOR' || gate === 'XOR' || gate === 'XNOR';
  const xorShape = gate === 'XOR' || gate === 'XNOR';
  const invertedOutput = gate === 'NAND' || gate === 'NOR' || gate === 'XNOR' || gate === 'NOT';
  const shapeEnd = inverter ? 82 : orShape ? 88 : 90;
  const bubbleX = inverter ? 89 : orShape ? 94 : 97;
  return <svg className="h-[92px] w-[174px] text-[#70dceb]" viewBox="0 0 150 100" role="img" aria-label={`${gate} logic gate symbol`} data-testid={`display-gate-symbol-${gate.toLowerCase()}`}>
    <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
      {inverter ? <><line x1="4" y1="50" x2="37" y2="50" /><path d="M37 25 L37 75 L82 50 Z" /></> : <><line x1="4" y1="37" x2="35" y2="37" /><line x1="4" y1="63" x2="35" y2="63" />
        {orShape ? <path d="M35 25 Q55 50 35 75 Q68 75 88 50 Q68 25 35 25 Z" /> : <path d="M35 25 L65 25 A25 25 0 0 1 65 75 L35 75 Z" />}
        {xorShape && <path d="M27 25 Q47 50 27 75" />}
      </>}
      <line x1={shapeEnd} y1="50" x2={invertedOutput ? bubbleX - 5 : shapeEnd} y2="50" />
      {invertedOutput && <circle cx={bubbleX} cy="50" r="5" fill="#0d1d29" />}
      <line x1={invertedOutput ? bubbleX + 5 : shapeEnd} y1="50" x2="145" y2="50" />
    </g>
    <g fill="#92aab8" fontSize="8" fontFamily="DM Mono, monospace">
      <text x="4" y={inverter ? 43 : 31}>A</text>{!inverter && <text x="4" y="77">B</text>}<text x="137" y="44">Y</text>
    </g>
  </svg>;
}

function Dashboard({ progress }: { progress: string[] }) {
  const [name] = useState(() => readStore(STORE.details, { name: '' }).name);
  const quick = [
    { to: '/logic-gates', icon: GitBranch, title: 'Switch the inputs', desc: 'Explore seven gates with a live truth table.', number: '01' },
    { to: '/code-editor', icon: Code2, title: 'Read the HDL', desc: 'Edit valid module and testbench examples.', number: '02' },
    { to: '/testbench', icon: Check, title: 'Check every vector', desc: 'Compare expected outputs with the oracle.', number: '03' },
    { to: '/simulation', icon: Play, title: 'Run a demo', desc: 'Walk through vectors and illustrative signals.', number: '04' },
  ];
  return <div>
    <div className="mb-8 grid gap-5 xl:grid-cols-[1.4fr_.6fr]">
      <Panel className="lab-grid relative overflow-hidden p-6 sm:p-8">
        <div className="absolute -right-8 -top-12 h-52 w-52 rounded-full border border-[#1b5366]/60 opacity-70" /><div className="absolute -right-1 top-2 h-36 w-36 rounded-full border border-[#1b5366]/50" />
        <div className="relative max-w-[660px]"><div className="mb-4 flex flex-wrap items-center gap-2"><Pill>Interactive classroom</Pill><Pill color="amber">Browser-only simulation</Pill></div>
          <div className="eyebrow mb-2">DIGITAL LOGIC · PRACTICAL SERIES 01</div>
          <h1 className="max-w-2xl text-[clamp(31px,5vw,52px)] font-extrabold leading-[1.04] tracking-[-.055em] text-[#f1f6f8]">Make logic visible.<br /><span className="text-[#57d9e9]">Learn it by switching.</span></h1>
          <p className="mt-4 max-w-xl text-[13px] leading-6 text-[#9db0bd]">A hands-on Verilog learning bench: change inputs, inspect correct truth tables, edit working examples, then check outputs against a transparent local oracle.{name ? ` Welcome back, ${name}.` : ''}</p>
          <div className="mt-6 flex flex-wrap gap-3"><Link to="/logic-gates" className="btn btn-primary" data-testid="link-start-gates">Open logic gates <ArrowRight size={15} /></Link><Link to="/experiments" className="btn btn-quiet" data-testid="link-browse-experiments">Browse experiments</Link></div>
        </div>
        <div className="relative mt-8 grid grid-cols-3 gap-3 border-t border-[#284556] pt-5 sm:max-w-[520px]">
          <div><div className="mono text-xl font-medium text-[#e5f1f5]">11</div><div className="mt-1 text-[9px] uppercase tracking-[.12em] text-[#8298a8]">Circuits</div></div>
          <div><div className="mono text-xl font-medium text-[#e5f1f5]">28</div><div className="mt-1 text-[9px] uppercase tracking-[.12em] text-[#8298a8]">Viva prompts</div></div>
          <div><div className="mono text-xl font-medium text-[#e5f1f5]">0</div><div className="mt-1 text-[9px] uppercase tracking-[.12em] text-[#8298a8]">Compiler claims</div></div>
        </div>
      </Panel>
      <Panel className="flex flex-col justify-between p-5 sm:p-6">
        <div><div className="flex items-center justify-between"><SectionLabel>What this lab runs</SectionLabel><span className="rounded-lg border border-[#283e4e] bg-[#0c1a27] p-2 text-[#73d8e7]"><Terminal size={16} /></span></div>
          <div className="mt-5 rounded-lg border border-[#2b4a5a] bg-[#0b1924] p-4">
            <div className="flex items-center gap-2 text-[11px] font-extrabold text-[#dce9ed]"><span className="live-dot" /> Demo Simulation</div>
            <p className="mt-2 text-[11px] leading-relaxed text-[#8ea4b2]">Browser truth-table evaluation only. Your Verilog text is not compiled or executed here.</p>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between gap-4 border-t border-[#243d4e] pt-4">
          <div><div className="mono text-[16px] text-[#dbe7ec]">{progress.length}<span className="text-[#647e90]"> / 12</span></div><div className="mt-1 text-[9px] uppercase tracking-[.1em] text-[#8298a8]">Routes visited</div></div>
          <Link to="/learning" className="btn !px-3 !py-2 text-[10px]" data-testid="link-toolchain-guide">Toolchain guide <ArrowRight size={13} /></Link>
        </div>
      </Panel>
    </div>
    <div className="mb-3 flex items-center justify-between"><div><div className="eyebrow">LEARN THROUGH A LOOP</div><h2 className="mt-1 text-lg font-extrabold text-[#e7eff2]">A practical bench, not a black box.</h2></div><span className="hidden text-[10px] text-[#8498a7] sm:block">Pick up at any step</span></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{quick.map(({ to, icon: Icon, title, desc, number }) => <Link key={to} to={to} className="panel group p-4 transition hover:border-[#3a7185]" data-testid={`card-quick-${number}`}>
      <div className="mb-4 flex items-center justify-between"><span className="rounded-lg border border-[#2a4b5d] bg-[#0c1d2a] p-2 text-[#59d1e3]"><Icon size={17} /></span><span className="mono text-[10px] text-[#607b8d]">{number}</span></div>
      <div className="text-[13px] font-extrabold text-[#dce7ec]">{title}</div><p className="mt-1.5 min-h-8 text-[10px] leading-relaxed text-[#8da2b0]">{desc}</p>
      <div className="mt-4 flex items-center gap-1 text-[10px] font-extrabold text-[#68d6e6]">Open section <ArrowRight size={12} className="transition group-hover:translate-x-1" /></div>
    </Link>)}</div>
    <div className="mb-3 mt-8 flex items-end justify-between gap-3"><div><div className="eyebrow">START WITH AN EXPERIMENT</div><h2 className="mt-1 text-lg font-extrabold text-[#e7eff2]">Featured logic studies</h2></div><Link to="/experiments" className="text-[10px] font-bold text-[#69d9e7]" data-testid="link-all-experiments">All 11 experiments <ArrowRight size={12} className="inline" /></Link></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[
      ['AND', 'Two inputs, one condition', 'Gates'],
      ['Half Adder', 'Sum and carry from two bits', 'Arithmetic'],
      ['2:1 MUX', 'Select one data input', 'Combinational'],
      ['Counter', 'Track a four-bit state sequence', 'Sequential'],
    ].map(([name, summary, tag]) => <Link key={name} to="/experiments" onClick={() => writeStore(STORE.circuit, name)} className="panel group p-4 transition hover:border-[#3a7185]" data-testid={`card-featured-experiment-${name.toLowerCase().replaceAll(' ', '-')}`}>
      <div className="flex items-center justify-between"><span className="rounded-lg border border-[#284b5d] bg-[#0c1d2a] p-2 text-[#59d1e3]"><FlaskConical size={16} /></span><span className="eyebrow !text-[8px]">{tag}</span></div>
      <div className="mt-4 text-[12px] font-extrabold text-[#dce7ec]">{name}</div><p className="mt-1 min-h-7 text-[10px] leading-relaxed text-[#8da2b0]">{summary}</p>
      <div className="mt-3 flex items-center gap-1 text-[9px] font-extrabold text-[#68d6e6]">Open experiment <ArrowRight size={11} className="transition group-hover:translate-x-1" /></div>
    </Link>)}</div>
    <div className="mt-6 grid gap-3 md:grid-cols-2">
      <Panel className="flex items-center justify-between gap-4 p-4"><div className="flex items-center gap-3"><span className="rounded-lg border border-[#574928] bg-[#292214] p-2 text-[#e1bd69]"><Vote size={17} /></span><div><div className="text-[12px] font-bold">Model a tiny election</div><div className="mt-1 text-[10px] text-[#879ba8]">One vote per browser until reset. No real voting.</div></div></div><Link to="/evm" className="btn !px-3 !py-2 text-[10px]" data-testid="link-evm">Open EVM</Link></Panel>
      <Panel className="flex items-center justify-between gap-4 p-4"><div className="flex items-center gap-3"><span className="rounded-lg border border-[#245365] bg-[#102736] p-2 text-[#59d1e3]"><BookOpen size={17} /></span><div><div className="text-[12px] font-bold">Save the viva score</div><div className="mt-1 text-[10px] text-[#879ba8]">Practice questions and keep your best attempt locally.</div></div></div><Link to="/viva" className="btn !px-3 !py-2 text-[10px]" data-testid="link-viva">Practice viva</Link></Panel>
    </div>
  </div>;
}

function LogicGates() {
  const [selected, setSelected] = useCircuitSelection('gates');
  const [a, setA] = useState(0); const [b, setB] = useState(0);
  const unary = selected === 'NOT';
  const output = expected(selected, a, b).Y;
  const changeCircuit = (gate: Circuit) => { setSelected(gate); setA(0); setB(0); };
  const toggle = (bit: number, set: (value: number) => void) => set(bit ? 0 : 1);
  return <div><Heading eyebrow="LAB BENCH / 01" title="Logic gates" description="Flip real Boolean input states and trace the result. The output is evaluated locally from each gate’s defining truth function." action={<Pill color="green">Oracle active</Pill>} />
    <div className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
      <Panel className="p-5">
        <div className="flex items-center justify-between"><SectionLabel>Choose a gate</SectionLabel><span className="mono text-[10px] text-[#71899a]">07 ELEMENTS</span></div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-2">{gates.map((gate, i) => <button type="button" key={gate} onClick={() => changeCircuit(gate)} aria-pressed={selected === gate} data-testid={`button-select-gate-${gate.toLowerCase()}`}
          className={`flex items-center justify-between rounded-lg border px-3 py-3 text-left text-[11px] font-extrabold transition ${selected === gate ? 'border-[#2b8291] bg-[#102e3a] text-[#70e1ec]' : 'border-[#263e4e] bg-[#0c1a26] text-[#9eb0bd] hover:border-[#3a6578]'}`}>
          <span>{gate}</span><span className="mono text-[9px] text-[#647d8d]">G{i + 1}</span></button>)}</div>
        <div className="mt-6 rounded-xl border border-[#243e4e] bg-[#0a1823] p-4">
          <div className="eyebrow mb-3">CURRENT INPUTS</div>
          <div className="space-y-3">
            {[[a, setA, 'A'], ...(!unary ? [[b, setB, 'B'] as [number, (value: number) => void, string]] : [])].map(([val, set, label]) => <div key={label as string} className="flex items-center justify-between rounded-lg border border-[#213a4a] bg-[#0e202d] px-3 py-2.5">
              <span className="mono text-[12px] text-[#c4d2da]">{label as string}</span><button type="button" onClick={() => toggle(val as number, set as (value: number) => void)} aria-label={`Toggle input ${label}`} aria-pressed={Boolean(val)} data-testid={`toggle-input-${String(label).toLowerCase()}`} className={`relative h-7 w-[54px] rounded-full border transition ${val ? 'border-[#2998a7] bg-[#175c67]' : 'border-[#425263] bg-[#1b2a37]'}`}><span className={`absolute top-[3px] h-[19px] w-[19px] rounded-full bg-[#d6e8eb] transition-transform ${val ? 'translate-x-[28px]' : 'translate-x-[3px]'}`} /><span className="sr-only">{val ? 'High' : 'Low'}</span></button>
              <span className={`mono w-8 text-right text-[11px] font-bold ${val ? 'text-[#59ddea]' : 'text-[#8397a6]'}`}>{val ? 'HIGH' : 'LOW'}</span>
            </div>)}
          </div>
        </div>
      </Panel>
      <div className="space-y-4">
        <Panel className="p-5 sm:p-6">
          <div className="flex items-start justify-between"><div><div className="eyebrow">LIVE TRUTH STATE</div><h2 className="mt-1 text-[22px] font-extrabold tracking-tight">{selected} gate</h2></div><Pill color="green">Calculated</Pill></div>
          <div className="my-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-4 rounded-xl border border-[#203c4e] bg-[#081722] px-5 py-7">
            <div className="space-y-3">{[['A', a], ...(!unary ? [['B', b] as [string, number]] : [])].map(([label, value]) => <div key={label as string} className="flex items-center gap-3"><span className="mono w-4 text-xs text-[#9bb1bf]">{label as string}</span><span className={`h-[2px] w-12 ${value ? 'bg-[#55d7e9]' : 'bg-[#466072]'}`} /><span className={`mono text-[10px] ${value ? 'text-[#60dce9]' : 'text-[#91a2ac]'}`}>{value ? '1' : '0'}</span></div>)}</div>
             <div className="flex min-h-[100px] min-w-[174px] items-center justify-center rounded-[18px] border border-[#315467] bg-[#112432] px-3"><GateSymbol gate={selected} /></div>
            <div className="flex items-center gap-3"><span className={`h-[2px] w-12 ${output ? 'bg-[#55d7e9]' : 'bg-[#466072]'}`} /><span className="mono text-xs text-[#9bb1bf]">Y</span><span className={`flex h-11 w-11 items-center justify-center rounded-full border mono text-[18px] font-bold ${output ? 'border-[#2b929f] bg-[#123943] text-[#68e7ed]' : 'border-[#395064] bg-[#152431] text-[#91a4b1]'}`}>{output}</span></div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3"><div><div className="text-[10px] text-[#8599a8]">Current result</div><div className="mono mt-1 text-sm text-[#dae7ed]">{selected === 'NOT' ? `Y = ¬${a} = ${output}` : `Y = f(${a}, ${b}) = ${output}`}</div></div><button type="button" className="btn !py-2 text-[10px]" onClick={() => { setA(0); setB(0); }} data-testid="button-reset-inputs"><RotateCcw size={13} /> Reset inputs</button></div>
        </Panel>
        <Panel className="p-5"><div className="mb-3 flex items-center justify-between"><SectionLabel>Complete truth table</SectionLabel><span className="mono text-[9px] text-[#7f95a5]">2ⁿ INPUT VECTORS</span></div><GateTable circuit={selected} interactive /><StatusNote>These values come from Boolean equations in this app, not from compiled HDL.</StatusNote></Panel>
      </div>
    </div>
  </div>;
}

function CodeEditor() {
  const [circuit, setCircuit] = useCircuitSelection();
  const [source, setSource] = useState(() => moduleTemplate(circuit));
  const [bench, setBench] = useState(() => testbenchTemplate(circuit));
  const [moduleMessage, setModuleMessage] = useState('');
  const [benchMessage, setBenchMessage] = useState('');
  const moduleCheck = checkHdlStructure(source, 'module');
  const benchCheck = checkHdlStructure(bench, 'testbench');
  const switchCircuit = (next: Circuit) => { setCircuit(next); setSource(moduleTemplate(next)); setBench(testbenchTemplate(next)); setModuleMessage('Template loaded.'); setBenchMessage('Template loaded.'); };
  async function copyText(text: string, target: 'module' | 'bench') {
    const updateMessage = target === 'module' ? setModuleMessage : setBenchMessage;
    try { await navigator.clipboard.writeText(text); updateMessage('Copied to clipboard.'); } catch { updateMessage('Clipboard permission unavailable. Select the code and copy it manually.'); }
  }
  function download(text: string, filename: string, target: 'module' | 'bench') {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    (target === 'module' ? setModuleMessage : setBenchMessage)(`${filename} downloaded.`);
  }
  return <div><Heading eyebrow="LAB BENCH / 02" title="Code editor" description="Study syntactically valid Verilog templates, then make edits. This editor is a text workspace—not a compiler." action={<CircuitSelect value={circuit} onChange={switchCircuit} />} />
    <StatusNote tone="warning">The text below is not compiled or executed in this browser. The simulation and testbench pages use a separate, fixed truth-table oracle.</StatusNote>
    <div className="mt-4 grid gap-4 xl:grid-cols-2">
      <Panel className="overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b border-[#294354] bg-[#10202d] px-4 py-3"><div><SectionLabel>Module · design.v</SectionLabel><div className="mono mt-1 text-[9px] text-[#7890a1]">{circuit} · Verilog source</div></div><div className="flex gap-1.5">
          <button type="button" className="btn !px-2 !py-1.5 text-[9px]" onClick={() => copyText(source, 'module')} data-testid="button-copy-module"><Clipboard size={12} /> Copy</button>
          <button type="button" className="btn !px-2 !py-1.5 text-[9px]" onClick={() => { setSource(moduleTemplate(circuit)); setModuleMessage('Module template restored.'); }} data-testid="button-reset-module"><RotateCcw size={12} /> Reset</button>
          <button type="button" className="btn !px-2 !py-1.5 text-[9px]" onClick={() => download(source, 'design.v', 'module')} data-testid="button-download-module"><ArrowDownToLine size={12} /> Download</button>
        </div></div>
        <div className="p-3 sm:p-4"><textarea className="codearea min-h-[360px]" spellCheck={false} aria-label="Verilog module source" data-testid="textarea-module-source" value={source} onChange={(e) => setSource(e.target.value)} /><div className="mt-2"><StatusNote tone={moduleCheck.ok ? 'success' : 'warning'}>{moduleCheck.message}</StatusNote></div><div className="mt-2 min-h-5 text-[10px] text-[#76d3e2]" role="status" data-testid="status-module-message">{moduleMessage}</div></div>
      </Panel>
      <Panel className="overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b border-[#294354] bg-[#10202d] px-4 py-3"><div><SectionLabel>Testbench · tb_design.v</SectionLabel><div className="mono mt-1 text-[9px] text-[#7890a1]">{circuit} · test vectors</div></div><div className="flex gap-1.5">
          <button type="button" className="btn !px-2 !py-1.5 text-[9px]" onClick={() => copyText(bench, 'bench')} data-testid="button-copy-testbench"><Clipboard size={12} /> Copy</button>
          <button type="button" className="btn !px-2 !py-1.5 text-[9px]" onClick={() => { setBench(testbenchTemplate(circuit)); setBenchMessage('Testbench template restored.'); }} data-testid="button-reset-testbench"><RotateCcw size={12} /> Reset</button>
          <button type="button" className="btn !px-2 !py-1.5 text-[9px]" onClick={() => download(bench, 'tb_design.v', 'bench')} data-testid="button-download-testbench"><ArrowDownToLine size={12} /> Download</button>
        </div></div>
        <div className="p-3 sm:p-4"><textarea className="codearea min-h-[360px]" spellCheck={false} aria-label="Verilog testbench source" data-testid="textarea-bench-source" value={bench} onChange={(e) => setBench(e.target.value)} /><div className="mt-2"><StatusNote tone={benchCheck.ok ? 'success' : 'warning'}>{benchCheck.message}</StatusNote></div><div className="mt-2 min-h-5 text-[10px] text-[#76d3e2]" role="status" data-testid="status-bench-message">{benchMessage}</div></div>
      </Panel>
    </div>
    <Panel className="mt-4 p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2"><Settings2 size={15} className="text-[#5ed4e5]" /><SectionLabel>Template notes</SectionLabel></div>
      <div className="grid gap-4 text-[11px] leading-relaxed text-[#98abb8] sm:grid-cols-2">
        <p>Combinational designs use continuous assignments. The sequential counter uses a clocked always block and a nonblocking assignment. Each panel can be edited, copied, reset, and downloaded independently.</p>
        <div><p>The testbench drives inputs and ends with <code className="mono text-[#65d5e3]">$finish</code>. The browser does not execute this HDL.</p><div className="mt-2 rounded-lg border border-[#284252] bg-[#091721] p-3"><div className="eyebrow mb-1">LOCAL TOOLCHAIN</div><code className="mono block text-[10px] leading-6 text-[#b8cbd3]">iverilog -g2012 -o sim.vvp design.v tb_design.v<br />vvp sim.vvp</code></div><Link to="/learning" className="mt-3 inline-flex items-center gap-2 text-[10px] font-bold text-[#6bd8e6]" data-testid="link-editor-learning">Read Verilog workflow <ArrowRight size={12} /></Link></div>
      </div>
    </Panel>
  </div>;
}

function checkHdlStructure(source: string, kind: 'module' | 'testbench') {
  if (!source.trim()) return { ok: false, message: 'Validation: source is empty. Add Verilog text before checking it.' };
  const moduleCount = source.match(/^\s*module\b/gm)?.length ?? 0;
  const endCount = source.match(/\bendmodule\b/g)?.length ?? 0;
  if (!moduleCount) return { ok: false, message: 'Validation: add a module declaration such as “module example;”.' };
  if (moduleCount !== endCount) return { ok: false, message: `Validation: found ${moduleCount} module declaration${moduleCount === 1 ? '' : 's'} and ${endCount} endmodule marker${endCount === 1 ? '' : 's'}. Check that each module is closed.` };
  if (kind === 'testbench' && !/\b(initial|always)\b/.test(source)) return { ok: false, message: 'Validation: add an initial or always block to drive testbench activity.' };
  if (kind === 'testbench' && !/\$finish\b/.test(source)) return { ok: false, message: 'Validation: add $finish to end a simulation run cleanly.' };
  return { ok: true, message: `Structure check passed (${moduleCount} module${moduleCount === 1 ? '' : 's'}). This is not a syntax parser and does not compile or verify behavior.` };
}

function Testbench() {
  const [circuit, setCircuit] = useCircuitSelection();
  const rows = inputRows(circuit);
  const outputs = Object.keys(expected(circuit, ...rows[0] as [number, number, number]));
  const passed = rows.length;
  return <div><Heading eyebrow="LAB BENCH / 03" title="Testbench checker" description="Walk each deterministic input vector against the known Boolean function. Expected and actual are the same browser oracle—not a simulator process." action={<CircuitSelect value={circuit} onChange={setCircuit} />} />
    <Panel className="mb-4 p-4 sm:p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3"><span className="rounded-lg border border-[#285b4a] bg-[#11291f] p-2 text-[#88ddb9]"><ShieldCheck size={18} /></span><div><SectionLabel>Vector comparison complete</SectionLabel><div className="mt-1 text-[10px] text-[#8ca1af]">All {rows.length} input vectors evaluated</div></div></div>
        <div className="flex gap-4"><div><div className="mono text-[18px] font-bold text-[#86ddb6]">{passed}</div><div className="text-[9px] uppercase tracking-wider text-[#8298a7]">Pass</div></div><div><div className="mono text-[18px] font-bold text-[#e67c73]">0</div><div className="text-[9px] uppercase tracking-wider text-[#8298a7]">Fail</div></div><div><div className="mono text-[18px] font-bold text-[#dae5eb]">{rows.length}</div><div className="text-[9px] uppercase tracking-wider text-[#8298a7]">Total</div></div></div>
      </div>
    </Panel>
    <Panel className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#2a4252] px-4 py-4"><div><SectionLabel>{circuit} · vector report</SectionLabel><div className="mt-1 text-[10px] text-[#8397a5]">Expected values compared against actual oracle output</div></div><Pill color="green">All pass</Pill></div>
       <div className="table-wrap"><table><thead><tr><th>#</th>{(circuit === 'Full Adder' ? ['A', 'B', 'CIN'] : circuit === '2:1 MUX' ? ['D0', 'D1', 'SEL'] : circuit === 'NOT' ? ['A'] : circuit === 'Counter' ? ['CURRENT Q'] : ['A', 'B']).map((l) => <th key={l}>{l}</th>)}{outputs.map((o) => <th key={`exp${o}`}>Expected {circuit === 'Counter' ? `next ${o}` : o}</th>)}{outputs.map((o) => <th key={`act${o}`}>Actual {circuit === 'Counter' ? `next ${o}` : o}</th>)}<th>Result</th></tr></thead>
        <tbody>{rows.map((row, index) => { const result = expected(circuit, row[0] ?? 0, row[1] ?? 0, row[2] ?? 0); return <tr className="mono text-[11px]" key={index} data-testid={`row-test-result-${index}`}><td className="text-[#7c93a2]">{String(index + 1).padStart(2, '0')}</td>{row.map((n, i) => <td key={i}>{n}</td>)}{outputs.map((o) => <td key={`e${o}`} className="text-[#9fb2bd]">{result[o]}</td>)}{outputs.map((o) => <td key={`a${o}`} className="font-bold text-[#58d6e6]">{result[o]}</td>)}<td><span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#8adbb7]"><Check size={12} /> PASS</span></td></tr>; })}</tbody></table></div>
      <div className="border-t border-[#263e4e] px-4 py-3"><StatusNote>“Actual” is generated by this page’s built-in Boolean oracle. No testbench text is run and no compiler output is fabricated.</StatusNote></div>
    </Panel>
  </div>;
}

function Simulation() {
  const [circuit, setCircuit] = useCircuitSelection();
  const [ran, setRan] = useState(false);
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const rows = inputRows(circuit);
  const execute = () => { setTime(new Date().toLocaleTimeString()); setRan(true); };
  const outputNames = Object.keys(expected(circuit, ...rows[0] as [number, number, number]));
  return <div><Heading eyebrow="LAB BENCH / 04" title="Demo simulation" description="A guided code-to-vectors workflow with honest logs, local oracle rows, and a sample waveform. This does not compile the editable HDL." action={<CircuitSelect value={circuit} onChange={(c) => { setCircuit(c); setRan(false); }} />} />
    <StatusNote tone="warning">No iverilog or vvp process is connected. “Run demo” evaluates the selected design’s documented truth function only. Logs and waveform are illustrative browser output.</StatusNote>
    <div className="mt-4 grid gap-4 xl:grid-cols-[.88fr_1.12fr]">
      <div className="space-y-4">
        <Panel className="p-5">
          <div className="mb-4 flex items-center justify-between"><SectionLabel>Run configuration</SectionLabel><span className="mono text-[9px] text-[#748d9e]">LOCAL / SAFE</span></div>
          <div className="space-y-3">
            {[['01', 'Select module', `${circuit} truth function`], ['02', 'Generate vectors', `${rows.length} input combinations`], ['03', 'Compare outputs', outputNames.join(', ') ]].map(([n, title, detail]) => <div key={n} className="flex items-center gap-3 rounded-lg border border-[#243d4c] bg-[#0b1925] p-3"><span className="mono text-[10px] text-[#56cfe2]">{n}</span><div><div className="text-[11px] font-bold text-[#d5e0e5]">{title}</div><div className="mt-1 text-[10px] text-[#8499a8]">{detail}</div></div><Check size={14} className="ml-auto text-[#5cbd9e]" /></div>)}
          </div>
          <button type="button" className="btn btn-primary mt-4 w-full" onClick={execute} data-testid="button-run-demo"><Play size={14} fill="currentColor" /> Run demo simulation</button>
        </Panel>
        <Panel className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#294152] bg-[#101f2b] px-4 py-3"><div className="flex items-center gap-2"><Terminal size={15} className="text-[#62d6e6]" /><SectionLabel>Demo log</SectionLabel></div><Pill color="amber">Not compiler output</Pill></div>
          <div className="mono space-y-2 p-4 text-[10px] leading-relaxed" role="log" aria-live="polite" data-testid="status-demo-log">
            <div className="text-[#72899a]">[{time}] &gt; browser demo session</div>
            {ran ? <><div className="text-[#74cde0]">[DEMO] Selected: {circuit} · built-in truth oracle</div><div className="text-[#a5b7c0]">[DEMO] Evaluated {rows.length} deterministic input vector{rows.length === 1 ? '' : 's'}</div><div className="text-[#a5b7c0]">[DEMO] Compared outputs: {outputNames.join(', ')}</div><div className="text-[#e8c977]">[NOTICE] No HDL source compiled. No VCD file produced.</div><div className="text-[#8bdcbb]">[DEMO] Result: vectors match the defined Boolean function.</div></> : <><div className="text-[#8096a5]">[READY] Awaiting a local demo run.</div><div className="text-[#e6c67d]">[NOTICE] This interface does not invoke iverilog or vvp.</div></>}
          </div>
        </Panel>
      </div>
      <div className="space-y-4">
         <Panel className="overflow-hidden"><div className="flex items-center justify-between border-b border-[#294152] px-4 py-3"><SectionLabel>Vector output</SectionLabel><span className="text-[9px] text-[#8499a8]">{ran ? 'DEMO RESULT' : 'PREVIEW'}</span></div><div className="table-wrap"><table><thead><tr><th>Time (illustrative)</th>{(circuit === 'Full Adder' ? ['A', 'B', 'CIN'] : circuit === '2:1 MUX' ? ['D0', 'D1', 'SEL'] : circuit === 'NOT' ? ['A'] : circuit === 'Counter' ? ['CURRENT Q'] : ['A', 'B']).map(x => <th key={x}>{x}</th>)}{outputNames.map((x) => <th className="text-[#57d6e7]" key={x}>{circuit === 'Counter' ? `NEXT ${x}` : x}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i} className="mono text-[11px]"><td className="text-[#8298a7]">{i * 10} ns*</td>{row.map((bit, j) => <td key={j}>{bit}</td>)}{outputNames.map((out) => <td className="font-bold text-[#60d7e5]" key={out}>{expected(circuit, row[0] ?? 0, row[1] ?? 0, row[2] ?? 0)[out]}</td>)}</tr>)}</tbody></table></div><p className="px-4 pb-3 text-[9px] text-[#6e8494]">* Illustrative vector spacing only; not a simulator time trace. Counter rows evaluate one next-state step with reset inactive; they do not represent a clock run.</p></Panel>
        <WaveChart sample />
      </div>
    </div>
  </div>;
}

type WaveValue = 0 | 1 | 'x' | 'z';
type WaveSignal = { name: string; values: WaveValue[]; times?: number[] };
function WaveChart({ sample = false, signals: supplied, timeScale = 1, timeUnit = 'ns' }: { sample?: boolean; signals?: WaveSignal[]; timeScale?: number; timeUnit?: string }) {
  const [zoom, setZoom] = useState(1);
  const signals = supplied ?? [{ name: 'clk', values: [0, 1, 0, 1, 0, 1, 0, 1] }, { name: 'A', values: [0, 0, 1, 1, 0, 0, 1, 1] }, { name: 'B', values: [0, 1, 0, 1, 0, 1, 0, 1] }, { name: 'Y · XOR', values: [0, 1, 1, 0, 0, 1, 1, 0] }];
  const width = 620 * zoom; const left = 96; const xSpan = width - left - 20; const rowH = 38;
  const maxTime = supplied ? Math.max(10, ...signals.flatMap((s) => s.times?.length ? [s.times[s.times.length - 1] ?? 0] : [])) : 80;
  const xAt = (time: number) => left + (time / maxTime) * xSpan;
  const formatTime = (tick: number) => `${Number((tick * timeScale).toFixed(3))} ${timeUnit}`;
  return <Panel className="overflow-hidden">
    <div className="flex flex-col justify-between gap-3 border-b border-[#294152] px-4 py-3 sm:flex-row sm:items-center"><div><div className="flex items-center gap-2"><Activity size={14} className="text-[#5bd6e7]" /><SectionLabel>{supplied ? 'Imported VCD waveform' : sample ? 'Sample waveform preview' : 'Generated sample waveform'}</SectionLabel></div><div className="mt-1 text-[9px] text-[#8196a5]">{supplied ? `Imported scalar changes · VCD timescale ${timeScale} ${timeUnit} per tick` : 'Generated sample signals · not VCD data'}</div></div>
      <div className="flex gap-1"><button type="button" aria-label="Zoom waveform in" className="btn !p-2" onClick={() => setZoom((z) => Math.min(1.7, z + .15))} data-testid="button-wave-zoom-in"><Plus size={13} /></button><button type="button" aria-label="Zoom waveform out" className="btn !p-2" onClick={() => setZoom((z) => Math.max(.7, z - .15))} data-testid="button-wave-zoom-out"><Minus size={13} /></button><button type="button" className="btn !p-2" onClick={() => setZoom(1)} aria-label="Reset waveform zoom" data-testid="button-wave-reset"><RotateCcw size={12} /></button></div>
    </div>
    <div className="scrollbar-thin overflow-x-auto p-3"><svg width={width} height={signals.length * rowH + 26} role="img" aria-label={`${supplied ? 'Imported VCD' : 'Generated sample'} waveform with ${signals.length} digital signals`} data-testid="display-wave-chart">
      {Array.from({ length: 9 }, (_, i) => { const tick = maxTime * i / 8; return <g key={i}><line x1={xAt(tick)} y1="0" x2={xAt(tick)} y2={signals.length * rowH} stroke="#1b3546" strokeDasharray="2 4" /><text x={xAt(tick)} y={signals.length * rowH + 16} fill="#698395" fontSize="9" fontFamily="DM Mono, monospace">{formatTime(tick)}</text></g>; })}
      {signals.map((signal, row) => {
        const y = row * rowH + 7; const hi = y + 5; const mid = y + 14; const lo = y + 24;
        const level = (value: WaveValue) => value === 1 ? hi : value === 0 ? lo : mid;
        const times = signal.times ?? signal.values.map((_, i) => i * 10);
        const points: string[] = [];
        if (signal.values.length) {
          points.push(`${xAt(times[0] ?? 0)},${level(signal.values[0])}`);
          for (let i = 1; i < signal.values.length; i++) {
            const x = xAt(times[i] ?? times[i - 1] ?? 0);
            points.push(`${x},${level(signal.values[i - 1])}`, `${x},${level(signal.values[i])}`);
          }
          points.push(`${xAt(maxTime)},${level(signal.values[signal.values.length - 1])}`);
        }
        const unknowns = signal.values.map((value, i) => (value === 'x' || value === 'z') && <text key={i} x={xAt(times[i] ?? 0)} y={mid + 3} fill="#e4bd70" fontSize="9" textAnchor="middle">{value.toUpperCase()}</text>);
        return <g key={signal.name}><text x="7" y={y + 15} fill="#a6bbc7" fontSize="10" fontFamily="DM Mono, monospace">{signal.name}</text><line x1={left} y1={y + 29} x2={width} y2={y + 29} stroke="#1b3342" /><polyline points={points.join(' ')} fill="none" stroke="#50d3e4" strokeWidth="2" strokeLinejoin="round" />{unknowns}</g>;
      })}
    </svg></div>
  </Panel>;
}

function Waveform() {
  const [signals, setSignals] = useState<WaveSignal[] | null>(null);
  const [fileLabel, setFileLabel] = useState('');
  const [error, setError] = useState('');
  const [timeScale, setTimeScale] = useState(1);
  const [timeUnit, setTimeUnit] = useState('ns');
  async function loadVcd(file?: File) {
    if (!file) return;
    setError('');
    if (!file.name.toLowerCase().endsWith('.vcd')) { setError('Choose a .vcd file.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('This local viewer accepts VCD files up to 5 MB.'); return; }
    try {
      const text = await file.text();
      const scaleMatch = text.match(/\$timescale\s+(\d+)\s*(s|ms|us|ns|ps|fs)\s+\$end/i);
      const scale = scaleMatch ? Number(scaleMatch[1]) : 1;
      if (!Number.isFinite(scale) || scale <= 0) { setError('VCD timescale must be a positive finite value.'); return; }
      const unit = scaleMatch?.[2]?.toLowerCase() ?? 'ticks';
      const ids = new Map<string, string>();
      for (const match of text.matchAll(/\$var\s+\w+\s+\d+\s+(\S+)\s+([^\s$]+)[\s\S]*?\$end/g)) ids.set(match[1], match[2]);
      if (!ids.size) { setError('No VCD signal declarations found in this file.'); return; }
      const collected = new Map<string, { values: WaveValue[]; times: number[] }>();
      for (const [, name] of ids) if (!collected.has(name)) collected.set(name, { values: [], times: [] });
      let currentTime = 0;
      for (const line of text.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (/^#\d+$/.test(trimmed)) { currentTime = Number(trimmed.slice(1)); continue; }
        const m = trimmed.match(/^([01xXzZ])(\S+)$/);
        if (m && ids.has(m[2])) {
          if (!Number.isSafeInteger(currentTime)) { setError('VCD timestamp is outside the safe integer range.'); return; }
          const trace = collected.get(ids.get(m[2])!);
          if (!trace) continue;
          const value: WaveValue = m[1] === '0' || m[1] === '1' ? Number(m[1]) as 0 | 1 : m[1].toLowerCase() as 'x' | 'z';
          if (trace.times.at(-1) === currentTime) trace.values[trace.values.length - 1] = value;
          else { trace.times.push(currentTime); trace.values.push(value); }
        }
      }
      const parsed = Array.from(collected, ([name, trace]) => ({ name, ...trace }));
      if (!parsed.some((s) => s.values.length)) { setError('This viewer currently supports scalar 0/1/x/z VCD changes; no scalar traces were found.'); return; }
      setSignals(parsed); setFileLabel(file.name); setTimeScale(scale); setTimeUnit(unit);
    } catch { setError('Could not read the selected file.'); }
  }
  return <div><Heading eyebrow="LAB BENCH / 05" title="Waveform viewer" description="Inspect generated sample signals, or import a scalar VCD file from a real local simulator run. The distinction is shown explicitly." />
    <div className="mb-4 grid gap-3 md:grid-cols-[1.15fr_.85fr]"><StatusNote tone={signals ? 'success' : 'warning'}>{signals ? <>Loaded scalar changes from <strong>{fileLabel}</strong>. The chart uses this file’s timestamps and timescale.</> : <>Generated sample signals are illustrative, not VCD output. No waveform file is created by the demo simulator.</>}</StatusNote>
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[#3b6072] bg-[#0d202c] px-3 py-2.5 text-[10px] font-bold text-[#acd1dc] hover:border-[#58c9d9]" data-testid="input-load-vcd"><ArrowDownToLine size={14} />Load a local .vcd<input type="file" accept=".vcd,text/plain" className="sr-only" aria-label="Load VCD file" onChange={(e) => loadVcd(e.target.files?.[0])} /></label>
    </div>
    {error && <div role="alert" className="mb-4 rounded-lg border border-[#6e3d3a] bg-[#2c1718] p-3 text-[11px] text-[#efaaa2]" data-testid="status-vcd-error">{error}</div>}
    <WaveChart signals={signals ?? undefined} timeScale={timeScale} timeUnit={timeUnit} />
    {signals && <button type="button" className="btn mt-3 text-[10px]" onClick={() => { setSignals(null); setFileLabel(''); setTimeScale(1); setTimeUnit('ns'); }} data-testid="button-clear-vcd"><RotateCcw size={13} />Return to generated sample</button>}
    <div className="mt-4 grid gap-3 md:grid-cols-2"><Panel className="p-4"><div className="mb-2 flex items-center gap-2 text-[11px] font-bold"><Layers3 size={14} className="text-[#60d3e3]" />What the chart shows</div><p className="text-[10px] leading-relaxed text-[#8fa3b0]">Digital high/low transitions placed on a simple time ruler. Zoom controls change the horizontal scale. To get authentic waveforms, create a VCD with Icarus Verilog then load it above.</p></Panel><Panel className="p-4"><div className="mb-2 text-[11px] font-bold">Local VCD workflow</div><code className="mono text-[10px] leading-6 text-[#83cddd]">initial begin<br />&nbsp; $dumpfile("dump.vcd");<br />&nbsp; $dumpvars(0, tb);<br />end</code></Panel></div>
  </div>;
}

function Experiments() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [active, setActive] = useCircuitSelection();
  const [tab, setTab] = useState<'aim' | 'theory' | 'code' | 'bench' | 'table' | 'viva'>('aim');
  const categories = ['All', 'Gates', 'Adders', 'Combinational', 'Sequential'];
  const filtered = experiments.filter((item) => {
    const isGate = gates.includes(item.name as Circuit);
    const cat = item.name === 'Half Adder' || item.name === 'Full Adder' ? 'Adders' : isGate ? 'Gates' : item.name === 'Counter' ? 'Sequential' : 'Combinational';
    return (filter === 'All' || filter === cat) && `${item.name} ${item.aim} ${item.theory}`.toLowerCase().includes(query.toLowerCase());
  });
  const experiment = experiments.find((item) => item.name === active)!;
  const tabItems = [
    ['aim', 'Aim'], ['theory', 'Theory'], ['code', 'Verilog'], ['bench', 'Testbench'], ['table', active === 'Counter' ? 'Behavior' : 'Truth table'], ['viva', 'Viva Q&A'],
  ] as const;
  return <div><Heading eyebrow="LEARN & PRACTISE / 01" title="Experiment library" description="Eleven lab exercises, from a single inverter to sequential state. Each includes the aim, explanation, code, vectors, and an oral-check prompt." />
    <div className="grid gap-4 xl:grid-cols-[300px_1fr]">
      <Panel className="overflow-hidden">
        <div className="border-b border-[#2a4252] p-4"><label className="relative block"><Search size={14} className="absolute left-3 top-3 text-[#7790a0]" /><input className="field !pl-9 text-[11px]" type="search" placeholder="Find an experiment…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search experiments" data-testid="input-search-experiments" /></label>
          <div className="mt-3 flex flex-wrap gap-1">{categories.map((c) => <button type="button" key={c} onClick={() => setFilter(c)} aria-pressed={filter === c} className={`rounded-full border px-2 py-1 text-[9px] font-bold ${filter === c ? 'border-[#2c8291] bg-[#123440] text-[#6bdeeb]' : 'border-[#304656] text-[#8ca0ae]'}`} data-testid={`filter-experiments-${c.toLowerCase()}`}>{c}</button>)}</div>
        </div>
        <div className="max-h-[680px] overflow-y-auto p-2 scrollbar-thin" data-testid="list-experiments">
          {filtered.map((item, index) => <button type="button" key={item.name} onClick={() => { setActive(item.name); setTab('aim'); }} aria-pressed={active === item.name} data-testid={`button-experiment-${item.name.toLowerCase().replaceAll(' ', '-')}`} className={`mb-1 w-full rounded-lg border p-3 text-left transition ${active === item.name ? 'border-[#2d7282] bg-[#102b38]' : 'border-transparent hover:border-[#294454] hover:bg-[#0e202c]'}`}>
            <div className="flex items-center justify-between"><span className={`text-[11px] font-extrabold ${active === item.name ? 'text-[#76deea]' : 'text-[#d0dce2]'}`}>{item.name}</span><span className="mono text-[9px] text-[#718a9a]">{String(index + 1).padStart(2, '0')}</span></div><p className="mt-1 line-clamp-2 text-[9px] leading-relaxed text-[#8297a5]">{item.aim}</p>
          </button>)}
          {!filtered.length && <div className="p-5 text-center text-[11px] text-[#8da0ad]">No experiment matches. Try a different term or category.</div>}
        </div>
      </Panel>
      <div className="min-w-0 space-y-4">
        <Panel className="p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="eyebrow">LAB EXERCISE</div><h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#e7eff3]" data-testid="text-active-experiment">{experiment.name}</h2></div><Pill>{experiment.rows.length} vectors</Pill></div>
          <div className="mt-4 flex gap-1 overflow-x-auto border-b border-[#294252]" role="tablist" aria-label="Experiment details">{tabItems.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`shrink-0 border-b-2 px-3 py-2.5 text-[10px] font-bold ${tab === id ? 'border-[#51d4e6] text-[#6cdeea]' : 'border-transparent text-[#8297a5] hover:text-[#c9d6dd]'}`} data-testid={`tab-experiment-${id}`}>{label}</button>)}</div>
          <div className="min-h-[280px] pt-5">
            {tab === 'aim' && <div><div className="mb-3 text-[10px] font-extrabold uppercase tracking-widest text-[#92a8b6]">Aim</div><p className="text-[15px] leading-relaxed text-[#d1dde3]">{experiment.aim}</p><div className="mt-6 rounded-lg border border-[#294454] bg-[#0b1924] p-4"><div className="eyebrow mb-2">EXPECTED OBSERVATION</div><p className="text-[11px] leading-relaxed text-[#9db0bc]">{experiment.theory}</p></div></div>}
            {tab === 'theory' && <div><div className="mb-3 text-[10px] font-extrabold uppercase tracking-widest text-[#92a8b6]">Theory / procedure</div><p className="max-w-3xl text-[12px] leading-7 text-[#c1d0d8]">{experiment.theory}</p><ol className="mt-5 space-y-2 text-[11px] text-[#9cafba]"><li>1. Read the module and identify each input and output port.</li><li>2. Walk every input combination shown in the truth table.</li><li>3. Compare the expected Boolean result with the demo oracle output.</li><li>4. Explain the result using the expression rather than memorizing a row.</li></ol></div>}
            {tab === 'code' && <CodeSnippet text={experiment.source} filename={`${experiment.name.toLowerCase().replaceAll(' ', '_')}.v`} />}
            {tab === 'bench' && <CodeSnippet text={experiment.bench} filename={`tb_${experiment.name.toLowerCase().replaceAll(' ', '_')}.v`} />}
            {tab === 'table' && <div><div className="mb-3 text-[10px] font-extrabold uppercase tracking-widest text-[#92a8b6]">{active === 'Counter' ? 'Behavior sequence (illustrative)' : 'Complete truth table'}</div><GateTable circuit={active} interactive /></div>}
            {tab === 'viva' && <div className="rounded-xl border border-[#2c4656] bg-[#0c1b27] p-5"><div className="eyebrow mb-3">ORAL CHECK</div><div className="text-[14px] font-bold leading-relaxed text-[#d9e5ea]">{experiment.viva.split('?')[0]}?</div><details className="mt-4"><summary className="cursor-pointer text-[10px] font-bold text-[#64d7e6]" data-testid="summary-viva-answer">Reveal answer</summary><p className="mt-3 text-[11px] text-[#9db0bb]">{experiment.viva.split('?').slice(1).join('?').trim()}</p></details></div>}
          </div>
        </Panel>
        <StatusNote tone="warning">Templates are provided for local study. This browser page does not invoke an HDL compiler.</StatusNote>
      </div>
    </div>
  </div>;
}

function CodeSnippet({ text, filename }: { text: string; filename: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() { try { await navigator.clipboard.writeText(text); setCopied(true); window.setTimeout(() => setCopied(false), 1600); } catch { setCopied(false); } }
  return <div><div className="mb-2 flex items-center justify-between text-[9px] text-[#8399a7]"><span className="mono">{filename}</span><button type="button" className="btn !px-2 !py-1.5 text-[9px]" onClick={copy} data-testid="button-copy-snippet">{copied ? <Check size={12} /> : <Clipboard size={12} />}{copied ? 'Copied' : 'Copy code'}</button></div><pre className="scrollbar-thin overflow-x-auto rounded-lg border border-[#253e4f] bg-[#07121d] p-4 text-[10px] leading-[1.8] text-[#b5cbd5]" data-testid="display-code-snippet"><code>{text}</code></pre></div>;
}

function Evm() {
  const candidates = ['Asha Menon', 'Kabir Shah', 'Mira Das'];
  const [counts, setCounts] = useState<number[]>(() => readStore(STORE.votes, [0, 0, 0]));
  const [voted, setVoted] = useState<number | null>(() => readStore(STORE.vote, null));
  const [notice, setNotice] = useState('');
  const cast = (index: number) => {
    if (voted !== null) { setNotice('This browser profile has already cast its one demo vote.'); return; }
    const next = counts.map((count, i) => count + Number(i === index));
    setCounts(next); setVoted(index); writeStore(STORE.votes, next); writeStore(STORE.vote, index); setNotice(`Demo vote recorded for ${candidates[index]}.`);
  };
  const reset = () => { setCounts([0, 0, 0]); setVoted(null); writeStore(STORE.votes, [0, 0, 0]); localStorage.removeItem(STORE.vote); setNotice('Demo tally and browser vote state reset.'); };
  const total = counts.reduce((a, b) => a + b, 0);
  return <div><Heading eyebrow="LEARN & PRACTISE / 02" title="Electronic voting demo" description="A small digital-logic teaching model for selecting one of three candidates. It is not an election system, identity check, or secure voting platform." action={<Pill color="amber">Educational only</Pill>} />
    <StatusNote tone="warning">One vote is stored per browser’s localStorage profile until master reset. This is only a local demo; clearing browser storage or another device can bypass the limit. Do not use for real elections.</StatusNote>
    <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
      <Panel className="p-5 sm:p-6"><div className="flex items-center justify-between"><SectionLabel>Cast a demo vote</SectionLabel><span className="mono text-[10px] text-[#7e96a5]">BALLOT / 01</span></div><p className="mt-1 text-[10px] text-[#8499a8]">Choose exactly one candidate for this browser profile.</p>
        <div className="mt-5 space-y-3">{candidates.map((name, i) => <div key={name} className={`flex items-center justify-between gap-3 rounded-xl border p-4 ${voted === i ? 'border-[#2c8290] bg-[#102c36]' : 'border-[#294252] bg-[#0d1c28]'}`}><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#38576a] bg-[#142b3b] text-[11px] font-extrabold text-[#76d9e6]">{name.split(' ').map(x => x[0]).join('')}</div><div><div className="text-[12px] font-extrabold text-[#dbe6eb]">{name}</div><div className="mt-1 text-[9px] text-[#8298a7]">Candidate {String(i + 1).padStart(2, '0')}</div></div></div><button type="button" disabled={voted !== null} className={`btn ${voted === null ? 'btn-primary' : ''} !px-3 !py-2 text-[10px] disabled:cursor-not-allowed disabled:opacity-55`} onClick={() => cast(i)} data-testid={`button-vote-${i + 1}`}>{voted === i ? <><Check size={13} /> Voted</> : voted === null ? 'Vote' : 'Locked'}</button></div>)}</div>
        {notice && <div role="status" className="mt-4 rounded-lg border border-[#2d5364] bg-[#102432] p-3 text-[10px] text-[#b0d1dc]" data-testid="status-vote-message">{notice}</div>}
        <button type="button" className="btn btn-quiet mt-5 !px-3 !py-2 text-[10px]" onClick={reset} data-testid="button-reset-evm"><RotateCcw size={13} /> Master reset demo</button>
      </Panel>
      <div className="space-y-4">
        <Panel className="p-5"><div className="flex items-center justify-between"><SectionLabel>Local tally</SectionLabel><span className="mono text-[10px] text-[#7c94a3]">{total} DEMO VOTES</span></div>
          <div className="mt-5 space-y-4">{candidates.map((name, i) => <div key={name} data-testid={`display-vote-count-${i + 1}`}><div className="mb-1.5 flex justify-between text-[10px]"><span className="font-bold text-[#c9d6dd]">{name}</span><span className="mono text-[#75d9e7]">{counts[i]} <span className="text-[#6f8796]">({total ? (counts[i] / total * 100).toFixed(1) : '0.0'}%)</span></span></div><div className="h-2 overflow-hidden rounded-full bg-[#1b3040]"><div className="h-full rounded-full bg-[#34afc2] transition-all" style={{ width: `${total ? counts[i] / total * 100 : 0}%` }} /></div></div>)}</div>
          <div className="mt-5 border-t border-[#294150] pt-3 text-[9px] leading-relaxed text-[#8196a5]">Demo totals remain on this browser only; the master reset clears them to zero.</div>
        </Panel>
        <Panel className="p-5"><div className="mb-3 flex items-center gap-2"><Code2 size={15} className="text-[#63d8e5]" /><SectionLabel>Logic concept</SectionLabel></div>
          <p className="text-[10px] leading-relaxed text-[#9db0bb]">A hardware design could encode candidate selection with a one-hot input, then count or decode the selected line. A real voting system needs strong identity, security, auditing, accessibility, privacy, and legal safeguards—not just three buttons.</p>
          <details className="mt-3"><summary className="cursor-pointer text-[10px] font-bold text-[#63d6e5]" data-testid="summary-evm-hdl">Show valid HDL / testbench concept</summary><pre className="mt-3 overflow-x-auto rounded-lg border border-[#243e4e] bg-[#081520] p-3 text-[9px] leading-relaxed text-[#b5c9d2]">{`module vote_decode(input wire [2:0] vote, output wire valid);\n  assign valid = (vote == 3'b001) ||\n                 (vote == 3'b010) ||\n                 (vote == 3'b100);\nendmodule\n\n// Testbench concept: drive legal and illegal vectors,\n// wait, then compare valid against the expected result.`}</pre></details>
        </Panel>
      </div>
    </div>
  </div>;
}

function Learning() {
  const [selected, setSelected] = useState('ports');
  const [filter, setFilter] = useState('');
  const visible = modules.filter((module) => `${module.title} ${module.tag} ${module.body}`.toLowerCase().includes(filter.toLowerCase()));
  const lesson = modules.find((item) => item.id === selected) ?? modules[0];
  return <div><Heading eyebrow="LEARN & PRACTISE / 03" title="Verilog field guide" description="A concise, practical glossary for the HDL structures used in this lab—plus the real local compile, run, and inspect sequence." />
    <div className="grid gap-4 xl:grid-cols-[290px_1fr]">
      <Panel className="overflow-hidden"><div className="border-b border-[#294252] p-3"><label className="relative block"><Search size={13} className="absolute left-3 top-[11px] text-[#728a9a]" /><input className="field !py-2 !pl-8 text-[10px]" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search learning modules" aria-label="Search learning modules" data-testid="input-search-modules" /></label></div>
        <div className="p-2">{visible.map((item, i) => <button key={item.id} type="button" onClick={() => setSelected(item.id)} aria-pressed={selected === item.id} className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left ${selected === item.id ? 'bg-[#102d3a] text-[#6ddbe8]' : 'text-[#aab9c3] hover:bg-[#0d202d]'}`} data-testid={`button-module-${item.id}`}><span className="mono text-[9px] text-[#607f91]">{String(i + 1).padStart(2, '0')}</span><span className="text-[10px] font-bold">{item.title}</span><ChevronDown size={12} className="ml-auto -rotate-90 opacity-50" /></button>)}
          {!visible.length && <p className="p-4 text-[10px] text-[#8ba0ae]">No modules found.</p>}
        </div>
      </Panel>
      <div className="space-y-4">
        <Panel className="p-5 sm:p-7"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="eyebrow">{lesson.tag}</div><h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#e5eef2]">{lesson.title}</h2></div><Pill>{String(modules.findIndex((m) => m.id === lesson.id) + 1).padStart(2, '0')} / {modules.length}</Pill></div>
          <p className="mt-5 max-w-3xl text-[12px] leading-7 text-[#b9c9d1]">{lesson.body}</p><pre className="mt-5 overflow-x-auto rounded-xl border border-[#294252] bg-[#091621] p-4 text-[11px] leading-[1.8] text-[#76d2e0]" data-testid="display-module-example">{lesson.example}</pre>
          <div className="mt-4"><StatusNote>{lesson.note}</StatusNote></div>
          <div className="mt-5 flex justify-between"><button type="button" className="btn !px-3 !py-2 text-[10px]" onClick={() => setSelected(modules[Math.max(0, modules.findIndex(m => m.id === lesson.id) - 1)].id)} disabled={lesson.id === modules[0].id} data-testid="button-module-previous">Previous</button><button type="button" className="btn !px-3 !py-2 text-[10px]" onClick={() => setSelected(modules[Math.min(modules.length - 1, modules.findIndex(m => m.id === lesson.id) + 1)].id)} disabled={lesson.id === modules[modules.length - 1].id} data-testid="button-module-next">Next module <ArrowRight size={12} /></button></div>
        </Panel>
        {lesson.id === 'toolchain' || lesson.id === 'comparison' ? <Toolchain /> : <Panel className="p-5"><div className="flex items-center gap-2"><Sparkles size={15} className="text-[#60d4e2]" /><SectionLabel>Connect the concepts</SectionLabel></div><p className="mt-2 text-[10px] leading-relaxed text-[#8ea2af]">Use the editor templates to compare a design module with its testbench. The testbench drives input values; the design defines output behavior.</p><Link to="/code-editor" className="btn mt-4 !px-3 !py-2 text-[10px]" data-testid="link-learning-editor">Open code editor <ArrowRight size={12} /></Link></Panel>}
      </div>
    </div>
  </div>;
}

function Toolchain() {
  return <Panel className="p-5"><div className="mb-3 flex items-center gap-2"><Terminal size={15} className="text-[#64d7e7]" /><SectionLabel>Correct local CLI workflow</SectionLabel></div>
    <div className="space-y-3 text-[10px] leading-relaxed text-[#97aab6]">
      <p><strong className="text-[#dce7ec]">1. Install</strong> Icarus Verilog and GTKWave using your operating system’s package manager or official distribution. This browser environment does not have iverilog, vvp, or gtkwave installed.</p>
      <p><strong className="text-[#dce7ec]">2. Compile</strong> Run the compiler from a terminal where both files exist:</p>
      <code className="mono block rounded-lg border border-[#263f4f] bg-[#081520] p-3 text-[10px] leading-6 text-[#7ed5e1]">iverilog -g2012 -o sim.vvp design.v tb_design.v</code>
      <p><strong className="text-[#dce7ec]">3. Simulate</strong> Execute the generated simulation image:</p><code className="mono block rounded-lg border border-[#263f4f] bg-[#081520] p-3 text-[10px] text-[#7ed5e1]">vvp sim.vvp</code>
      <p><strong className="text-[#dce7ec]">4. Create / view waveform</strong> Include <code className="mono text-[#69d2df]">$dumpfile("dump.vcd"); $dumpvars(0, tb_design);</code> in the testbench, run vvp again, then open the real file:</p><code className="mono block rounded-lg border border-[#263f4f] bg-[#081520] p-3 text-[10px] text-[#7ed5e1]">gtkwave dump.vcd</code>
    </div>
  </Panel>;
}

const quizOptions = [
  ['NAND', 'NOR', 'AND', 'XOR'],
  ['When both inputs are high', 'When inputs differ', 'When inputs are equal', 'When both inputs are low'],
  ['0', '1', 'X', 'Z'],
  ['Drive inputs and check outputs', 'Synthesize the design', 'Route a circuit board', 'Generate a clock automatically'],
  ['GTKWave', 'vvp', 'iverilog', 'Verilog'],
  ['The output is the complement of A AND B', 'The output equals A AND B', 'The output is A OR B', 'The output is the complement of A OR B'],
  ['A net connection', 'A physical register always', 'A module port only', 'A testbench task'],
  ['posedge clk', 'negedge reset only', 'any wire change', 'initial begin'],
  ['At least two inputs are high', 'All inputs are low', 'Exactly one input is high', 'A and B differ only'],
  ['D1', 'D0', 'The inverted select', 'Neither input'],
];
const quizKey = [0, 2, 1, 0, 0, 0, 0, 0, 0, 0];
const quizPrompt = [
  'Which single gate is functionally complete?',
  'When does XNOR output 1?',
  'For a half adder with A=1 and B=1, what is SUM?',
  'What is the primary job of a testbench?',
  'Which tool displays waveform data such as VCD?',
  'What does NAND compute?',
  'In Verilog, what does wire represent?',
  'What event triggers an always @(posedge clk) block?',
  'When does a full adder assert carry-out?',
  'A 2:1 mux with SEL=1 chooses which input?',
];
function Viva() {
  const [best, setBest] = useState<number | null>(() => readStore(STORE.quiz, null));
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answered, setAnswered] = useState<number[]>([]);
  const start = () => { setIndex(0); setChoice(null); setScore(0); setFinished(false); setAnswered([]); setActive(true); };
  const submit = () => {
    if (choice === null) return;
    const nextScore = score + Number(choice === quizKey[index]);
    setScore(nextScore);
    setAnswered((old) => [...old, choice]);
    if (index === quizPrompt.length - 1) {
      setFinished(true); setActive(false);
      const previous = readStore<number | null>(STORE.quiz, null);
      const saved = Math.max(previous ?? 0, nextScore);
      writeStore(STORE.quiz, saved); setBest(saved);
    } else { setIndex(index + 1); setChoice(null); }
  };
  const short = answered.reduce((acc, item, i) => acc + Number(item === quizKey[i]), 0);
  return <div><Heading eyebrow="LEARN & PRACTISE / 04" title="Viva practice" description="Short oral-exam answers for the important concepts, plus a scored ten-question check. Your best quiz score is saved in this browser." action={<Pill color="green">{vivaQuestions.length} quick answers</Pill>} />
    <div className="grid gap-4 xl:grid-cols-[.9fr_1.1fr]">
      <div className="space-y-4">
        <Panel className="p-5">
          <div className="flex items-center justify-between"><div><div className="eyebrow">SCORED QUIZ</div><SectionLabel>Check your fundamentals</SectionLabel></div><div className="rounded-lg border border-[#29495b] bg-[#0b1c28] px-3 py-2 text-right"><div className="mono text-[15px] text-[#69d6e6]">{best === null ? '—' : `${best}/10`}</div><div className="text-[8px] uppercase tracking-wide text-[#8397a5]">Best saved</div></div></div>
          {!active && !finished && <div className="mt-4"><p className="text-[10px] leading-relaxed text-[#92a6b2]">Ten questions · one point each. Your highest score is kept locally, not sent anywhere.</p><button type="button" className="btn btn-primary mt-4" onClick={start} data-testid="button-start-quiz"><Play size={13} /> Start quiz</button></div>}
          {active && <div className="mt-5" data-testid="display-quiz-question"><div className="mb-3 flex justify-between text-[9px] text-[#8398a6]"><span>QUESTION {index + 1} / {quizPrompt.length}</span><span className="mono">SCORE {score}</span></div><div className="mb-4 text-[14px] font-bold leading-relaxed text-[#e2ebef]">{quizPrompt[index]}</div><div className="space-y-2">{quizOptions[index].map((option, i) => <button key={option} type="button" aria-pressed={choice === i} onClick={() => setChoice(i)} className={`w-full rounded-lg border p-3 text-left text-[10px] ${choice === i ? 'border-[#338294] bg-[#112d39] text-[#73dce9]' : 'border-[#2a4252] bg-[#0b1a25] text-[#a9bac3] hover:border-[#436274]'}`} data-testid={`button-quiz-answer-${i}`}>{String.fromCharCode(65 + i)}. {option}</button>)}</div><button type="button" className="btn btn-primary mt-4" disabled={choice === null} onClick={submit} data-testid="button-submit-quiz">{index === quizPrompt.length - 1 ? 'Finish quiz' : 'Submit & continue'} <ArrowRight size={13} /></button></div>}
          {finished && <div className="mt-5 rounded-xl border border-[#2a5849] bg-[#10251e] p-4" role="status" data-testid="status-quiz-result"><div className="eyebrow !text-[#82dcb6]">ATTEMPT COMPLETE</div><div className="mono mt-2 text-3xl font-bold text-[#e4f1eb]">{short}<span className="text-[#78988b]"> / 10</span></div><p className="mt-2 text-[10px] text-[#a2bcaf]">{short >= 8 ? 'Strong command of the fundamentals.' : 'Good first pass. Review the answers and try again.'} Best score saved on this device.</p><button type="button" onClick={start} className="btn mt-3 !px-3 !py-2 text-[10px]" data-testid="button-retry-quiz">Try again <RotateCcw size={12} /></button></div>}
        </Panel>
        <StatusNote tone="warning">This is a study aid, not an official examination or graded submission.</StatusNote>
      </div>
      <Panel className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#294252] px-4 py-4"><div><div className="eyebrow">QUICK ORAL REVIEW</div><SectionLabel>Questions & answers</SectionLabel></div><span className="mono text-[10px] text-[#8096a4]">{vivaQuestions.length} ITEMS</span></div>
        <div className="max-h-[730px] overflow-y-auto p-3 scrollbar-thin">{vivaQuestions.map(([question, answer], i) => <details key={i} className="group border-b border-[#243b4b] px-2 py-3" data-testid={`details-viva-${i + 1}`}><summary className="flex cursor-pointer list-none items-start gap-3 text-[10px] font-bold leading-relaxed text-[#cbd9df]"><span className="mono mt-0.5 text-[9px] text-[#57ccdd]">{String(i + 1).padStart(2, '0')}</span><span className="flex-1">{question}</span><ChevronDown size={13} className="mt-0.5 shrink-0 text-[#8297a5] transition group-open:rotate-180" /></summary><p className="ml-7 mt-2 text-[10px] leading-relaxed text-[#93a8b5]" data-testid={`answer-viva-${i + 1}`}>{answer}</p></details>)}</div>
      </Panel>
    </div>
  </div>;
}

const reportSections = [
  { title: 'Abstract', body: 'IVerilog Digital Logic Lab is a browser-based teaching interface for introductory digital logic and Verilog. Students can explore seven logic gates and common combinational/sequential examples, edit syntactically valid HDL templates, inspect truth tables, compare vectors, and review waveform concepts. The application clearly distinguishes its built-in demo oracle from native HDL compilation.' },
  { title: '1. Introduction', body: 'Digital logic is best learned by connecting Boolean algebra to observable input/output behavior. This project provides an interactive classroom bench where a learner switches input vectors, studies the corresponding Verilog description, and checks each expected result. It is designed as a practical companion to a college Computer Engineering lab.' },
  { title: '2. Problem statement', body: 'Beginners often encounter truth tables, HDL syntax, testbench stimulus, and waveform tools as disconnected topics. In addition, a browser interface can be mistaken for a real compiler. This lab addresses both issues with a connected learning path and explicit tool-capability labels.' },
  { title: '3. Objectives', body: '• Demonstrate AND, OR, NOT, NAND, NOR, XOR and XNOR truth tables. • Present valid module and testbench templates for gates, adders, a 2:1 multiplexer, and a counter. • Compare deterministic input vectors against correct Boolean results. • Explain the distinction between Verilog, Icarus Verilog, vvp, GTKWave, and VCD data. • Provide EVM, viva, and report demonstrations without implying production use.' },
  { title: '4. Scope and limitations', body: 'The implementation is client-side and stores preferences, progress, quiz score, student information, and EVM demo state in localStorage. It does not include an API, accounts, shared synchronization, HDL parser, compiler, or simulator process. “Demo Simulation” uses built-in equations. Generated waveform examples are samples only; a VCD is shown as loaded only after a learner imports and parses a local scalar VCD file.' },
  { title: '5. System architecture', body: 'The React single-page frontend uses React Router for routes and a shared navigation shell. Circuit definitions and vector oracles are pure TypeScript functions. React component state drives interactions; localStorage persists learner preferences and local demo state. SVG renders a transparent illustrative digital waveform or a supported scalar trace imported from VCD.' },
  { title: '6. Modules and implementation', body: 'The logic-gate bench lets learners toggle input bits. The code editor switches between module and testbench templates and supports editing, reset, copy, and download. The testbench checker enumerates input vectors and compares expected/actual oracle values. The demo simulator shows honest logs and vector tables. The experiment library includes aims, theory, HDL, testbenches, tables/behavior, and viva prompts. Other modules cover educational voting, learning notes, viva practice, and this report.' },
  { title: '7. Methodology and verification', body: 'For each combinational example, all possible binary input combinations are enumerated. Expected outputs are evaluated from the corresponding Boolean expression. Half-adder sum is A XOR B and carry is A AND B. Full-adder sum is A XOR B XOR CIN and carry is AB + ACIN + BCIN. A 2:1 mux selects D0 for SEL=0 and D1 for SEL=1. The counter example is sequential and its textual testbench documents a clock/reset sequence; it is not presented as a combinational table.' },
  { title: '8. Results and discussion', body: 'The interface provides an interactive path from inputs to Boolean result, valid example syntax, vector-by-vector comparisons, and transparent simulation boundaries. Seven fundamental gates and four additional experiment types are included. A real compile-and-view workflow is documented for local tools, and imported VCD traces are distinguished from generated sample signals.' },
  { title: '9. Educational EVM demonstration', body: 'Three candidate buttons demonstrate mutually exclusive selection and persistent local tally state. The browser profile may cast one vote until the master reset. This is a classroom logic demo only: localStorage is not secure identity or a reliable election database, and this feature is not suitable for real voting.' },
  { title: '10. Real tool workflow', body: 'Install Icarus Verilog and GTKWave on a local computer. Compile design and testbench files with iverilog -g2012 -o sim.vvp design.v tb_design.v. Run vvp sim.vvp. To create waveform data, add $dumpfile and $dumpvars to the testbench and run the simulation; view the resulting file using gtkwave dump.vcd. These tools are not installed or run by this browser application.' },
  { title: '11. Conclusion and future work', body: 'This project makes foundational HDL concepts tangible without overstating browser capabilities. Possible future improvements include a server-side isolated compiler, real authenticated class accounts, a complete VCD parser, instructor-authored experiments, and accessible assessment exports. Each addition should maintain clear provenance for generated versus compiled results.' },
  { title: 'References', body: 'IEEE Std 1364-2005, IEEE Standard for Verilog Hardware Description Language. Icarus Verilog documentation and project: iverilog.com. GTKWave documentation and project: gtkwave.sourceforge.net. Consult your course laboratory manual for institution-specific conventions and grading requirements.' },
];
function Documentation() {
  return <div><Heading eyebrow="REFERENCE / PROJECT REPORT" title="Project documentation" description="A complete report outline for the learning platform. Print this page to create a paper copy from your browser." action={<button type="button" className="btn btn-primary no-print" onClick={() => window.print()} data-testid="button-print-report"><FileText size={14} /> Print report</button>} />
    <Panel className="mb-4 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="eyebrow">PROJECT TITLE</div><h2 className="mt-1 text-lg font-extrabold leading-snug text-[#e6eff2]">IVerilog Digital Logic Lab: Interactive Verilog Simulator &amp; Learning Platform</h2></div><Pill>Report draft</Pill></div><p className="mt-3 text-[10px] text-[#859aa8]">Prepared as a practical educational project. Add your institution’s required cover-page details in the About &amp; student section.</p></Panel>
    <div className="space-y-3">{reportSections.map((section, i) => <Panel key={section.title} className="p-4 sm:p-5" data-testid={`section-report-${i}`}><h3 className="mb-2 text-[13px] font-extrabold text-[#dfe9ed]">{section.title}</h3><p className="whitespace-pre-line text-[11px] leading-7 text-[#a9bac3]">{section.body}</p></Panel>)}</div>
    <Panel className="mt-4 p-4"><div className="flex items-start gap-2 text-[10px] leading-relaxed text-[#9bb1bd]"><Lightbulb size={14} className="mt-0.5 shrink-0 text-[#e5c46f]" />Print uses your browser’s print dialog. For an academic submission, confirm the report format and citation requirements with your instructor.</div></Panel>
  </div>;
}

type StudentDetails = { name: string; institution: string; course: string; studentId: string; semester: string };
function About() {
  const [details, setDetails] = useState<StudentDetails>(() => readStore(STORE.details, { name: '', institution: '', course: 'Computer Engineering', studentId: '', semester: '' }));
  const [saved, setSaved] = useState(false);
  const update = (key: keyof StudentDetails, value: string) => { setSaved(false); setDetails((current) => ({ ...current, [key]: value })); };
  const save = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); writeStore(STORE.details, details); setSaved(true); };
  return <div><Heading eyebrow="REFERENCE / PROJECT NOTES" title="About this lab" description="A practical digital-logic classroom for college learners—designed to make the difference between a browser demo and a real toolchain unmistakable." />
    <div className="grid gap-4 xl:grid-cols-[1fr_.9fr]">
      <div className="space-y-4">
        <Panel className="p-5 sm:p-6"><div className="eyebrow mb-2">PURPOSE</div><h2 className="text-xl font-extrabold leading-snug text-[#e8f0f3]">Switch inputs. Read the HDL. Explain the output.</h2><p className="mt-3 text-[11px] leading-7 text-[#a6b8c2]">This learning product links the most useful early digital-logic habits: reason from a truth table, relate the table to Verilog source, drive test vectors, and interpret output values. It favors practical, inspectable results over pretending a compiler is running.</p>
          <div className="mt-5 grid gap-2 sm:grid-cols-3">{[['01', 'Explore', 'Toggle live Boolean inputs.'], ['02', 'Read', 'Study valid HDL templates.'], ['03', 'Check', 'Compare every demo vector.']].map(([n, title, body]) => <div key={n} className="rounded-lg border border-[#294352] bg-[#0b1a25] p-3"><div className="mono text-[10px] text-[#5bd4e5]">{n}</div><div className="mt-2 text-[11px] font-extrabold text-[#d8e4e9]">{title}</div><div className="mt-1 text-[9px] leading-relaxed text-[#8196a4]">{body}</div></div>)}</div>
        </Panel>
        <Panel className="p-5"><div className="mb-3 flex items-center gap-2"><Layers3 size={15} className="text-[#5fd5e5]" /><SectionLabel>Frontend architecture</SectionLabel></div><div className="grid gap-2 sm:grid-cols-2">{[['React + TypeScript', 'Page components and explicit local UI state'], ['React Router', 'Persistent navigation for all learning areas'], ['Boolean oracle', 'Correct deterministic combinational vectors'], ['localStorage', 'Student info, progress, score, preferences, EVM demo state']].map(([title, body]) => <div key={title} className="rounded-lg border border-[#253e4d] bg-[#0b1924] p-3"><div className="text-[10px] font-bold text-[#d8e5ea]">{title}</div><div className="mt-1 text-[9px] leading-relaxed text-[#8499a7]">{body}</div></div>)}</div></Panel>
      </div>
      <div className="space-y-4">
        <Panel className="p-5 sm:p-6"><div className="mb-4 flex items-center gap-2"><Clipboard size={15} className="text-[#60d3e3]" /><div><div className="eyebrow">LOCAL ONLY</div><SectionLabel>Student project details</SectionLabel></div></div><p className="mb-4 text-[10px] leading-relaxed text-[#8298a6]">Optional details are stored in this browser only and never sent to a server.</p>
          <form onSubmit={save} className="space-y-3">{([
            ['name', 'Student name', 'Your name'], ['institution', 'Institution', 'College or university'], ['course', 'Programme / course', 'Computer Engineering'], ['studentId', 'Student ID', 'Optional ID'], ['semester', 'Semester / year', 'e.g. Semester 3'],
          ] as [keyof StudentDetails, string, string][]).map(([key, label, placeholder]) => <label key={key} className="block text-[10px] font-bold text-[#a4b5bf]">{label}<input className="field mt-1.5 text-[11px]" value={details[key]} onChange={(e) => update(key, e.target.value)} placeholder={placeholder} data-testid={`input-student-${key}`} /></label>)}
            <div className="flex flex-wrap items-center gap-3 pt-1"><button type="submit" className="btn btn-primary text-[10px]" data-testid="button-save-student"><Check size={13} /> Save details</button>{saved && <span role="status" className="text-[10px] text-[#8cdbb8]" data-testid="status-student-saved">Saved in this browser.</span>}</div>
          </form>
        </Panel>
        <Panel className="p-5"><div className="mb-2 flex items-center gap-2"><Monitor size={15} className="text-[#5fd6e6]" /><SectionLabel>Honest capability boundary</SectionLabel></div><ul className="space-y-2 text-[10px] leading-relaxed text-[#9aadb8]"><li>• Simulation pages display “Demo Simulation” and evaluate built-in logic only.</li><li>• No iverilog, vvp, or GTKWave process is included in this browser environment.</li><li>• Sample waveform signals are generated illustrations—not VCD files.</li><li>• VCD view is labeled imported only after a local VCD file is parsed.</li><li>• The EVM is local educational state, not an election product.</li></ul></Panel>
        <Link to="/documentation" className="btn w-full" data-testid="link-project-documentation">Open full project documentation <ArrowRight size={13} /></Link>
      </div>
    </div>
  </div>;
}

function NotFound() {
  return <div className="mx-auto max-w-xl py-20 text-center"><div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#31576b] bg-[#102737] text-[#62d9e8]"><Cpu size={26} /></div><div className="eyebrow">ROUTE NOT FOUND</div><h1 className="page-title mt-2">This circuit is open.</h1><p className="muted mt-3 text-[12px]">That route is not part of this lab. Return to the dashboard or choose a section from the navigation.</p><Link to="/" className="btn btn-primary mt-6" data-testid="link-not-found-home">Back to dashboard <ArrowRight size={14} /></Link></div>;
}

function App() {
  return <BrowserRouter><AppShell /></BrowserRouter>;
}

export default App;
