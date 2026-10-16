import type { SupportedLocale } from "@/lib/i18n/translations";

/** Public blog: listing, post detail, share bar, comments and code blocks. Post content itself is never translated. */
const tr = {
  meta: {
    listTitle: "Blog",
    listDescription:
      "FENS öğrencilerinden donanım projeleri, açık kaynak yazılımlar, yapay zekâ deneyleri ve hackathon notları.",
    notFoundTitle: "Yazı bulunamadı",
  },
  catalog: {
    title: "Blog",
    intro: "Kulüp üyelerinin projeleri ve etkinlikleri hakkında yazdıkları.",
    rss: "RSS akışı",
    rssLabel: "RSS akışı (yeni sekmede açılır)",
    write: "Yazı yaz",
    loading: "Yazılar yükleniyor...",
    emptyTitle: "Henüz yayınlanmış yazı yok",
    emptyHint: "Üyelerimizin ilk yazıları yakında burada olacak.",
    searchLabel: "Yazılarda ara",
    searchPlaceholder: "Başlık, konu, yazar veya etiket ara (örn. ESP32, RAG)",
    clearSearch: "Temizle",
    clearSearchLabel: "Aramayı temizle",
    categoriesLabel: "Kategoriye göre filtrele",
    tagsLabel: "Etiketler",
    removeTag: "Etiketi kaldır",
    noResultsTitle: "Aramanızla eşleşen yazı bulunamadı",
    noResultsHint: "Farklı bir arama terimi deneyin veya filtreleri temizleyin.",
    resetFilters: "Filtreleri sıfırla",
    resultCount: (count: number) => `${count} yazı listeleniyor`,
    likePost: (title: string, count: number) => `"${title}" yazısını beğen (${count} beğeni)`,
    likeFailed: "Beğeni kaydedilemedi. Lütfen tekrar deneyin.",
  },
  auth: {
    signInToLike: "Yazıları beğenmek için giriş yapın.",
    signIn: "Giriş yap",
  },
  categories: {
    all: "Tüm yazılar",
    embedded: "Gömülü Sistemler",
    culture: "Mühendislik Kültürü",
    ai: "Yapay Zekâ",
    events: "Etkinlikler & Hackathon",
    general: "Genel",
  },
  post: {
    backToAll: "Tüm yazılara dön",
    readingTime: (minutes: number) => `${minutes} dk okuma`,
    readingTimeShort: (minutes: number) => `${minutes} dk`,
    publishedOn: "Yayın tarihi",
    tags: "Etiketler",
    related: "Benzer yazılar",
  },
  bar: {
    actionsLabel: "Yazı işlemleri",
    like: "Yazıyı beğen",
    liked: "Beğendiniz",
    likeCount: (count: number) => `${count} beğeni`,
    likeFailed: "Beğeni kaydedilemedi. Lütfen tekrar deneyin.",
    share: "Paylaş:",
    shareWhatsApp: "WhatsApp'ta paylaş",
    shareX: "X'te paylaş",
    shareLinkedIn: "LinkedIn'de paylaş",
    newTab: "(yeni sekmede açılır)",
    copyLink: "Bağlantıyı kopyala",
    copy: "Kopyala",
    copied: "Kopyalandı",
    copyFailed: "Kopyalanamadı",
    linkCopied: "Bağlantı panoya kopyalandı.",
  },
  comments: {
    heading: "Yorumlar",
    count: (count: number) => `${count} yorum`,
    signedInAs: "Oturum açık:",
    commentLabel: "Yorumunuz",
    commentPlaceholder: "Sorunuzu, geri bildiriminizi veya katkınızı yazın",
    plainTextNote: "Yorumlar düz metin olarak gösterilir.",
    submit: "Yorum gönder",
    submitting: "Gönderiliyor...",
    minLength: "Yorum en az 3 karakter olmalı.",
    saveFailed: "Yorum kaydedilemedi. Lütfen tekrar deneyin.",
    published: "Yorumunuz yayınlandı.",
    signInTitle: "Tartışmaya katılın",
    signInBody: "Yorum yazmak veya soru sormak için üye portalına giriş yapın.",
    signInCta: "Giriş yap veya kayıt ol",
    empty: "Henüz yorum yok. İlk yorumu siz yazabilirsiniz.",
    listLabel: "Yorum listesi",
    repliesLabel: (name: string) => `${name} adlı üyenin yorumuna gelen yanıtlar`,
    reply: "Yanıtla",
    replyLabel: "Yanıtınız",
    replyPlaceholder: "Yanıtınızı yazın",
    sendReply: "Yanıtı gönder",
    cancel: "İptal",
    report: (name: string) => `${name} adlı üyenin yorumunu moderasyon için işaretle`,
    reported: "Bu yorum işaretlendi",
    reportDone: "Yorum moderasyon için işaretlendi.",
    reportFailed: "Yorum işaretlenemedi. Lütfen tekrar deneyin.",
  },
  code: {
    fallbackLanguage: "kod",
    copy: "Kodu kopyala",
    copied: "Kopyalandı",
    copyFailed: "Kopyalanamadı",
  },
};

const en: typeof tr = {
  meta: {
    listTitle: "Blog",
    listDescription:
      "Hardware projects, open-source software, AI experiments and hackathon notes from FENS students.",
    notFoundTitle: "Post not found",
  },
  catalog: {
    title: "Blog",
    intro: "Club members writing about their projects and events.",
    rss: "RSS feed",
    rssLabel: "RSS feed (opens in a new tab)",
    write: "Write a post",
    loading: "Loading posts...",
    emptyTitle: "No posts yet",
    emptyHint: "Our members' first posts will appear here soon.",
    searchLabel: "Search posts",
    searchPlaceholder: "Search by title, topic, author or tag (e.g. ESP32, RAG)",
    clearSearch: "Clear",
    clearSearchLabel: "Clear search",
    categoriesLabel: "Filter by category",
    tagsLabel: "Tags",
    removeTag: "Remove tag",
    noResultsTitle: "No posts match your search",
    noResultsHint: "Try a different search term or clear the filters.",
    resetFilters: "Reset filters",
    resultCount: (count: number) => (count === 1 ? "Showing 1 post" : `Showing ${count} posts`),
    likePost: (title: string, count: number) =>
      `Like "${title}" (${count} ${count === 1 ? "like" : "likes"})`,
    likeFailed: "Your like could not be saved. Please try again.",
  },
  auth: {
    signInToLike: "Sign in to like posts.",
    signIn: "Sign in",
  },
  categories: {
    all: "All posts",
    embedded: "Embedded Systems",
    culture: "Engineering Culture",
    ai: "Artificial Intelligence",
    events: "Events & Hackathons",
    general: "General",
  },
  post: {
    backToAll: "Back to all posts",
    readingTime: (minutes: number) => `${minutes} min read`,
    readingTimeShort: (minutes: number) => `${minutes} min`,
    publishedOn: "Published on",
    tags: "Tags",
    related: "Related posts",
  },
  bar: {
    actionsLabel: "Post actions",
    like: "Like this post",
    liked: "Liked",
    likeCount: (count: number) => (count === 1 ? "1 like" : `${count} likes`),
    likeFailed: "Your like could not be saved. Please try again.",
    share: "Share:",
    shareWhatsApp: "Share on WhatsApp",
    shareX: "Share on X",
    shareLinkedIn: "Share on LinkedIn",
    newTab: "(opens in a new tab)",
    copyLink: "Copy link",
    copy: "Copy",
    copied: "Copied",
    copyFailed: "Could not copy",
    linkCopied: "Link copied to clipboard.",
  },
  comments: {
    heading: "Comments",
    count: (count: number) => (count === 1 ? "1 comment" : `${count} comments`),
    signedInAs: "Signed in as",
    commentLabel: "Your comment",
    commentPlaceholder: "Share a question, some feedback or your own take",
    plainTextNote: "Comments are shown as plain text.",
    submit: "Post comment",
    submitting: "Posting...",
    minLength: "Comments need at least 3 characters.",
    saveFailed: "Your comment could not be saved. Please try again.",
    published: "Your comment has been posted.",
    signInTitle: "Join the discussion",
    signInBody: "Sign in to the member portal to comment or ask a question.",
    signInCta: "Sign in or sign up",
    empty: "No comments yet. Be the first to share your thoughts.",
    listLabel: "Comments",
    repliesLabel: (name: string) => `Replies to ${name}`,
    reply: "Reply",
    replyLabel: "Your reply",
    replyPlaceholder: "Write your reply",
    sendReply: "Send reply",
    cancel: "Cancel",
    report: (name: string) => `Flag comment by ${name} for moderation`,
    reported: "This comment is flagged",
    reportDone: "Comment flagged for moderation.",
    reportFailed: "This comment could not be flagged. Please try again.",
  },
  code: {
    fallbackLanguage: "code",
    copy: "Copy code",
    copied: "Copied",
    copyFailed: "Could not copy",
  },
};

export const blogText = { tr, en };

export type BlogText = typeof tr;

/** Category values stored with posts (Turkish), mapped to dictionary keys. */
const CATEGORY_KEYS: Record<string, keyof BlogText["categories"]> = {
  "gömülü sistemler": "embedded",
  "mühendislik kültürü": "culture",
  "yapay zekâ": "ai",
  "yapay zeka": "ai",
  etkinlikler: "events",
  genel: "general",
};

/** Filter chips on the listing; `value` is what posts store, so filtering keeps working in both languages. */
export const BLOG_CATEGORY_FILTERS: { value: string; key: keyof BlogText["categories"] }[] = [
  { value: "all", key: "all" },
  { value: "Gömülü Sistemler", key: "embedded" },
  { value: "Mühendislik Kültürü", key: "culture" },
  { value: "Yapay Zekâ", key: "ai" },
  { value: "Etkinlikler", key: "events" },
];

/** Translates a known category; a custom category (posts use their first tag) is shown as written. */
export function blogCategoryLabel(category: string, locale: SupportedLocale): string {
  const key = CATEGORY_KEYS[category.trim().toLocaleLowerCase("tr-TR")];
  return key ? blogText[locale].categories[key] : category;
}

/** Sign-in link that brings the visitor back to `path` afterwards. */
export function blogSignInHref(path: string): string {
  return `/portal/giris?redirect=${encodeURIComponent(path)}`;
}
