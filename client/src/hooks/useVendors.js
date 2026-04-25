import { useState, useEffect } from "react";
import { listVendors } from "../services/vendorService";

export const useVendors = (params = {}) => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});

  const fetchVendors = async (searchParams = params) => {
    try {
      setLoading(true);
      setError(null);
      const data = await listVendors(searchParams);
      setVendors(data.items || []);
      setPagination({
        page: data.page,
        totalPages: data.totalPages,
        total: data.total,
      });
    } catch (err) {
      setError(err.message || "Failed to fetch vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  return {
    vendors,
    loading,
    error,
    pagination,
    refetch: fetchVendors,
  };
};