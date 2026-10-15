# ⚡ IUS ENGINEERING CLUB — KAMPÜS PROJELERİ & KOMİSYON SUNUM DOSYASI
## Öğrenci Kulüpleri Komisyonu (SCC) & FENS Yönetimi İçin Proje Portföyü (2026/2027)

---

## 🌟 1. AMİRAL GEMİSİ DONANIM & IOT PROJESİ: IUS PowerHub
### (Öğrenci Kartı (RFID) Entegreli Akıllı Kampüs Powerbank İstasyonları)

### 📌 Projenin Amacı ve Problem Tanımı:
* **Kampüsteki Temel Sorun:** IUS amfilerinde, kütüphanede ve kafeteryada priz sayıları yetersizdir. Öğrencilerin telefon, tablet ve dizüstü cihazlarının şarjı ders aralarında tükenmekte, öğrenciler duvar diplerinde priz aramak zorunda kalmaktadır.
* **Mühendislik Çözümümüz:** IUS mühendislik öğrencileri olarak dışarıdan pahalı ticari sistemler satın almak yerine, **kendi tasarlayıp üreteceğimiz Akıllı Powerbank İstasyonlarını (IUS PowerHub)** kampüsün kilit noktalarına kuruyoruz.
* **Kullanım Senaryosu:** 
  1. Öğrenci IUS Öğrenci Kartını istasyondaki RFID okuyucuya okutur.
  2. Sistem kartı doğrular ve dolu olan bir powerbank yuvasının elektromanyetik kilidini açar.
  3. Öğrenci powerbank'i alıp dersine veya kütüphaneye gider.
  4. İşini bitirince powerbank'i herhangi bir boş yuvaya takar.
  5. İstasyon, pogo-pin/manyetik şarj rayları üzerinden powerbank'i algılar, kilitler ve otomatik olarak hızlı şarja başlar.

---

### 🛠️ Çok Disiplinli Mühendislik Mimarisi:

```
[Öğrenci IUS Kartı] ──(NFC/RFID)──> [RC522 / PN532 Okuyucu]
                                           │
                                           ▼
                                  [ESP32 / Raspberry Pi Ana Kart]
                                           │
             ┌─────────────────────────────┴─────────────────────────────┐
             ▼                                                           ▼
 [Donanım & Mekanik Kontrol]                                   [IoT & Web Bulut Ağı]
 • Solenoid Akıllı Kilitler                                     • Öğrenci Zimmet Takip API'si
 • Manyetik Pogo-Pin Şarj Devreleri                             • 2 Saat Ücretsiz Kullanım Limiti
 • Akıllı Batarya Yönetimi (BMS & Isı Sensörü)                  • İstasyon Doluluk Dashboard'u
 • 3D Baskı / Lazer Kesim Şasi (ME / EE)                        • LCD / OLED Durum Ekranı
```

1. **Elektrik-Elektronik Mühendisliği (EE):**
   * Güvenli batarya şarj devreleri (TP4056 / BMS koruma modülleri).
   * Aşırı akım, kısa devre ve aşırı ısınma koruma sensörleri (Yangın ve lab güvenliği standardı).
   * Otomatik temaslı pogo-pin şarj istasyon baraları.
2. **Bilgisayar & Yazılım Mühendisliği (CS / SE):**
   * ESP32 / Raspberry Pi mikrodenetleyici firmware yazılımı (C++ / MicroPython).
   * IUS öğrenci kartı ID doğrulaması ve yerel/bulut veritabanı (SQLite / REST API).
   * Canlı durum takip arayüzü (Hangi istasyonda kaç dolu powerbank var gösteren mobil uyumlu web paneli).
3. **Makine Mühendisliği (ME):**
   * FENS laboratuvarlarındaki 3D yazıcılar ve pleksi/metal kesim ile sağlam, şık kampüs istasyon kasası.
   * Yaylı ve manyetik kilitleme mekanizması tasarımı.

---

## 🏛️ 2. ÖĞRENCİ KULÜP KOMİSYONU (SCC) HOCALARINA ÖZEL ANLATIM STRATEJİSİ
*(Komisyon üyeleriyle yüz yüze görüşmelerde vurgulanacak özel noktalar)*

Form F252'de onay imzası bulunan komisyon üyelerimizin uzmanlık alanlarına göre hazırlanmış ikna argümanları:

### 1. 🎓 Asst. Prof. Dr. Özge Büyükdağlı (FENS — Bilgisayar Mühendisliği)
* **Vurgulanacak Nokta:** Yazılım mimarisi, akran eğitimi ve açık kaynak kültürü.
* **Mesaj:** *"Hocam, kulübümüz sadece sosyal etkinlik yapmayacak; CS/SE öğrencilerini haftalık pratik yapay zeka ve yazılım atölyelerinde (AI Labs) toplayacağız. Ayrıca IUS PowerHub'ın backend yazılımını ve RFID takip sistemini öğrencilerimiz kendi açık kaynak projeleri olarak geliştirecek. Sizin CS derslerinizdeki teorik temeli kampüste çalışan canlı yazılımlara dönüştüreceğiz."*

### 2. ⚡ Asst. Prof. Dr. Mustafa Krupalija (FENS — Elektrik-Elektronik Mühendisliği)
* **Vurgulanacak Nokta:** Donanım güvenliği, gömülü sistemler, batarya yönetimi (BMS) ve IoT prototipleme.
* **Mesaj:** *"Hocam, IUS PowerHub projemizde donanım ve batarya güvenliği en birinci önceliğimiz. Devrelerde termal sensörler, BMS koruması ve endüstriyel standartta manyetik pogo-pin konnektörler kullanacağız. FENS laboratuvarlarında sizin mentorluğunuzda donanım ve gömülü sistemler takımımızı kurmak istiyoruz."*

### 3. 📣 Velida Handžić-Mirica (UCO Yöneticisi — Üniversite İletişim Ofisi)
* **Vurgulanacak Nokta:** Üniversite marka değeri, tanıtım günleri (Open Days) ve kampüs inovasyonu.
* **Mesaj:** *"Velida Hanım, bu proje üniversitemizin prestijini doğrudan yükseltecek. İstasyonların üzerine IUS ve kulüp logolarımızı yerleştireceğiz. Liselerden üniversite tanıtımına gelen aday öğrencilere 'Bizim mühendislik öğrencilerimiz kampüste kendi RFID şarj istasyonlarını üretti' demek IUS adına muazzam bir kurumsal PR başarısıdır."*

### 4. ⚖️ Assoc. Prof. Dr. Ena Kazić-Çakar (Hukuk Fakültesi — FUS)
* **Vurgulanacak Nokta:** Tüzük disiplini, veri güvenliği (KVKK/GDPR) ve üniversite kurallarına %100 uyum.
* **Mesaj:** *"Hocam, kulübümüz IUS Tüzüğü Madde 77'ye ve SCC yönetmeliğine harfiyen bağlı olarak kuruldu. PowerHub sisteminde hiçbir kişisel veri depolanmayacak; sadece öğrenci kartının UID numarasıyla geçici zimmet kaydı tutulacak. Şeffaf, denetlenebilir ve kurallara tam uyumlu bir kulüp yapısı inşa ettik."*

### 5. 🔬 Prof. Dr. Leila Miller (Akademik Danışmanımız — FENS)
* **Vurgulanacak Nokta:** Matematiksel ve mühendislik düşünce, disiplinlerarası entegrasyon ve fakülte birliği.
* **Mesaj:** *"Leila Hocam, danışmanlığınızda FENS'in Bilgisayar, Elektrik, Makine ve Endüstri bölümlerini tek çatı altında birleştiren ilk büyük topluluğu kurduk. Haftalık akademik atölyeler ve projelerle öğrencilerimizin ders başarılarını ve teknik özgüvenlerini artıracağız."*

### 6. 🏛️ Assoc. Prof. Dr. Altijana Hromić-Jahjefendić (FENS Dekanı)
* **Vurgulanacak Nokta:** Saraybosna teknoloji ekosistemi entegrasyonu, DevHack 2027 ve fakülte istihdamı.
* **Mesaj:** *"Sayın Dekanım, amacımız FENS'i Bosna-Hersek'in en aktif ve saygın mühendislik fakültesi konumuna taşımak. Saraybosna yazılım firmalarıyla (Bit Alliance) ortak hackathonlar ve zirveler düzenleyerek mezunlarımızın işe alım oranlarını yukarı taşıyacağız."*

---

## 🚀 3. HOCALARA SUNULACAK 5 TEMEL KULÜP PROJESİ ÖZETİ

| # | Proje Adı | Türü | Hedef Kitle | Fakülteye & Kampüse Faydası |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **IUS PowerHub** | Donanım & IoT | Tüm IUS Öğrencileri | Kampüste priz sorununu çözer; öğrencilerin geliştirdiği yerli teknoloji prototipidir. |
| **2** | **IUS DevHack 2027** | 24 Saatlik Hackathon | 80+ Mühendislik Öğrencisi | FENS laboratuvarlarında 24 saat aralıksız yazılım geliştirme maratonu; sektör jürisi ve sponsorlar. |
| **3** | **IUS TechSummit 2027** | Yıllık Teknoloji Zirvesi | 150+ Öğrenci & Şirketler | Amfide sektör liderleri, paneller ve doğrudan staj/iş mülakat stantları. |
| **4** | **Haftalık Hands-On AI Labs** | Düzenli Atölye | 30–50 Öğrenci / Hafta | Cursor, Claude, LLM prompt mühendisliği ve modern yazılım akran eğitimi. |
| **5** | **The Marshmallow Challenge** | Lansman & Prototipleme | Tüm Kampüs (100+ Kişi) | Multidisipliner mühendislik ruhunu aşılayan interaktif açılış turnuvası. |

---

## 📌 Sunum ve Görüşme Notları:
* **Tutum:** Saygılı, mütevazı ama teknik vizyonu son derece yüksek ve hazırlıklı bir öğrenci liderliği sergilenmelidir.
* **Destek Talebi:** Okuldan nakit bütçe yerine amfi/laboratuvar kullanım izinleri, 3D yazıcı desteği ve akademik rehberlik talep edilmelidir. Bu yaklaşım komisyon hocalarının desteğini %100 garanti altına alır.
