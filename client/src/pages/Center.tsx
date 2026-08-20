// Area 50 design reminder: center page is the heavier portal, using violet atmosphere, hard labels, practical service metadata, and no fabricated testimonials.
import { ArrowRight, Clock3, Gamepad2, MapPin, Phone, Trophy } from "lucide-react";
import { Link } from "wouter";

const CENTER_IMAGE = "/manus-storage/area50-center-hero_de9fad3b.jpg";
const MARK_IMAGE = "/manus-storage/area50-mark_6c38c50c.png";

const services = [
  { index: "01", title: "PC ROOM", detail: "أجهزة جاهزة لجلسة فردية أو منافسة مع الأصدقاء.", icon: Gamepad2 },
  { index: "02", title: "SPECIAL ROOMS", detail: "مساحات خاصة للفرق والجلسات الطويلة.", icon: Trophy },
  { index: "03", title: "STEERING WHEEL", detail: "خذ مكانك خلف المقود وخلي السباق يبدأ.", icon: Clock3 },
];

function CenterHeader() {
  return (
    <header className="sub-header">
      <Link href="/" className="sub-header__back"><ArrowRight size={20} /> العودة للبوابة</Link>
      <Link href="/" className="sub-header__brand"><img src={MARK_IMAGE} alt="" aria-hidden="true" /><span>AREA 50</span></Link>
      <span className="sub-header__label">CENTER / 01</span>
    </header>
  );
}

export default function Center() {
  return (
    <div className="area-page area-page--sub area-page--center" dir="rtl">
      <CenterHeader />
      <main className="sub-main">
        <section className="sub-hero" aria-labelledby="center-title">
          <div className="sub-hero__visual">
            <img src={CENTER_IMAGE} alt="أجواء مركز ألعاب Area 50" />
            <div className="sub-hero__visual-wash" />
            <span className="sub-hero__stamp">OPEN<br /><b>LATE</b></span>
          </div>
          <div className="sub-hero__copy">
            <div className="eyebrow"><span>01</span> Area 50 Gaming Center</div>
            <h1 id="center-title">مو بس<br /><em>تلعب.</em></h1>
            <p>تدخل حتى تعيش الجولة. مساحة للـ PC، الغرف الخاصة، واللحظات التي تصير سالفة بعدين.</p>
            <div className="sub-hero__facts">
              <span><MapPin size={16} /> الموصل · حي المالية</span>
              <span><Clock3 size={16} /> 12 PM — 2 AM</span>
              <a href="tel:07729220544"><Phone size={16} /> 07729220544</a>
            </div>
          </div>
        </section>

        <section className="service-section" aria-labelledby="services-title">
          <div className="section-heading section-heading--compact">
            <div><div className="eyebrow"><span>02</span> داخل السنتر</div><h2 id="services-title">خلي الجلسة<br /><span>على مزاجك.</span></h2></div>
            <p>من أول جولة إلى آخر ريماتش، كل مساحة هنا مصممة حتى تبقى داخل اللعبة.</p>
          </div>
          <div className="service-list">
            {services.map(({ index, title, detail, icon: Icon }) => (
              <article className="service-row" key={index}>
                <span className="service-row__index">{index}</span>
                <Icon className="service-row__icon" size={23} strokeWidth={1.5} />
                <div><h3>{title}</h3><p>{detail}</p></div>
                <span className="service-row__arrow"><ArrowRight size={20} /></span>
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer className="site-footer"><span>AREA 50 / CENTER</span><span>للحجز والاستفسار · 07729220544</span></footer>
    </div>
  );
}
