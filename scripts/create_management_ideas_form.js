function createManagementIdeasForm() {
  // 1. Formu Oluştur
  const formTitle = "IUS Engineering Club — Yönetim Fikir & Proje Havuzu 💡";
  const form = FormApp.create(formTitle);
  
  form.setDescription(
    "IUS Engineering Club Yönetim Kurulu & Çekirdek Ekip Fikir Havuzu.\n\n" +
    "Aklına gelen yeni bir etkinlik, yazılım/donanım projesi, sponsorluk fikri veya kampüs girişimi mi var? " +
    "Hiç çekinmeden hemen buraya yaz! Bu form sınırsızdır, aklına her yeni fikir geldiğinde tekrar gönderebilirsin.\n\n" +
    "Toplanan fikirler yönetim kurulu toplantılarında değerlendirilip doğrudan Linear ve yol haritamıza (Roadmap) eklenecektir."
  );

  // Sınırsız gönderime izin ver (tek yanıt sınırlamasını kapat)
  form.setLimitOneResponsePerUser(false);
  form.setAllowResponseEdits(true);
  form.setProgressBar(true);

  // ================= BÖLÜM 1: GÖNDEREN BİLGİSİ =================
  const nameItem = form.addListItem();
  nameItem.setTitle("Fikri Paylaşan Yönetim Üyesi")
          .setHelpText("Kim olduğunu seç (veya diğer seçeneğiyle adını belirt).")
          .setChoiceValues([
            "Hasan Kaan (Başkan)",
            "Mahmut İhsan Avcı (Başkan Yrd. / Operasyon)",
            "Bekir Enes Çokbekler (Sayman / Finans)",
            "Muhammed Efe Ural (PR & Sosyal Medya / Sponsorluk)",
            "Bakir Bašić (Kurumsal PR)",
            "Diğer Çekirdek Ekip Üyesi"
          ])
          .setRequired(true);

  // ================= BÖLÜM 2: FİKİR & PROJE DETAYLARI =================
  form.addPageBreakItem().setTitle("Proje / Fikir Detayları");

  // Soru 2: Fikir Başlığı
  const titleItem = form.addTextItem();
  titleItem.setTitle("Fikrin / Projenin Başlığı")
           .setHelpText("Kısa, akılda kalıcı ve çarpıcı bir başlık (Örn: IUS 3D Yazıcı Paylaşım Ağı, Gece Kodlama Maratonu, Bit Alliance Ofis Gezisi)")
           .setRequired(true);

  // Soru 3: Kategori
  const categoryItem = form.addCheckboxItem();
  categoryItem.setTitle("Fikrin Alanı / Kategorisi")
              .setHelpText("Birden fazla işaretleyebilirsin.")
              .setChoiceValues([
                "💻 Yazılım & Yapay Zeka (AI / Web / App / Bootcamp)",
                "⚙️ Multidisipliner Mühendislik & Donanım (Robotik, IoT, 3D Print)",
                "🏆 Hackathon & Yarışma (DevHack vb.)",
                "🎤 Konferans / Seminer / Tech-Talk (IUS TechSummit vb.)",
                "🏢 Şirket Ziyareti & Sanayi Gezisi",
                "🍕 Kampüs Sosyal & Topluluk Etkinliği (Marshmallow vb.)",
                "💰 Sponsorluk & Finansman Fırsatı",
                "📱 PR, Sosyal Medya & İçerik Kampanyası"
              ])
              .showOtherOption(true)
              .setRequired(true);

  // Soru 4: Problem ve Çözüm (Make Sense)
  const problemItem = form.addParagraphTextItem();
  problemItem.setTitle("Hangi Sorunu Çözüyor veya Ne Kazandıracak?")
             .setHelpText("Bu proje IUS mühendislik öğrencilerine veya kulübümüze ne katacak? Neden yapmalıyız?")
             .setRequired(true);

  // Soru 5: Detaylı Açıklama
  const descItem = form.addParagraphTextItem();
  descItem.setTitle("Fikrin / Projenin Detaylı İşleyişi")
          .setHelpText("Aklındaki plan nedir? Adım adım nasıl işleyecek, ne yapılacak?")
          .setRequired(true);

  // Soru 6: Hedef Kitle
  const audienceItem = form.addMultipleChoiceItem();
  audienceItem.setTitle("Hedef Kitle")
              .setChoiceValues([
                "Tüm IUS Öğrencileri (Açık Katılım)",
                "Sadece FENS Mühendislik Öğrencileri",
                "Sadece Yazılım / CS / SE Öğrencileri",
                "Sadece Kulüp Yönetim & Aktif Proje Ekipleri",
                "Dış Katılımcılar (Diğer Üniversiteler / Bosna Genel)"
              ])
              .setRequired(true);

  // ================= BÖLÜM 3: UYGULANABİLİRLİK & KAYNAK =================
  form.addPageBreakItem().setTitle("Uygulanabilirlik & İhtiyaçlar");

  // Soru 7: Bütçe ve Kaynak İhtiyacı
  const budgetItem = form.addMultipleChoiceItem();
  budgetItem.setTitle("Tahmini Maliyet & Bütçe İhtiyacı")
            .setHelpText("Projenin gerçekleşmesi için finansman gerekir mi?")
            .setChoiceValues([
              "🟢 Sıfır Maliyet (Sadece organizasyon & zaman gerekir)",
              "🟡 Düşük Bütçe (< 100 KM - Basit kırtasiye, atıştırmalık vb.)",
              "🟠 Orta Bütçe (100 - 400 KM - Sertifika, küçük ödül, malzeme)",
              "🔴 Sponsor / Büyük Bütçe (400+ KM - Şirket sponsoru şart)"
            ])
            .setRequired(true);

  // Soru 8: Zaman ve Zorluk
  const feasibilityItem = form.addScaleItem();
  feasibilityItem.setTitle("Zorluk / Zaman Skalası")
                 .setHelpText("1: Çok Kolay (Hemen bu hafta yapılabilir)  ---  5: Çok Kapsamlı (1-2 ay hazırlık gerektirir)")
                 .setBounds(1, 5)
                 .setLabels("Çok Hızlı / Kolay", "Büyük / Kapsamlı")
                 .setRequired(true);

  // Soru 9: Sorumluluk / Liderlik
  const leadItem = form.addMultipleChoiceItem();
  leadItem.setTitle("Bu Fikrin Sorumluluğunu Kim Üstlensin?")
          .setChoiceValues([
            "🙋 Bu fikrin liderliğini bizzat ben yürütmek istiyorum!",
            "🤝 Bir ekip kuralım, ben de içinde yer alırım.",
            "💡 Sadece fikir olarak öneriyorum, uygun biri yürütsün.",
            "👑 Yönetim kurulunda ortak oylayalım."
          ])
          .setRequired(true);

  // Soru 10: İlk Somut Adım
  const firstStepItem = form.addParagraphTextItem();
  firstStepItem.setTitle("Bu Fikri Hayata Geçirmek İçin Atılacak 'İlk Somut Adım' Ne Olmalı?")
               .setHelpText("Örn: Dekanla görüşmek, hocalara mail atmak, afiş tasarlamak, salonda yer ayırtmak...")
               .setRequired(false);

  // Soru 11: Ekler ve Linkler
  const linksItem = form.addParagraphTextItem();
  linksItem.setTitle("Referans Linkler, Örnekler veya Ek Notlar")
           .setHelpText("Varsa benzer etkinliğin linki, GitHub reposu, Figma tasarımı veya YouTube videosu.")
           .setRequired(false);

  // Sonuç Linklerini Yazdır
  Logger.log("✅ FORM BAŞARIYLA OLUŞTURULDU!");
  Logger.log("📝 Düzenleme Linki (Admin): " + form.getEditUrl());
  Logger.log("🌐 Yanıt Verme Linki (Paylaşım): " + form.getPublishedUrl());
}
