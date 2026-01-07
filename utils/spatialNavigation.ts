import { NavigationDirection } from "../types";

// A simple spatial navigation implementation for React Web apps acting as TV apps.
// It calculates the closest focusable element in the direction of the key press.

export const handleSpatialNavigation = (
  e: KeyboardEvent,
  containerClass: string = 'focusable'
) => {
  const currentElement = document.activeElement as HTMLElement;
  if (!currentElement) return;

  const direction = e.key;
  if (![NavigationDirection.UP, NavigationDirection.DOWN, NavigationDirection.LEFT, NavigationDirection.RIGHT].includes(direction as NavigationDirection)) {
    return;
  }

  e.preventDefault();

  const allFocusables = Array.from(document.querySelectorAll(`.${containerClass}`)) as HTMLElement[];
  if (allFocusables.length === 0) return;

  const currentRect = currentElement.getBoundingClientRect();
  const currentCenter = {
    x: currentRect.left + currentRect.width / 2,
    y: currentRect.top + currentRect.height / 2,
  };

  let bestCandidate: HTMLElement | null = null;
  let minDistance = Number.MAX_VALUE;

  allFocusables.forEach((candidate) => {
    if (candidate === currentElement) return;

    const rect = candidate.getBoundingClientRect();
    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    // Filter by direction
    let isValidDirection = false;
    switch (direction) {
      case NavigationDirection.RIGHT:
        isValidDirection = center.x > currentCenter.x;
        break;
      case NavigationDirection.LEFT:
        isValidDirection = center.x < currentCenter.x;
        break;
      case NavigationDirection.DOWN:
        isValidDirection = center.y > currentCenter.y;
        break;
      case NavigationDirection.UP:
        isValidDirection = center.y < currentCenter.y;
        break;
    }

    if (isValidDirection) {
      // Euclidean distance
      const dist = Math.sqrt(
        Math.pow(center.x - currentCenter.x, 2) + 
        Math.pow(center.y - currentCenter.y, 2)
      );

      // We prioritize alignment in the non-movement axis to avoid jumping rows unnecessarily
      let alignmentPenalty = 0;
      if (direction === NavigationDirection.LEFT || direction === NavigationDirection.RIGHT) {
        alignmentPenalty = Math.abs(center.y - currentCenter.y) * 2;
      } else {
        alignmentPenalty = Math.abs(center.x - currentCenter.x) * 2;
      }

      const totalScore = dist + alignmentPenalty;

      if (totalScore < minDistance) {
        minDistance = totalScore;
        bestCandidate = candidate;
      }
    }
  });

  if (bestCandidate) {
    (bestCandidate as HTMLElement).focus();
    (bestCandidate as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  }
};
