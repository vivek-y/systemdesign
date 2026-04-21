import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AttemptProgress, TopicKey, TOPIC_ORDER } from '../types/design';

export interface AttemptState {
  designId: string | null;
  currentStep: number; // 0 = overview, 1-8 = topic index
  revealedTopics: Record<TopicKey, boolean>;
  revealedQuestions: {
    highLevelDesign: number[];
    deepDive: number[];
  };
  completed: boolean;
}

function buildFreshRevealedTopics(): Record<TopicKey, boolean> {
  return Object.fromEntries(TOPIC_ORDER.map((key) => [key, false])) as Record<TopicKey, boolean>;
}

const initialState: AttemptState = {
  designId: null,
  currentStep: 0,
  revealedTopics: buildFreshRevealedTopics(),
  revealedQuestions: {
    highLevelDesign: [],
    deepDive: [],
  },
  completed: false,
};

const attemptSlice = createSlice({
  name: 'attempt',
  initialState,
  reducers: {
    initAttempt(
      state,
      action: PayloadAction<{ designId: string; savedProgress: AttemptProgress | null }>
    ) {
      const { designId, savedProgress } = action.payload;
      if (savedProgress) {
        state.designId = designId;
        state.currentStep = savedProgress.currentStep;
        state.revealedTopics = savedProgress.revealedTopics;
        state.revealedQuestions = {
          highLevelDesign: [...savedProgress.revealedQuestions.highLevelDesign],
          deepDive: [...savedProgress.revealedQuestions.deepDive],
        };
        state.completed = savedProgress.completed;
      } else {
        state.designId = designId;
        state.currentStep = 0;
        state.revealedTopics = buildFreshRevealedTopics();
        state.revealedQuestions = { highLevelDesign: [], deepDive: [] };
        state.completed = false;
      }
    },
    navigateTo(state, action: PayloadAction<number>) {
      state.currentStep = action.payload;
    },
    revealTopic(state, action: PayloadAction<TopicKey>) {
      state.revealedTopics[action.payload] = true;
    },
    revealQuestion(
      state,
      action: PayloadAction<{ topicKey: 'highLevelDesign' | 'deepDive'; index: number }>
    ) {
      const { topicKey, index } = action.payload;
      if (!state.revealedQuestions[topicKey].includes(index)) {
        state.revealedQuestions[topicKey].push(index);
      }
    },
    markComplete(state) {
      state.completed = true;
    },
    resetAttempt() {
      return { ...initialState, revealedTopics: buildFreshRevealedTopics() };
    },
  },
});

export const {
  initAttempt,
  navigateTo,
  revealTopic,
  revealQuestion,
  markComplete,
  resetAttempt,
} = attemptSlice.actions;
export default attemptSlice.reducer;
