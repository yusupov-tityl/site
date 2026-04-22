import { motion } from "framer-motion";
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
import { MarqueeRow } from "@/components/MarqueeRow";
import { ArrowUpRight } from "lucide-react";

const directions = [
  { t: "LLM и работа с текстом", d: "Большие языковые модели для анализа документов, классификации, маршрутизации, поиска по знаниям, подготовки ответов и поддержки внутренних сервисных сценариев." },
  { t: "RAG и поиск по внутренним материалам", d: "Подходы для точного поиска и ответов по корпоративным документам, регламентам, базам знаний и архивам." },
  { t: "Document AI и обработка документов", d: "Извлечение, проверка, структурирование и анализ информации в документном контуре организации." },
  { t: "Машинное зрение и компьютерное зрение", d: "Технологии анализа изображений и видео для контроля, распознавания, детекции объектов и событий." },
  { t: "Видеоаналитика с ИИ", d: "Подходы для мониторинга визуальных потоков, выявления событий и поддержки решений в процессах, где важны скорость и точность реакции." },
  { t: "Прикладное ML и работа с данными", d: "Модели и алгоритмы для классификации, оценки, прогнозирования и поддержки решений на основе корпоративных данных." },
];

const effects = [
  { t: "Документы и внутренняя переписка", d: "Анализ, классификация, проверка, поиск и маршрутизация материалов в процессах с высокой документной нагрузкой." },
  { t: "Корпоративные знания", d: "Быстрый доступ к регламентам, инструкциям, архивам и внутренней экспертизе без долгого ручного поиска." },
  { t: "Визуальный контроль и видеоаналитика", d: "Работа с изображениями и видеопотоками в сценариях, где критичны скорость фиксации событий и качество визуального анализа." },
  { t: "Рутинные сервисные операции", d: "Снижение ручной нагрузки в типовых внутренних сценариях, где сотрудники регулярно работают с повторяющимися действиями и запросами." },
  { t: "Поддержка управленческих и операционных решений", d: "Подготовка структурированной информации для специалистов и руководителей на основе документов, данных и визуальных сигналов." },
];

const stack = [
  "Python", "PyTorch", "TensorFlow", "Hugging Face", "LangChain", "LlamaIndex",
  "OpenSearch", "PostgreSQL", "pgvector", "FAISS", "Qdrant", "Triton",
  "ONNX", "OpenCV", "YOLO", "FastAPI", "Kubernetes", "Docker",
];

const faq = [
  { q: "Что такое компьютерное зрение в прикладном смысле?", a: "Это работа системы с изображениями и видео, когда из визуального потока нужно выделить объекты, события, признаки или отклонения, полезные для процесса." },
  { q: "Когда стоит рассматривать машинное зрение?", a: "Когда задача связана с визуальным контролем, анализом изображений, проверкой состояния, обнаружением объектов или событий в производственном, инфраструктурном или ином операционном контуре." },
  { q: "Когда уместны российские LLM?", a: "Когда для проекта важны требования к контуру размещения, локальной инфраструктуре, правилам работы с данными и технологической независимости." },
  { q: "Чем отличается LLM от RAG-подхода?", a: "LLM отвечает за обработку и генерацию текста, а RAG помогает подтягивать релевантные фрагменты из внутренних источников и использовать их в ответах или аналитике." },
  { q: "С чего начинать выбор технологии?", a: "С задачи, данных и среды применения. В корпоративных проектах правильная последовательность обычно такая: понять процесс, оценить ограничения, выбрать технологический подход и только потом переходить к пилоту или разработке." },
];

export default function Technologies() {
  useSeo(
    "Технологии Ай-Титул — LLM, RAG, Document AI, машинное зрение, видеоаналитика",
    "Прикладные ИИ-технологии для корпоративных задач: большие языковые модели, поиск по документам, компьютерное зрение, видеоаналитика и прикладной ML.",
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-amber-400 selection:text-black overflow-x-hidden">
      <SiteNav />
      <PageHero
        index="02"
        eyebrow="Технологии"
        title="Технологии и прикладная экспертиза Ай-Титул"
        subtitle="Мы применяем прикладные ИИ-технологии для задач, где важны документы, данные, изображения, видео, внутренние знания и скорость обработки информации. Мы подбираем технологический подход под конкретную задачу, качество исходных данных, требования к среде и логику дальнейшего внедрения."
        ctas={[
          { label: "Обсудить задачу", href: "#contact" },
          { label: "Получить консультацию", href: "#contact" },
          { label: "Выбрать решение", href: "#stack" },
        ]}
      />

      <section className="py-24 md:py-32 px-6 md:px-10 border-b border-white/10">
        <SectionHeader
          index="02"
          label="Подход"
          title="Технологическая экспертиза, связанная с реальными задачами"
          body={[
            "Технологии для корпоративной среды оцениваются по простому критерию: насколько они помогают работать с реальными процессами, документами, данными и внутренними ограничениями. По этой причине мы рассматриваем не только качество модели или алгоритма, но и условия применения — доступность данных, требования безопасности, состав ИТ-ландшафта, масштаб задачи и способ встраивания решения в действующую среду.",
            "Ай-Титул работает с несколькими прикладными направлениями: большими языковыми моделями, поиском и ответами по внутренним документам, обработкой документного контура, машинным зрением, видеоаналитикой и прикладным ML. Такой набор покрывает значимую часть корпоративных сценариев, где нужен измеримый результат, а не демонстрационный эффект.",
          ]}
        />
      </section>

      <section className="py-24 md:py-32 px-6 md:px-10 border-b border-white/10">
        <SectionHeader
          index="03"
          label="Направления"
          title="Ключевые технологические направления"
        />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          className="max-w-[1600px] mx-auto mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10"
        >
          {directions.map((d, i) => (
            <NumberedCard key={d.t} index={i + 1} title={d.t} desc={d.d} />
          ))}
        </motion.div>
      </section>

      <section className="py-24 md:py-32 px-6 md:px-10 border-b border-white/10">
        <SectionHeader
          index="04"
          label="LLM"
          title="LLM-решения для корпоративных задач"
          body="LLM особенно полезны в задачах, где организация работает с большим объемом документов, текстов, регламентов и внутренних знаний. Такие модели помогают ускорять поиск информации, классификацию материалов, подготовку ответов и другие текстовые сценарии, если они корректно встроены в источники данных, правила доступа и рабочие процессы."
        />
        <div className="max-w-[1600px] mx-auto mt-14 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <h3 className="text-2xl md:text-3xl font-heading font-extrabold uppercase tracking-tight mb-5">
              Российские LLM в корпоративной среде
            </h3>
            <p className="text-base md:text-lg text-white/65 leading-relaxed">
              В ряде проектов значимы требования к контуру размещения, импортонезависимости, локальной инфраструктуре и правилам работы с данными. В таких случаях мы рассматриваем российские LLM наряду с другими вариантами и выбираем подход, который соответствует задаче, ограничениям среды и ожидаемому уровню качества.
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-col gap-8">
            <PillRow
              items={[
                "анализ и обработка документных потоков",
                "поиск по внутренним знаниям",
                "поддержка сотрудников в сервисных сценариях",
                "классификация и маршрутизация текстовой информации",
                "подготовка ответов и обобщений по внутренним материалам",
              ]}
            />
            <a
              href="#contact"
              data-cursor="link"
              className="self-start inline-flex items-center gap-2 bg-amber-400 text-black px-6 py-3.5 text-xs font-extrabold uppercase tracking-widest hover:bg-amber-300 transition-colors"
            >
              Заказать консультацию специалиста <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      <section className="py-10 border-y border-white/10">
        <MarqueeRow items={["LLM", "RAG", "Document AI", "CV", "видеоаналитика", "ML"]} />
      </section>

      <section className="py-24 md:py-32 px-6 md:px-10 border-b border-white/10">
        <SectionHeader
          index="05"
          label="CV / Видеоаналитика"
          title="Компьютерное зрение, машинное зрение и видеоаналитика"
          body="Компьютерное и машинное зрение применяются в задачах, где нужен анализ изображений и видео: распознавание объектов, выявление событий, визуальный контроль и детекция отклонений. В корпоративной и производственной среде такие технологии используются для машинного контроля, видеоаналитики и других сценариев, где важно быстро получать информацию из визуального потока."
        />
        <div className="max-w-[1600px] mx-auto mt-14 grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10">
          {[
            { t: "Машинное зрение и промышленная среда", d: "Машинное зрение применяется на производстве и в смежных контурах для контроля, выявления дефектов, проверки комплектности и отслеживания объектов. В отдельных сценариях такие подходы используются и в робототехнических системах, где важно распознавать объекты, события и отклонения." },
            { t: "Видеоаналитика с ИИ", d: "Видеоаналитика с ИИ полезна там, где организация работает с постоянным визуальным потоком и нуждается в более быстрой реакции на события. В зависимости от задачи это может быть мониторинг обстановки, контроль операций, фиксация событий, распознавание объектов и поддержка процессов, завязанных на визуальные данные." },
          ].map((b, i) => (
            <motion.div
              key={b.t}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
              className="bg-[#141414] p-10 md:p-12"
            >
              <span className="text-[11px] text-amber-300 font-bold tracking-[0.3em]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-5 text-2xl md:text-3xl font-heading font-extrabold uppercase tracking-tight mb-5">
                {b.t}
              </h3>
              <p className="text-base text-white/65 leading-relaxed">{b.d}</p>
            </motion.div>
          ))}
        </div>
        <div className="max-w-[1600px] mx-auto mt-12 flex flex-col gap-8">
          <PillRow
            items={[
              "система машинного зрения для визуального контроля",
              "нейросетевая видеоаналитика для мониторинга событий",
              "машинный контроль в производственных и инфраструктурных контурах",
              "обработка изображений и видеопотоков для выявления отклонений",
              "поддержка сценариев, где важны детекция и классификация визуальных объектов",
            ]}
          />
          <a
            href="#contact"
            data-cursor="link"
            className="self-start inline-flex items-center gap-2 border border-white/25 text-white/85 hover:border-amber-300 hover:text-amber-300 px-6 py-3.5 text-xs font-extrabold uppercase tracking-widest transition-colors"
          >
            Посмотреть кейсы внедрения ИИ <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>

      <section className="py-24 md:py-32 px-6 md:px-10 border-b border-white/10">
        <SectionHeader
          index="06"
          label="RAG / Document AI"
          title="RAG, Document AI и прикладная работа с данными"
          body="Для корпоративной среды особенно важны технологии, связанные с внутренними документами, базами знаний и данными. RAG помогает находить и использовать релевантные фрагменты внутренних материалов, Document AI — разбирать и проверять документы, а прикладное ML — решать задачи классификации, оценки и приоритизации информации."
        />
        <div className="max-w-[1600px] mx-auto mt-14">
          <PillRow
            items={[
              "поиск и ответы по внутренним документам",
              "проверка комплектности и корректности материалов",
              "структурирование неформализованных данных",
              "поддержка процессов принятия решений",
              "работа с корпоративными знаниями и архивами",
            ]}
          />
        </div>
      </section>

      <section className="py-24 md:py-32 px-6 md:px-10 border-b border-white/10">
        <SectionHeader
          index="07"
          label="Эффект"
          title="Где технологии дают практический эффект"
        />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          className="max-w-[1600px] mx-auto mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-px bg-white/10"
        >
          {effects.map((e, i) => (
            <motion.div
              key={e.t}
              variants={fadeUp}
              className="bg-[#141414] p-8 flex flex-col gap-4 group hover:bg-[#1a1a1a] transition-colors"
            >
              <span className="text-[11px] text-amber-300 font-bold tracking-[0.3em]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-lg md:text-xl font-heading font-extrabold uppercase tracking-tight group-hover:text-amber-300 transition-colors">
                {e.t}
              </h3>
              <p className="text-sm text-white/55 leading-relaxed">{e.d}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="py-24 md:py-32 px-6 md:px-10 border-b border-white/10">
        <SectionHeader
          index="08"
          label="Контур"
          title="Почему этот технологический контур подходит для корпоративной среды"
          body={[
            "В корпоративных проектах технология оценивается не по громкости названия, а по тому, насколько она применима в реальном контуре. Поэтому мы смотрим на несколько вещей одновременно: качество исходных данных, тип документов, роль пользователя, ограничения инфраструктуры, требования безопасности, будущую интеграцию и удобство повседневного использования.",
            "Такой подход позволяет выбирать технологию под практическую задачу и строить решения, которые можно развивать дальше — от пилота до полноценной эксплуатации.",
          ]}
        />
        <div className="max-w-[1600px] mx-auto mt-14">
          <PillRow
            items={[
              "работа с документами, знаниями, данными и визуальными потоками в одном контуре",
              "учет корпоративных ограничений и инфраструктуры",
              "связка технологической экспертизы с внедрением",
              "ориентация на прикладной результат",
            ]}
          />
        </div>
      </section>

      <section id="stack" className="py-24 md:py-32 px-6 md:px-10 border-b border-white/10">
        <SectionHeader
          index="09"
          label="Стек"
          title="Наш технологический стек"
          align="left"
        />
        <div className="max-w-[1600px] mx-auto mt-14">
          <PillRow items={stack} />
        </div>
      </section>

      <section className="py-24 md:py-32 px-6 md:px-10 border-b border-white/10">
        <SectionHeader index="10" label="FAQ" title="Частые вопросы" align="left" />
        <div className="max-w-[1600px] mx-auto mt-12">
          <FAQAccordion items={faq} />
        </div>
      </section>

      <CTASection
        index="11"
        title="Обсудим, какие технологии подходят вашей задаче"
        body="Если вам нужно понять, какие подходы лучше подходят для работы с документами, знаниями, визуальными потоками, данными и внутренними системами, начнем с предметного обсуждения вашей задачи и условий применения."
        buttons={[
          { label: "Запросить консультацию" },
          { label: "Обсудить проект" },
          { label: "Связаться с командой" },
        ]}
      />

      <SiteFooter />
    </div>
  );
}
