export interface BlogPostItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  category: "Gömülü Sistemler" | "Mühendislik Kültürü" | "Yapay Zekâ" | "Etkinlikler" | "Genel";
  tags: string[];
  readingTimeMin: number;
  status: "published" | "draft" | "archived";
  likesCount: number;
  viewsCount: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogCommentItem {
  id: string;
  postId: string;
  postSlug: string;
  parentId?: string | null;
  userId: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  content: string;
  isFlagged: boolean;
  createdAt: string;
  replies?: BlogCommentItem[];
}

export const initialBlogPosts: BlogPostItem[] = [
  {
    id: "post-1",
    slug: "esp32-rfid-iot-station-architecture",
    title: "ESP32 ve RFID ile Otonom Güç İstasyonu Mimarisi",
    excerpt: "IUS PowerHub projesinde SPI bus yönetimi, MQTT telemetrisi ve öğrenci kartı yetkilendirme katmanını nasıl tasarladık?",
    coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    authorId: "usr-1",
    authorName: "Hasan Kaan Karabulut",
    authorRole: "Donanım Lideri & Kurucu Başkan",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    category: "Gömülü Sistemler",
    tags: ["ESP32", "RFID", "IoT", "MQTT", "Hardware"],
    readingTimeMin: 5,
    status: "published",
    likesCount: 28,
    viewsCount: 342,
    publishedAt: "2026-10-14T10:00:00Z",
    createdAt: "2026-10-14T09:30:00Z",
    updatedAt: "2026-10-14T10:00:00Z",
    content: `# ESP32 ve RFID ile Otonom Güç İstasyonu Mimarisi

Kampüs içi ortak çalışma alanlarında en sık karşılaşılan problem, öğrencilerin priz bulma ve kablo kargaşası yaşamasıdır. **IUS PowerHub** projesiyle, FENS A-Blok koridorlarına yerleştirilecek modüler bir akıllı şarj istasyonu geliştirdik.

## Donanım Mimarisi ve Bileşen Seçimi

İstasyonun ana beyni olarak **ESP32-WROOM-32D** mikrokontrolcüsünü tercih ettik. Sebepleri:
- Çift çekirdekli 240 MHz Tensilica Xtensa mimarisi.
- Dahili Wi-Fi (802.11 b/g/n) ve BLE desteği.
- Çoklu donanım SPI ve I2C hatları sayesinde sensör ve ekran yönetiminin kolaylığı.

\`\`\`cpp
#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <PubSubClient.h>

#define SS_PIN    5
#define RST_PIN   22
#define RELAY_PIN 26

MFRC522 mfrc522(SS_PIN, RST_PIN);
WiFiClient espClient;
PubSubClient mqttClient(espClient);

void setup() {
  Serial.begin(115200);
  SPI.begin();
  mfrc522.PCD_Init();
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);
  connectToCampusNetwork();
}
\`\`\`

## SPI Bus Çakışmalarını Önleme

RC522 RFID okuyucu modülü ile 1.3 inç OLED ekran aynı SPI hattını paylaştığında donanım kilitlenmeleri gözlemledik. Çözüm olarak:
1. CS (Chip Select) pinlerini net lojik seviyelerle ayırdık.
2. RFID tarama döngüsünü FreeRTOS Task'ı olarak Core 1'e aldık.
3. Telemetri ve MQTT iletişimini Core 0'da çalıştırdık.

> "Gömülü sistemlerde paralel iş parçacıklarını donanım çekirdeklerine bölmek, SPI ve I2C kilitlenmelerini %90 oranında ortadan kaldırır."

## Güvenlik ve Öğrenci Kartı Entegrasyonu

Mifare Classic 1K kartların UID değerleri doğrudan veritabanında saklanmaz. Bunun yerine SHA-256 ile tuzlanmış hash biçiminde Supabase IoT yetkilendirme tablosuna iletilir. Sunucu onay verdiğinde istasyon rölesi 60 dakikalık şarj seansını başlatır.

### Sonraki Adımlar
DevHack 2027 maratonunda bu istasyona solar panel şarj denetleyicisi (MPPT) ve mobil uygulama üzerinden rezervasyon yeteneği kazandıracağız. Katılmak isteyen tüm elektrik ve bilgisayar mühendisliği öğrencilerini atölyemize bekliyoruz!
`,
  },
  {
    id: "post-2",
    slug: "linear-task-driven-student-club-management",
    title: "Öğrenci Kulübünü Modern Bir Teknoloji Şirketi Gibi Yönetmek",
    excerpt: "WhatsApp kaosundan Linear sprintlerine geçiş: Görev atama, pull request takibi ve şeffaf bütçe mimarisi.",
    coverImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    authorId: "usr-2",
    authorName: "Mahmut İhsan Avcı",
    authorRole: "Başkan Yardımcısı & Operasyon Lideri",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    category: "Mühendislik Kültürü",
    tags: ["Linear", "Agile", "Productivity", "Leadership", "IEC"],
    readingTimeMin: 4,
    status: "published",
    likesCount: 22,
    viewsCount: 289,
    publishedAt: "2026-10-12T14:00:00Z",
    createdAt: "2026-10-12T13:00:00Z",
    updatedAt: "2026-10-12T14:00:00Z",
    content: `# Öğrenci Kulübünü Modern Bir Teknoloji Şirketi Gibi Yönetmek

Geleneksel üniversite kulüplerinin en büyük zaafı, tüm iletişimin kontrolsüz WhatsApp gruplarına ve kaybolan Google Drive bağlantılarına sıkışmasıdır. Görevlerin kimde olduğu unutulur, teslim tarihleri aksar ve yeni katılan üyeler ne yapacağını bilemez.

## Linear Geçişi ve Sprint Döngüleri

IEC yönetim kurulunu kurarken aldığımız ilk radikal karar şuydu: **Kulübü bir startup gibi işleteceğiz.**

Her hafta pazartesi günü 15 dakikalık sanal standup ile haftalık hedefleri belirliyoruz:
- **Triage**: Yeni gelen üyelik başvuruları ve proje teklifleri havuzda toplanır.
- **Backlog**: Onaylanan ancak hemen başlanmayacak görevler (örneğin Marshmallow Challenge malzeme listesi).
- **In Progress**: O hafta üzerinde çalışılan somut çıktılar (afiş tasarımı, dilekçe teslimi, kod geliştirme).
- **Done**: Yayına alınan veya resmi onaydan geçen işler.

## Şeffaf Sorumluluk ve Roller

Linear'da her görevin tek bir *Assignee* (Sorumlusu) ve bir teslim tarihi (DueDate) vardır:
- *PR & Sosyal Medya*: Afiş revizyonları ve Instagram Reels kurguları.
- *Sayman*: 1.300 KM taslak bütçe ve sponsorluk teklif mektupları.
- *Yazılım Grubu*: Portal ve mobil uygulama repository commit'leri.

> "Eğer bir görevin iki sorumlusu varsa, aslında hiç kimse sorumlu değildir."

Bu kültürü benimsemek, mezun olduktan sonra Silikon Vadisi veya Avrupa merkezli uzaktan çalışan teknoloji firmalarında çalışacak arkadaşlarımız için paha biçilemez bir iş deneyimi sunuyor.
`,
  },
  {
    id: "post-3",
    slug: "local-rag-ollama-fens-labs",
    title: "FENS Laboratuvarlarında Yerel LLM ve RAG Kurulum Rehberi",
    excerpt: "RTX GPU'lar üzerinde Qwen 2.5 Coder ve Ollama ile kampüs içi gizli veri analiz istasyonu oluşturma adımları.",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    authorId: "usr-4",
    authorName: "Yazılım & AI Komitesi",
    authorRole: "Araştırma ve Geliştirme Çalışma Grubu",
    authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    category: "Yapay Zekâ",
    tags: ["Ollama", "Qwen", "LLM", "RAG", "Python", "GPU"],
    readingTimeMin: 7,
    status: "published",
    likesCount: 45,
    viewsCount: 512,
    publishedAt: "2026-10-10T11:00:00Z",
    createdAt: "2026-10-10T10:00:00Z",
    updatedAt: "2026-10-10T11:00:00Z",
    content: `# FENS Laboratuvarlarında Yerel LLM ve RAG Kurulum Rehberi

Mühendislik projelerinde ve akademik araştırmalarda yapay zekâ modellerinden faydalanırken veri gizliliği en hassas konulardan biridir. FENS Binasındaki yüksek performanslı RTX GPU'lara sahip bilgisayarlarda, buluta bağımlı olmadan 14B parametreli modelleri tam hızda çalıştırmak mümkündür.

## Neden Yerel Model (Local AI)?

1. **Sıfır Veri Sızıntısı**: Üniversite tezleri, sınav hazırlıkları ve tescillenmemiş donanım şemaları yerel ağdan dışarı çıkmaz.
2. **Sıfır API Maliyeti**: Token başına ücret ödemek zorunda kalmadan sınırsız sorgulama ve test imkânı.
3. **Düşük Gecikme**: Yerel PCIe veri yolu üzerinden 80+ token/saniye üretim hızı.

## Kurulum Adımları

Laboratuvar makinelerinde PowerShell üzerinden Ollama servisini başlatıyoruz:

\`\`\`powershell
# Qwen 2.5 Coder 14B modelini yerel GPU VRAM'ine çekme
ollama run qwen2.5-coder:14b

# Model yanıt hızını test etme
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2.5-coder:14b",
  "prompt": "Write a fast Python script using FAISS for dense vector search."
}'
\`\`\`

## ChromaDB ve Vektör Veritabanı ile RAG Hattı

Kulübün tüzüğünü, etkinlik formlarını ve FENS ders kataloglarını vektörel hale getirerek asistana bağladık:

\`\`\`python
import chromadb
from sentence_transformers import SentenceTransformer

embed_fn = SentenceTransformer('BAAI/bge-m3')
client = chromadb.PersistentClient(path="./iec_knowledge_store")
collection = client.get_or_create_collection(name="fens_documents")

# Doküman embedding indeksleme
collection.add(
    documents=["FENS Mühendislik Kulübü Tüzüğü Madde 4...", "DevHack 2027 Kuralları..."],
    metadatas=[{"source": "tuzuk.md"}, {"source": "hackathon.md"}],
    ids=["doc1", "doc2"]
)
\`\`\`

Bu altyapı, yakında portalımızdaki akıllı arama ve soru-cevap asistanının temelini oluşturacak.
`,
  },
  {
    id: "post-4",
    slug: "devhack-2027-sarajevo-hackathon-blueprint",
    title: "DevHack 2027: 24 Saatlik Saraybosna Hackathon Rehberi",
    excerpt: "Balkanların en dinamik üniversite hackathonuna hazırlanırken takım kurma, prototipleme ve jüri sunum stratejileri.",
    coverImage: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    authorId: "usr-3",
    authorName: "Bekir Enes Çokbekler",
    authorRole: "Finans & Etkinlik Koordinatörü",
    authorAvatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80",
    category: "Etkinlikler",
    tags: ["DevHack", "Hackathon", "Sarajevo", "Competition", "Students"],
    readingTimeMin: 6,
    status: "published",
    likesCount: 39,
    viewsCount: 420,
    publishedAt: "2026-10-08T09:00:00Z",
    createdAt: "2026-10-08T08:00:00Z",
    updatedAt: "2026-10-08T09:00:00Z",
    content: `# DevHack 2027: 24 Saatlik Saraybosna Hackathon Rehberi

Uluslararası Saraybosna Üniversitesi kampüsünde gerçekleştireceğimiz **DevHack 2027**, yazılım ve donanım geliştiricilerini 24 saat boyunca kesintisiz bir inovasyon maratonunda buluşturuyor.

## 3 Ana Yarışma Kategorisi

1. **Akıllı Kampüs & IoT**: Kampüs enerji verimliliği, kütüphane doluluk sensörleri ve akıllı lojistik çözümleri.
2. **Yapay Zekâ Destekli FinTech**: Balkan pazarına yönelik dijital ödeme, mikro-kredi ve finansal okuryazarlık algoritmaları.
3. **Açık Kaynak Sosyal Fayda**: Engelli öğrencilere yönelik erişilebilirlik araçları ve çok dilli afet koordinasyon yazılımları.

## Kazanma İpuçları

- **Fikir Değil Çalışan MVP**: Jüri slayt gösterisinden ziyade çalışan bir arayüz ve canlı API entegrasyonu görmek ister.
- **Takım Dinamiği**: 4 kişilik ideal bir takımda 1 Frontend/Tasarımcı, 1 Backend/DevOps, 1 Donanım/AI mühendisi ve 1 Sunum/Pitch lideri olmalıdır.
- **Zaman Yönetimi**: İlk 6 saatte mimariyi dondurun, sonraki 12 saatte kodlayın, son 6 saati hata ayıklama ve sunum provasına ayırın.
`,
  },
];

export const initialBlogComments: BlogCommentItem[] = [
  {
    id: "c-1",
    postId: "post-1",
    postSlug: "esp32-rfid-iot-station-architecture",
    userId: "usr-2",
    authorName: "Mahmut İhsan Avcı",
    authorRole: "Başkan Yardımcısı",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    content: "FreeRTOS task izolasyonu donanım stabilitesi açısından çok kritikti. Laboratuvardaki prototip testlerinde röle tepki süresi 80ms'nin altına indi.",
    isFlagged: false,
    createdAt: "2026-10-14T11:20:00Z",
    replies: [
      {
        id: "c-1-1",
        postId: "post-1",
        postSlug: "esp32-rfid-iot-station-architecture",
        parentId: "c-1",
        userId: "usr-1",
        authorName: "Hasan Kaan Karabulut",
        authorRole: "Donanım Lideri",
        authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        content: "Kesinlikle! Haftaya gelecek PCB baskılarıyla birlikte hat kayıplarını daha da düşüreceğiz.",
        isFlagged: false,
        createdAt: "2026-10-14T12:05:00Z",
      },
    ],
  },
  {
    id: "c-2",
    postId: "post-2",
    postSlug: "linear-task-driven-student-club-management",
    userId: "usr-6",
    authorName: "Nazlıcan Cebeci",
    authorRole: "Üye (IE)",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    content: "Bir endüstri mühendisliği öğrencisi olarak Linear Kanban panolarının ve döngülerin kulüpte bu kadar disiplinli kullanılması harika!",
    isFlagged: false,
    createdAt: "2026-10-13T09:15:00Z",
  },
  {
    id: "c-3",
    postId: "post-3",
    postSlug: "local-rag-ollama-fens-labs",
    userId: "usr-5",
    authorName: "Bakir Bašić",
    authorRole: "PR & Medya",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    content: "Yerel modellerin hızı şaşırtıcı seviyede. FENS laboratuvarındaki testlerin kısa bir demo videosunu resmi sosyal medyada da paylaşacağız.",
    isFlagged: false,
    createdAt: "2026-10-11T14:40:00Z",
  },
];
