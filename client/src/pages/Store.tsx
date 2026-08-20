// Area 50 design reminder: store page is the lighter portal, using aqua/cyan signals, product-editorial framing, and honest placeholders until the catalogue is supplied.
import { ArrowRight, Box, Instagram, MapPin, Truck } from "lucide-react";
import { Link } from "wouter";

const STORE_IMAGE = "/manus-storage/area50-store-hero_cfa38d93.jpg";
const MARK_IMAGE = "/manus-storage/area50-mark_6c38c50c.png";

const categories = [
  { index: "01", title: "مجسمات 3D", detail: "قطع تنطبع حسب الطلب وتضيف شخصية لمكانك.", tone: "cyan" },
  { index: "02", title: "إكسسوارات اللاعب", detail: "أشياء صغيرة، فرقها كبير في جوّ اللعب.", tone: "lime" },
  { index: "03", title: "اختيارات Area", detail: "منتجات مختارة من عالم الألعاب والـ setup.", tone: "violet" },
];

function StoreHeader() {
  return (
    <header className="sub-header">
      <Link href="/" className="sub-header__back"><ArrowRight size={20} /> العودة للبوابة</Link>
      <Link href="/" className="sub-header__brand"><img src={MARK_IMAGE} alt="" aria-hidden="true" /><span>AREA STORE</span></Link>
      <span className="sub-header__label">STORE / 02</span>
    </header>
  );
}

export default function Store() {
  return (
    <div className="area-page area-page--sub area-page--store" dir="rtl">
      <StoreHeader />
      <main className="sub-main">
        <section className="sub-hero sub-hero--store" aria-labelledby="store-title">
          <div className="sub-hero__copy">
            <div className="eyebrow"><span>02</span> Area Store</div>
            <h1 id="store-title">قطعة<br /><em>تشبهك.</em></h1>
            <p>متجر للاعبين الكبار والصغار: مجسمات 3D وإكسسوارات تضبط عالمك على ذوقك.</p>
            <div className="sub-hero__facts">
              <span><Box size={16} /> أكثر من 100 منتج</span>
              <span><Truck size={16} /> توصيل لكل المحافظات</span>
              <a href="https://instagram.com/area.store_" target="_blank" rel="noreferrer"><Instagram size={16} /> @area.store_</a>
            </div>
          </div>
          <div className="sub-hero__visual">
            <img src={STORE_IMAGE} alt="منتجات ألعاب وإكسسوارات من Area Store" />
            <div className="sub-hero__visual-wash" />
            <span className="sub-hero__stamp">NEW<br /><b>DROP</b></span>
          </div>
        </section>

        <section className="service-section" aria-labelledby="store-categories-title">
          <div className="section-heading section-heading--compact">
            <div><div className="eyebrow"><span>03</span> استكشف الرفوف</div><h2 id="store-categories-title">اختيارات<br /><span>للجو الخاص بيك.</span></h2></div>
            <p>كل رف هنا يخبّي اكتشافاً جديداً؛ اختَر القطعة التي تكمل جوّك.</p>
          </div>
          <div className="service-list service-list--store">
            {categories.map(({ index, title, detail, tone }) => (
              <article className={`service-row service-row--${tone}`} key={index}>
                <span className="service-row__index">{index}</span>
                <div className="service-row__shape" aria-hidden="true" />
                <div><h3>{title}</h3><p>{detail}</p></div>
                <span className="service-row__arrow"><ArrowRight size={20} /></span>
              </article>
            ))}
          </div>
        </section>
        <div className="store-note"><MapPin size={18} /><span>المتجر يبدأ من هنا، والتفاصيل القادمة تصنع الرف الحقيقي.</span></div>
      </main>
      <footer className="site-footer"><span>AREA STORE / 02</span><span>للطلب والتوصيل · @area.store_</span></footer>
    </div>
  );
}
