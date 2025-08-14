# Stok Takip Frontend (React + Vite)

FLO temasına (turuncu/beyaz) yakın, modern bir **stok takip** arayüzü.  
Dashboard, kritik stok uyarıları, kategori bazlı grafik, ürün listesi/arama/filtre ve **Ürün Ekle** modallı hızlı iş akışları içerir. Envanter değeri **maliyet esaslı** hesaplanır.

## ✨ Özellikler
- **Dashboard**: Toplam ürün, toplam stok, düşük/kritik stok, toplam değer
- **Anlık Uyarılar**: `stok = 0` ve `stok ≤ ROP` ürünler
- **Grafik**: Kategori bazlı Stok / İhtiyaç (Recharts)
- **Arama & Filtre**: SKU/Ad/Kategori/Lokasyon + “Sadece kritik stok”
- **Ürün Ekle**: Modal form, doğrulama, benzersiz SKU üretimi
- **CSV Dışa Aktar**
- **Tema**: FLO turuncusu (`#ff6a00`) ve sade kart tasarımları
- **Mock veri**: Hızlı demo için örnek ürünler

## 🧱 Teknoloji
- **React 18** + **Vite**
- **Recharts**, **Lucide Icons**, **Framer Motion** (hazır; kullanım opsiyonel)
- Saf CSS (Tailwind yok), değişken tabanlı tema

## 🚀 Başlangıç

> Gereksinim: Node.js 18+

```bash
# bağımlılıklar
npm install

# geliştirme (5173 portunda sabit)
npm run dev

# üretim derlemesi
npm run build

# build edilmişi önizleme (5173)
npm run preview
