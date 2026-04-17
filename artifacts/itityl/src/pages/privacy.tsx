import { useEffect } from "react";
import { Link } from "wouter";
import { m as motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Magnetic } from "@/components/Magnetic";
import { easeOutExpo } from "@/lib/motion";

const sections = [
  {
    num: "01",
    title: "Оператор персональных данных",
    body: [
      "Оператор: ООО «АЙ-ТИТУЛ»",
      "ИНН / КПП: 9725182971 / 772501001",
      "ОГРН: 1257700145504",
      "Адрес: 115432, г. Москва, пр-кт Андропова, д. 18, к. 1, помещ. 8/8",
      "E-mail для обращений по ПДн: pochta@i-tityl.ru",
      "Телефон: +7 (993) 338-43-13",
    ],
  },
  {
    num: "02",
    title: "Термины",
    body: [
      "Персональные данные (ПДн) — любая информация, относящаяся к прямо или косвенно определяемому физическому лицу.",
      "Обработка ПДн — любое действие или совокупность действий с ПДн, включая сбор, запись, систематизацию, накопление, хранение, уточнение, использование, передачу, обезличивание, блокирование, удаление, уничтожение.",
      "Пользователь — лицо, посетившее Сайт и/или оставившее заявку или сообщение.",
    ],
  },
  {
    num: "03",
    title: "Какие данные мы обрабатываем",
    body: [
      "3.1. Данные, которые вы предоставляете сами (через формы/обратную связь):",
      "— имя (ФИО или представление);",
      "— номер телефона;",
      "— адрес электронной почты;",
      "— компания или должность, если указаны;",
      "— текст сообщения/заявки и иные сведения, которые вы добровольно укажете.",
      "3.2. Технические данные (при посещении Сайта):",
      "— IP-адрес, сведения о браузере и устройстве, данные об обращениях к страницам, дата и время доступа;",
      "— файлы cookie и аналогичные идентификаторы.",
      "Оператор не обрабатывает специальные категории ПДн (о здоровье, религии и т. п.) и биометрические данные, если иное не согласовано отдельно и не требуется по закону.",
    ],
  },
  {
    num: "04",
    title: "Цели обработки персональных данных",
    body: [
      "— обработка входящих обращений и заявок, обратная связь;",
      "— подготовка коммерческого предложения, уточнение требований, заключение и исполнение договоров;",
      "— направление сервисных сообщений по заявке или проекту;",
      "— улучшение качества работы Сайта, статистика и аналитика посещений;",
      "— соблюдение требований законодательства РФ.",
    ],
  },
  {
    num: "05",
    title: "Правовые основания обработки",
    body: [
      "— ваше согласие (например, при отправке формы);",
      "— необходимость заключения или исполнения договора либо принятия мер по вашему запросу до заключения договора;",
      "— требования законодательства РФ.",
      "Вы можете отозвать согласие в любой момент (см. раздел 10).",
    ],
  },
  {
    num: "06",
    title: "Условия обработки и передача третьим лицам",
    body: [
      "6.1. Оператор обрабатывает ПДн с соблюдением принципов законности, минимизации и целевого использования данных.",
      "6.2. Доступ к ПДн предоставляется только уполномоченным сотрудникам Оператора и/или подрядчикам, которым поручена обработка ПДн по договору (хостинг, сервис форм/CRM, почтовые сервисы) — в объёме, необходимом для достижения целей обработки.",
      "6.3. Оператор может передать ПДн третьим лицам:",
      "— по вашему поручению или запросу;",
      "— при исполнении договора;",
      "— по требованию уполномоченных госорганов в случаях, предусмотренных законом.",
    ],
  },
  {
    num: "07",
    title: "Хранение и сроки обработки",
    body: [
      "7.1. ПДн обрабатываются и хранятся не дольше, чем это необходимо для достижения целей обработки, либо до отзыва согласия, если более длительный срок не требуется законодательством РФ.",
      "7.2. По достижении целей обработки либо при отзыве согласия (если нет иных законных оснований продолжать обработку) ПДн подлежат удалению или обезличиванию.",
    ],
  },
  {
    num: "08",
    title: "Локализация и трансграничная передача",
    body: [
      "8.1. Оператор обеспечивает обработку ПДн в соответствии с требованиями законодательства РФ о персональных данных.",
      "8.2. Трансграничная передача ПДн допускается только при наличии правовых оснований и с соблюдением требований законодательства РФ.",
    ],
  },
  {
    num: "09",
    title: "Меры защиты персональных данных",
    body: [
      "Оператор принимает необходимые организационные и технические меры для защиты ПДн, включая:",
      "— ограничение доступа к ПДн (разграничение прав);",
      "— применение средств защиты информации (при необходимости);",
      "— контроль и аудит доступа;",
      "— резервное копирование (при необходимости);",
      "— обучение сотрудников и внутренние регламенты обработки.",
    ],
  },
  {
    num: "10",
    title: "Права субъекта персональных данных",
    body: [
      "Вы вправе:",
      "— получать сведения об обработке ваших ПДн;",
      "— требовать уточнения, блокирования или уничтожения ПДн при наличии оснований;",
      "— отзывать согласие на обработку ПДн;",
      "— обжаловать действия или бездействие Оператора в уполномоченный орган или суд.",
      "Как обратиться: отправьте запрос на pochta@i-tityl.ru с темой «Персональные данные». В запросе укажите ФИО (или как вы представлялись), контакты для ответа и суть обращения.",
    ],
  },
  {
    num: "11",
    title: "Cookie и настройки браузера",
    body: [
      "Сайт может использовать cookie и аналогичные технологии для корректной работы, улучшения пользовательского опыта и аналитики. Вы можете ограничить использование cookie в настройках браузера. При отключении cookie отдельные функции Сайта могут работать некорректно.",
    ],
  },
  {
    num: "12",
    title: "Заключительные положения",
    body: [
      "12.1. Политика может обновляться. Актуальная версия всегда размещается на Сайте.",
      "12.2. Продолжая пользоваться Сайтом и/или отправляя заявку, вы подтверждаете ознакомление с настоящей Политикой.",
    ],
  },
];

export default function Privacy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 border-b border-white/10 bg-black/70 backdrop-blur-md">
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

        <Magnetic strength={0.35}>
          <Link
            href="/"
            data-cursor="link"
            className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.25em] text-white/70 hover:text-amber-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            На главную
          </Link>
        </Magnetic>
      </nav>

      {/* HEADER */}
      <section className="pt-40 md:pt-48 pb-16 px-6 md:px-10 border-b border-white/10">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeOutExpo }}
            className="mb-8 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-amber-300/90 font-bold"
          >
            <span className="w-8 h-px bg-amber-300/70" />
            Правовая информация
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: easeOutExpo, delay: 0.05 }}
            className="font-heading font-extrabold uppercase tracking-tighter leading-[0.92] text-[clamp(40px,6.5vw,104px)]"
          >
            Политика
            <br />
            <span className="text-amber-300">конфиденциальности</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeOutExpo, delay: 0.15 }}
            className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs uppercase tracking-[0.25em] text-white/50 font-bold"
          >
            <div>
              <div className="text-white/30 mb-1">Дата публикации</div>
              <div className="text-white">13 января 2026</div>
            </div>
            <div>
              <div className="text-white/30 mb-1">Действует</div>
              <div className="text-white">до замены новой редакцией</div>
            </div>
            <div>
              <div className="text-white/30 mb-1">Оператор</div>
              <div className="text-white">ООО «АЙ-ТИТУЛ»</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* INTRO */}
      <section className="py-20 px-6 md:px-10 border-b border-white/10">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-3">
            <div className="text-[10px] uppercase tracking-[0.3em] text-amber-300 font-bold sticky top-28">
              <span className="inline-block w-6 h-px bg-amber-300 mr-2 align-middle" />
              Общее
            </div>
          </div>
          <div className="lg:col-span-9 text-lg md:text-xl leading-relaxed text-white/80 font-light space-y-6 max-w-3xl">
            <p>
              Настоящая Политика определяет порядок и условия обработки
              персональных данных пользователей сайта{" "}
              <span className="text-amber-300">itityl.ru</span> (далее — Сайт)
              оператором персональных данных — ООО «АЙ-ТИТУЛ».
            </p>
            <p>
              Оператор обязан обеспечить неограниченный доступ к документу,
              определяющему политику в отношении обработки персональных
              данных.
            </p>
          </div>
        </div>
      </section>

      {/* SECTIONS */}
      <section className="px-6 md:px-10">
        <div className="max-w-[1400px] mx-auto divide-y divide-white/10 border-b border-white/10">
          {sections.map((s, i) => (
            <motion.article
              key={s.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: easeOutExpo, delay: i * 0.03 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 py-14"
            >
              <div className="lg:col-span-3 flex items-start gap-4">
                <span className="font-heading font-extrabold text-amber-300 text-2xl leading-none tabular-nums">
                  {s.num}
                </span>
                <h2 className="font-heading font-extrabold uppercase tracking-tight text-xl md:text-2xl leading-[1.05]">
                  {s.title}
                </h2>
              </div>
              <div className="lg:col-span-9 space-y-4 text-base md:text-[17px] leading-relaxed text-white/75 font-light max-w-3xl">
                {s.body.map((p, pi) => (
                  <p key={pi}>{p}</p>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 px-6 md:px-10">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <div className="text-[11px] uppercase tracking-[0.3em] text-amber-300 font-bold mb-6">
              Контакты оператора
            </div>
            <h3 className="font-heading font-extrabold uppercase tracking-tight text-[clamp(32px,5vw,72px)] leading-[0.95] mb-8">
              Есть вопрос по персональным данным?
            </h3>
            <p className="text-white/60 text-lg max-w-xl font-light leading-relaxed">
              Напишите на{" "}
              <a
                href="mailto:pochta@i-tityl.ru"
                data-cursor="link"
                className="text-amber-300 hover:text-amber-200 underline decoration-amber-300/40 underline-offset-4"
              >
                pochta@i-tityl.ru
              </a>{" "}
              с темой «Персональные данные» и укажите ФИО, контакты для
              ответа и суть обращения.
            </p>
          </div>
          <div className="lg:col-span-4 flex lg:justify-end">
            <Magnetic strength={0.4}>
              <Link
                href="/"
                data-cursor="link"
                className="inline-flex items-center gap-3 bg-amber-400 text-black px-7 py-4 text-xs font-extrabold uppercase tracking-widest hover:bg-amber-300 transition-colors"
              >
                Вернуться на сайт <ArrowUpRight className="w-4 h-4" />
              </Link>
            </Magnetic>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-6 md:px-10 bg-black text-white border-t border-white/15">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">
          <p>&copy; {new Date().getFullYear()} АЙ-ТИТУЛ. Все права защищены.</p>
          <div className="flex items-center gap-8">
            <Link href="/privacy" data-cursor="link" className="text-amber-300">
              Конфиденциальность
            </Link>
            <a href="/" data-cursor="link" className="hover:text-amber-300 transition-colors">
              На главную
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
