# Net Defterim · YKS 2028 (Yusuf Kaya)

Yusuf Kaya'nın kişisel deneme yanlış arşivi. Türkçe, mobil uyumlu arayüz. Sınav türleri: TYT, AYT, 9. Sınıf, 10. Sınıf, 11. Sınıf, 12. Sınıf.

## Neler var

- **Toplu yükleme:** Deneme sonrası birden fazla soru fotoğrafını tek seferde bırak; fotoğraflar tarayıcıda küçültülür (uzun kenar 1800 px, JPEG), sırayla kaydedilir ve arka planda çözülür. Her soru için "yanlış işaretledim / boş bıraktım / doğru ama emin değildim" ayrımı tutulur.
- **Çözüm ve konu:** OpenAI Responses API görüntü girdisiyle adım adım çözüm üretir. Konu listesi `lib/meb-topics.ts` içindedir: MEB Türkiye Yüzyılı Maarif Modeli ortaöğretim programlarından (https://tymm.meb.gov.tr/ogretim-programlari) 9 ders (Matematik, Fizik, Kimya, Biyoloji, Türk Dili ve Edebiyatı, Tarih, Coğrafya, Felsefe, Din Kültürü) × sınıf × ünite/tema × içerik çerçevesi olarak alınmıştır (~150 ünite, ~500 konu). Soru eklerken konu bu menüden seçilir; boş bırakılırsa yapay zekâ aynı listeden seçer (serbest metin girişleri de en yakın konuya eşlenir); böylece aylık rapor "Türev / türev alma" gibi kopyalarla bölünmez. Çözüm cevap anahtarıyla çelişirse ikinci bağımsız çözüm istenir ve sonuç `verification` alanında açıklanır. Hata tipi etiketi (`errorType`) üretilir.
- **YouTube videosu (Maarif Modeli'ne uygun):** Sorgu, konunun MEB sınıfı ve ünitesiyle kurulur ("{konu} {sınıf}. sınıf {ders} konu anlatımı yeni müfredat"). Kaynak sırası: `YOUTUBE_API_KEY` varsa Data API v3; yoksa anahtarsız YouTube arama sayfası (ytInitialData) okunur — yani hiçbir anahtar olmadan da gerçek video bulunur; ikisi de başarısızsa OpenAI web araması. Sıralama AI varsa modelle (yeni müfredat/Maarif uyumu öne alınır), yoksa sezgisel puanla (konu kelimeleri, "konu anlatımı", yeni müfredat ibaresi, 4-60 dk süre, izlenme). Soru penceresinde "Konu videosu" sekmesi açılınca video yoksa otomatik aranır. Sonuçlar konu bazında `video_cache` tablosunda saklanır; "işime yaramadı" denen video bir daha önerilmez, "yeniden ara" listeyi tazeler.
- **Aralıklı tekrar:** Her soru 1 → 3 → 7 → 14 → 30 → 60 gün aralıklarla tekrar sırasına girer. "Doğru çözdüm" aralığı uzatır, "Yine yanlış" aşamayı sıfırlar. Ana sayfada "Bugün tekrar sırası" listesi, arşivde "Bugün sırada / Öğrenildi" filtreleri.
- **Arşiv:** Liste veya Ders › Konu gruplu görünüm, hata türü/ay/sınav filtreleri, gerçek **.xlsx** çıktı (bağımlılıksız yazıcı `lib/xlsx.ts`; soru listesi + konu özeti sayfaları), CSV ve A4 yazdır/PDF.
- **Aylık rapor:** Konu sıralamasında önceki aya göre değişim, boş/emin değildim kırılımı; yapay zekâ notları örnek sorular ve hata tiplerinden kişisel örüntü çıkarır, önceki ayın hedeflerini değerlendirir ve gelecek ay için 3 hedef üretir. Hedefler işaretlenebilir; bir sonraki ay puanlanır.
- **Ders notlarım:** Ders ve MEB konusunu menüden seç, "Notu hazırla" ile yapay zekâ konu özeti, kavramlar, formüller, çözümlü örnekler, öğrencinin kendi hatalarına göre sık hatalar, mini test ve tekrar notu içeren bir ders notu üretir (`study_notes` tablosu). Sonrasında "Ek istek" kutusuna yazılan prompt ile not yeniden yazılır. Soru penceresindeki "Bu konunun ders notu" bağlantısı konuyu seçili getirir.
- **Denemelerim:** Net, doğru/yanlış/boş girişi; net gelişim çizgisi ve deneme başına yüklenen yanlış sayısı grafiği (recharts). Ana sayfada YKS 2028 geri sayımı (tarih Ayarlar'dan değiştirilir, tarayıcıda saklanır).
- **Bildirim:** Ayın ilk 10 gününde ana sayfada geçen ayın raporu için uyarı; "Takvime ekle" ile her ayın 1'i 19.00 (Europe/Istanbul) tekrarlayan .ics hatırlatması. Codex otomasyonu ayrıca kullanılabilir. (Sites üzerinde zamanlanmış görev/push altyapısı olmadığı için sunucudan e-posta/push gönderimi yoktur.)
- **Yedek:** Ayarlar › "Yedeği indir" tüm soruları, çözümleri, tekrar geçmişini, raporları ve denemeleri JSON olarak verir; "Geri yükle" aynı kimlikli kayıtları atlayarak içe aktarır. Fotoğraflar yedeğe dahil değildir (R2'de kalır).
- **Oturum:** Giriş yapılmamışsa API çağrısı yapılmaz; karşılama ekranı gösterilir. Giriş ChatGPT kimliğiyle yapılır (Sites platformu); ayrı e-posta/şifre girişi bu ortamda mümkün değildir.

## Veri ve kimlik

Sites özel erişimi ve ChatGPT kimliği kullanılır. Her API işlemi sunucuda kullanıcı kimliğini kontrol eder (`lib/server.ts › owner`). Sorular, raporlar, denemeler ve video önbelleği D1'de; fotoğraflar R2'de tutulur. Veriler tarayıcı depolamasına bağlı değildir; yalnızca sınav tarihi, son deneme adı ve arşiv görünüm tercihi `localStorage`'da tutulur.

## Ortam değişkenleri

- `OPENAI_API_KEY` (gerekli, gizli) — çözüm, konu sınıflaması, video seçimi, aylık notlar.
- `OPENAI_MODEL` (varsayılan `gpt-5.6-luna`).
- `YOUTUBE_API_KEY` (isteğe bağlı, gizli) — YouTube Data API v3. Ücretsiz günlük kota 10.000 birim; bir konu araması ~101 birim.

Anahtarlar kaynakta veya tarayıcıda tutulmaz. Anahtar yoksa kayıt, tekrar, çıktı ve yedek çalışır; çözüm/video/not üretimi açık bir bağlantı mesajı gösterir.

## Veri şeması

`db/schema.ts` + `drizzle/0001_spaced_repetition.sql`: `questions` tablosuna `mistake_type`, `review_stage`, `next_review`, `review_log`; `reports` tablosuna `goals`; yeni `exams` ve `video_cache` tabloları. Göç uygulanmamış yerel önizlemelerde `lib/server.ts › ensureSchema` ilk API çağrısında eksik sütun/tabloları güvenli biçimde ekler (üretimde göç önce koştuğu için hiçbir şey yapmaz).

## Geliştirme ve kontroller

- Kilitli bağımlılık kurulumu: `npm run install:ci`
- Önizleme: `npm run dev`
- Derleme: `npm run build`
- Tür kontrolü: `npx tsc --noEmit`
- Birim kontrol (aylık analiz, aralıklı tekrar, konu eşleme, CSV/XLSX): `npx tsx work/check-study.mjs`
- Bütünleşme kontrolü (önizleme açıkken): `node work/check-api.mjs` — giriş, yükleme, konu eşleme, hata türü, tekrar döngüsü, CSRF, denemeler, rapor hedefleri, yedek al/geri yükle. Geçici kayıtlar sonunda silinir.
- Veri şeması değişikliği: `npm run db:generate`; oluşan SQL'i incele.

Resmî API belgeleri: https://developers.openai.com/api/docs/guides/images-vision · https://developers.openai.com/api/docs/guides/tools-web-search · https://developers.google.com/youtube/v3/docs/search/list
