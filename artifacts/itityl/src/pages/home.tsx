import React, { useEffect, useRef } from "react";
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
    transition: { staggerChildren: 0.12 }
  }
};

const services = [
  { ru: "Автоматизация процессов", en: "Process Automation" },
  { ru: "ИИ-решения для бизнеса", en: "AI Business Solutions" },
  { ru: "Машинное обучение", en: "Machine Learning" },
  { ru: "Цифровая трансформация", en: "Digital Transformation" },
  { ru: "Аналитика данных", en: "Data Analytics" },
  { ru: "Консалтинг по ИИ", en: "AI Consulting" },
];

const team = [
  { name: "Александр", role: "Технический директор" },
  { name: "Мария", role: "Руководитель ИИ-проектов" },
  { name: "Дмитрий", role: "Главный разработчик" },
];

const logos = ["Сбер", "Яндекс", "VK", "МТС", "Тинькофф", "Росатом", "Газпром", "Лукойл"];

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black overflow-x-hidden">

      {/* Fixed Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 border-b border-white/20 bg-black/90 backdrop-blur-md">
        <Link href="/" className="text-xl font-heading font-extrabold uppercase tracking-wider">
          АЙ-ТИТУЛ
        </Link>

        <div className="hidden md:flex items-center gap-10 text-xs font-bold tracking-[0.2em] uppercase">
          <a href="#about" className="hover:opacity-60 transition-opacity">О нас</a>
          <a href="#services" className="hover:opacity-60 transition-opacity">Услуги</a>
          <a href="#team" className="hover:opacity-60 transition-opacity">Команда</a>
        </div>

        <a
          href="#contact"
          className="hidden md:flex items-center gap-2 bg-white text-black px-5 py-2.5 text-xs font-extrabold uppercase tracking-widest hover:bg-white/80 transition-colors"
        >
          Свяжись с нами <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-44 pb-20 px-6 md:px-10 min-h-screen flex flex-col justify-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-end"
        >
          <div className="lg:col-span-8">
            <motion.h1
              variants={fadeUp}
              className="text-[11vw] leading-[0.85] font-heading font-extrabold uppercase tracking-tighter"
            >
              Место где<br />
              <span className="text-white/50">процессы</span><br />
              становятся<br />
              умнее.
            </motion.h1>
          </div>

          <motion.div variants={fadeUp} className="lg:col-span-4 flex flex-col gap-8 lg:pb-4">
            <p className="text-lg text-white/60 max-w-sm font-light leading-relaxed">
              Оставить свой след в индустрии ИИ — это не просто цель, а жизненное кредо для всех членов нашей команды.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#contact"
                className="flex items-center gap-2 bg-white text-black px-6 py-4 text-xs font-extrabold uppercase tracking-widest hover:bg-white/80 transition-colors"
              >
                Начать проект <ArrowUpRight className="w-4 h-4" />
              </a>
              <a
                href="#services"
                className="flex items-center gap-2 border border-white/20 text-white px-6 py-4 text-xs font-extrabold uppercase tracking-widest hover:bg-white/10 transition-colors"
              >
                Наши услуги <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── MARQUEE LOGOS ── */}
      <div className="border-y border-white/15 py-7 overflow-hidden bg-black">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...logos, ...logos].map((logo, i) => (
            <span
              key={i}
              className="mx-12 text-xl font-heading font-extrabold text-white/25 uppercase tracking-widest flex-shrink-0"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>

      {/* ── ABOUT ── */}
      <section id="about" className="py-32 px-6 md:px-10 border-b border-white/15">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12"
        >
          <motion.div variants={fadeUp} className="lg:col-span-3">
            <span className="text-xs uppercase tracking-[0.25em] text-white/40 font-bold">01 / О нас</span>
          </motion.div>
          <motion.div variants={fadeUp} className="lg:col-span-9">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-heading font-extrabold leading-none uppercase tracking-tighter mb-16">
              Мы создаём ценность
            </h2>
            <p className="text-xl text-white/60 max-w-2xl leading-relaxed mb-16">
              Мы усердно работаем каждый день, чтобы сделать жизнь наших клиентов лучше и счастливее. Команда АЙ-ТИТУЛ разрабатывает интеллектуальные решения, которые автоматизируют рутину и открывают новые возможности.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-white/15">
              {[
                { val: "120+", label: "Проектов" },
                { val: "40+", label: "Клиентов" },
                { val: "5+", label: "Лет опыта" },
                { val: "98%", label: "Довольных" },
              ].map((s, i) => (
                <div key={i}>
                  <div className="text-4xl md:text-5xl font-heading font-extrabold mb-2">{s.val}</div>
                  <div className="text-xs text-white/40 uppercase tracking-widest">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="py-32 px-6 md:px-10 bg-white text-black">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="max-w-[1600px] mx-auto"
        >
          <motion.div variants={fadeUp} className="mb-16 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-3">
              <span className="text-xs uppercase tracking-[0.25em] text-black/40 font-bold">02 / Услуги</span>
            </div>
            <div className="lg:col-span-9">
              <h2 className="text-4xl md:text-6xl font-heading font-extrabold uppercase tracking-tighter">
                Что мы делаем
              </h2>
            </div>
          </motion.div>

          <div className="flex flex-col border-t border-black/15">
            {services.map((service, index) => (
              <motion.a
                key={index}
                href="#contact"
                variants={fadeUp}
                className="group flex items-center justify-between py-10 md:py-14 border-b border-black/15 hover:bg-black hover:text-white px-6 -mx-6 transition-colors duration-300"
              >
                <div className="flex items-baseline gap-6">
                  <span className="text-xs text-black/30 group-hover:text-white/40 font-bold tracking-widest w-8 flex-shrink-0 transition-colors">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-3xl md:text-5xl lg:text-6xl font-heading font-extrabold uppercase tracking-tighter">
                    {service.ru}
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs uppercase tracking-widest text-black/40 group-hover:text-white/40 hidden md:block transition-colors">
                    {service.en}
                  </span>
                  <ArrowUpRight className="w-8 h-8 md:w-12 md:h-12 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-out flex-shrink-0" />
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── QUOTE ── */}
      <section className="py-32 px-6 md:px-10 bg-black text-white border-b border-white/15">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="max-w-[1600px] mx-auto"
        >
          <motion.p
            variants={fadeUp}
            className="text-3xl md:text-5xl lg:text-6xl font-heading font-light leading-[1.15] max-w-5xl mb-14"
          >
            "Они не просто автоматизировали наши процессы — они изменили то, как мы мыслим о бизнесе. Профессионализм на каждом этапе."
          </motion.p>
          <motion.div variants={fadeUp} className="flex items-center gap-6">
            <div className="w-12 h-px bg-white/30" />
            <div>
              <div className="font-extrabold uppercase tracking-wider text-sm">Сергей Ковалёв</div>
              <div className="text-white/40 text-xs uppercase tracking-widest mt-1">CEO, TechProcess Group</div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── TEAM ── */}
      <section id="team" className="py-32 px-6 md:px-10 bg-black text-white border-b border-white/15">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="max-w-[1600px] mx-auto"
        >
          <motion.div variants={fadeUp} className="mb-20 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-3">
              <span className="text-xs uppercase tracking-[0.25em] text-white/40 font-bold">03 / Команда</span>
            </div>
            <div className="lg:col-span-9">
              <h2 className="text-5xl md:text-7xl font-heading font-extrabold uppercase tracking-tighter">
                Люди за идеями
              </h2>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/15 pt-16">
            {team.map((member, i) => (
              <motion.div key={i} variants={fadeUp} className="group flex flex-col">
                <div className="aspect-[3/4] bg-white/5 mb-6 relative overflow-hidden flex items-center justify-center border border-white/10 group-hover:border-white/30 transition-colors duration-500">
                  <span className="text-white/10 font-heading text-[120px] uppercase font-extrabold absolute leading-none">
                    {member.name[0]}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <h4 className="text-3xl font-heading font-extrabold uppercase tracking-tighter mb-2">{member.name}</h4>
                <p className="text-white/40 uppercase tracking-widest text-xs">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="py-32 px-6 md:px-10 bg-white text-black">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12"
        >
          <motion.div variants={fadeUp} className="lg:col-span-3">
            <span className="text-xs uppercase tracking-[0.25em] text-black/40 font-bold">04 / Контакт</span>
          </motion.div>
          <motion.div variants={fadeUp} className="lg:col-span-9">
            <h2 className="text-[9vw] leading-[0.85] font-heading font-extrabold uppercase tracking-tighter mb-20">
              Давайте<br />работать<br />вместе.
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 pt-12 border-t border-black/15">
              <div className="flex flex-col gap-6">
                <p className="text-sm uppercase tracking-widest text-black/50 font-bold">Напишите нам</p>
                <a
                  href="mailto:hello@itityl.ru"
                  className="text-2xl md:text-4xl font-heading font-extrabold hover:opacity-50 transition-opacity tracking-tight"
                >
                  hello@itityl.ru
                </a>
              </div>
              <div className="flex flex-col gap-5">
                <p className="text-sm uppercase tracking-widest text-black/50 font-bold">Соцсети</p>
                {["Telegram", "LinkedIn", "ВКонтакте", "Хабр"].map((s) => (
                  <a key={s} href="#" className="flex items-center gap-2 text-lg font-heading font-bold uppercase tracking-wider hover:opacity-50 transition-opacity group">
                    {s}
                    <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-6 md:px-10 bg-black text-white border-t border-white/15">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">
          <p>&copy; {new Date().getFullYear()} АЙ-ТИТУЛ. Все права защищены.</p>
          <div className="flex items-center gap-8">
            <a href="#" className="hover:text-white transition-colors">Конфиденциальность</a>
            <a href="#" className="hover:text-white transition-colors">Условия</a>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 22s linear infinite;
        }
      `}</style>
    </div>
  );
}
