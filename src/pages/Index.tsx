import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ScanLine, ShieldCheck, Sparkles, Bell, Mail, Upload,
  ArrowRight, CheckCircle2, Clock, Receipt
} from "lucide-react";
import heroImg from "@/assets/hero.png";

const features = [
  { icon: ScanLine, title: "Scan any receipt", desc: "Upload a photo or PDF. Claimly extracts product, store, price and date in seconds." },
  { icon: ShieldCheck, title: "Warranty tracker", desc: "We auto-calculate warranty windows and remind you before they expire." },
  { icon: Sparkles, title: "AI claim writer", desc: "Generate polished refund and warranty claim emails with one click." },
  { icon: Bell, title: "Smart alerts", desc: "Never miss a return window again. We notify you days in advance." },
  { icon: Receipt, title: "All in one place", desc: "Every receipt, warranty, and claim — organized into one tidy dashboard." },
  { icon: Mail, title: "One-click send", desc: "Copy or send your generated claim straight to the merchant. Done." },
];

const steps = [
  { n: "01", title: "Upload your receipt", desc: "Drag, drop or snap a photo. PDF, PNG, JPG — all welcome." },
  { n: "02", title: "We do the math", desc: "Claimly identifies the product and calculates warranty + return deadlines." },
  { n: "03", title: "Claim and recover", desc: "When something goes wrong, generate a claim email instantly and send." },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-soft" />
        <div className="absolute inset-x-0 top-0 h-[600px]" style={{ background: "var(--gradient-hero-fade)" }} />
        <div className="container relative pt-20 pb-24 md:pt-28 md:pb-32 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI-powered refunds & warranty claims
            </span>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05]">
              Never lose <br />
              <span className="text-gradient-brand">warranty money</span> <br />
              again.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
              Claimly automates receipts, warranties and returns — so you recover every dollar you're owed without lifting a finger.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/signup">
                <Button variant="hero" size="xl" className="group">
                  Get started free
                  <ArrowRight className="transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="glass" size="xl">Try the demo</Button>
              </Link>
            </div>
            <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> No credit card</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> 2-min setup</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-elevated animate-float">
              <img src={heroImg} alt="Claimly automates global receipts and warranties" className="w-full h-auto" />
              <div className="absolute inset-0 bg-gradient-to-tr from-background/30 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-6 -left-6 glass rounded-2xl p-4 shadow-soft hidden md:flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-success/15 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm font-semibold">Refund recovered</p>
                <p className="text-xs text-muted-foreground">$249 from Amazon</p>
              </div>
            </div>
            <div className="absolute -top-6 -right-6 glass rounded-2xl p-4 shadow-soft hidden md:flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-warning/15 flex items-center justify-center">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm font-semibold">Warranty expiring</p>
                <p className="text-xs text-muted-foreground">in 12 days</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-y bg-muted/30">
        <div className="container py-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-3 text-xs uppercase tracking-widest text-muted-foreground font-medium">
          <span>Amazon</span><span>Flipkart</span><span>Best Buy</span><span>Apple</span><span>Nike</span><span>Walmart</span>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="container py-24">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <h2 className="font-display text-4xl md:text-5xl font-bold">Everything you need to claim back what's yours</h2>
          <p className="mt-4 text-lg text-muted-foreground">From scanning to sending — Claimly handles the boring parts.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group relative rounded-2xl p-6 bg-card border hover:shadow-elevated hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-11 w-11 rounded-xl bg-gradient-brand flex items-center justify-center mb-4 shadow-glow">
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="bg-gradient-soft py-24">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <h2 className="font-display text-4xl md:text-5xl font-bold">How Claimly works</h2>
            <p className="mt-4 text-lg text-muted-foreground">Three steps. Zero spreadsheets.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl p-8 bg-card border shadow-soft relative"
              >
                <span className="absolute top-6 right-6 font-display text-5xl font-bold text-gradient-brand opacity-30">{s.n}</span>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  {i === 0 && <Upload className="h-5 w-5 text-primary" />}
                  {i === 1 && <ShieldCheck className="h-5 w-5 text-primary" />}
                  {i === 2 && <Mail className="h-5 w-5 text-primary" />}
                </div>
                <h3 className="font-display font-semibold text-xl mb-2">{s.title}</h3>
                <p className="text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-brand p-12 md:p-16 text-center shadow-elevated">
          <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white, transparent 40%), radial-gradient(circle at 80% 60%, white, transparent 40%)" }} />
          <div className="relative max-w-2xl mx-auto text-white space-y-6">
            <h2 className="font-display text-4xl md:text-5xl font-bold">Stop leaving money on the table.</h2>
            <p className="text-lg opacity-90">Join thousands of households recovering refunds and protecting warranties — automatically.</p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link to="/signup">
                <Button size="xl" className="bg-white text-primary hover:bg-white/90 rounded-full">Start free today</Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="glass" size="xl" className="text-white border-white/30">View demo</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
