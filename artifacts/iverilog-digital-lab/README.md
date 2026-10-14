# IVerilog Digital Logic Lab

**IVerilog Digital Logic Lab: Interactive Verilog Simulator & Learning Platform** is a client-side educational application for digital-logic and introductory Verilog coursework.

## Replit setup and run

Run the following commands from the workspace root (the directory containing the pnpm workspace):

```sh
pnpm install
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/iverilog-digital-lab dev
```

The Vite config requires `PORT` and `BASE_PATH`. Replit workflows normally provide these environment values; use the values above for a local root-path preview. To build:

```sh
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/iverilog-digital-lab build
```

## Download and publish on GitHub Pages

Open **About this lab** in the running app and choose **Download GitHub package**. The ZIP contains a ready-to-publish static site: `index.html`, the bundled CSS and JavaScript in `assets/`, the favicon, and this README. It does not contain the editable TypeScript source.

1. Create an empty GitHub repository and extract the ZIP contents into the repository root. Keep `index.html` and the `assets/` folder together.
2. Commit and push those files to the `main` branch.
3. In the repository, open **Settings → Pages**. Choose **Deploy from a branch**, select `main` and `/(root)`, then save.
4. Open the Pages URL shown in repository settings. The site uses hash-based routes in this package so refreshing a section works on GitHub Pages.

To make a fresh static build from this pnpm workspace instead of using the download ZIP:

```sh
PORT=5000 BASE_PATH=./ VITE_GITHUB_PAGES=true pnpm --filter @workspace/iverilog-digital-lab build
```

The output is `artifacts/iverilog-digital-lab/dist/public/`. Deploy the contents of that directory as the GitHub Pages root. The normal Replit build keeps browser-history routes; the GitHub Pages build uses hash routes because Pages does not provide SPA rewrites by default.

The app uses React Router browser-history routes and expects the web server to fall back to `index.html` for paths such as `/logic-gates` and `/experiments`. Vite development and preview provide SPA history fallback. Deployments should enable the equivalent static-host rewrite.

## What runs in the browser

- Logic gate and combinational experiment values are computed with local Boolean truth functions.
- “Demo Simulation” runs those fixed truth functions against enumerated vectors. It does **not** parse, compile, or execute the HDL text.
- The waveform preview is generated sample data, not a VCD. A learner can import a local scalar VCD (0/1/x/z changes) to display transitions on the file's timestamps and timescale.
- Student details, selected circuit, visited-route progress, best viva score, and the educational EVM demo state use localStorage on the current browser profile.
- This environment does not provide `iverilog`, `vvp`, or `gtkwave`; the browser application does not claim they are installed.

## Real local Icarus Verilog + GTKWave workflow

Install Icarus Verilog and GTKWave separately on a computer you control, using your OS package manager or the projects' official distribution instructions. The commands below assume both tools are installed and available on `PATH`; they are **not** executed by the web app.

Given a design file named `design.v` and a testbench file named `tb_design.v`, compile:

```sh
iverilog -g2012 -o sim.vvp design.v tb_design.v
```

Run the generated simulation executable:

```sh
vvp sim.vvp
```

To generate an actual VCD file, add a dump block to the simulation testbench, with its own testbench module name as the scope:

```verilog
initial begin
  $dumpfile("dump.vcd");
  $dumpvars(0, tb_design);
end
```

Compile and run the testbench again, then open the VCD file in GTKWave:

```sh
iverilog -g2012 -o sim.vvp design.v tb_design.v
vvp sim.vvp
gtkwave dump.vcd
```

If GTKWave is installed on a remote/headless machine, it may require a graphical display or a suitable remote desktop/X server. The generated `dump.vcd` is real simulator output only when those local commands actually ran successfully and created it.
