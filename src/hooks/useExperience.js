import { useState, useEffect } from "react";
import { getExperiences } from "@/services/experienceService";

export function useExperience() {
  const [experience, setExperience] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    getExperiences()
      .then((data) => active && setExperience(data))
      .catch((err) => active && setError(err))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return { experience, loading, error };
}
