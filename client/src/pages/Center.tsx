// Area 50 design reminder: center page is an energetic night-arcade route—bold blocks, game-specific cards, and room booking that only accepts full hours.
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, CarFront, CircleDot, Clock3, Crown, Gamepad2, MapPin, MessageCircle, Monitor, Phone, Sparkles, Table2, Trophy, Users } from "lucide-react";
import { Link } from "wouter";

const CENTER_IMAGE = "/manus-storage/area50-center-hero_de9fad3b.jpg";
const MARK_IMAGE = "/manus-storage/area50-mark_6c38c50c.png";
const WHATSAPP_NUMBER = "9647729220544";

const bookingHours = [
  { value: "12", label: "12:00 PM" },
  { value: "13", label: "1:00 PM" },
  { value: "14", label: "2:00 PM" },
  { value: "15", label: "3:00 PM" },
  { value: "16", label: "4:00 PM" },
  { value: "17", label: "5:00 PM" },
  { value: "18", label: "6:00 PM" },
  { value: "19", label: "7:00 PM" },
  { value: "20", label: "8:00 PM" },
  { value: "21", label: "9:00 PM" },
  { value: "22", label: "10:00 PM" },
  { value: "23", label: "11:00 PM" },
  { value: "24", label: "12:00 AM" },
  { value: "25", label: "1:00 AM" },
  { value: "26", label: "2:00 AM" },
];

const services = [
  { index: "01", title: "PC", label: "PLAY STATION", detail: "أجهزة جاهزة للرانك، الكاجوال، وكل جلسة تريدها بطريقتك.", icon: Monitor, tone: "violet", meta: "SETUP / READY" },
  { index: "02", title: "PS5", label: "CONSOLE ZONE", detail: "ريماتش سريع، لعب جماعي، ومكتبة ألعاب تخلي الوقت يمر أسرع.", icon: Gamepad2, tone: "lime", meta: "CO-OP / 4P" },
  { index: "03", title: "BILLIARD", label: "TABLE ONE", detail: "مباراة هادئة أو تحدّي بين الأصدقاء على طاولة جاهزة.", icon: CircleDot, tone: "aqua", meta: "FOCUS / PLAY" },
  { index: "04", title: "PING PONG", label: "TABLE TWO", detail: "نقطة بنقطة، حركة أسرع، وضحكة تطلع من كل جولة.", icon: Table2, tone: "pink", meta: "FAST / FUN" },
  { index: "05", title: "STEERING WHEEL", label: "RACE DECK", detail: "ثبت الحزام، اختَر مسارك، وخلي السباق يبدأ من أول لفة.", icon: CarFront, tone: "yellow", meta: "RACE / START" },
  { index: "06", title: "SEASONAL TOURNAMENTS", label: "AREA 50 EVENTS", detail: "بطولات موسمية، جدول واضح، ومنافسة تجمع لاعبي المدينة.", icon: Trophy, tone: "violet", meta: "BRACKET / LIVE" },
  { index: "07", title: "VIP ROOM", label: "PRIVATE / VIP", detail: "غرفة خاصة للجلسات الهادئة، الفرق الصغيرة، والمناسبات المميزة.", icon: Crown, tone: "violet", meta: "ROOM / PRIVATE" },
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

type BookingFormProps = {
  room: "VIP Room" | "VVIP Room";
  variant: "vip" | "vvip";
};

function BookingForm({ room, variant }: BookingFormProps) {
  const [booking, setBooking] = useState({ date: "", startTime: "", endTime: "", guests: "" });
  const [error, setError] = useState("");
  const startOptions = bookingHours.slice(0, -1);
  const endOptions = bookingHours.slice(1);

  function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const start = Number(booking.startTime);
    const end = Number(booking.endTime);
    if (!booking.startTime || !booking.endTime || end <= start) {
      setError("اختَر وقت نهاية بعد وقت البداية وبساعة كاملة.");
      return;
    }
    setError("");
    const startLabel = bookingHours.find((option) => option.value === booking.startTime)?.label ?? booking.startTime;
    const endLabel = bookingHours.find((option) => option.value === booking.endTime)?.label ?? booking.endTime;
    const details = [
      `مرحباً Area 50، أريد حجز ${room}.`,
      booking.date ? `التاريخ: ${booking.date}` : "التاريخ: يحدد لاحقاً",
      `الوقت: من ${startLabel} إلى ${endLabel}`,
      booking.guests ? `عدد الأشخاص: ${booking.guests}` : "عدد الأشخاص: يحدد لاحقاً",
    ].join("%0A");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${details}`, "_blank", "noopener,noreferrer");
  }

  return (
    <form className={`vip-booking-form vip-booking-form--${variant}`} onSubmit={submitBooking}>
      <div className="vip-form-heading"><span>{variant === "vip" ? "07 / VIP BOOKING" : "08 / VVIP BOOKING"}</span><strong>احجز غرفتك الخاصة.</strong></div>
      <label>التاريخ<input type="date" required value={booking.date} onChange={(event) => setBooking({ ...booking, date: event.target.value })} /></label>
      <div className="vip-form-row vip-form-row--hours">
        <label>من الساعة<select required value={booking.startTime} onChange={(event) => setBooking({ ...booking, startTime: event.target.value })}><option value="">اختَر</option>{startOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <label>إلى الساعة<select required value={booking.endTime} onChange={(event) => setBooking({ ...booking, endTime: event.target.value })}><option value="">اختَر</option>{endOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
      </div>
      <label>عدد الأشخاص<select required value={booking.guests} onChange={(event) => setBooking({ ...booking, guests: event.target.value })}><option value="">اختَر العدد</option><option value="2">2 أشخاص</option><option value="4">4 أشخاص</option><option value="6">6 أشخاص</option><option value="8+">8+ أشخاص</option></select></label>
      {error && <p className="vip-booking-error" role="alert">{error}</p>}
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
          <div className="center-hero-rework__rail"><span>01</span><i /><span>07</span><small>SPACES<br />TO PLAY</small></div>
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

        <section className="center-vip center-vip--standard" id="vip-room" aria-labelledby="vip-title">
          <div className="center-vip__intro">
            <div className="center-vip__mark"><Crown size={26} /><span>07 / PRIVATE MODE</span></div>
            <span className="center-kicker">PRIVATE ROOM / VIP</span>
            <h2 id="vip-title">VIP<br /><em>Room.</em></h2>
            <p>غرفة خاصة للجلسات الهادئة، الفرق الصغيرة، والمناسبات التي تريدها بخصوصية أكثر.</p>
            <div className="center-vip__notes"><span><Sparkles size={15} /> جلسة خاصة</span><span><Users size={15} /> للفرق الصغيرة</span></div>
          </div>
          <BookingForm room="VIP Room" variant="vip" />
        </section>

        <section className="center-vip center-vvip" id="vvip-room" aria-labelledby="vvip-title">
          <div className="center-vip__intro">
            <div className="center-vip__mark"><Crown size={26} /><span>08 / PRIVATE MODE</span></div>
            <span className="center-kicker">THE LAST ROOM / VVIP</span>
            <h2 id="vvip-title">VVIP<br /><em>Room.</em></h2>
            <p>آخر مستوى من الخصوصية داخل Area 50. غرفة أهدأ، مساحة أوسع، وتجربة تنحجز قبل ما توصل.</p>
            <div className="center-vip__notes"><span><Sparkles size={15} /> أجواء خاصة</span><span><Users size={15} /> للفرق والمناسبات</span></div>
          </div>
          <BookingForm room="VVIP Room" variant="vvip" />
        </section>
      </main>
      <footer className="site-footer center-footer"><span>AREA 50 / CENTER</span><span>للحجز والاستفسار · 07729220544</span></footer>
    </div>
  );
}
