/**
 * Board member portraits for the About page.
 *
 * To add a photo: save it as public/team/<file>.jpg (portrait, 4:5, at least 800x1000 px, face
 * roughly in the upper third) and set the entry below to "/team/<file>.jpg". Until then the card
 * shows the member's initials on the palette gradient, at the same size, so nothing shifts later.
 */
export const BOARD_PHOTOS: Record<string, string | null> = {
  "Kaan Mete Şenyıldız": "/team/kaan-mete-senyildiz.jpg",
  "Hasan Kaan Karabulut": null, // /team/hasan-kaan-karabulut.jpg
  "Mahmut İhsan Avcı": null, // /team/mahmut-ihsan-avci.jpg
  "Bekir Enes Çokbekler": "/team/bekir-enes-cokbekler-v2.jpg",
  "Muhammed Efe Ural": "/team/muhammed-efe-ural.jpg",
};
