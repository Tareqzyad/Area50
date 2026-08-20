import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Minus, Plus, ShoppingBag, Sparkles, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const STORE_HERO = "/manus-storage/area50-store-hero_cfa38d93.jpg";
const MARK_IMAGE = "/manus-storage/area50-mark_6c38c50c.png";

type CartItem = { id: number; name: string; price: number; currency: string; imageUrl: string; quantity: number; stock: number };
type StoreCategory = { id: number; slug: string; title: string; detail: string | null; tone: string };
type StoreProduct = { id: number; categoryId: number; name: string; description: string | null; price: number; currency: string; imageUrl: string; isAvailable: number; stock: number };

const formatPrice = (value: number, currency = "IQD") => `${value.toLocaleString("ar-IQ")} ${currency}`;

export default function Store() {
  const categoriesQuery = trpc.store.categories.list.useQuery();
  const productsQuery = trpc.store.products.list.useQuery();
  const [activeCategory, setActiveCategory] = useState<number | "all">("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const categories = (categoriesQuery.data ?? []) as StoreCategory[];
  const products = (productsQuery.data ?? []) as StoreProduct[];
  const visibleProducts = useMemo(() => products.filter(product => product.isAvailable && product.stock > 0 && (activeCategory === "all" || product.categoryId === activeCategory)), [products, activeCategory]);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  function addToCart(product: StoreProduct) {
    if (!product.isAvailable || product.stock <= 0) return toast.error("هذا المنتج غير متوفر حالياً");
    const existing = cart.find(item => item.id === product.id);
    if (existing && existing.quantity >= product.stock) return toast.info("وصلت إلى الحد المتوفر من هذا المنتج");
    setCart(current => {
      const currentItem = current.find(item => item.id === product.id);
      if (currentItem) return current.map(item => item.id === product.id ? { ...item, stock: product.stock, quantity: Math.min(item.quantity + 1, product.stock) } : item);
      return [...current, { id: product.id, name: product.name, price: product.price, currency: product.currency, imageUrl: product.imageUrl, quantity: 1, stock: product.stock }];
    });
    setCartOpen(true);
    toast.success("تمت إضافة المنتج إلى السلة");
  }

  function updateQuantity(id: number, delta: number) {
    setCart(current => current.flatMap(item => {
      if (item.id !== id) return [item];
      const nextQuantity = Math.min(item.quantity + delta, item.stock);
      return nextQuantity <= 0 ? [] : [{ ...item, quantity: nextQuantity }];
    }));
  }

  return (
    <div className="area-page area-page--sub area-page--store" dir="rtl">
      <header className="sub-header">
        <Link href="/" className="sub-header__back"><ArrowRight size={16} /> العودة للبوابة</Link>
        <div className="sub-header__brand"><img src={MARK_IMAGE} alt="Area 50" /><span>AREA STORE</span></div>
        <button className="store-cart-trigger" onClick={() => setCartOpen(open => !open)} aria-label="فتح سلة المشتريات"><ShoppingBag size={17} /><span>السلة</span>{cartCount > 0 && <b>{cartCount}</b>}</button>
      </header>

      <main className="sub-main">
        <section className="sub-hero sub-hero--store">
          <div className="sub-hero__copy">
            <span className="eyebrow"><span>02</span> AREA STORE / CURATED GOODS</span>
            <h1>خذ الـ<br /><em>setup</em><br />وياك.</h1>
            <p>اختيارات Area Store تتغير حسب مزاج اللعب: إكسسوارات، قطع مميزة، ومنتجات تضبط شكل مساحتك بدون زحمة.</p>
            <div className="sub-hero__facts"><span><Sparkles size={15} /> مختارات بعناية</span><span><Check size={15} /> تحديث مستمر</span><a href="#products">استعرض المنتجات <ArrowLeft size={15} /></a></div>
          </div>
          <div className="sub-hero__visual"><img src={STORE_HERO} alt="منتجات Area Store" /><div className="sub-hero__visual-wash" /><div className="sub-hero__stamp">AREA<br /><b>STORE</b></div></div>
        </section>

        <section className="store-catalog" id="products">
          <div className="store-catalog-heading"><div><span className="eyebrow"><span>CATALOG</span> SHOP THE SIGNAL</span><h2>الكتالوج <em>الحالي.</em></h2></div><p>كل قطعة هنا مختارة حتى تضيف شيئاً حقيقياً إلى setup مالك.</p></div>
          {categoriesQuery.error && <div className="store-inline-error">تعذر تحميل التصنيفات. يمكنك إعادة المحاولة من زر الأسفل.</div>}
          <div className="store-category-bar" aria-label="تصنيفات المتجر"><button className={activeCategory === "all" ? "is-active" : ""} onClick={() => setActiveCategory("all")}>الكل <small>{products.filter(product => product.isAvailable && product.stock > 0).length}</small></button>{categories.map(category => <button className={activeCategory === category.id ? "is-active" : ""} key={category.id} onClick={() => setActiveCategory(category.id)}>{category.title}<small>{products.filter(product => product.categoryId === category.id && product.isAvailable && product.stock > 0).length}</small></button>)}</div>
          {productsQuery.isLoading ? <div className="store-empty"><p>جارٍ تجهيز الكتالوج...</p></div> : productsQuery.error ? <div className="store-error"><p>تعذر تحميل الكتالوج حالياً.</p><span>تحقق من الاتصال ثم حاول مرة أخرى.</span><button onClick={() => { void productsQuery.refetch(); void categoriesQuery.refetch(); }}>إعادة المحاولة <ArrowLeft size={15} /></button></div> : visibleProducts.length === 0 ? <div className="store-empty"><p>لا توجد منتجات ظاهرة بهذا التصنيف حالياً.</p><span>جرّب تصنيفاً آخر أو ارجع قريباً.</span></div> : <div className="store-product-grid">{visibleProducts.map((product, index) => <article className="store-product-card" key={product.id} style={{ animationDelay: `${index * 50}ms` }}><div className="store-product-card__image"><img src={product.imageUrl} alt={product.name} /><span>{product.stock <= 3 ? "باقي قليل" : "متوفر"}</span></div><div className="store-product-card__body"><span className="store-product-card__category">{categories.find(category => category.id === product.categoryId)?.title || "Area Pick"}</span><h3>{product.name}</h3><p>{product.description}</p><div className="store-product-card__footer"><strong>{formatPrice(product.price, product.currency)}</strong><button onClick={() => addToCart(product)}><Plus size={16} /> أضف للسلة</button></div></div></article>)}</div>}
        </section>
        <section className="store-note store-note--wide"><ShoppingBag size={17} /><span>للشراء والاستلام، أرسل طلبك من السلة وسنتواصل وياك لتأكيد التفاصيل.</span></section>
      </main>

      {cartOpen && <div className="store-cart-backdrop" onClick={() => setCartOpen(false)} />}
      <aside className={`store-cart-drawer ${cartOpen ? "is-open" : ""}`} aria-label="سلة المشتريات">
        <div className="store-cart-drawer__head"><div><span className="eyebrow"><span>{cartCount}</span> YOUR BAG</span><h2>سلة المشتريات</h2></div><button onClick={() => setCartOpen(false)} aria-label="إغلاق السلة"><ChevronDown size={20} /></button></div>
        {cart.length === 0 ? <div className="store-cart-empty"><ShoppingBag size={30} /><p>السلة فارغة حالياً.</p><span>أضف المنتجات التي تعجبك من الكتالوج.</span></div> : <><div className="store-cart-list">{cart.map(item => <div className="store-cart-item" key={item.id}><img src={item.imageUrl} alt="" /><div><strong>{item.name}</strong><span>{formatPrice(item.price, item.currency)}</span><div className="store-cart-quantity"><button onClick={() => updateQuantity(item.id, -1)}><Minus size={13} /></button><b>{item.quantity}</b><button onClick={() => updateQuantity(item.id, 1)} disabled={item.quantity >= item.stock} title={item.quantity >= item.stock ? "وصلت إلى الحد المتوفر" : "زيادة الكمية"}><Plus size={13} /></button><button className="store-cart-remove" onClick={() => setCart(current => current.filter(entry => entry.id !== item.id))}><Trash2 size={14} /></button></div></div></div>)}</div><div className="store-cart-summary"><span>المجموع التقريبي</span><strong>{formatPrice(cartTotal)}</strong><button onClick={() => toast.info("قريباً: سيتم ربط الطلبات بواتساب أو الدفع الإلكتروني من لوحة الإدارة.")}>إرسال الطلب <ArrowLeft size={16} /></button></div></>}
      </aside>
    </div>
  );
}
