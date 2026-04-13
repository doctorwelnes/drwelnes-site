export interface FavoriteItem {
  id: string;
  recipeId?: string;
  exerciseId?: string;
  createdAt: string;
}

export interface FavoritesResponse {
  favorites: FavoriteItem[];
}
