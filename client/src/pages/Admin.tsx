import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Clock3,
  DoorOpen,
  Eye,
  EyeOff,
  ImagePlus,
  Link2,
  LogOut,
  LockKeyhole,
  PackageOpen,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  ShoppingBag,
  Tags,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const roomLabels = { vip: "VIP Room", vvip: "VVIP Room" } as const;
const statusLabels = { pending: "قيد المراجعة", confirmed: "مؤكد", cancelled: "ملغى" } as const;
const storeOrderStatusLabels = { pending: "جديد", confirmed: "تم التأكيد", completed: "مكتمل", cancelled: "ملغى" } as const;
const toneOptions = [
  { value: "cyan", label: "سماوي" },
  { value: "lime", label: "لايم" },
  { value: "violet", label: "بنفسجي" },
  { value: "amber", label: "ذهبي" },
] as const;

type Category = {
  id: number;
  slug: string;
  title: string;
  detail: string | null;
  tone: string;
  createdAt: Date;
};

type Product = {
  id: number;
  categoryId: number;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  imageUrl: string;
  isAvailable: number;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
};

type StoreOrderStatus = keyof typeof storeOrderStatusLabels;
type StoreOrder = {
  id: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  notes: string | null;
  totalAmount: number;
  currency: string;
  status: StoreOrderStatus;
  createdAt: Date;
  items: Array<{ id: number; productId: number | null; productName: string; price: number; quantity: number }>;
};

function formatBookingDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("ar-IQ", { day: "numeric", month: "long", year: "numeric" });
}

function formatCreatedAt(value: Date | string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString("ar-IQ", { dateStyle: "medium", timeStyle: "short" });
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("تعذر قراءة الصورة"));
    reader.readAsDataURL(file);
  });
}

export default function Admin() {
  const utils = trpc.useUtils();
  const adminMe = trpc.admin.me.useQuery();
  const isAdmin = Boolean(adminMe.data?.isAdmin);
  const [code, setCode] = useState("");
  const login = trpc.admin.login.useMutation({
    onSuccess: async () => {
      setCode("");
      await utils.admin.me.invalidate();
      toast.success("تم فتح لوحة الإدارة");
    },
    onError: error => toast.error(error.message || "رمز الإدارة غير صحيح"),
  });

  const bookings = trpc.admin.bookings.list.useQuery(undefined, { enabled: isAdmin, retry: false });
  const prices = trpc.admin.prices.list.useQuery(undefined, { enabled: isAdmin, retry: false });
  const categories = trpc.admin.store.categories.list.useQuery(undefined, { enabled: isAdmin, retry: false });
  const products = trpc.admin.store.products.list.useQuery(undefined, { enabled: isAdmin, retry: false });
  const storeOrders = trpc.admin.store.orders.list.useQuery(undefined, { enabled: isAdmin, retry: false });
  const logout = trpc.admin.logout.useMutation({
    onSuccess: async () => {
      await utils.admin.me.invalidate();
      toast.success("تم تسجيل الخروج");
    },
  });
  const updateStatus = trpc.admin.bookings.updateStatus.useMutation({
    onSuccess: async () => {
      await utils.admin.bookings.list.invalidate();
      toast.success("تم تحديث حالة الحجز");
    },
    onError: error => toast.error(error.message),
  });
  const updatePrice = trpc.admin.prices.update.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.admin.prices.list.invalidate(), utils.prices.list.invalidate()]);
      toast.success("تم حفظ السعر");
    },
    onError: error => toast.error(error.message),
  });
  const updateStoreOrderStatus = trpc.admin.store.orders.updateStatus.useMutation({
    onSuccess: async () => {
      await utils.admin.store.orders.list.invalidate();
      toast.success("تم تحديث حالة طلب المتجر");
    },
    onError: error => toast.error(error.message),
  });

  function submitLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (code.trim()) login.mutate({ code: code.trim() });
  }

  if (!isAdmin) {
    return (
      <main className="admin-page admin-page--login" dir="rtl">
        <div className="admin-login-card">
          <Link href="/" className="admin-back-link"><ArrowRight size={17} /> العودة للموقع</Link>
          <div className="admin-lock-mark"><LockKeyhole size={26} /></div>
          <span className="admin-eyebrow">AREA 50 / PRIVATE ACCESS</span>
          <h1>لوحة الإدارة.</h1>
          <p>هذه الصفحة خاصة بإدارة الحجوزات وأسعار الغرف والمتجر. أدخل رمز الإدارة للمتابعة.</p>
          <form onSubmit={submitLogin} className="admin-login-form">
            <label>رمز الإدارة<input type="password" autoComplete="current-password" value={code} onChange={event => setCode(event.target.value)} placeholder="أدخل الرمز" /></label>
            <button type="submit" disabled={login.isPending || !code.trim()}>{login.isPending ? "جارٍ التحقق..." : "دخول آمن"}<ShieldCheck size={18} /></button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <AdminDashboard
      bookings={bookings.data ?? []}
      prices={prices.data ?? []}
      categories={(categories.data ?? []) as Category[]}
      products={(products.data ?? []) as Product[]}
      orders={(storeOrders.data ?? []) as StoreOrder[]}
      onLogout={() => logout.mutate()}
      updatingStatus={updateStatus.isPending}
      onStatusChange={(id, status) => updateStatus.mutate({ id, status })}
      updatingPrice={updatePrice.isPending}
      onPriceSave={(room, pricePerHour) => updatePrice.mutate({ room, pricePerHour })}
      updatingOrderStatus={updateStoreOrderStatus.isPending}
      onOrderStatusChange={(id, status) => updateStoreOrderStatus.mutate({ id, status })}
    />
  );
}

type AdminDashboardProps = {
  bookings: Array<{ id: number; room: "vip" | "vvip"; guestName: string; bookingDate: string; startHour: number; endHour: number; guests: number; status: "pending" | "confirmed" | "cancelled"; createdAt: Date }>;
  prices: Array<{ room: "vip" | "vvip"; pricePerHour: number; currency: string }>;
  categories: Category[];
  products: Product[];
  orders: StoreOrder[];
  onLogout: () => void;
  updatingStatus: boolean;
  onStatusChange: (id: number, status: "pending" | "confirmed" | "cancelled") => void;
  updatingPrice: boolean;
  onPriceSave: (room: "vip" | "vvip", pricePerHour: number) => void;
  updatingOrderStatus: boolean;
  onOrderStatusChange: (id: number, status: StoreOrderStatus) => void;
};

function AdminDashboard({ bookings, prices, categories, products, orders, onLogout, updatingStatus, onStatusChange, updatingPrice, onPriceSave, updatingOrderStatus, onOrderStatusChange }: AdminDashboardProps) {
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
  useEffect(() => {
    setPriceDrafts(Object.fromEntries(prices.map(price => [price.room, String(price.pricePerHour)])));
  }, [prices]);

  const pendingCount = useMemo(() => bookings.filter(booking => booking.status === "pending").length, [bookings]);
  const confirmedCount = useMemo(() => bookings.filter(booking => booking.status === "confirmed").length, [bookings]);

  return (
    <main className="admin-page" dir="rtl">
      <header className="admin-header">
        <div><span className="admin-eyebrow">AREA 50 / CONTROL ROOM</span><h1>لوحة الإدارة</h1></div>
        <div className="admin-header-actions"><Link href="/center" className="admin-back-link"><ArrowRight size={17} /> صفحة السنتر</Link><Link href="/store" className="admin-back-link"><ShoppingBag size={17} /> صفحة المتجر</Link><button className="admin-logout" onClick={onLogout}><LogOut size={16} /> خروج</button></div>
      </header>
      <section className="admin-stats" aria-label="ملخص الإدارة">
        <div><Clock3 size={21} /><span>طلبات بانتظار الرد</span><strong>{pendingCount}</strong></div>
        <div><Check size={21} /><span>حجوزات مؤكدة</span><strong>{confirmedCount}</strong></div>
        <div><Users size={21} /><span>كل الحجوزات</span><strong>{bookings.length}</strong></div>
        <div><PackageOpen size={21} /><span>منتجات المتجر</span><strong>{products.length}</strong></div>
      </section>

      <section className="admin-panel" aria-labelledby="prices-title">
        <div className="admin-panel-heading"><div><span className="admin-eyebrow">01 / ROOM PRICING</span><h2 id="prices-title">أسعار الغرف</h2></div><p>عدّل سعر الساعة، وسيظهر مباشرةً داخل نماذج الحجز.</p></div>
        <div className="admin-price-grid">
          {(["vip", "vvip"] as const).map(room => (
            <div className={`admin-price-card admin-price-card--${room}`} key={room}>
              <div className="admin-price-card__top"><DoorOpen size={20} /><span>{roomLabels[room]}</span></div>
              <label>السعر لكل ساعة<input type="number" min="0" step="1000" value={priceDrafts[room] ?? "0"} onChange={event => setPriceDrafts({ ...priceDrafts, [room]: event.target.value })} /></label>
              <button onClick={() => onPriceSave(room, Math.max(0, Number(priceDrafts[room] ?? 0)))} disabled={updatingPrice}><Save size={16} /> {updatingPrice ? "جارٍ الحفظ" : "حفظ السعر"}</button>
            </div>
          ))}
        </div>
      </section>

      <StoreManagement categories={categories} products={products} />
      <StoreOrdersManagement orders={orders} updating={updatingOrderStatus} onStatusChange={onOrderStatusChange} />

      <section className="admin-panel" aria-labelledby="bookings-title">
        <div className="admin-panel-heading"><div><span className="admin-eyebrow">03 / BOOKING INBOX</span><h2 id="bookings-title">طلبات الحجز</h2></div><button className="admin-refresh" onClick={() => window.location.reload()}><RefreshCw size={16} /> تحديث</button></div>
        {bookings.length === 0 ? <div className="admin-empty"><p>لا توجد حجوزات حتى الآن.</p><span>طلبات الزوار ستظهر هنا بعد إرسال نموذج VIP أو VVIP.</span></div> : <div className="admin-bookings-list">{bookings.map(booking => <article className={`admin-booking-row admin-booking-row--${booking.room}`} key={booking.id}>
          <div className="admin-booking-room"><strong>{roomLabels[booking.room]}</strong><span>#{String(booking.id).padStart(4, "0")}</span></div>
          <div className="admin-booking-main"><h3>{booking.guestName}</h3><p>{formatBookingDate(booking.bookingDate)} · {booking.startHour}:00 — {booking.endHour}:00 · {booking.guests} أشخاص</p><small>أُرسل {formatCreatedAt(booking.createdAt)}</small></div>
          <div className="admin-booking-actions"><span className={`admin-status admin-status--${booking.status}`}>{statusLabels[booking.status]}</span><div><button title="تأكيد" onClick={() => onStatusChange(booking.id, "confirmed")} disabled={updatingStatus}><Check size={16} /></button><button title="إلغاء" onClick={() => onStatusChange(booking.id, "cancelled")} disabled={updatingStatus}><X size={16} /></button></div></div>
        </article>)}</div>}
      </section>
    </main>
  );
}

function StoreManagement({ categories, products }: { categories: Category[]; products: Product[] }) {
  const utils = trpc.useUtils();
  const [categoryDraft, setCategoryDraft] = useState({ id: 0, slug: "", title: "", detail: "", tone: "cyan" });
  const [productDraft, setProductDraft] = useState({ id: 0, categoryId: "", name: "", description: "", price: "", imageUrl: "", stock: "10", isAvailable: 1 });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const uploadImage = trpc.admin.store.uploadImage.useMutation();
  const createCategory = trpc.admin.store.categories.create.useMutation({ onSuccess: async () => { await utils.admin.store.categories.list.invalidate(); resetCategory(); toast.success("تمت إضافة التصنيف"); }, onError: error => toast.error(error.message) });
  const updateCategory = trpc.admin.store.categories.update.useMutation({ onSuccess: async () => { await utils.admin.store.categories.list.invalidate(); resetCategory(); toast.success("تم تعديل التصنيف"); }, onError: error => toast.error(error.message) });
  const deleteCategory = trpc.admin.store.categories.delete.useMutation({ onSuccess: async () => { await utils.admin.store.categories.list.invalidate(); toast.success("تم حذف التصنيف"); }, onError: error => toast.error(error.message) });
  const createProduct = trpc.admin.store.products.create.useMutation({ onSuccess: async () => { await utils.admin.store.products.list.invalidate(); resetProduct(); toast.success("تمت إضافة المنتج"); }, onError: error => toast.error(error.message) });
  const updateProduct = trpc.admin.store.products.update.useMutation({ onSuccess: async () => { await utils.admin.store.products.list.invalidate(); resetProduct(); toast.success("تم تعديل المنتج"); }, onError: error => toast.error(error.message) });
  const deleteProduct = trpc.admin.store.products.delete.useMutation({ onSuccess: async () => { await utils.admin.store.products.list.invalidate(); toast.success("تم حذف المنتج"); }, onError: error => toast.error(error.message) });

  function resetCategory() { setCategoryDraft({ id: 0, slug: "", title: "", detail: "", tone: "cyan" }); }
  function resetProduct() { setProductDraft({ id: 0, categoryId: categories[0] ? String(categories[0].id) : "", name: "", description: "", price: "", imageUrl: "", stock: "10", isAvailable: 1 }); setSelectedFile(null); }

  useEffect(() => {
    if (!productDraft.categoryId && categories[0]) setProductDraft(draft => ({ ...draft, categoryId: String(categories[0].id) }));
  }, [categories, productDraft.categoryId]);

  function submitCategory(event: React.FormEvent) {
    event.preventDefault();
    const data = { slug: categoryDraft.slug.trim(), title: categoryDraft.title.trim(), detail: categoryDraft.detail.trim(), tone: categoryDraft.tone as "cyan" | "lime" | "violet" | "amber" };
    if (!data.slug || !data.title) return toast.error("اكتب اسم التصنيف والمعرّف");
    if (categoryDraft.id) updateCategory.mutate({ id: categoryDraft.id, data: { title: data.title, detail: data.detail, tone: data.tone } });
    else createCategory.mutate(data);
  }

  async function submitProduct(event: React.FormEvent) {
    event.preventDefault();
    if (!productDraft.categoryId || !productDraft.name.trim() || !productDraft.price || !productDraft.imageUrl.trim() && !selectedFile) return toast.error("أكمل اسم المنتج والتصنيف والسعر والصورة");
    try {
      let imageUrl = productDraft.imageUrl.trim();
      if (selectedFile) {
        if (!selectedFile.type.startsWith("image/") || selectedFile.size > 5 * 1024 * 1024) return toast.error("اختر صورة أقل من 5MB");
        const base64 = await readFileAsDataUrl(selectedFile);
        const uploaded = await uploadImage.mutateAsync({ fileName: selectedFile.name, contentType: selectedFile.type as "image/jpeg" | "image/png" | "image/webp" | "image/gif", base64 });
        imageUrl = uploaded.url;
      }
      const data = { categoryId: Number(productDraft.categoryId), name: productDraft.name.trim(), description: productDraft.description.trim(), price: Number(productDraft.price), imageUrl, isAvailable: productDraft.isAvailable, stock: Math.max(0, Number(productDraft.stock || 0)) };
      if (productDraft.id) updateProduct.mutate({ id: productDraft.id, data });
      else createProduct.mutate(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر رفع الصورة");
    }
  }

  function editCategory(category: Category) { setCategoryDraft({ id: category.id, slug: category.slug, title: category.title, detail: category.detail || "", tone: category.tone }); }
  function editProduct(product: Product) { setProductDraft({ id: product.id, categoryId: String(product.categoryId), name: product.name, description: product.description || "", price: String(product.price), imageUrl: product.imageUrl, stock: String(product.stock), isAvailable: product.isAvailable }); setSelectedFile(null); }
  function removeCategory(id: number) { if (products.some(product => product.categoryId === id)) return toast.error("لا يمكن حذف تصنيف يحتوي منتجات. عدّل المنتجات أولاً."); if (window.confirm("حذف هذا التصنيف؟")) deleteCategory.mutate({ id }); }
  function removeProduct(id: number) { if (window.confirm("حذف هذا المنتج؟")) deleteProduct.mutate({ id }); }

  const categoryLabel = (id: number) => categories.find(category => category.id === id)?.title || "بدون تصنيف";
  const busy = uploadImage.isPending || createCategory.isPending || updateCategory.isPending || createProduct.isPending || updateProduct.isPending;

  return (
    <section className="admin-panel admin-store-panel" aria-labelledby="store-management-title">
      <div className="admin-panel-heading"><div><span className="admin-eyebrow">02 / STORE CONTROL</span><h2 id="store-management-title">إدارة المتجر</h2></div><p>أضف التصنيفات والمنتجات وعدّل السعر والوصف والصورة والتوفر من هنا.</p></div>
      <div className="admin-store-grid">
        <form className="admin-form-card" onSubmit={submitCategory}>
          <div className="admin-form-card__title"><Tags size={18} /><h3>{categoryDraft.id ? "تعديل التصنيف" : "إضافة تصنيف"}</h3></div>
          <label>اسم التصنيف<input value={categoryDraft.title} onChange={event => setCategoryDraft({ ...categoryDraft, title: event.target.value })} placeholder="مثلاً: أجهزة وإكسسوارات" /></label>
          <label>المعرّف بالإنكليزي<input value={categoryDraft.slug} disabled={Boolean(categoryDraft.id)} onChange={event => setCategoryDraft({ ...categoryDraft, slug: event.target.value.toLowerCase().replace(/\s+/g, "-") })} placeholder="accessories" /></label>
          <label>الوصف<textarea value={categoryDraft.detail} onChange={event => setCategoryDraft({ ...categoryDraft, detail: event.target.value })} placeholder="وصف قصير يظهر للزوار" /></label>
          <label>لون البطاقة<select value={categoryDraft.tone} onChange={event => setCategoryDraft({ ...categoryDraft, tone: event.target.value })}>{toneOptions.map(tone => <option value={tone.value} key={tone.value}>{tone.label}</option>)}</select></label>
          <div className="admin-form-actions"><button className="admin-primary-action" type="submit" disabled={busy}>{categoryDraft.id ? <Pencil size={15} /> : <Plus size={15} />} {categoryDraft.id ? "حفظ التعديل" : "إضافة التصنيف"}</button>{categoryDraft.id && <button className="admin-secondary-action" type="button" onClick={resetCategory}>إلغاء</button>}</div>
          <div className="admin-mini-list">{categories.map(category => <div className="admin-mini-row" key={category.id}><span><strong>{category.title}</strong><small>{category.slug}</small></span><span><button type="button" title="تعديل" onClick={() => editCategory(category)}><Pencil size={14} /></button><button type="button" title="حذف" onClick={() => removeCategory(category.id)}><Trash2 size={14} /></button></span></div>)}</div>
        </form>

        <form className="admin-form-card admin-product-form" onSubmit={submitProduct}>
          <div className="admin-form-card__title"><PackageOpen size={18} /><h3>{productDraft.id ? "تعديل المنتج" : "إضافة منتج"}</h3></div>
          <div className="admin-form-two-col"><label>اسم المنتج<input value={productDraft.name} onChange={event => setProductDraft({ ...productDraft, name: event.target.value })} placeholder="مثلاً: ماوس باد Area" /></label><label>التصنيف<select value={productDraft.categoryId} onChange={event => setProductDraft({ ...productDraft, categoryId: event.target.value })}><option value="">اختر تصنيفاً</option>{categories.map(category => <option value={category.id} key={category.id}>{category.title}</option>)}</select></label></div>
          <label>الوصف<textarea value={productDraft.description} onChange={event => setProductDraft({ ...productDraft, description: event.target.value })} placeholder="تفاصيل المنتج ومميزاته" /></label>
          <div className="admin-form-two-col"><label>السعر بالدينار العراقي<input type="number" min="0" step="1000" value={productDraft.price} onChange={event => setProductDraft({ ...productDraft, price: event.target.value })} placeholder="25000" /></label><label>الكمية المتوفرة<input type="number" min="0" value={productDraft.stock} onChange={event => setProductDraft({ ...productDraft, stock: event.target.value })} /></label></div>
          <label>رابط الصورة (اختياري إذا رفعت صورة)<div className="admin-input-with-icon"><Link2 size={16} /><input value={productDraft.imageUrl} onChange={event => setProductDraft({ ...productDraft, imageUrl: event.target.value })} placeholder="https://... أو /manus-storage/..." /></div></label>
          <label className="admin-upload-label"><span><ImagePlus size={17} /> صورة من جهازك</span><input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={event => setSelectedFile(event.target.files?.[0] || null)} /><small>{selectedFile ? selectedFile.name : "PNG / JPG / WEBP · الحد الأقصى 5MB"}</small></label>
          <label className="admin-checkbox-label"><input type="checkbox" checked={productDraft.isAvailable === 1} onChange={event => setProductDraft({ ...productDraft, isAvailable: event.target.checked ? 1 : 0 })} /> المنتج ظاهر ومتوفر للزوار</label>
          <div className="admin-form-actions"><button className="admin-primary-action" type="submit" disabled={busy}>{selectedFile ? <Upload size={15} /> : <Save size={15} />} {busy ? "جارٍ الحفظ" : productDraft.id ? "حفظ المنتج" : "إضافة المنتج"}</button>{productDraft.id && <button className="admin-secondary-action" type="button" onClick={resetProduct}>إلغاء</button>}</div>
        </form>
      </div>

      <div className="admin-products-table-wrap">
        <div className="admin-products-table-heading"><div><h3>المنتجات الحالية</h3><span>{products.length} منتجات محفوظة</span></div><button className="admin-refresh" type="button" onClick={() => window.location.reload()}><RefreshCw size={15} /> تحديث</button></div>
        {products.length === 0 ? <div className="admin-empty"><p>لا توجد منتجات بعد.</p><span>أضف أول منتج من النموذج أعلاه.</span></div> : <div className="admin-products-table">{products.map(product => <article className={`admin-product-row ${product.isAvailable ? "" : "is-hidden"}`} key={product.id}><img src={product.imageUrl} alt="" /><div className="admin-product-info"><strong>{product.name}</strong><span>{categoryLabel(product.categoryId)} · {product.price.toLocaleString("ar-IQ")} {product.currency} · المخزون {product.stock}</span><small>{product.description || "بدون وصف"}</small></div><span className={`admin-availability ${product.isAvailable ? "is-available" : "is-hidden"}`}>{product.isAvailable ? <><Eye size={14} /> ظاهر</> : <><EyeOff size={14} /> مخفي</>}</span><div className="admin-product-actions"><button type="button" title="تعديل المنتج" onClick={() => editProduct(product)}><Pencil size={16} /></button><button type="button" title="حذف المنتج" onClick={() => removeProduct(product.id)}><Trash2 size={16} /></button></div></article>)}</div>}
      </div>
    </section>
  );
}

function StoreOrdersManagement({ orders, updating, onStatusChange }: { orders: StoreOrder[]; updating: boolean; onStatusChange: (id: number, status: StoreOrderStatus) => void }) {
  return (
    <section className="admin-panel admin-orders-panel" aria-labelledby="store-orders-title">
      <div className="admin-panel-heading"><div><span className="admin-eyebrow">03 / STORE INBOX</span><h2 id="store-orders-title">طلبات المتجر</h2></div><div className="admin-orders-heading-meta"><span>{orders.length} طلب محفوظ</span><button className="admin-refresh" type="button" onClick={() => window.location.reload()}><RefreshCw size={15} /> تحديث</button></div></div>
      {orders.length === 0 ? <div className="admin-empty"><p>لا توجد طلبات متجر حتى الآن.</p><span>طلبات الزبائن ستظهر هنا بعد إرسالها من السلة.</span></div> : <div className="admin-store-orders-list">{orders.map(order => <article className={`admin-store-order-row admin-store-order-row--${order.status}`} key={order.id}>
        <div className="admin-store-order-top"><div><strong>طلب #{String(order.id).padStart(4, "0")}</strong><small>{formatCreatedAt(order.createdAt)}</small></div><span className={`admin-status admin-status--${order.status}`}>{storeOrderStatusLabels[order.status]}</span></div>
        <div className="admin-store-order-grid"><div className="admin-store-order-customer"><h3>{order.customerName}</h3><p dir="ltr">{order.customerPhone}</p><p>{order.customerAddress}</p>{order.notes && <small>ملاحظة: {order.notes}</small>}</div><div className="admin-store-order-items">{order.items.map(item => <div key={item.id}><span>{item.productName} × {item.quantity}</span><strong>{(item.price * item.quantity).toLocaleString("ar-IQ")} {order.currency}</strong></div>)}<div className="admin-store-order-total"><span>الإجمالي</span><strong>{order.totalAmount.toLocaleString("ar-IQ")} {order.currency}</strong></div></div></div>
        <div className="admin-store-order-actions"><label>تحديث الحالة<select value={order.status} onChange={event => onStatusChange(order.id, event.target.value as StoreOrderStatus)} disabled={updating}>{Object.entries(storeOrderStatusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label></div>
      </article>)}</div>}
    </section>
  );
}
