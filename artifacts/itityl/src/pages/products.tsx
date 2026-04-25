import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { fadeUp } from "@/lib/motion";
import { useSeo } from "@/lib/useSeo";
import { SiteNav } from "@/components/landing/SiteNav";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { PageHero } from "@/components/landing/PageHero";
import { SectionHeader } from "@/components/landing/SectionHeader";
import { NumberedCard } from "@/components/landing/NumberedCard";
import { PillRow } from "@/components/landing/PillRow";
import { FAQAccordion } from "@/components/landing/FAQAccordion";
import { CTASection } from "@/components/landing/CTASection";
import { NavList } from "@/components/landing/NavList";
import { Breadcrumbs } from "@/components/landing/Breadcrumbs";
import { MarqueeRow } from "@/components/MarqueeRow";
import { useContactModal } from "@/lib/contact-modal";
import { BreadcrumbSchema } from "@/components/StructuredData";

const products = [
  {
    title: "ИИ-агенты для бизнеса",
    desc: "Решение для автоматизации отдельных функций, внутренних сервисных сценариев, маршрутов обработки информации и типовых задач сотрудников. Подходит там, где важно сократить ручную нагрузку и ускорить выполнение повторяющихся операций.",
    cta: "Подробнее об ИИ-агентах",
    to: "/products/ai-agents",
  },
  {
    title: "Интеллектуальная канцелярия",
    desc: "Решение для автоматического распределения входящих писем и документов, ускорения канцелярских операций и снижения объема ручной обработки в документном контуре организации.",
    cta: "Подробнее об интеллектуальной канцелярии",
    to: "/products/smart-office",
  },
  {
    title: "Аналитик документов",
    desc: "Решение для проверки комплектности, непротиворечивости и корректности документации, а также для более эффективной работы со сложным массивом документов и регламентных материалов.",
    cta: "Подробнее об аналитике документов",
    to: "/products/document-analyst",
  },
  {
    title: "RAG по внутренним документам",
    desc: "Решение для поиска и ответов по внутренним документам на естественном языке. Помогает быстрее находить нужную информацию, работать с корпоративными знаниями и сокращать время на поиск по внутренним материалам.",
    cta: "Подробнее о RAG",
    to: "/products/rag",
  },
];

const tasks = [
  { t: "Снижение ручной нагрузки", d: "Помогают сократить объем повторяющихся действий и перераспределить время сотрудников на более значимые задачи." },
  { t: "Ускорение работы с документами", d: "Повышают скорость обработки входящих материалов, внутренней документации и типовых маршрутов согласования." },
  { t: "Доступ к знаниям организации", d: "Упрощают поиск информации в регламентах, инструкциях, базах знаний и внутренних документах." },
  { t: "Поддержка сервисных и операционных функций", d: "Помогают подразделениям быстрее работать с типовыми запросами, данными и внутренними сценариями." },
  { t: "Повышение качества обработки информации", d: "Снижают риск пропусков, улучшают полноту проверки и делают работу с документным контуром более управляемой." },
];

const audience = [
  { t: "Крупные организации", d: "Для компаний со сложной структурой процессов, большим объемом внутренних данных и развитым документным контуром." },
  { t: "B2G и государственный сектор", d: "Для организаций, где особенно важны регламенты, надежность обработки и аккуратная работа с внутренними материалами." },
  { t: "Функциональные подразделения", d: "Для блоков, где критичны скорость работы с информацией, качество обработки документов и доступ к знаниям." },
  { t: "Организации в цифровой трансформации", d: "Для заказчиков, которым нужны не абстрактные идеи, а конкретные прикладные решения для рабочих задач." },
];

const faq = [
  { q: "Это готовые решения или они адаптируются под среду заказчика?", a: "На обзорной странице мы показываем продуктовые направления в целом. Формат адаптации и глубина доработки зависят от конкретного решения и условий применения." },
  { q: "Чем продукт отличается от услуги?", a: "Продукт — это отдельное прикладное решение или направление. Услуга — это формат проектной работы: обследование, проектирование, разработка, интеграция и сопровождение." },
  { q: "Подходят ли такие решения для сложной корпоративной инфраструктуры?", a: "Да, именно поэтому мы рассматриваем продукты в контексте реальной рабочей среды, процессов, документов и требований безопасности." },
  { q: "С чего начать выбор продукта?", a: "С определения задачи: что именно нужно улучшить — работу с документами, доступ к знаниям, внутренние сервисные сценарии или повторяющиеся операции." },
  { q: "Если задача не укладывается в один продукт, что делать?", a: "В таких случаях имеет смысл рассмотреть сервисный формат и обсудить задачу через раздел услуг." },
];

const marquee = ["документы", "знания", "процессы", "канцелярия", "RAG", "агенты", "автоматизация"];

export default function Products() {
  useSeo({
    title:
      "Продукты Ай-Титул — ИИ-агенты, RAG, Smart-Office, аналитик документов",
    description:
      "Продуктовая линейка Ай-Титул: ИИ-агенты, интеллектуальная канцелярия, аналитик документов, RAG по внутренним материалам для корпоративной среды и B2G.",
    path: "/products",
  });

  const { open: openModal } = useContactModal();
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-amber-400 selection:text-black overflow-x-hidden">
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/" },
          { name: "Продукты", url: "/products" },
        ]}
      />
      <SiteNav />
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Продукты" }]} />
      <PageHero
        index="01"
        eyebrow="Продукты"
        title="Прикладные ИИ-решения для документов, знаний и корпоративных процессов"
        subtitle="Мы развиваем продуктовые направления для организаций, которым нужны понятные инструменты для работы с документами, внутренними знаниями, рутинными операциями и сервисными сценариями."
        hasBreadcrumbs
        ctas={[
          { label: "Посмотреть продукты", href: "#products" },
          { label: "Выбрать решение", href: "#choose" },
          { label: "Обсудить задачу", ctaSource: "products-hero-discuss" },
        ]}
      />

      <section className="py-24 md:py-32 px-6 md:px-10 border-b border-white/10">
        <SectionHeader
          index="02"
          label="Направления"
          title="Прикладные продуктовые направления компании"
          body="Мы работаем не только как консультант и разработчик ИИ-решений под заказ, но и как компания, развивающая собственные прикладные продуктовые направления. Они сформированы вокруг типовых корпоративных задач, где особенно важны скорость обработки информации, качество работы с документами, доступ к внутренним знаниям и снижение ручной нагрузки."
        />
      </section>

      <section className="py-10 border-y border-white/10">
        <MarqueeRow items={marquee} />
      </section>

      <section id="products" className="py-24 md:py-32 px-6 md:px-10 border-b border-white/10">
        <SectionHeader
          index="03"
          label="Линейка"
          title="Продукты и решения"
          body="В продуктовой линейке Ай-Титул собраны решения для задач, которые регулярно возникают в корпоративной среде: обработка документов, доступ к знаниям, автоматизация рутинных операций и поддержка внутренних процессов. Каждый продукт ориентирован на практическое применение и понятный эффект в рабочем контуре организации."
        />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          className="max-w-[1600px] mx-auto mt-14 grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10"
        >
          {products.map((p, i) => (
            <NumberedCard key={p.title} index={i + 1} title={p.title} desc={p.desc} cta={p.cta} to={p.to} />
          ))}
        </motion.div>
        <div className="max-w-[1600px] mx-auto mt-12">
          <button
            type="button"
            onClick={() => openModal("products-grid-consultation")}
            data-cursor="link"
            data-analytics="cta:products-grid-consultation"
            className="group flex items-center justify-between gap-6 w-full bg-amber-400 text-black px-6 md:px-12 py-7 md:py-8 hover:bg-amber-300 transition-colors text-left"
          >
            <span className="text-lg md:text-2xl lg:text-3xl font-heading font-extrabold uppercase tracking-tight">
              Заказать консультацию специалиста
            </span>
            <ArrowUpRight className="w-7 h-7 md:w-8 md:h-8 shrink-0 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      </section>

      <section className="py-24 md:py-32 px-6 md:px-10 border-b border-white/10">
        <SectionHeader
          index="04"
          label="Задачи"
          title="Какие задачи решают продукты Ай-Титул"
          body="Наши продуктовые направления ориентированы на те задачи, которые регулярно возникают в корпоративной среде и требуют более эффективной работы с информацией, документами и внутренними знаниями."
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
            Каждое решение ориентировано на повседневное применение в корпоративной среде и учитывает реальные процессы, инфраструктуру и правила работы с информацией.
          </p>
        </div>
      </section>

      <section className="py-24 md:py-32 px-6 md:px-10 border-b border-white/10">
        <SectionHeader
          index="05"
          label="Аудитория"
          title="Кому особенно актуальны наши решения"
          body="Продукты Ай-Титул особенно актуальны для организаций, где много документов, регламентов, внутренних знаний, повторяющихся операций и требований к устойчивости процессов. В первую очередь это крупные компании, государственные и подведомственные структуры, а также подразделения с высокой нагрузкой на обработку информации."
        />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          className="max-w-[1600px] mx-auto mt-14 grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10"
        >
          {audience.map((a, i) => (
            <NumberedCard key={a.t} index={i + 1} title={a.t} desc={a.d} />
          ))}
        </motion.div>
      </section>

      <section className="py-24 md:py-32 px-6 md:px-10 border-b border-white/10">
        <SectionHeader
          index="06"
          label="Принципы"
          title="Почему продуктовые решения Ай-Титул работают в реальной среде"
          body={[
            "Наша продуктовая линейка опирается на практику работы с корпоративными задачами. Мы хорошо понимаем, где организации сталкиваются с перегруженным документным контуром, где сотрудники теряют время на поиск информации, а где ручные операции мешают скорости и качеству процессов.",
            "Продукты формируются на основе этой прикладной логики, с учетом того, как решения будут использоваться в действующей среде.",
          ]}
        />
        <div className="max-w-[1600px] mx-auto mt-14">
          <PillRow
            items={[
              "прикладной фокус",
              "ориентация на корпоративную среду",
              "сильная экспертиза в документах и знаниях",
              "возможность связать продуктовый и проектный формат работы",
            ]}
          />
        </div>
      </section>

      <section className="py-24 md:py-32 px-6 md:px-10 border-b border-white/10">
        <SectionHeader
          index="07"
          label="Услуги"
          title="Когда нужен не только продукт, но и проектная работа"
          body="Часть задач может решаться не только через продуктовые направления, но и через отдельный сервисный формат. Мы вынесли услуги в самостоятельный раздел, чтобы упростить навигацию и разделить готовые решения и проектную работу. Если вашей организации требуется обследование процессов, выбор сценариев, пилотирование, кастомная разработка или интеграция в сложный контур, ознакомиться с этими услугами вы можете в соответствующем разделе."
        />
        <div className="max-w-[1600px] mx-auto mt-12">
          <Link
            href="/services"
            data-cursor="link"
            className="inline-flex items-center gap-2 border border-white/25 text-white/85 hover:border-amber-300 hover:text-amber-300 px-6 py-3.5 text-xs font-extrabold uppercase tracking-widest transition-colors"
          >
            Перейти к услугам <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      <section id="choose" className="py-24 md:py-32 px-6 md:px-10 border-b border-white/10">
        <SectionHeader
          index="08"
          label="Навигатор"
          title="Выберите интересующее направление"
          body="Если у вас уже есть понимание задачи, перейдите сразу к нужному продукту."
        />
        <div className="max-w-[1600px] mx-auto mt-14">
          <NavList items={products.map((p) => ({ label: p.title, to: p.to }))} />
        </div>
      </section>

      <section className="py-24 md:py-32 px-6 md:px-10 border-b border-white/10">
        <SectionHeader
          index="09"
          label="FAQ"
          title="Частые вопросы о продуктах"
          align="left"
        />
        <div className="max-w-[1600px] mx-auto mt-12">
          <FAQAccordion items={faq} />
        </div>
      </section>

      <CTASection
        index="10"
        title="Поможем выбрать подходящее решение"
        body="Если вы хотите понять, какой продукт лучше подходит под ваши процессы, документы, внутренние знания или сервисные сценарии, начнем с предметного разговора о задаче и текущей среде."
        source="products-final"
        buttons={[
          { label: "Заказать консультацию", ctaSource: "products-final-consult" },
          { label: "Обсудить проект", ctaSource: "products-final-project" },
          { label: "Связаться с командой", ctaSource: "products-final-team" },
        ]}
      />

      <SiteFooter />
    </div>
  );
}
