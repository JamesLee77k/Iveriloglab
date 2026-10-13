export type Circuit = 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR' | 'XNOR' | 'Half Adder' | 'Full Adder' | '2:1 MUX' | 'Counter';

export const circuits: Circuit[] = ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR', 'Half Adder', 'Full Adder', '2:1 MUX', 'Counter'];
export const gates = circuits.slice(0, 7) as Circuit[];

export function expected(circuit: Circuit, a: number, b = 0, c = 0): Record<string, number> {
  switch (circuit) {
    case 'AND': return { Y: a & b };
    case 'OR': return { Y: a | b };
    case 'NOT': return { Y: Number(!a) };
    case 'NAND': return { Y: Number(!(a & b)) };
    case 'NOR': return { Y: Number(!(a | b)) };
    case 'XOR': return { Y: a ^ b };
    case 'XNOR': return { Y: Number(!(a ^ b)) };
    case 'Half Adder': return { SUM: a ^ b, CARRY: a & b };
    case 'Full Adder': return { SUM: a ^ b ^ c, CARRY: (a & b) | (a & c) | (b & c) };
    case '2:1 MUX': return { Y: c ? b : a };
    case 'Counter': return { Q: (a + 1) & 0b1111 };
  }
}

export function inputRows(circuit: Circuit): number[][] {
  if (circuit === 'NOT') return [[0], [1]];
  if (circuit === 'Full Adder') return Array.from({ length: 8 }, (_, i) => [(i >> 2) & 1, (i >> 1) & 1, i & 1]);
  if (circuit === '2:1 MUX') return Array.from({ length: 8 }, (_, i) => [(i >> 2) & 1, (i >> 1) & 1, i & 1]);
  if (circuit === 'Counter') return Array.from({ length: 16 }, (_, i) => [i]);
  return [[0, 0], [0, 1], [1, 0], [1, 1]];
}

function moduleName(circuit: Circuit): string {
  if (circuit === '2:1 MUX') return 'MUX21';
  if (circuit === 'Counter') return 'SIMPLE_COUNTER';
  return circuit.toUpperCase().replaceAll(' ', '_');
}

const expr: Record<string, string> = {
  AND: 'assign Y = A & B;', OR: 'assign Y = A | B;', NOT: 'assign Y = ~A;',
  NAND: 'assign Y = ~(A & B);', NOR: 'assign Y = ~(A | B);', XOR: 'assign Y = A ^ B;', XNOR: 'assign Y = ~(A ^ B);',
};

export function moduleTemplate(circuit: Circuit): string {
  const n = moduleName(circuit);
  if (expr[circuit]) {
    const unary = circuit === 'NOT';
    return `module ${n}(input wire A,${unary ? '' : ' input wire B,'} output wire Y);\n  ${expr[circuit]}\nendmodule`;
  }
  if (circuit === 'Half Adder') return `module HALF_ADDER(input wire A, B, output wire SUM, CARRY);\n  assign SUM = A ^ B;\n  assign CARRY = A & B;\nendmodule`;
  if (circuit === 'Full Adder') return `module FULL_ADDER(input wire A, B, CIN, output wire SUM, COUT);\n  assign SUM = A ^ B ^ CIN;\n  assign COUT = (A & B) | (A & CIN) | (B & CIN);\nendmodule`;
  if (circuit === '2:1 MUX') return `module MUX21(input wire D0, D1, SEL, output wire Y);\n  assign Y = SEL ? D1 : D0;\nendmodule`;
  return `module SIMPLE_COUNTER(input wire clk, reset, output reg [3:0] Q);\n  always @(posedge clk or posedge reset) begin\n    if (reset) Q <= 4'b0000;\n    else Q <= Q + 1'b1;\n  end\nendmodule`;
}

export function testbenchTemplate(circuit: Circuit): string {
  const mod = moduleName(circuit);
  if (circuit === 'NOT') return `module tb_not;\n  reg A; wire Y;\n  NOT uut(.A(A), .Y(Y));\n  initial begin\n    A=0; #10; $display("A=%b Y=%b", A, Y);\n    A=1; #10; $display("A=%b Y=%b", A, Y);\n    $finish;\n  end\nendmodule`;
  const ports = circuit === 'Half Adder' ? 'reg A, B; wire SUM, CARRY;' :
    circuit === 'Full Adder' ? 'reg A, B, CIN; wire SUM, COUT;' :
      circuit === '2:1 MUX' ? 'reg D0, D1, SEL; wire Y;' :
        circuit === 'Counter' ? 'reg clk, reset; wire [3:0] Q;' : 'reg A, B; wire Y;';
  const instance = circuit === 'Half Adder' ? '.A(A), .B(B), .SUM(SUM), .CARRY(CARRY)' :
    circuit === 'Full Adder' ? '.A(A), .B(B), .CIN(CIN), .SUM(SUM), .COUT(COUT)' :
      circuit === '2:1 MUX' ? '.D0(D0), .D1(D1), .SEL(SEL), .Y(Y)' :
        circuit === 'Counter' ? '.clk(clk), .reset(reset), .Q(Q)' : '.A(A), .B(B), .Y(Y)';
  if (circuit === 'Counter') return `module tb_counter;\n  ${ports}\n  ${mod} uut(${instance});\n  initial begin clk=0; forever #5 clk=~clk; end\n  initial begin reset=1; #12; reset=0; #50; $finish; end\nendmodule`;
  return `module tb_${mod.toLowerCase()};\n  ${ports}\n  ${mod} uut(${instance});\n  initial begin\n    ${circuit === 'Full Adder' ? 'A=0; B=0; CIN=0; #10; A=0; B=0; CIN=1; #10; A=0; B=1; CIN=0; #10; A=0; B=1; CIN=1; #10; A=1; B=0; CIN=0; #10; A=1; B=0; CIN=1; #10; A=1; B=1; CIN=0; #10; A=1; B=1; CIN=1;' :
    circuit === '2:1 MUX' ? 'D0=0; D1=0; SEL=0; #10; D0=0; D1=1; SEL=0; #10; D0=0; D1=1; SEL=1;' :
      'A=0; B=0; #10; A=0; B=1; #10; A=1; B=0; #10; A=1; B=1;'}\n    #10; $finish;\n  end\nendmodule`;
}

export const experiments = circuits.map((name) => {
  const aim: Record<string, string> = {
    AND: 'Verify that the output is high only when both inputs are high.', OR: 'Observe how either asserted input drives the output.', NOT: 'Invert a single binary input.',
    NAND: 'Build the universal gate complement of AND.', NOR: 'Build the universal gate complement of OR.', XOR: 'Detect when exactly one input is high.', XNOR: 'Detect equal input states.',
    'Half Adder': 'Add two single-bit operands and observe sum and carry.', 'Full Adder': 'Add two bits and a carry-in across all eight cases.', '2:1 MUX': 'Select one of two data inputs with SEL.', Counter: 'Observe a four-bit register increment on each rising edge.',
  };
  const theory: Record<string, string> = {
    AND: 'Boolean product: Y = A · B. Both conditions must be true.', OR: 'Boolean sum: Y = A + B. At least one condition must be true.', NOT: 'Complement: Y = ¬A. The output is the opposite state.',
    NAND: 'Y = ¬(A · B). NAND is functionally complete; any logic function can be built from NAND gates.', NOR: 'Y = ¬(A + B). NOR is also functionally complete.', XOR: 'Y = A ⊕ B. High when inputs differ; often used in parity and addition.', XNOR: 'Y = ¬(A ⊕ B). High when inputs are equal.',
    'Half Adder': 'SUM = A ⊕ B; CARRY = A · B. It has no carry-in input.', 'Full Adder': 'SUM = A ⊕ B ⊕ CIN; COUT = AB + ACIN + BCIN.', '2:1 MUX': 'Y = SEL ? D1 : D0. A combinational selector routes one data input.', Counter: 'A sequential circuit stores state. Nonblocking assignment updates Q at each rising clock edge.',
  };
  const viva: Record<string, string> = {
    AND: 'Why is AND called a product gate? Its truth table matches Boolean multiplication.',
    OR: 'When does OR output zero? Only when every input is zero.',
    NOT: 'How many inputs does an inverter have? One.',
    NAND: 'Why is NAND universal? Any Boolean function can be constructed from NAND gates.',
    NOR: 'What is a NOR output for inputs 0 and 0? One.',
    XOR: 'Where is XOR used in an adder? It produces the sum bit.',
    XNOR: 'What does XNOR indicate? Equality of its two inputs.',
    'Half Adder': 'Can a half adder accept a carry-in? No; use a full adder to include carry-in.',
    'Full Adder': 'When does a full adder produce carry-out? When at least two of A, B, CIN are high.',
    '2:1 MUX': 'What does SEL=1 choose? D1.',
    Counter: 'Why use nonblocking assignment in clocked logic? It models simultaneous register updates.',
  };
  return { name, aim: aim[name], theory: theory[name], source: moduleTemplate(name), bench: testbenchTemplate(name), rows: inputRows(name), viva: viva[name] };
});

export const modules = [
  { id: 'ports', title: 'Ports & modules', tag: 'Structure', body: 'A module is a reusable hardware block. Its port list declares the boundary between the block and its environment. Inputs are driven from outside; outputs are observed outside.', example: 'module gate(input wire A, B, output wire Y);\\n  assign Y = A & B;\\nendmodule', note: 'Declare port direction and width explicitly. A module declaration does not execute like a software function; it describes hardware.' },
  { id: 'wire', title: 'wire', tag: 'Nets', body: 'A net such as wire represents a connection driven continuously by a source: a continuous assignment, a gate primitive, or a module output.', example: 'wire Y;\\nassign Y = A ^ B;', note: 'A wire cannot be assigned procedurally inside an always block.' },
  { id: 'reg', title: 'reg', tag: 'Variables', body: 'In Verilog, reg is a procedural variable type. It does not automatically mean a physical register: combinational always blocks can assign reg variables too.', example: 'reg Y;\\nalways @(*) begin\\n  Y = A | B;\\nend', note: 'Use reg for values assigned in procedural blocks in Verilog-2001.' },
  { id: 'assign', title: 'Continuous assign', tag: 'Combinational', body: 'assign continuously evaluates a relationship between nets, making it ideal for simple combinational logic.', example: 'assign Y = (A & B) | CIN;', note: 'Use blocking assignment (=) inside combinational procedural blocks; use nonblocking (<=) for clocked state.' },
  { id: 'always', title: 'always blocks', tag: 'Processes', body: 'An always block describes behavior that reacts to changes in its sensitivity list. Use @(*) for combinational logic or a clock edge for sequential logic.', example: 'always @(posedge clk) begin\\n  Q <= D;\\nend', note: 'A complete sensitivity list and complete assignments avoid simulation mismatches and inferred latches.' },
  { id: 'testbench', title: 'Testbenches', tag: 'Verification', body: 'A testbench is a simulation-only top module. It drives DUT inputs, waits for propagation, checks expected outputs, and ends the run.', example: 'initial begin\\n  A = 0; B = 1; #10;\\n  if (Y !== 0) $display(\"FAIL\");\\n  $finish;\\nend', note: 'Testbench code is not synthesized. This browser lab compares vectors using a built-in oracle; it does not compile this text.' },
  { id: 'clocks', title: 'Clocks & state', tag: 'Sequential', body: 'A clock provides discrete update events. A flip-flop samples its input at an edge and holds state between edges.', example: 'always @(posedge clk or posedge reset)\\n  if (reset) Q <= 0;\\n  else Q <= Q + 1;', note: 'The counter experiment illustrates state transitions using a documented demo sequence.' },
  { id: 'toolchain', title: 'Toolchain: IVerilog & GTKWave', tag: 'Workflow', body: 'Icarus Verilog (iverilog) compiles Verilog source and testbench into a simulation executable. vvp runs that simulation. GTKWave opens a VCD waveform generated by the testbench.', example: 'iverilog -g2012 -o sim.vvp design.v tb.v\\nvvp sim.vvp\\ngtkwave dump.vcd', note: 'Install Icarus Verilog and GTKWave separately on your computer. Neither compiler nor waveform viewer is running in this browser lab.' },
  { id: 'comparison', title: 'Verilog vs IVerilog vs GTKWave', tag: 'Concepts', body: 'Verilog is the hardware description language. Icarus Verilog (often invoked as iverilog) is an open-source compiler/simulator for Verilog. GTKWave is a separate waveform viewer.', example: 'Verilog source → iverilog compile → vvp simulation → VCD file → GTKWave view', note: 'A .vcd is generated by a simulator with $dumpfile/$dumpvars; this app does not pretend its illustrative chart is a VCD.' },
];

export const vivaQuestions = [
  ['What does HDL stand for?', 'Hardware Description Language.'],
  ['What does a Verilog module define?', 'A reusable hardware block and its interface.'],
  ['What is a primary purpose of a testbench?', 'Drive test vectors and verify a design under simulation.'],
  ['What does assign describe?', 'A continuous assignment relationship.'],
  ['What is the output of AND for 1 and 1?', '1.'],
  ['What is the output of OR for 0 and 1?', '1.'],
  ['What does a NOT gate do?', 'It complements its input.'],
  ['When does XOR output 1?', 'When its inputs differ.'],
  ['When does XNOR output 1?', 'When its inputs are equal.'],
  ['Give the NAND expression.', 'Y = ~(A & B).'],
  ['Give the NOR expression.', 'Y = ~(A | B).'],
  ['Which gates are functionally complete?', 'NAND alone or NOR alone.'],
  ['What is a half-adder sum?', 'A XOR B.'],
  ['What is a half-adder carry?', 'A AND B.'],
  ['What extra input does a full adder have?', 'Carry-in (CIN).'],
  ['When is full-adder carry-out high?', 'When at least two of A, B, and CIN are high.'],
  ['What does a 2:1 mux do?', 'Selects one of two data inputs using a select signal.'],
  ['What is a wire in Verilog?', 'A net that represents a driven connection.'],
  ['Does reg necessarily infer a hardware register?', 'No; it is a procedural variable type in Verilog.'],
  ['What event triggers posedge clk?', 'A transition of clk from 0 to 1.'],
  ['Why use nonblocking assignment for state?', 'To model simultaneous updates of clocked registers.'],
  ['What does iverilog do?', 'Compiles Verilog source for simulation.'],
  ['What does vvp do?', 'Runs an Icarus Verilog simulation executable.'],
  ['What does GTKWave do?', 'Displays waveform data such as VCD files.'],
  ['How is a VCD usually created?', 'The testbench calls $dumpfile and $dumpvars during simulation.'],
  ['Is this browser lab compiling Verilog?', 'No; it runs a labeled demo simulation using a built-in logic oracle.'],
  ['What is a latch?', 'A level-sensitive storage element that can arise from incomplete combinational assignments.'],
  ['What is a truth table?', 'A listing of input combinations and their corresponding outputs.'],
];
