---
version: 1
slug: "app-study-landing-tsx"
primary_target: "app/study/landing.tsx"
related_targets: ["app/study-app.tsx","app/study/auth.tsx"]
---

# Landing (giriş öncesi) ve uygulama kabuğu

Scope: Persuade (landing) + Operate (giriş sonrası uygulama, yalnız renk/tipografi dili ve emoji temizliği). Ziyaretçi modu: karar verir ve kayıt olur.

## Audience and job
YKS öğrencisi; netudu'nun ne olduğunu ve neden tek yerde toplandığını birkaç saniyede anlamalı, Kayıt ol / Üye girişi ile devam etmeli. Kanıt: gerçek ürün özellikleri (program, yanlış defteri, deneme takvimi, aralıklı tekrar). Sahte müşteri/yorum/sayı yok; önizleme verisi sentetiktir ve öyle etiketlenir.

## Direction contract
THESIS: "Tek hedef. Her şey yerli yerinde." Yoğun hero-şablonu yerine, ürünün kendisi (çalışma programı, net grafiği, yaklaşan deneme) ilk ekranda tam ölçekli çalışan bir panel olarak görünür; sakin, kâğıt gibi ve süssüz.
OWN-WORLD: Kullanıcının iki referans görseli (yerleşim) ve son lacivert palet değerleri (renk) bağlayıcıdır. Koyu: #101722 zemin, #192333 yüzey, #223047 iç panel, #354761 kenarlık, #F5F7FC metin, #B8C5D8 ikincil, #38B6FF gök mavisi (eylem), #FF875C mercan (ders ayrıntısı), #35D6A0 nane (ilerleme/tamamlanma), #FFC857 güneş sarısı (takvim), renkli düğme metni #101722. Açık: #F5F8FC zemin, beyaz yüzey, derin mavi marka (#0B74C9), mavi tonlu nötrler. Başlık: Poppins SemiBold, sıkı aralıklı; ikinci satır vurgu renginde. İnce 1px çizgiler, 8-14px köşe, yumuşak ama gerçek ofsetli gölge; gradyan metin, parıltı, cam yok.
STORY: Ziyaretçi neyin tek yerde toplandığını (program, yanlış defteri, deneme takvimi) görür, güvenir, Kayıt ol'a basar; zaten hesabı olan Üye girişi'ni kullanır.
FIRST VIEWPORT: Üst çubuk: sol logo (N defter işareti + netudu), orta "Özellikler" "Nasıl çalışır?", sağ "Üye girişi" ve dolu "Kayıt ol". Ortada küçük harf aralıklı üst etiket "YKS HAZIRLIĞININ YENİ DÜZENİ" (referansta var), iki satır dev başlık "Tek hedef." (metin rengi) / "Her şey yerli yerinde." (vurgu rengi), iki satır alt metin, iki eylem: dolu "Hemen başla →" ve metin "Netudu'yu keşfet →". Altında genişliği ~1250px'e kadar çerçeveli ürün paneli (kenar çubuğu + bugünün programı + net grafiği + yaklaşan deneme); panelin altında üç sütun adım özeti (01 Planını oluştur / 02 Yanlışlarından öğren / 03 Gelişimini gör). Birincil eylem başlığın hemen altında.
FORM: Kullanıcı sabitledi (referans görseller); concept-seed çalıştırılmadı, tahmin listesi yok. seed: none (unavailable)
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
