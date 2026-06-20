import { useState, useEffect, useCallback } from "react";
import { listArtisan } from "../services/artisanService";

export const useArtisan = (params = {}) => {
  const [Artisan, setArtisan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});

  const fetchArtisan = useCallback(async (searchParams = params) => {
    try {
      setLoading(true);
      setError(null);
      const data = await listArtisan(searchParams);
      setArtisan(data.items || []);
      setPagination({
        page: data.page,
        totalPages: data.totalPages,
        total: data.total,
      });
    } catch (err) {
      setError(err.message || "Failed to fetch Artisan");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchArtisan();
  }, [fetchArtisan]);

  return {
    Artisan,
    loading,
    error,
    pagination,
    refetch: fetchArtisan,
  };
};