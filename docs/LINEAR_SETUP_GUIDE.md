# Linear & Antigravity IDE Entegrasyon Kılavuzu ⚡

**Linear masaüstü uygulaması bilgisayarınıza başarıyla kuruldu ve ekranınızda açıldı!**

Linear, Trello gibi 10 kişi sınırına takılmaz; 15-20+ kişilik ekibinizi **%100 ücretsiz** ve ultra-hızlı bir şekilde yönetebilirsiniz.

---

### 1. Adım: Linear'a Giriş Yapın & Kulüp Alanınızı Oluşturun
1. Açılan Linear uygulamasında (veya [linear.app](https://linear.app) adresinde):
   * **"Log in with Google"** diyerek ücretsiz giriş yapın.
   * Workspace adı: `IUS Engineering Events`
   * Bir Takım (Team) adı sorarsa: `Engineering Events` (Kısaltma/Key: `IEE`) olarak belirleyebilirsiniz.

---

### 2. Adım: API Anahtarını Alın (30 Saniye)
Antigravity IDE'nin sizin adınıza tek bir cümlenizle Linear'da görev açabilmesi için:
1. Linear uygulamasında sol üstteki profilinize tıklayın $\rightarrow$ **Settings (Ayarlar)** seçeneğine gidin.
2. Sol menüden **"Security & Access"** (veya **API**) sekmesine tıklayın.
3. **"Personal API Keys"** başlığı altından **"Create Key"** butonuna basın.
4. Çıkan anahtarı (`lin_api_...`) kopyalayın.

---

### 3. Adım: Antigravity IDE ile Bağlama
Bu kodu chat'ten bana iletmeniz (veya terminalden çalıştırmanız) yeterli:
```bash
python scripts/linear_manager.py configure <API_KEY>
```

---

### 4. Ekip Arkadaşlarınızı Davet Edin
* Sol menüdeki **Settings $\rightarrow$ Members** kısmından ekipteki 15-20 arkadaşınızın e-postalarını girerek davet linki gönderin.
* Arkadaşlarınız App Store / Google Play'den **Linear** uygulamasını indirip giriş yaptıklarında, atadığınız tüm görevler anında ceplerine düşecek!

---

### 🎯 IDE Üzerinden Nasıl Görev Atayacaksınız?
Her şey bağlandığında sadece chat'e şunu yazmanız yeterli olacak:
* *"Kaan, Mehmet'e 'A-Block Amfi salonu rezervasyon dilekçesini SKS'ye ver' görevi ata, teslim tarihi cuma olsun"*
* *"Yazılım ekibine 'Hackathon afiş ve web sitesi tasarımlarını tamamla' task'i aç"*

Linear arayüzünde görev anında belirecek ve Mehmet'in telefonuna bildirim gidecek! 🚀
