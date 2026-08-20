// Area 50 design reminder: portal-first landing page, asymmetrical editorial rhythm, dark graphite field, Area Lime as a signal not a wash.
import { ArrowUpLeft, MapPin, Sparkles, Timer, Instagram } from "lucide-react";
import { Link } from "wouter";

const ASSET_BASE = "https://area50game-jujyunld.manus.space/manus-storage";
const CENTER_IMAGE = `${ASSET_BASE}/area50-center-hero_de9fad3b.jpg`;
const STORE_IMAGE = `${ASSET_BASE}/area50-store-hero_cfa38d93.jpg`;
const MARK_IMAGE = `${ASSET_BASE}/area50-mark_6c38c50c.png`;

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand-mark ${compact ? "brand-mark--compact" : ""}`}>
      <img src={MARK_IMAGE} alt="" aria-hidden="true" />
      <span className="brand-mark__type"><b>AREA</b><b>50</b></span>
    </div>
  );
}

function Header() {
  return (
    <header className="site-header">
      <Link href="/" className="brand-lockup" aria-label="Area 50 الصفحة الرئيسية">
        <BrandMark compact />
        <span className="brand-lockup__caption">Gaming Center<br />&amp; Store</span>
      </Link>
      <nav className="header-nav" aria-label="التنقل الرئيسي">
        <a href="#portals">البوابات</a>
        <a href="#about">عن Area 50</a>
      </nav>
      <div className="header-meta">
        <span className="status-dot" />
        <span>الموصل · العراق</span>
      </div>
    </header>
  );
}

export default function Home() {
  return (
    <div className="area-page area-page--home" dir="rtl">
      <Header />
      <main>
        <section className="home-hero" aria-labelledby="home-title">
          <div className="hero-copy">
            <div className="eyebrow"><span>01</span> AREA 50 CENTER</div>
            <h1 id="home-title">هلا بك في<br /><em>Area 50 Center</em></h1>
            <p className="hero-lead">مكان واحد يجمع جلسة اللعب، لحظة التحدّي، والقطعة التي تكمل عالمك.</p>
            <div className="hero-actions">
              <a className="text-link" href="#portals">اختَر مساحتك <ArrowUpLeft size={18} strokeWidth={1.8} /></a>
              <span className="hero-note">وقت اللعب يبدأ بخطوة<br /><b>اختَر بوابتك</b></span>
            </div>
          </div>
          <div className="hero-side">
            <div className="hero-side__mark"><BrandMark /></div>
            <div className="hero-side__vertical">YOUR FAVORITE AREA <span>↗</span></div>
            <div className="hero-side__index">AREA<br /><strong>50</strong></div>
          </div>
        </section>

        <section id="portals" className="portal-section" aria-labelledby="portals-title">
          <div className="section-heading">
            <div>
              <div className="eyebrow"><span>02</span> اختَر بوابتك</div>
              <h2 id="portals-title">مساحتان.<br /><span>مزاج واحد.</span></h2>
            </div>
            <p>ابدأ من المركز أو مرّ على المتجر. كل طريق مصمم حتى يوصلّك للشيء الذي تبحث عنه بالضبط.</p>
          </div>

          <div className="portal-grid">
            <Link href="/center" className="portal-card portal-card--center">
              <img src={CENTER_IMAGE} alt="إضاءة وأجهزة لعب داخل مركز Area 50" />
              <div className="portal-card__wash" />
              <div className="portal-card__top"><span>01 / CENTER</span><span className="portal-card__arrow"><ArrowUpLeft size={22} /></span></div>
              <div className="portal-card__content">
                <span className="portal-card__tag">OPEN LATE · MOSUL</span>
                <h3>السنتر</h3>
                <p>PC Room · Special Rooms · Steering Wheel</p>
              </div>
            </Link>
            <Link href="/store" className="portal-card portal-card--store">
              <img src={STORE_IMAGE} alt="منتجات وإكسسوارات ألعاب مختارة في Area Store" />
              <div className="portal-card__wash" />
              <div className="portal-card__top"><span>02 / STORE</span><span className="portal-card__arrow"><ArrowUpLeft size={22} /></span></div>
              <div className="portal-card__content">
                <span className="portal-card__tag">NEW DROPS · AREA STORE</span>
                <h3>المتجر</h3>
                <p>مجسمات 3D · إكسسوارات · قطع للاعبين</p>
              </div>
            </Link>
          </div>
        </section>

        <section id="about" className="signal-strip" aria-label="معلومات سريعة">
          <div className="signal-strip__item"><MapPin size={18} /><span>حي المالية، فوق مطعم الحطب</span></div>
          <div className="signal-strip__item"><Timer size={18} /><span>12 PM — 2 AM</span></div>
          <div className="signal-strip__item"><Sparkles size={18} /><span>تجربة تتوسع معك</span></div>
          <a className="signal-strip__social" href="https://instagram.com/area50_iq" target="_blank" rel="noreferrer"><Instagram size={18} /><span>@area50_iq</span></a>
        </section>
      </main>
      <footer className="site-footer">
        <span>AREA 50 © 2026</span>
        <span>YOUR FAVORITE AREA</span>
        <span>خلّ اللعب يقودك</span>
      </footer>
    </div>
  );
}
