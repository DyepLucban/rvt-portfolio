import { useState, useEffect } from "react";
import { getProjects } from "@/services/projectService";

// Owns loading/error state and calls the service. Components consume this and
// stay unaware of where the data comes from.
export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    getProjects()
      .then((data) => active && setProjects(data))
      .catch((err) => active && setError(err))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return { projects, loading, error };
}
