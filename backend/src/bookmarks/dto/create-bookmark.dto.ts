export class CreateBookmarkDto {
  url: string;
  title: string;
  description?: string;
  faviconUrl?: string;
  isFavorite?: boolean;
}