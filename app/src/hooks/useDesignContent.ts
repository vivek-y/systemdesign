import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchDesignContent } from '../store/contentSlice';
import type { DesignContent } from '../types/design';

export function useDesignContent(designId: string): {
  content: DesignContent | null;
  loading: boolean;
  error: string | null;
} {
  const dispatch = useAppDispatch();

  const content = useAppSelector((state) => state.content.designs[designId] ?? null);
  const loading = useAppSelector((state) => state.content.loading[designId] ?? false);
  const error = useAppSelector((state) => state.content.errors[designId] ?? null);

  useEffect(() => {
    dispatch(fetchDesignContent(designId));
  }, [dispatch, designId]);

  return { content, loading, error };
}
