export interface StoredGroup {
  id?: string;
  token: string;
  chatid: string;
  emoji?: string;
  media?: string;
  mediaType?: "video" | "photo";
}
