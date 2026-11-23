export interface VoiceStatement {
  speaker: "Miracle" | "Oludamade" | "Both";
  initial: "M" | "O" | "O&M";
  text: string;
}

export interface StoryChapter {
  id: string;
  number: number;
  title: string;
  dateLabel?: string;
  tag?: string;
  imageFile: string;
  statements: VoiceStatement[];
}

export interface WeddingEvent {
  id: "engagement" | "church" | "reception";
  name: string;
  shortTime: string;
  timeDisplay: string;
  startIsoWat: string;
  endIsoWat: string;
  venue: string;
  address: string;
  mapsQuery: string;
  /** TODO: swap in exact Google Maps pin URL when confirmed */
  mapsUrl: string;
  description: string;
}

export interface HotelRecommendation {
  name: string;
  area: string;
  mapsUrl: string;
  /** TODO: add confirmed hotel phone number or booking URL */
  contactNote: string;
}

export interface WeddingPartyMember {
  name: string;
  role: string;
  initials: string;
  imageFile?: string;
}

export interface BankAccount {
  label: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  showColourSwatches?: boolean;
}

export interface ContactPerson {
  name: string;
  role: string;
  phoneDisplay: string;
  whatsappNumber: string;
  telHref: string;
}

export type GalleryCategory = "Together" | "Her" | "Him" | "Guest";

export interface GeneratedImage {
  fileName: string;
  src: string;
  width: number;
  height: number;
  orientation: "portrait" | "landscape" | "square";
  blurDataURL: string;
  alt: string;
  sizeBytes: number;
  sha256: string;
  isDuplicate: boolean;
}

export interface DriveUploadedFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  createdTime: string;
  thumbnailLink?: string;
  webViewLink?: string;
}

export interface DriveStorageQuota {
  limitBytes: number;
  usageBytes: number;
  remainingBytes: number;
  lowSpaceWarning: boolean;
}
