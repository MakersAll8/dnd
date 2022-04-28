import { useCallback, useLayoutEffect, useMemo, useState } from "react";

export type MediaName =
  | "phone"
  | "tablet_portrait"
  | "tablet_landscape"
  | "laptop"
  | "desktop";

export type MediaQueries = { queryText: string; mediaName: string }[];

export type MediaMatches =
  | {
      media: string;
      mediaQueryIndex: number;
      mediaName: string;
    }
  | undefined;

export const MEDIA_QUERIES = [
  { queryText: "(min-width: 1200px)", mediaName: "desktop" },
  { queryText: "(min-width: 992px)", mediaName: "laptop" },
  { queryText: "(min-width: 768px)", mediaName: "tablet_landscape" },
  { queryText: "(min-width: 576px)", mediaName: "tablet_portrait" },
  { queryText: "(min-width: 0px)", mediaName: "phone" },
];

export function useMediaQuery(mediaQueries: MediaQueries) {
  const [media, setMedia] = useState<MediaMatches[]>();

  const getMediaQueryLists = useCallback(() => {
    const mediaQueryLists = mediaQueries.map((query) => ({
      mediaQueryList: window.matchMedia(query.queryText),
      mediaName: query.mediaName,
    }));

    const matches: MediaMatches[] = mediaQueryLists.map(
      (mediaQueryList, index) => {
        if (mediaQueryList.mediaQueryList.matches === true) {
          return {
            media: mediaQueryList.mediaQueryList.media,
            mediaQueryIndex: index,
            mediaName: mediaQueryList.mediaName,
          };
        }
        return undefined;
      }
    );
    const mediaMatches = matches.filter((m) => m !== undefined);

    setMedia(mediaMatches);
  }, [mediaQueries]);

  useLayoutEffect(() => {
    const bodySizeObserver = new ResizeObserver(getMediaQueryLists);
    const body = document.querySelector("body") as HTMLBodyElement;
    bodySizeObserver.observe(body);
    return (): void => {
      bodySizeObserver.disconnect();
    };
  }, [getMediaQueryLists]);

  return { media };
}

export interface DropTargetColumnsReturn {
  columns: MediaColumns;
}

export type MediaColumns = 1 | 2 | 3;

export function useDropTargetColumns(): DropTargetColumnsReturn {
  const { media } = useMediaQuery(MEDIA_QUERIES);
  const columns = useMemo(() => {
    if (!media) {
      return 1;
    }
    const largestMatch = media[0];
    if (!largestMatch) {
      return 1;
    }
    switch (largestMatch.mediaName) {
      case "tablet_landscape":
      case "tablet_portrait":
      case "phone":
        return 1;
      case "laptop":
        return 2;
      case "desktop":
        return 3;
      default:
        return 1;
    }
  }, [media]);

  return { columns };
}
