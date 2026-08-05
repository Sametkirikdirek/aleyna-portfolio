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
} from "../data/content";

/**
 * Firestore'dan içerik çeken hook.
 * Firestore'da veri yoksa veya bağlantı başarısızsa, content.js fallback'ini kullanır.
 *
 * @param {string} docId - Firestore doküman kimliği
 * @param {*} fallback - Firestore boşsa kullanılacak statik veri
 * @returns {{ data: any, loading: boolean, refresh: Function }}
 */
export function useContent(docId, fallback) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const result = await getContent(docId);
    if (result !== null) {
      setData(result);
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
    avatar: data?.avatar || fallbackProfile.avatar,
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

export function useTimeline() {
  return useContent("timeline", { images: [] });
}

export function useCv() {
  return useContent("cv", {
    tr: fallbackProfile.cv?.tr || "",
    en: fallbackProfile.cv?.en || "",
  });
}

export function useContact() {
  return useContent("contact", {
    title: "Birlikte bir şey",
    titleHighlight: "inşa edelim.",
    subtitle:
      "İster bir tablo siparişi, ister bir yapay zeka projesi, ister sadece merhaba demek için — kapım açık. Tuval kadar net, kod kadar titiz bir iş birliği için yaz.",
    ctaText: "E-POSTA GÖNDER",
    artworks: fallbackContactArtworks,
  });
}
