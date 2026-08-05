import { useState, useEffect } from "react";
import { getContent } from "../lib/firestore";

// Statik fallback verisi
import {
  profile as fallbackProfile,
  paintings as fallbackGallery,
  aiProjects as fallbackAiProjects,
  personalWritings as fallbackWritings,
  experiences as fallbackExperiences,
  skills as fallbackSkills,
  contactArtworks as fallbackContactArtworks,
  timelineImages as fallbackTimelineImages,
} from "../data/content";

/**
 * Firestore'dan içerik çeken ve localStorage önbelleği kullanan hook.
 * İlk açılışta önceden kaydedilmiş veriyi anında gösterir, görsel sıçramalarını (flash of content) önler.
 *
 * @param {string} docId - Firestore doküman kimliği
 * @param {*} fallback - Firestore boşsa kullanılacak statik veri
 * @returns {{ data: any, loading: boolean, refresh: Function }}
 */
export function useContent(docId, fallback) {
  const cacheKey = `portfolio_cache_${docId}`;

  const [data, setData] = useState(() => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn("Cache read error:", e);
    }
    return fallback;
  });

  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const result = await getContent(docId);
    if (result !== null) {
      setData(result);
      try {
        localStorage.setItem(cacheKey, JSON.stringify(result));
      } catch (e) {
        console.warn("Cache write error:", e);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId]);

  return { data, loading, refresh: load };
}

// ---- Özel hook'lar (her içerik tipi için) ----

export function useProfile() {
  const { data, loading, refresh } = useContent("profile", {
    ...fallbackProfile,
    experiences: fallbackExperiences,
    skills: fallbackSkills,
  });

  const mergedData = {
    ...fallbackProfile,
    ...data,
    avatar: data?.avatar !== undefined ? data.avatar : fallbackProfile.avatar,
  };

  return { data: mergedData, loading, refresh };
}

export function useGallery() {
  return useContent("gallery", { artworks: fallbackGallery });
}

export function useAiProjects() {
  return useContent("aiProjects", { projects: fallbackAiProjects });
}

export function useWritings() {
  return useContent("writings", { personalWritings: fallbackWritings });
}

export function useCv() {
  return useContent("cv", {
    experiences: fallbackExperiences,
    skills: fallbackSkills,
    cvUrl: fallbackProfile.cv?.pdfUrl || "",
  });
}

export function useTimeline() {
  return useContent("timeline", { images: fallbackTimelineImages, experiences: fallbackExperiences });
}

export function useContact() {
  return useContent("contact", {
    email: fallbackProfile.email,
    location: fallbackProfile.location,
    artworks: fallbackContactArtworks,
  });
}
