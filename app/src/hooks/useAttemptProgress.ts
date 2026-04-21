import { useAppDispatch, useAppSelector } from '../store';
import {
  revealTopic,
  revealQuestion,
  navigateTo,
  markComplete,
} from '../store/attemptSlice';
import type { AttemptState } from '../store/attemptSlice';
import type { TopicKey } from '../types/design';

export function useAttemptProgress(): {
  progress: AttemptState;
  revealTopic: (topicKey: TopicKey) => void;
  revealQuestion: (topicKey: 'highLevelDesign' | 'deepDive', index: number) => void;
  navigateTo: (step: number) => void;
  markComplete: () => void;
} {
  const dispatch = useAppDispatch();
  const progress = useAppSelector((state) => state.attempt);

  return {
    progress,
    revealTopic: (topicKey: TopicKey) => dispatch(revealTopic(topicKey)),
    revealQuestion: (topicKey: 'highLevelDesign' | 'deepDive', index: number) =>
      dispatch(revealQuestion({ topicKey, index })),
    navigateTo: (step: number) => dispatch(navigateTo(step)),
    markComplete: () => dispatch(markComplete()),
  };
}
