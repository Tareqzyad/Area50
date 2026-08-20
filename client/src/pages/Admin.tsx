import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Clock3, DoorOpen, LogOut, LockKeyhole, RefreshCw, Save, ShieldCheck, Users, X } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const roomLabels = { vip: "VIP Room", vvip: "VVIP Room" } as const;
const statusLabels = { pending: "قيد المراجعة", confirmed: "مؤكد", cancelled: "ملغى" } as const;

function formatBookingDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("ar-IQ", { day: "numeric", month: "long", year: "numeric" });
}

function formatCreatedAt(value: Date | string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString("ar-IQ", { dateStyle: "medium", timeStyle: "short" });
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
          <p>هذه الصفحة خاصة بإدارة حجوزات الغرف وأسعارها. أدخل رمز الإدارة للمتابعة.</p>
          <form onSubmit={submitLogin} className="admin-login-form">
            <label>رمز الإدارة<input type="password" autoComplete="current-password" value={code} onChange={event => setCode(event.target.value)} placeholder="أدخل الرمز" /></label>
            <button type="submit" disabled={login.isPending || !code.trim()}>{login.isPending ? "جارٍ التحقق..." : "دخول آمن"}<ShieldCheck size={18} /></button>
          </form>
        </div>
      </main>
    );
  }

  return <AdminDashboard bookings={bookings.data ?? []} prices={prices.data ?? []} onLogout={() => logout.mutate()} updatingStatus={updateStatus.isPending} onStatusChange={(id, status) => updateStatus.mutate({ id, status })} updatingPrice={updatePrice.isPending} onPriceSave={(room, pricePerHour) => updatePrice.mutate({ room, pricePerHour })} />;
}

type AdminDashboardProps = {
  bookings: Array<{ id: number; room: "vip" | "vvip"; guestName: string; bookingDate: string; startHour: number; endHour: number; guests: number; status: "pending" | "confirmed" | "cancelled"; createdAt: Date }>;
  prices: Array<{ room: "vip" | "vvip"; pricePerHour: number; currency: string }>;
  onLogout: () => void;
  updatingStatus: boolean;
  onStatusChange: (id: number, status: "pending" | "confirmed" | "cancelled") => void;
  updatingPrice: boolean;
  onPriceSave: (room: "vip" | "vvip", pricePerHour: number) => void;
};

function AdminDashboard({ bookings, prices, onLogout, updatingStatus, onStatusChange, updatingPrice, onPriceSave }: AdminDashboardProps) {
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
        <div className="admin-header-actions"><Link href="/center" className="admin-back-link"><ArrowRight size={17} /> صفحة السنتر</Link><button className="admin-logout" onClick={onLogout}><LogOut size={16} /> خروج</button></div>
      </header>
      <section className="admin-stats" aria-label="ملخص الإدارة">
        <div><Clock3 size={21} /><span>طلبات بانتظار الرد</span><strong>{pendingCount}</strong></div>
        <div><Check size={21} /><span>حجوزات مؤكدة</span><strong>{confirmedCount}</strong></div>
        <div><Users size={21} /><span>كل الحجوزات</span><strong>{bookings.length}</strong></div>
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

      <section className="admin-panel" aria-labelledby="bookings-title">
        <div className="admin-panel-heading"><div><span className="admin-eyebrow">02 / BOOKING INBOX</span><h2 id="bookings-title">طلبات الحجز</h2></div><button className="admin-refresh" onClick={() => window.location.reload()}><RefreshCw size={16} /> تحديث</button></div>
        {bookings.length === 0 ? <div className="admin-empty"><p>لا توجد حجوزات حتى الآن.</p><span>طلبات الزوار ستظهر هنا بعد إرسال نموذج VIP أو VVIP.</span></div> : <div className="admin-bookings-list">{bookings.map(booking => <article className={`admin-booking-row admin-booking-row--${booking.room}`} key={booking.id}>
          <div className="admin-booking-room"><strong>{roomLabels[booking.room]}</strong><span>#{String(booking.id).padStart(4, "0")}</span></div>
          <div className="admin-booking-main"><h3>{booking.guestName}</h3><p>{formatBookingDate(booking.bookingDate)} · {booking.startHour}:00 — {booking.endHour}:00 · {booking.guests} أشخاص</p><small>أُرسل {formatCreatedAt(booking.createdAt)}</small></div>
          <div className="admin-booking-actions"><span className={`admin-status admin-status--${booking.status}`}>{statusLabels[booking.status]}</span><div><button title="تأكيد" onClick={() => onStatusChange(booking.id, "confirmed")} disabled={updatingStatus}><Check size={16} /></button><button title="إلغاء" onClick={() => onStatusChange(booking.id, "cancelled")} disabled={updatingStatus}><X size={16} /></button></div></div>
        </article>)}</div>}
      </section>
    </main>
  );
}
