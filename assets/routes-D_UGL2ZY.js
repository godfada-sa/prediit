import { o as reactRaw } from "./useStore-BI3_Wmfo.js";
import { k as Link } from "./index-sG8SpmM9.js";
import { o as makeIcon, t as Button } from "./button-DS1rjqG5.js";
import { t as ChevronRight } from "./chevron-right-CFc3Z5YP.js";
import { t as CircleCheck } from "./circle-check-big-D7UGd4CY.js";
import { t as ShieldCheck } from "./shield-check-jvVy79mL.js";
import { t as Sparkles } from "./sparkles-Bdgb3vhO.js";
import { t as Upload } from "./upload-DEbLKMg8.js";
import { t as Zap } from "./zap-DtLusXU7.js";

const Camera = makeIcon("camera", [
  ["path", { d: "M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z", key: "camera" }],
  ["circle", { cx: "12", cy: "13", r: "3", key: "lens" }]
]);
const Cpu = makeIcon("cpu", [
  ["rect", { x: "4", y: "4", width: "16", height: "16", rx: "2", key: "outer" }],
  ["rect", { x: "8", y: "8", width: "8", height: "8", rx: "1", key: "inner" }]
]);
const Gauge = makeIcon("gauge", [
  ["path", { d: "m12 14 4-4", key: "needle" }],
  ["path", { d: "M3.34 19a10 10 0 1 1 17.32 0", key: "dial" }]
]);

const heroPhone = "/assets/hero-phone-6VezEgsy.jpg";
const React = reactRaw();
const ticker = [
  "Screenshot analysis",
  "Probabilistic picks",
  "1X2 · goals · correct score",
  "Private image processing",
  "18+ · Play responsibly"
];
const steps = [
  { icon: Camera, number: "01", title: "Open your lobby", detail: "Launch the instant virtual football fixtures on your phone." },
  { icon: Upload, number: "02", title: "Upload one screenshot", detail: "Choose a clear image of the slate you want analysed." },
  { icon: Cpu, number: "03", title: "The model reads it", detail: "Visible fixtures are extracted and scored on the server." },
  { icon: CircleCheck, number: "04", title: "Review your picks", detail: "See ranked estimates with confidence and market context." }
];
const principles = [
  { icon: Zap, title: "Fast by design", detail: "A single screenshot moves from upload to ranked picks in one focused flow." },
  { icon: Gauge, title: "Confidence, not certainty", detail: "Every result is presented as a probabilistic estimate—not a guaranteed win." },
  { icon: ShieldCheck, title: "Private processing", detail: "Images are analysed server-side and the AI credential never enters your browser." },
  { icon: Sparkles, title: "Multiple markets", detail: "Review 1X2, goals, draw probability and correct-score estimates together." }
];
const facts = [
  ["1 upload", "Per analysis"],
  ["4 views", "Market context"],
  ["Private", "Server processing"]
];

function LandingPage() {
  return React.jsxs("main", {
    className: "min-h-screen overflow-x-hidden bg-background",
    children: [
      React.jsx("header", {
        className: "sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl",
        children: React.jsxs("div", {
          className: "mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3",
          children: [
            React.jsxs("a", {
              href: "#top",
              className: "flex min-w-0 items-center gap-2",
              children: [
                React.jsx("span", { className: "grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground glow-ring", children: React.jsx(Zap, { className: "h-4 w-4" }) }),
                React.jsxs("span", { className: "truncate text-lg font-black tracking-tight", children: ["PREDI", React.jsx("span", { className: "text-primary glow-text", children: "IT" })] })
              ]
            }),
            React.jsxs("div", {
              className: "flex shrink-0 items-center gap-2",
              children: [
                React.jsx(Button, { asChild: true, variant: "ghost", size: "sm", className: "rounded-full text-xs font-bold tracking-widest text-muted-foreground uppercase hover:text-foreground", children: React.jsx(Link, { to: "/login", children: "Log in" }) }),
                React.jsx(Button, { asChild: true, size: "sm", className: "rounded-full pulse-glow", children: React.jsx(Link, { to: "/signup", children: "Get started" }) })
              ]
            })
          ]
        })
      }),
      React.jsx("div", {
        className: "border-b border-border/60 bg-ash/60 py-2",
        children: React.jsx("div", {
          className: "flex w-max ticker-track",
          children: [0, 1].map((loop) => React.jsx("div", {
            className: "flex shrink-0 items-center",
            children: ticker.map((item) => React.jsxs("span", {
              className: "flex items-center gap-2 px-4 text-xs font-semibold text-ash-foreground",
              children: [React.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-primary" }), item]
            }, `${loop}-${item}`))
          }, loop))
        })
      }),
      React.jsx("section", {
        id: "top",
        className: "relative px-4 pt-12 pb-16",
        style: { backgroundImage: "var(--gradient-hero)" },
        children: React.jsxs("div", {
          className: "mx-auto flex max-w-6xl flex-col items-center gap-12 text-center lg:flex-row lg:items-center lg:text-left",
          children: [
            React.jsxs("div", {
              className: "w-full lg:flex-1",
              children: [
                React.jsxs("span", { className: "inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-bold tracking-widest text-primary uppercase", children: [React.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-primary" }), "AI-assisted analysis"] }),
                React.jsxs("h1", { className: "mt-5 text-5xl leading-[0.95] font-black tracking-tight sm:text-6xl lg:text-7xl", children: ["READ THE", React.jsx("br", {}), React.jsx("span", { className: "text-primary glow-text", children: "VIRTUAL" }), React.jsx("br", {}), "ROUND"] }),
                React.jsx("p", { className: "mt-3 text-sm font-bold tracking-wide text-accent uppercase", children: "Virtual football · Instant analysis" }),
                React.jsx("p", { className: "mx-auto mt-4 max-w-md text-base text-muted-foreground lg:mx-0", children: "Upload a fixture screenshot and receive ranked, probabilistic market estimates before the next virtual round." }),
                React.jsxs("div", {
                  className: "mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start",
                  children: [
                    React.jsx(Button, { asChild: true, size: "lg", className: "rounded-full text-base font-bold pulse-glow", children: React.jsx(Link, { to: "/signup", children: "Create account" }) }),
                    React.jsx(Button, { asChild: true, size: "lg", variant: "secondary", className: "rounded-full border border-border text-base font-semibold", children: React.jsxs("a", { href: "#principles", children: ["How it works ", React.jsx(ChevronRight, { className: "ml-1 h-4 w-4" })] }) })
                  ]
                }),
                React.jsx("dl", {
                  className: "mt-9 grid grid-cols-3 gap-3 border-t border-border/60 pt-6",
                  children: facts.map(([value, label]) => React.jsxs("div", { children: [React.jsx("dt", { className: "text-lg font-black sm:text-xl", children: value }), React.jsx("dd", { className: "text-[10px] font-bold tracking-widest text-primary uppercase", children: label })] }, label))
                })
              ]
            }),
            React.jsxs("div", {
              className: "relative w-full max-w-xs lg:max-w-sm lg:flex-1",
              children: [
                React.jsx("div", { className: "absolute inset-0 -z-10 rounded-full blur-3xl", style: { boxShadow: "var(--shadow-glow-lg)", background: "var(--gradient-primary)", opacity: 0.28 } }),
                React.jsx("img", { src: heroPhone, width: 912, height: 1200, alt: "Phone showing the virtual-football analysis interface", className: "mx-auto w-full rounded-3xl" })
              ]
            })
          ]
        })
      }),
      React.jsx("section", {
        className: "px-4 py-16",
        children: React.jsxs("div", {
          className: "mx-auto max-w-6xl",
          children: [
            React.jsx("p", { className: "text-[11px] font-bold tracking-widest text-primary uppercase", children: "Process" }),
            React.jsx("h2", { className: "mt-2 text-3xl font-black tracking-tight sm:text-4xl", children: "One screenshot. Four steps." }),
            React.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "A focused workflow built for short virtual rounds." }),
            React.jsx("div", {
              className: "mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
              children: steps.map(({ icon: Icon, number, title, detail }) => React.jsxs("div", {
                className: "rounded-2xl p-5 surface-ash",
                children: [React.jsxs("div", { className: "flex items-center justify-between", children: [React.jsx("span", { className: "grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary", children: React.jsx(Icon, { className: "h-5 w-5" }) }), React.jsx("span", { className: "text-2xl font-black text-border", children: number })] }), React.jsx("h3", { className: "mt-4 text-base font-bold", children: title }), React.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: detail })]
              }, number))
            })
          ]
        })
      }),
      React.jsx("section", {
        id: "principles",
        className: "px-4 py-16",
        style: { background: "var(--gradient-ash)" },
        children: React.jsxs("div", {
          className: "mx-auto max-w-6xl",
          children: [
            React.jsxs("h2", { className: "text-3xl font-black tracking-tight sm:text-4xl", children: ["Clear by ", React.jsx("span", { className: "text-primary glow-text", children: "design" })] }),
            React.jsx("div", {
              className: "mt-8 grid gap-4 sm:grid-cols-2",
              children: principles.map(({ icon: Icon, title, detail }) => React.jsxs("div", {
                className: "flex gap-4 rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur",
                children: [React.jsx("span", { className: "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground glow-ring", children: React.jsx(Icon, { className: "h-5 w-5" }) }), React.jsxs("div", { className: "min-w-0", children: [React.jsx("h3", { className: "text-base font-bold", children: title }), React.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: detail })] })]
              }, title))
            })
          ]
        })
      }),
      React.jsx("section", {
        className: "px-4 py-20",
        children: React.jsxs("div", {
          className: "mx-auto max-w-3xl rounded-3xl border border-primary/30 p-8 text-center pulse-glow",
          style: { backgroundImage: "var(--gradient-hero)" },
          children: [
            React.jsxs("h2", { className: "text-3xl font-black tracking-tight sm:text-4xl", children: ["Ready to analyse the ", React.jsx("span", { className: "text-primary glow-text", children: "next round?" })] }),
            React.jsx("p", { className: "mt-3 text-sm text-muted-foreground", children: "Create an account, submit your registration proof and start with transparent probabilistic picks." }),
            React.jsx(Button, { asChild: true, size: "lg", className: "mt-6 w-full rounded-full text-base font-bold sm:w-auto", children: React.jsx(Link, { to: "/signup", children: "Create account" }) })
          ]
        })
      }),
      React.jsxs("footer", {
        className: "border-t border-border/60 px-4 py-8 text-center",
        children: [
          React.jsxs("p", { className: "text-sm font-black tracking-tight", children: ["PREDI", React.jsx("span", { className: "text-primary", children: "IT" })] }),
          React.jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: "18+. Predictions are probabilistic and never guaranteed. Play responsibly." })
        ]
      })
    ]
  });
}

export { LandingPage as component };
