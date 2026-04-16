import React from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* Fixed Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/20 bg-black/90 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-xl font-heading font-bold uppercase tracking-wider">
            itityl
          </Link>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
          <a href="#about" className="hover:opacity-70 transition-opacity">About</a>
          <a href="#services" className="hover:opacity-70 transition-opacity">Services</a>
          <a href="#team" className="hover:opacity-70 transition-opacity">Team</a>
        </div>
        
        <a href="#contact" className="hidden md:flex items-center gap-2 bg-white text-black px-5 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors">
          Work with us <ArrowUpRight className="w-4 h-4" />
        </a>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 min-h-screen flex flex-col justify-center">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-end"
        >
          <div className="lg:col-span-8">
            <motion.h1 
              variants={fadeUp}
              className="text-[12vw] leading-[0.85] font-heading font-bold uppercase tracking-tighter"
            >
              We build<br />
              <span className="text-white/70">digital</span><br />
              products<br />
              that matter.
            </motion.h1>
          </div>
          
          <motion.div variants={fadeUp} className="lg:col-span-4 flex flex-col gap-8 lg:pb-4">
            <p className="text-lg md:text-xl text-white/70 max-w-md font-light leading-relaxed">
              A modern IT agency offering web development, mobile apps, UI/UX design, and digital transformation for ambitious brands.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#contact" className="flex items-center gap-2 bg-white text-black px-6 py-4 text-sm font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors">
                Start a project <ArrowUpRight className="w-4 h-4" />
              </a>
              <a href="#services" className="flex items-center gap-2 border border-white/20 text-white px-6 py-4 text-sm font-bold uppercase tracking-wider hover:bg-white/10 transition-colors">
                Our Services <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Marquee Logos */}
      <div className="border-y border-white/20 py-8 overflow-hidden bg-black flex relative">
        <div className="marquee-container w-full">
          <div className="marquee-content items-center gap-16 px-8 text-2xl font-heading font-bold text-white/30 uppercase tracking-widest">
            <span>Google</span>
            <span>Microsoft</span>
            <span>AWS</span>
            <span>Figma</span>
            <span>Vercel</span>
            <span>Stripe</span>
            <span>Google</span>
            <span>Microsoft</span>
            <span>AWS</span>
            <span>Figma</span>
            <span>Vercel</span>
            <span>Stripe</span>
          </div>
        </div>
      </div>

      {/* About Section */}
      <section id="about" className="py-32 px-6">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12"
        >
          <motion.div variants={fadeUp} className="lg:col-span-4">
            <span className="text-xs uppercase tracking-[0.2em] text-white/50 font-bold">01 / About</span>
          </motion.div>
          <motion.div variants={fadeUp} className="lg:col-span-8">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold leading-none uppercase tracking-tighter mb-12">
              We are a team of engineers and designers building digital products from the ground up. Based globally, working remotely.
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-white/20">
              <div>
                <div className="text-4xl md:text-5xl font-heading font-bold mb-2">200+</div>
                <div className="text-sm text-white/50 uppercase tracking-wider">Projects</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-heading font-bold mb-2">50+</div>
                <div className="text-sm text-white/50 uppercase tracking-wider">Clients</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-heading font-bold mb-2">8+</div>
                <div className="text-sm text-white/50 uppercase tracking-wider">Years</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-heading font-bold mb-2">99%</div>
                <div className="text-sm text-white/50 uppercase tracking-wider">Satisfaction</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-32 px-6 bg-white text-black">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="max-w-[1600px] mx-auto"
        >
          <motion.div variants={fadeUp} className="mb-20">
            <span className="text-xs uppercase tracking-[0.2em] text-black/50 font-bold">02 / Services</span>
          </motion.div>
          
          <div className="flex flex-col border-t border-black/20">
            {[
              "Web Development",
              "Mobile Applications",
              "UI/UX Design",
              "Digital Strategy",
              "Cloud Solutions",
              "AI Integration"
            ].map((service, index) => (
              <motion.a 
                key={index}
                href="#contact"
                variants={fadeUp}
                className="group flex items-center justify-between py-10 md:py-16 border-b border-black/20 hover:bg-black/5 transition-colors px-4 -mx-4"
              >
                <h3 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold uppercase tracking-tighter">
                  {service}
                </h3>
                <ArrowUpRight className="w-10 h-10 md:w-16 md:h-16 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-out" />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Testimonial Section */}
      <section className="py-32 px-6 bg-black text-white border-b border-white/20">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="max-w-[1600px] mx-auto text-center"
        >
          <motion.p variants={fadeUp} className="text-3xl md:text-5xl lg:text-6xl font-heading font-light leading-tight max-w-5xl mx-auto mb-12">
            "They didn't just build our app, they helped us rethink our entire digital strategy. Absolute professionals from start to finish."
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-sm">Sarah Jenkins</span>
            <span className="text-white/50 text-sm uppercase tracking-wider">CEO, TechForward</span>
          </motion.div>
        </motion.div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-32 px-6 bg-black text-white">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="max-w-[1600px] mx-auto"
        >
          <motion.div variants={fadeUp} className="mb-20 grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <span className="text-xs uppercase tracking-[0.2em] text-white/50 font-bold">03 / Team</span>
            </div>
            <div className="lg:col-span-8">
              <h2 className="text-5xl md:text-7xl font-heading font-bold uppercase tracking-tighter">
                The People
              </h2>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8 border-t border-white/20 pt-16">
            {[
              { name: "Alex", role: "CTO" },
              { name: "Maria", role: "Designer" },
              { name: "David", role: "Lead Developer" }
            ].map((member, index) => (
              <motion.div key={index} variants={fadeUp} className="flex flex-col group">
                <div className="aspect-[3/4] bg-white/5 mb-6 relative overflow-hidden flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-500">
                  {/* Placeholder for team image */}
                  <span className="text-white/20 font-heading text-8xl uppercase font-bold absolute">{member.name[0]}</span>
                </div>
                <h4 className="text-3xl font-heading font-bold uppercase mb-2">{member.name}</h4>
                <p className="text-white/50 uppercase tracking-wider text-sm">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 px-6 bg-white text-black border-t border-black/20">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12"
        >
          <motion.div variants={fadeUp} className="lg:col-span-4">
            <span className="text-xs uppercase tracking-[0.2em] text-black/50 font-bold">04 / Contact</span>
          </motion.div>
          <motion.div variants={fadeUp} className="lg:col-span-8">
            <h2 className="text-[10vw] leading-[0.85] font-heading font-bold uppercase tracking-tighter mb-16">
              Let's work<br />together.
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="flex flex-col gap-6">
                <p className="text-lg font-medium">Ready to start a project?</p>
                <a href="mailto:hello@itityl.com" className="text-3xl md:text-5xl font-heading font-bold hover:opacity-70 transition-opacity">
                  hello@itityl.com
                </a>
              </div>
              <div className="flex flex-col gap-4 text-lg font-medium uppercase tracking-wider">
                <a href="#" className="hover:opacity-70 transition-opacity">Twitter / X</a>
                <a href="#" className="hover:opacity-70 transition-opacity">LinkedIn</a>
                <a href="#" className="hover:opacity-70 transition-opacity">Instagram</a>
                <a href="#" className="hover:opacity-70 transition-opacity">Dribbble</a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-black text-white border-t border-white/20">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs uppercase tracking-widest text-white/50 font-bold">
          <p>&copy; {new Date().getFullYear()} itityl.</p>
          <div className="flex items-center gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
