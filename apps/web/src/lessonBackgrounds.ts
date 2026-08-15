import sceneCommunicationBridge from "./assets/scene_communication_bridge.png";
import sceneDiscoveryWall from "./assets/scene_discovery_wall.png";
import sceneBlueprintCommunication from "./assets/scene_blueprint_communication.png";
import sceneProgressJourney from "./assets/scene_progress_journey.png";
import sceneCappyUniverse from "./assets/scene_cappy_universe.png";

/**
 * Each ASL lesson (one per 5-letter group, see mockData.ts) gets its own
 * backdrop, on both the lesson-list card (LessonList.tsx) and the
 * lesson-step pages (NavLayout.tsx) so a learner sees a consistent, distinct
 * scene for the whole time they're inside that lesson.
 */
export const ASL_LESSON_BACKGROUNDS: Record<string, string> = {
  "lesson-a-e": sceneCommunicationBridge,
  "lesson-f-j": sceneDiscoveryWall,
  "lesson-k-o": sceneBlueprintCommunication,
  "lesson-p-t": sceneProgressJourney,
  "lesson-u-z": sceneCappyUniverse,
};
