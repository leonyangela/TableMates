import { useState, useCallback } from "react";
import { saveData } from "../utils/saveData.utils";

export function useSaveData(collectionName) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const save = useCallback(
    async (data) => {
      setLoading(true);
      setError(null);
      try {
        const result = await saveData(collectionName, data);
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [collectionName]
  );

  return { save, loading, error };
}