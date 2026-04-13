"use client";

import type { SWRConfiguration } from "swr";

interface FetcherError extends Error {
  status: number;
}

// Base fetcher for SWR
export const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.") as FetcherError;
    error.status = res.status;
    throw error;
  }
  return res.json();
};

// Post fetcher for mutations
export const postFetcher = async <T>(
  url: string,
  { arg }: { arg: Record<string, unknown> },
): Promise<T> => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });
  if (!res.ok) {
    const error = new Error("An error occurred while posting data.") as FetcherError;
    error.status = res.status;
    throw error;
  }
  return res.json();
};

// Delete fetcher for mutations
export const deleteFetcher = async <T>(
  url: string,
  { arg }: { arg: { recipeId?: string; exerciseId?: string } },
): Promise<T> => {
  const searchParams = new URLSearchParams();
  if (arg.recipeId) searchParams.append("recipeId", arg.recipeId);
  if (arg.exerciseId) searchParams.append("exerciseId", arg.exerciseId);

  const fullUrl = searchParams.toString() ? `${url}?${searchParams.toString()}` : url;

  const res = await fetch(fullUrl, {
    method: "DELETE",
  });
  if (!res.ok) {
    const error = new Error("An error occurred while deleting data.") as FetcherError;
    error.status = res.status;
    throw error;
  }
  return res.json();
};

// Default SWR config
export const defaultSWRConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 5000,
  errorRetryCount: 3,
};

// SWR keys
export const swrKeys = {
  favorites: {
    recipes: "/api/favorites/recipes",
    exercises: "/api/favorites/exercises",
  },
  recipes: {
    all: "/api/recipes",
    bySlug: (slug: string) => `/api/recipes/${slug}`,
  },
  exercises: {
    all: "/api/exercises",
    byId: (id: string) => `/api/exercises/${id}`,
  },
  user: {
    profile: "/api/user/profile",
    calculations: "/api/calculations",
  },
} as const;
