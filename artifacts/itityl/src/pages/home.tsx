import { useRef } from "react";
import { Link } from "wouter";
import { ArrowUpRight, ArrowDown } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { fadeUp, stagger, lineDraw, easeOutExpo } from "@/lib/motion";
import { SplitText } from "@/components/SplitText";
import { Magnetic } from "@/components/Magnetic";
import { Counter } from "@/components/Counter";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import { ServicesList } from "@/components/ServicesList";
import { MarqueeRow } from "@/components/MarqueeRow";
import { ContactForm } from "@/components/ContactForm";

const services = [
  {
    ru: "Консалтинг",
    en: "Consulting & Strategy",
    gradient: "linear-gradient(135deg, #1a1a1a 0%, #b86a1f 100%)",
  },
  {
    ru: "Разработка",
    en: "Custom AI Development",
    gradient: "linear-gradient(135deg, #2a1a0a 0%, #d97a1f 100%)",
  },
  {
    ru: "Сопровождение",
    en: "Support & Evolution",
    gradient: "linear-gradient(135deg, #0f0f1a 0%, #ff9933 100%)",
  },
  {
    ru: "Аналитика данных",
    en: "Applied Data Analytics",
    gradient: "linear-gradient(135deg, #1a1208 0%, #c4621a 100%)",
  },
  {
    ru: "Интеграция в системы",
    en: "Enterprise Integration",
    gradient: "linear-gradient(135deg, #0a0a0a 0%, #e08828 100%)",
  },
  {
    ru: "Обучение и аудит",
    en: "AI Audit & Training",
    gradient: "linear-gradient(135deg, #1f0f00 0%, #ffaa44 100%)",
  },
];

const process = [
  {
    n: "01",
    title: "Обследование",
    desc: "Оцениваем текущие процессы, данные, регламенты, используемые системы и зрелость среды для внедрения ИИ.",
  },
  {
    n: "02",
    title: "Стратегия",
    desc: "Формируем список инициатив с оценкой эффекта, сроков, ограничений и требований к внедрению.",
  },
  {
    n: "03",
    title: "Пилотирование",
    desc: "Запускаем пилотные проекты, чтобы подтвердить применимость сценария до масштабирования.",
  },
  {
    n: "04",
    title: "Разработка",
    desc: "Переводим пилот в рабочее решение и встраиваем в инфраструктуру.",
  },
  {
    n: "05",
    title: "Сопровождение",
    desc: "Поддерживаем решение после запуска, улучшаем модели, расширяем охват сценариев.",
  },
];

const products = [
  {
    name: "Интеллектуальная канцелярия",
    desc: "Извлечение данных, классификация, поиск, маршрутизация, проверка комплектности, ускорение обработки обращений и внутренних документов.",
  },
  {
    name: "Аналитик документов",
    desc: "Анализ, структурирование и извлечение данных из массивов документов и регламентной информации.",
  },
  {
    name: "Корпоративные знания",
    desc: "Поиск по внутренним базам знаний, регламентам, инструкциям и архивам с быстрым получением релевантных ответов и ссылок на источники.",
  },
  {
    name: "Документы и переписка",
    desc: "Ускорение обработки входящих и внутренних документов, маршрутизации, проверки и подготовки информации.",
  },
];

const team = [
  { name: "Александр", role: "Технический директор" },
  { name: "Мария", role: "Руководитель ИИ-проектов" },
  { name: "Дмитрий", role: "Главный разработчик" },
];

const audiences = [
  {
    title: "Крупный бизнес",
    desc: "Сложные процессы, большой объём данных, документов и корпоративных систем.",
  },
  {
    title: "Госсектор",
    desc: "Высокая регламентированность, существенная документная нагрузка, повышенные требования к устойчивости.",
  },
  {
    title: "Функциональные подразделения",
    desc: "Снижение ручной нагрузки в операционных и поддерживающих функциях, где сотрудники тратят время на типовые действия.",
  },
];

const logos = [
  "МосГорСвет",
  "Москоллектор",
  "Экотехпром",
  "ОЭК",
  "ГОРМОСТ",
  "Мосгортранс",
];

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroTextY = useTransform(heroProgress, [0, 1], [0, -120]);
  const { scrollYProgress } = useScroll();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-amber-400 selection:text-black overflow-x-hidden">
      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-amber-400/80 origin-left z-[100]"
        style={{ scaleX: scrollYProgress }}
      />

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 border-b border-white/10 bg-black/60 backdrop-blur-md">
        <Magnetic strength={0.25}>
          <Link
            href="/"
            data-cursor="link"
            className="flex items-center gap-2 text-xl font-heading font-extrabold uppercase tracking-wider"
          >
            <span>АЙ-ТИТУЛ</span>
            <span className="text-amber-400">|</span>
          </Link>
        </Magnetic>

        <div className="hidden md:flex items-center gap-10 text-xs font-bold tracking-[0.2em] uppercase">
          {[
            { l: "Услуги", h: "#services" },
            { l: "Продукты", h: "#products" },
            { l: "Команда", h: "#team" },
            { l: "Компания", h: "#about" },
          ].map((it) => (
            <a
              key={it.h}
              href={it.h}
              data-cursor="link"
              className="relative group hover:text-amber-300 transition-colors"
            >
              {it.l}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-amber-300 group-hover:w-full transition-all duration-500 ease-out" />
            </a>
          ))}
        </div>

        <Magnetic strength={0.4}>
          <a
            href="#contact"
            data-cursor="link"
            className="hidden md:flex items-center gap-2 bg-white text-black px-5 py-2.5 text-xs font-extrabold uppercase tracking-widest hover:bg-amber-300 transition-colors"
          >
            Связаться <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </Magnetic>
      </nav>

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative pt-44 pb-24 px-6 md:px-10 min-h-screen flex flex-col justify-center overflow-hidden"
      >
        <HeroBackdrop />

        <motion.div
          style={{ y: heroTextY }}
          className="relative z-10 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-end"
        >
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: easeOutExpo }}
              className="mb-6 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-amber-300/90 font-bold"
            >
              <span className="w-8 h-px bg-amber-300/70" />
              ИИ‑компания · Москва
            </motion.div>

            <h1 className="text-[12vw] lg:text-[8.5vw] leading-[0.88] font-heading font-extrabold uppercase tracking-tighter">
              <SplitText
                as="span"
                text="Искусственный интеллект"
                stagger={0.06}
                className="block"
              />
              <SplitText
                as="span"
                text="для бизнеса"
                stagger={0.07}
                delay={0.15}
                className="block text-white/40"
              />
              <SplitText
                as="span"
                text="и госсектора"
                stagger={0.07}
                delay={0.25}
                className="block"
              />
            </h1>
          </div>

          <motion.div
            variants={stagger(0.12, 0.5)}
            initial="hidden"
            animate="visible"
            className="lg:col-span-4 flex flex-col gap-8 lg:pb-6"
          >
            <motion.p
              variants={fadeUp}
              className="text-base md:text-lg text-white/70 max-w-md font-light leading-relaxed"
            >
              От обследования процессов до внедрения решений. Помогаем крупным
              организациям находить прикладные сценарии использования ИИ и
              доводить инициативы до результата.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              <Magnetic strength={0.5}>
                <a
                  href="#contact"
                  data-cursor="view"
                  data-cursor-label="Написать"
                  className="flex items-center gap-3 bg-amber-400 text-black px-7 py-4 text-xs font-extrabold uppercase tracking-widest hover:bg-amber-300 transition-colors"
                >
                  Обсудить задачи <ArrowUpRight className="w-4 h-4" />
                </a>
              </Magnetic>
              <Magnetic strength={0.4}>
                <a
                  href="#services"
                  data-cursor="link"
                  className="flex items-center gap-2 border border-white/25 text-white px-6 py-4 text-xs font-extrabold uppercase tracking-widest hover:bg-white/10 transition-colors"
                >
                  Подробнее об услугах
                </a>
              </Magnetic>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-white/50"
        >
          <span>Скролл</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          >
            <ArrowDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── MARQUEE LOGOS ── */}
      <section className="border-y border-white/15 py-8 bg-black flex flex-col gap-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="px-6 md:px-10 flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-white/50 font-bold"
        >
          <span className="w-6 h-px bg-white/30" />
          Нам доверяют
        </motion.div>
        <MarqueeRow items={logos} speed={32} />
        <MarqueeRow items={[...logos].reverse()} reverse speed={36} />
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="py-32 px-6 md:px-10 border-b border-white/15 relative overflow-hidden">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger(0.1)}
          className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12"
        >
          <motion.div variants={fadeUp} className="lg:col-span-3">
            <span className="text-xs uppercase tracking-[0.3em] text-amber-300/80 font-bold">
              01 / О компании
            </span>
          </motion.div>

          <div className="lg:col-span-9">
            <SplitText
              as="h2"
              text="Процессы, которые становятся умнее."
              stagger={0.06}
              className="text-4xl md:text-6xl lg:text-7xl font-heading font-extrabold leading-[0.95] uppercase tracking-tighter mb-12"
            />

            <motion.p
              variants={fadeUp}
              className="text-xl text-white/65 max-w-2xl leading-relaxed mb-16"
            >
              ИИ особенно эффективен там, где в организации есть большой объём
              документов, повторяющиеся операции, регламентные процессы и
              высокая стоимость ручной обработки информации. Мы соединяем
              стратегию, инженерию и сопровождение, чтобы инициатива доходила
              до результата.
            </motion.p>

            <motion.div
              variants={lineDraw}
              className="h-px bg-white/30 origin-left mb-12"
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { val: "120+", label: "Крупных проектов" },
                { val: "40+", label: "Заказчиков" },
                { val: "8+", label: "Лет в ИИ" },
                { val: "98%", label: "Доходят до прод" },
              ].map((s, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <div className="text-4xl md:text-6xl font-heading font-extrabold mb-3 text-amber-300">
                    <Counter value={s.val} />
                  </div>
                  <div className="text-xs text-white/45 uppercase tracking-widest">
                    {s.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="py-32 px-6 md:px-10 bg-white text-black">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger(0.08)}
          className="max-w-[1600px] mx-auto"
        >
          <motion.div
            variants={fadeUp}
            className="mb-16 grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            <div className="lg:col-span-3">
              <span className="text-xs uppercase tracking-[0.3em] text-amber-700 font-bold">
                02 / Услуги
              </span>
            </div>
            <div className="lg:col-span-9">
              <SplitText
                as="h2"
                text="Что мы делаем"
                stagger={0.07}
                className="text-4xl md:text-6xl lg:text-7xl font-heading font-extrabold uppercase tracking-tighter leading-none"
              />
              <motion.p
                variants={fadeUp}
                className="mt-6 text-lg text-black/55 max-w-2xl leading-relaxed"
              >
                Технология выбирается под задачу и ограничения среды. Для нас
                ИИ не самоцель — важнее, чтобы решение можно было внедрить и
                масштабировать.
              </motion.p>
            </div>
          </motion.div>

          <ServicesList services={services} />
        </motion.div>
      </section>

      {/* ── PROCESS ── */}
      <section id="process" className="py-32 px-6 md:px-10 bg-black text-white border-b border-white/15 relative overflow-hidden">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger(0.08)}
          className="max-w-[1600px] mx-auto"
        >
          <motion.div
            variants={fadeUp}
            className="mb-16 grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            <div className="lg:col-span-3">
              <span className="text-xs uppercase tracking-[0.3em] text-amber-300/80 font-bold">
                03 / Процесс
              </span>
            </div>
            <div className="lg:col-span-9">
              <SplitText
                as="h2"
                text="Как строится работа"
                stagger={0.07}
                className="text-4xl md:text-6xl font-heading font-extrabold uppercase tracking-tighter leading-none"
              />
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-px bg-white/10">
            {process.map((p, i) => (
              <motion.div
                key={p.n}
                variants={fadeUp}
                whileHover={{ backgroundColor: "rgba(255,180,80,0.08)" }}
                className="bg-black p-6 lg:p-8 flex flex-col gap-4 min-h-[260px] group cursor-default"
                data-cursor="link"
              >
                <div className="flex items-center justify-between">
                  <span className="text-amber-300/90 text-sm font-bold tracking-widest">
                    {p.n}
                  </span>
                  <motion.span
                    className="block w-6 h-px bg-white/40 group-hover:w-12 group-hover:bg-amber-300 transition-all duration-500"
                  />
                </div>
                <h3 className="text-2xl font-heading font-extrabold uppercase tracking-tight">
                  {p.title}
                </h3>
                <p className="text-sm text-white/55 leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── PRODUCTS ── */}
      <section id="products" className="py-32 px-6 md:px-10 bg-black text-white border-b border-white/15">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger(0.1)}
          className="max-w-[1600px] mx-auto"
        >
          <motion.div
            variants={fadeUp}
            className="mb-16 grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            <div className="lg:col-span-3">
              <span className="text-xs uppercase tracking-[0.3em] text-amber-300/80 font-bold">
                04 / Продукты
              </span>
            </div>
            <div className="lg:col-span-9">
              <SplitText
                as="h2"
                text="Наши продукты"
                stagger={0.07}
                className="text-4xl md:text-6xl font-heading font-extrabold uppercase tracking-tighter leading-none"
              />
              <motion.p
                variants={fadeUp}
                className="mt-6 text-lg text-white/55 max-w-2xl leading-relaxed"
              >
                Наряду с проектной разработкой мы развиваем набор прикладных
                направлений, востребованных в корпоративной среде.
              </motion.p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10">
            {products.map((p, i) => (
              <motion.a
                href="#contact"
                key={i}
                variants={fadeUp}
                data-cursor="view"
                data-cursor-label="Подробнее"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.4, ease: easeOutExpo }}
                className="bg-black p-8 lg:p-12 flex flex-col gap-6 min-h-[300px] group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-amber-500/0 to-amber-500/0 group-hover:from-amber-500/10 group-hover:to-transparent transition-all duration-700" />
                <div className="relative flex items-start justify-between">
                  <span className="text-xs text-white/30 font-bold tracking-widest">
                    0{i + 1}
                  </span>
                  <ArrowUpRight className="w-6 h-6 text-white/40 group-hover:text-amber-300 group-hover:rotate-12 transition-all duration-500" />
                </div>
                <div className="relative mt-auto">
                  <h3 className="text-3xl md:text-4xl font-heading font-extrabold uppercase tracking-tight mb-4 group-hover:text-amber-300 transition-colors duration-500">
                    {p.name}
                  </h3>
                  <p className="text-sm md:text-base text-white/55 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── QUOTE ── */}
      <section className="py-32 px-6 md:px-10 bg-black text-white border-b border-white/15 relative">
        <div className="max-w-[1600px] mx-auto">
          <SplitText
            as="p"
            text="«Мы строим решения, которым можно доверять. Данные, на которые можно положиться. ИИ, которому можно доверять.»"
            stagger={0.04}
            className="text-3xl md:text-5xl lg:text-6xl font-heading font-light leading-[1.15] max-w-5xl mb-14"
          />
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex items-center gap-6"
          >
            <div className="w-12 h-px bg-amber-300/60" />
            <div>
              <div className="font-extrabold uppercase tracking-wider text-sm">
                Команда АЙ‑ТИТУЛ
              </div>
              <div className="text-white/40 text-xs uppercase tracking-widest mt-1">
                Принципы работы
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── AUDIENCES ── */}
      <section className="py-32 px-6 md:px-10 bg-black text-white border-b border-white/15">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger(0.1)}
          className="max-w-[1600px] mx-auto"
        >
          <motion.div
            variants={fadeUp}
            className="mb-16 grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            <div className="lg:col-span-3">
              <span className="text-xs uppercase tracking-[0.3em] text-amber-300/80 font-bold">
                05 / Кому актуально
              </span>
            </div>
            <div className="lg:col-span-9">
              <SplitText
                as="h2"
                text="Для кого мы работаем"
                stagger={0.07}
                className="text-4xl md:text-6xl font-heading font-extrabold uppercase tracking-tighter leading-none"
              />
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/15 pt-16">
            {audiences.map((a, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.5, ease: easeOutExpo }}
                className="group flex flex-col"
                data-cursor="link"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 group-hover:border-amber-300/40 mb-6 relative overflow-hidden flex items-center justify-center transition-colors duration-500">
                  <span className="text-amber-300/15 group-hover:text-amber-300/40 font-heading text-[180px] uppercase font-extrabold leading-none transition-colors duration-700">
                    0{i + 1}
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  />
                </div>
                <h4 className="text-2xl md:text-3xl font-heading font-extrabold uppercase tracking-tight mb-3">
                  {a.title}
                </h4>
                <p className="text-white/55 text-sm leading-relaxed">{a.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── TEAM ── */}
      <section id="team" className="py-32 px-6 md:px-10 bg-black text-white border-b border-white/15">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger(0.12)}
          className="max-w-[1600px] mx-auto"
        >
          <motion.div
            variants={fadeUp}
            className="mb-16 grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            <div className="lg:col-span-3">
              <span className="text-xs uppercase tracking-[0.3em] text-amber-300/80 font-bold">
                06 / Команда
              </span>
            </div>
            <div className="lg:col-span-9">
              <SplitText
                as="h2"
                text="Люди за идеями"
                stagger={0.07}
                className="text-4xl md:text-6xl lg:text-7xl font-heading font-extrabold uppercase tracking-tighter leading-none"
              />
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/15 pt-16">
            {team.map((member, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.5, ease: easeOutExpo }}
                className="group flex flex-col"
                data-cursor="view"
                data-cursor-label="Профиль"
              >
                <div className="aspect-[3/4] bg-white/5 mb-6 relative overflow-hidden flex items-center justify-center border border-white/10 group-hover:border-amber-300/40 transition-colors duration-500">
                  <span className="text-white/10 group-hover:text-amber-300/30 font-heading text-[160px] uppercase font-extrabold absolute leading-none transition-colors duration-700">
                    {member.name[0]}
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-amber-500/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                    {["TG", "in", "Vk"].map((s) => (
                      <span
                        key={s}
                        className="px-2 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold uppercase tracking-widest"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <h4 className="text-3xl font-heading font-extrabold uppercase tracking-tighter mb-2 group-hover:text-amber-300 transition-colors duration-500">
                  {member.name}
                </h4>
                <p className="text-white/40 uppercase tracking-widest text-xs">
                  {member.role}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="py-32 px-6 md:px-10 bg-white text-black relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-40 -right-40 w-[60vw] h-[60vw] rounded-full blur-[120px] opacity-50"
          style={{
            background:
              "radial-gradient(circle, rgba(255,170,40,0.55), transparent 60%)",
          }}
        />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger(0.1)}
          className="relative max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12"
        >
          <motion.div variants={fadeUp} className="lg:col-span-3">
            <span className="text-xs uppercase tracking-[0.3em] text-amber-700 font-bold">
              07 / Контакт
            </span>
          </motion.div>

          <div className="lg:col-span-9">
            <h2 className="text-[12vw] lg:text-[8.5vw] leading-[0.88] font-heading font-extrabold uppercase tracking-tighter mb-16">
              <SplitText as="span" text="Давайте" stagger={0.07} className="block" />
              <SplitText as="span" text="построим" stagger={0.07} delay={0.1} className="block text-black/40" />
              <SplitText as="span" text="вместе." stagger={0.07} delay={0.2} className="block" />
            </h2>

            <motion.p
              variants={fadeUp}
              className="text-lg text-black/60 max-w-2xl leading-relaxed mb-16"
            >
              Расскажите о задаче — мы предложим оптимальный подход и оценим
              эффект от ИИ. Мы свяжемся с вами в ближайшее время.
            </motion.p>

            <motion.div variants={lineDraw} className="h-px bg-black/20 origin-left mb-12" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
              <motion.div variants={fadeUp} className="lg:col-span-7">
                <ContactForm />
              </motion.div>

              <div className="lg:col-span-5 flex flex-col gap-12">
                <motion.div variants={fadeUp} className="flex flex-col gap-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-black/50 font-bold">
                    Напишите нам
                  </p>
                  <Magnetic strength={0.2}>
                    <a
                      href="mailto:info@itityl.ru"
                      data-cursor="view"
                      data-cursor-label="Письмо"
                      className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight hover:text-amber-700 transition-colors break-all"
                    >
                      info@itityl.ru
                    </a>
                  </Magnetic>
                  <a
                    href="tel:+74951234567"
                    data-cursor="link"
                    className="text-lg font-heading font-bold tracking-tight text-black/70 hover:text-black transition-colors"
                  >
                    +7 (495) 123‑45‑67
                  </a>
                  <p className="text-sm text-black/50">Москва, Россия</p>
                </motion.div>

                <motion.div variants={fadeUp} className="flex flex-col gap-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-black/50 font-bold">
                    Соцсети
                  </p>
                  {["Telegram", "LinkedIn", "ВКонтакте", "Хабр"].map((s) => (
                    <Magnetic key={s} strength={0.25}>
                      <a
                        href="#"
                        data-cursor="link"
                        className="flex items-center gap-3 text-base md:text-lg font-heading font-bold uppercase tracking-wider hover:text-amber-700 transition-colors group"
                      >
                        {s}
                        <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-400" />
                      </a>
                    </Magnetic>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10 px-6 md:px-10 bg-black text-white border-t border-white/15">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">
          <p>&copy; {new Date().getFullYear()} АЙ-ТИТУЛ. Все права защищены.</p>
          <div className="flex items-center gap-8">
            <a href="#" data-cursor="link" className="hover:text-amber-300 transition-colors">
              Конфиденциальность
            </a>
            <a href="#" data-cursor="link" className="hover:text-amber-300 transition-colors">
              Условия
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
