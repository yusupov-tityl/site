import { m as motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import { fadeUp } from "@/lib/motion";
import { useSeo } from "@/lib/useSeo";
import { SiteNav } from "@/components/landing/SiteNav";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { PageHero } from "@/components/landing/PageHero";
import { SectionHeader } from "@/components/landing/SectionHeader";
import { NumberedCard } from "@/components/landing/NumberedCard";
import { FAQAccordion } from "@/components/landing/FAQAccordion";
import { CTASection } from "@/components/landing/CTASection";
import { NavList } from "@/components/landing/NavList";
import { Breadcrumbs } from "@/components/landing/Breadcrumbs";
import { CTAButton } from "@/components/landing/CTAButton";
import { MarqueeRow } from "@/components/MarqueeRow";
import { useContactModal } from "@/lib/contact-modal";
import { BreadcrumbSchema, FAQPageSchema, ItemListSchema } from "@/components/StructuredData";

const services = [
  { t: "AI-консалтинг и выявление сценариев", d: "Помогаем определить, где искусственный интеллект может дать практический эффект, какие задачи стоит запускать в первую очередь и как подойти к внедрению без лишних гипотез.", to: "/services/ai-consulting" },
  { t: "Обследование бизнес-процессов и ИТ-ландшафта", d: "Анализируем процессы, документы, данные, регламенты, текущие системы и ограничения среды, чтобы оценить готовность организации к внедрению ИИ.", to: "/services/process-audit" },
  { t: "Формирование портфеля ИИ-инициатив", d: "Определяем приоритетные направления, оцениваем потенциальный эффект, сроки, требования к внедрению и логику запуска инициатив.", to: "/services/portfolio" },
  { t: "Пилоты и проверка гипотез", d: "Запускаем пилотные проекты, чтобы проверить применимость сценария на реальных данных и в реальной рабочей среде.", to: "/services/pilots" },
  { t: "Разработка ИИ-решений", d: "Проектируем и создаем прикладные решения под конкретные задачи бизнеса с учетом процессов, инфраструктуры и требований безопасности.", to: "/services/development" },
  { t: "Интеграция в корпоративные системы", d: "Встраиваем решения в действующие процессы, внутренние сервисы, документооборот и ИТ-ландшафт организации.", to: "/services/integration" },
  { t: "Сопровождение и развитие", d: "Поддерживаем решения после запуска, улучшаем качество работы, расширяем охват сценариев и адаптируем систему под новые задачи.", to: "/services/support" },
];

const tasks = [
  { t: "Снижение ручной нагрузки", d: "Помогаем автоматизировать рутинные действия, сократить объем ручной обработки и высвободить время сотрудников." },
  { t: "Ускорение работы с документами", d: "Снижаем задержки при поиске, анализе, маршрутизации и обработке документов, регламентов и входящей информации." },
  { t: "Повышение доступности знаний", d: "Помогаем быстрее находить нужную информацию во внутренних материалах, инструкциях, базах знаний и архивах." },
  { t: "Улучшение качества процессов", d: "Снижаем вероятность пропусков, повышаем предсказуемость обработки и улучшаем управляемость процессов." },
  { t: "Интеграция ИИ в реальную среду", d: "Помогаем внедрять решения не отдельно от бизнеса, а внутри существующих процессов, систем и организационных ограничений." },
];

const reasons = [
  { t: "Экспертная и внедренческая работа в одном контуре", d: "Не ограничиваемся рекомендациями и можем провести проект от диагностики до рабочего решения." },
  { t: "Фокус на корпоративной среде", d: "Учитываем специфику сложных процессов, документов, внутренних систем и требований безопасности." },
  { t: "Прикладной подход", d: "Оцениваем ИИ не как модную технологию, а как инструмент для конкретных процессов и задач." },
  { t: "Высокая скорость перехода к предметной работе", d: "Быстро переходим от обсуждения к обследованию, гипотезам, приоритизации и пилотам." },
];

const directions = [
  { t: "Документные процессы", d: "Обработка, анализ, поиск, маршрутизация и структурирование информации." },
  { t: "Корпоративные знания", d: "Ускорение доступа к внутренним материалам, регламентам и накопленной экспертизе." },
  { t: "Рутинные операции", d: "Снижение объема повторяющихся действий и повышение производительности сотрудников." },
  { t: "Внутренние сервисы и функции", d: "Поддержка подразделений, которые работают с большими потоками информации и типовыми запросами." },
  { t: "Аналитика и принятие решений", d: "Подготовка структурированной информации для специалистов и руководителей." },
];

const faq = [
  { q: "С чего обычно начинается работа?", a: "Обычно мы начинаем с обследования процессов, данных, документов и текущих систем. Это позволяет понять, где ИИ действительно даст эффект и какие сценарии стоит запускать в первую очередь." },
  { q: "Нужно ли сразу заказывать разработку?", a: "Нет. Во многих случаях сначала разумно определить приоритетные направления и проверить гипотезы через пилот." },
  { q: "Можно ли внедрять ИИ в уже существующий ИТ-ландшафт?", a: "Да. Одна из ключевых задач — встроить решение в действующие системы, процессы и организационные ограничения." },
  { q: "Что делать, если в компании много идей, но непонятно, с чего начать?", a: "В таком случае полезно пройти этап диагностики и формирования портфеля инициатив, чтобы отделить перспективные сценарии от второстепенных." },
];

export default function Services() {
  useSeo({
    title: "Услуги по внедрению ИИ — обследование, пилоты, разработка | Ай-Титул",
    description:
      "Полный цикл внедрения ИИ: AI-консалтинг, обследование процессов, портфель инициатив, пилоты за 4–8 недель, разработка и интеграция в корпоративный контур.",
    path: "/services",
  });

  const { open: openModal } = useContactModal();
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-amber-400 selection:text-black overflow-x-hidden">
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/" },
          { name: "Услуги", url: "/services" },
        ]}
      />
      <FAQPageSchema items={faq} />
      <ItemListSchema
        name="Услуги Ай-Титул в области ИИ"
        items={services.map((s) => ({ name: s.t, url: s.to, description: s.d }))}
      />
      <SiteNav />
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Услуги" }]} />
      <PageHero
        index="03"
        eyebrow="Услуги"
        title="Услуги по разработке и внедрению ИИ-решений для бизнеса"
        subtitle="Мы оказываем услуги в сфере искусственного интеллекта для бизнеса и B2G: помогаем выявлять прикладные сценарии, оценивать их эффект, запускать пилоты, разрабатывать решения и встраивать их в процессы, документы, данные и корпоративные системы."
        hasBreadcrumbs
        ctas={[
          { label: "Обсудить задачи", ctaSource: "services-hero-discuss" },
          { label: "Посмотреть услуги", href: "#services" },
          { label: "Получить консультацию", ctaSource: "services-hero-consult" },
        ]}
      />

      <section className="py-24 md:py-32 px-6 md:px-10 border-b border-white/10">
        <SectionHeader
          index="02"
          label="Подход"
          title="Какие услуги в сфере ИИ мы оказываем"
          body="Ай-Титул помогает компаниям и государственным организациям внедрять искусственный интеллект не как абстрактную технологию, а как прикладной инструмент для конкретных процессов. Мы подключаемся на разных этапах: когда нужно понять потенциал ИИ, определить приоритетные сценарии, проверить гипотезы, создать рабочее решение или встроить его в действующую инфраструктуру."
        />
      </section>

      <section id="services" className="py-24 md:py-32 px-6 md:px-10 border-b border-white/10">
        <SectionHeader
          index="03"
          label="Услуги"
          title="Наши услуги"
          body="Мы выстраиваем работу так, чтобы заказчик мог пройти весь путь — от первичной оценки применимости ИИ до полноценного использования решения в рабочем контуре."
        />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          className="max-w-[1600px] mx-auto mt-14 grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10"
        >
          {services.map((s, i) => (
            <NumberedCard key={s.t} index={i + 1} title={s.t} desc={s.d} to={s.to} cta="Подробнее" />
          ))}
          <motion.div
            variants={fadeUp}
            className="bg-amber-400 text-black p-10 lg:p-12 flex flex-col gap-6 min-h-[320px] md:col-span-1"
          >
            <span className="text-[11px] font-bold tracking-[0.3em]">08</span>
            <h3 className="text-3xl md:text-4xl font-heading font-extrabold uppercase tracking-tight">
              Не знаете, что выбрать?
            </h3>
            <p className="text-base leading-relaxed">
              Закажите консультацию и наш специалист расскажет подробнее об услугах, которые мы предоставляем для бизнеса.
            </p>
            <button
              type="button"
              onClick={() => openModal("services-help-choose")}
              data-cursor="link"
              data-analytics="cta:services-help-choose"
              className="mt-auto self-start inline-flex items-center gap-2 bg-black text-white px-6 py-3.5 text-xs font-extrabold uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
            >
              Заказать консультацию <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        </motion.div>
      </section>

      <section className="py-10 border-y border-white/10">
        <MarqueeRow items={["консалтинг", "обследование", "портфель", "пилот", "разработка", "интеграция", "сопровождение"]} />
      </section>

      <section className="py-24 md:py-32 px-6 md:px-10 border-b border-white/10">
        <SectionHeader
          index="04"
          label="Задачи"
          title="Какие задачи бизнеса мы помогаем решать"
          body="Услуги ИИ для бизнеса дают максимальный эффект там, где есть повторяющиеся операции, большой объем информации, сложные маршруты согласования, корпоративные документы, внутренние знания и высокая стоимость ручной обработки данных."
        />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          className="max-w-[1600px] mx-auto mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-px bg-white/10"
        >
          {tasks.map((t, i) => (
            <motion.div
              key={t.t}
              variants={fadeUp}
              className="bg-[#141414] p-8 flex flex-col gap-4 group hover:bg-[#1a1a1a] transition-colors"
            >
              <span className="text-[11px] text-amber-300 font-bold tracking-[0.3em]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-lg md:text-xl font-heading font-extrabold uppercase tracking-tight group-hover:text-amber-300 transition-colors">
                {t.t}
              </h3>
              <p className="text-sm text-white/55 leading-relaxed">{t.d}</p>
            </motion.div>
          ))}
        </motion.div>
        <div className="max-w-[1600px] mx-auto mt-10">
          <p className="max-w-3xl text-base md:text-lg text-white/65">
            Когда бизнес ищет нейросети для процессов или ИИ-решения для автоматизации, на практике ему нужен не набор модных инструментов, а понятная проектная работа: оценка сценариев, выбор приоритетов, пилот, разработка и внедрение.
          </p>
        </div>
      </section>

      <section className="py-24 md:py-32 px-6 md:px-10 border-b border-white/10">
        <SectionHeader
          index="05"
          label="Почему мы"
          title="Почему компании обращаются к нам за ИИ-услугами"
          body="Заказчикам важны не только компетенции в технологиях, но и способность довести проект до рабочего состояния в реальной корпоративной среде. Поэтому мы выстраиваем услуги вокруг прикладного результата, а не вокруг формального интереса к AI."
        />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          className="max-w-[1600px] mx-auto mt-14 grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10"
        >
          {reasons.map((r, i) => (
            <NumberedCard key={r.t} index={i + 1} title={r.t} desc={r.d} />
          ))}
        </motion.div>
        <div className="max-w-[1600px] mx-auto mt-12">
          <CTAButton label="Получить консультацию" ctaSource="services-why-consult" variant="primary" />
        </div>
      </section>

      <section className="py-24 md:py-32 px-6 md:px-10 border-b border-white/10">
        <SectionHeader
          index="06"
          label="Направления"
          title="В каких направлениях применяются наши услуги"
          body="Одна и та же сервисная модель может применяться в разных типах задач. Мы собрали типовые направления, где ИИ особенно полезен в корпоративной среде."
        />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          className="max-w-[1600px] mx-auto mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-px bg-white/10"
        >
          {directions.map((d, i) => (
            <motion.div
              key={d.t}
              variants={fadeUp}
              className="bg-[#141414] p-8 flex flex-col gap-4 group hover:bg-[#1a1a1a] transition-colors"
            >
              <span className="text-[11px] text-amber-300 font-bold tracking-[0.3em]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-lg md:text-xl font-heading font-extrabold uppercase tracking-tight group-hover:text-amber-300 transition-colors">
                {d.t}
              </h3>
              <p className="text-sm text-white/55 leading-relaxed">{d.d}</p>
            </motion.div>
          ))}
        </motion.div>
        <div className="max-w-[1600px] mx-auto mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#111] border border-white/10 p-8 md:p-12">
          <p className="lg:col-span-8 text-base md:text-lg text-white/70 leading-relaxed">
            Часть задач может решаться не только в сервисном формате, но и через отдельные продуктовые направления. Мы собрали их в отдельном разделе, чтобы вам было удобнее выбрать подходящий формат работы и быстрее перейти к нужному решению.
          </p>
          <div className="lg:col-span-4 lg:justify-self-end">
            <Link
              href="/products"
              data-cursor="link"
              className="inline-flex items-center gap-2 border border-white/25 text-white/85 hover:border-amber-300 hover:text-amber-300 px-6 py-3.5 text-xs font-extrabold uppercase tracking-widest transition-colors"
            >
              Перейти к продуктовым направлениям <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 px-6 md:px-10 border-b border-white/10">
        <SectionHeader
          index="07"
          label="Навигатор"
          title="Выберите интересующее направление"
          body="Если вы уже понимаете, какой формат работы вам нужен, перейдите сразу к соответствующей услуге."
        />
        <div className="max-w-[1600px] mx-auto mt-14">
          <NavList items={services.map((s) => ({ label: s.t, to: s.to }))} />
        </div>
      </section>

      <section className="py-24 md:py-32 px-6 md:px-10 border-b border-white/10">
        <SectionHeader index="08" label="FAQ" title="Частые вопросы об ИИ-услугах" align="left" />
        <div className="max-w-[1600px] mx-auto mt-12">
          <FAQAccordion items={faq} />
        </div>
      </section>

      <CTASection
        index="09"
        title="Обсудим, какие ИИ-услуги нужны вашей организации"
        body="Если вам нужен понятный набор услуг под конкретные процессы, документы, данные и системы, начнем с предметного обсуждения вашей задачи и возможных сценариев внедрения. Закажите консультацию и наш специалист свяжется с вами в течение рабочего дня."
        source="services-final"
        buttons={[
          { label: "Обсудить проект", ctaSource: "services-final-project" },
          { label: "Получить консультацию", ctaSource: "services-final-consult" },
          { label: "Связаться с командой", ctaSource: "services-final-team" },
        ]}
      />

      <SiteFooter />
    </div>
  );
}
