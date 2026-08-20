// Area 50 design reminder: center page is an energetic night-arcade route—bold blocks, game-specific cards, violet competition energy, and a final VIP reservation moment.
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, CarFront, CircleDot, Clock3, Crown, Gamepad2, MapPin, MessageCircle, Monitor, Phone, Sparkles, Table2, Trophy, Users } from "lucide-react";
import { Link } from "wouter";

const CENTER_IMAGE = "/manus-storage/area50-center-hero_de9fad3b.jpg";
const MARK_IMAGE = "/manus-storage/area50-mark_6c38c50c.png";
const WHATSAPP_NUMBER = "9647729220544";

const services = [
  { index: "01", title: "PC", label: "PLAY STATION", detail: "أجهزة جاهزة للرانك، الكاجوال، وكل جلسة تريدها بطريقتك.", icon: Monitor, tone: "violet", meta: "SETUP / READY" },
  { index: "02", title: "PS5", label: "CONSOLE ZONE", detail: "ريماتش سريع، لعب جماعي، ومكتبة ألعاب تخلي الوقت يمر أسرع.", icon: Gamepad2, tone: "lime", meta: "CO-OP / 4P" },
  { index: "03", title: "BILLIARD", label: "TABLE ONE", detail: "مباراة هادئة أو تحدّي بين الأصدقاء على طاولة جاهزة.", icon: CircleDot, tone: "aqua", meta: "FOCUS / PLAY" },
  { index: "04", title: "PING PONG", label: "TABLE TWO", detail: "نقطة بنقطة، حركة أسرع، وضحكة تطلع من كل جولة.", icon: Table2, tone: "pink", meta: "FAST / FUN" },
  { index: "05", title: "STEERING WHEEL", label: "RACE DECK", detail: "ثبت الحزام، اختَر مسارك، وخلي السباق يبدأ من أول لفة.", icon: CarFront, tone: "yellow", meta: "RACE / START" },
  { index: "06", title: "SEASONAL TOURNAMENTS", label: "AREA 50 EVENTS", detail: "بطولات موسمية، جدول واضح، ومنافسة تجمع لاعبي المدينة.", icon: Trophy, tone: "violet", meta: "BRACKET / LIVE" },
];

function CenterHeader() {
  return (
    <header className="sub-header center-header">
      <Link href="/" className="sub-header__back"><ArrowRight size={18} /> العودة للبوابة</Link>
      <Link href="/" className="sub-header__brand"><img src={MARK_IMAGE} alt="" aria-hidden="true" /><span>AREA 50</span></Link>
      <span className="sub-header__label">CENTER / 01</span>
    </header>
  );
}

function BookingForm() {
  const [booking, setBooking] = useState({ date: "", time: "", guests: "" });

  function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const details = [
      "مرحباً Area 50، أريد حجز VIP Room.",
      booking.date ? `التاريخ: ${booking.date}` : "التاريخ: يحدد لاحقاً",
      booking.time ? `الوقت: ${booking.time}` : "الوقت: يحدد لاحقاً",
      booking.guests ? `عدد الأشخاص: ${booking.guests}` : "عدد الأشخاص: يحدد لاحقاً",
    ].join("%0A");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${details}`, "_blank", "noopener,noreferrer");
  }

  return (
    <form className="vip-booking-form" onSubmit={submitBooking}>
      <div className="vip-form-heading"><span>02 / BOOKING</span><strong>خلّ الحجز علينا.</strong></div>
      <label>التاريخ<input type="date" value={booking.date} onChange={(event) => setBooking({ ...booking, date: event.target.value })} /></label>
      <div className="vip-form-row">
        <label>الوقت<input type="time" value={booking.time} onChange={(event) => setBooking({ ...booking, time: event.target.value })} /></label>
        <label>الأشخاص<select value={booking.guests} onChange={(event) => setBooking({ ...booking, guests: event.target.value })}><option value="">اختَر</option><option value="2">2 أشخاص</option><option value="4">4 أشخاص</option><option value="6">6 أشخاص</option><option value="8+">8+ أشخاص</option></select></label>
      </div>
      <button type="submit" className="vip-booking-submit"><MessageCircle size={18} /> أرسل طلب الحجز <ArrowLeft size={18} /></button>
      <a className="vip-call-link" href="tel:07729220544"><Phone size={15} /> أو اتصل مباشرةً: 07729220544</a>
    </form>
  );
}

export default function Center() {
  return (
    <div className="area-page area-page--sub area-page--center center-redesign" dir="rtl">
      <CenterHeader />
      <main className="center-main">
        <section className="center-hero-rework" aria-labelledby="center-title">
          <div className="center-hero-rework__copy">
            <div className="eyebrow"><span>01</span> AREA 50 GAMING CENTER</div>
            <h1 id="center-title">اللعب<br /><em>ينلعب صح.</em></h1>
            <p>مو بس مكان تلعب بيه. هذا مكان تختار بيه مزاجك، تجمع فريقك، وتطلع من الجولة بسالفة جديدة.</p>
            <div className="center-hero-rework__actions"><a href="#center-services" className="center-line-link">اكتشف المساحات <ArrowLeft size={18} /></a><span>الموصل · حي المالية<br /><b>12 PM — 2 AM</b></span></div>
          </div>
          <div className="center-hero-rework__visual">
            <img src={CENTER_IMAGE} alt="أجواء مركز ألعاب Area 50" />
            <div className="center-hero-rework__wash" />
            <span className="center-hero-rework__code">A50<br /><b>PLAY</b></span>
            <span className="center-hero-rework__stamp">OPEN<br /><strong>LATE</strong></span>
            <span className="center-hero-rework__vertical">YOUR NIGHT / YOUR GAME</span>
          </div>
          <div className="center-hero-rework__rail"><span>01</span><i /><span>06</span><small>SPACES<br />TO PLAY</small></div>
        </section>

        <section className="center-signal" aria-label="معلومات السنتر">
          <div><MapPin size={17} /><span>الموصل · حي المالية</span></div>
          <div><Clock3 size={17} /><span>مفتوح يومياً · 12 PM — 2 AM</span></div>
          <div><Users size={17} /><span>جلسات فردية وفرق</span></div>
          <a href="tel:07729220544"><Phone size={17} /><span>07729220544</span></a>
        </section>

        <section className="center-services" id="center-services" aria-labelledby="services-title">
          <div className="center-section-heading">
            <div><span className="center-kicker">02 / CHOOSE YOUR MODE</span><h2 id="services-title">اختَر لعبتك.<br /><em>نضبط الباقي.</em></h2></div>
            <p>من جولة تنافسية إلى جلسة هادئة، كل مساحة في Area 50 إلها طريقتها الخاصة.</p>
          </div>
          <div className="center-services-grid">
            {services.map(({ index, title, label, detail, icon: Icon, tone, meta }) => (
              <article className={`center-service-card center-service-card--${tone}`} key={index}>
                <div className="center-service-card__top"><span>{index}</span><Icon size={24} strokeWidth={1.6} /><b>{meta}</b></div>
                <div className="center-service-card__body"><span>{label}</span><h3>{title}</h3><p>{detail}</p></div>
                <div className="center-service-card__footer"><span>AREA 50 / {index}</span><ArrowLeft size={17} /></div>
              </article>
            ))}
          </div>
        </section>

        <section className="center-vip" id="vip-room" aria-labelledby="vip-title">
          <div className="center-vip__intro">
            <div className="center-vip__mark"><Crown size={26} /><span>07 / PRIVATE MODE</span></div>
            <span className="center-kicker">THE LAST ROOM / VIP</span>
            <h2 id="vip-title">غرفتك.<br /><em>قوانينك.</em></h2>
            <p>لما تريد الجلسة تكون خاصة، VIP Room تنتظرك. مساحة أهدأ، وقتك أنت، وتجربة تنحجز قبل ما توصل.</p>
            <div className="center-vip__notes"><span><Sparkles size={15} /> أجواء خاصة</span><span><Users size={15} /> للفرق والمناسبات</span></div>
          </div>
          <BookingForm />
        </section>
      </main>
      <footer className="site-footer center-footer"><span>AREA 50 / CENTER</span><span>للحجز والاستفسار · 07729220544</span></footer>
    </div>
  );
}
