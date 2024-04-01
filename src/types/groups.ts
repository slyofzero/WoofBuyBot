export interface StoredGroup {
  id?: string;
  token: string;
  chatId: number;
  emoji?: string;
  media?: string;
  mediaType?: "video" | "photo";
}
