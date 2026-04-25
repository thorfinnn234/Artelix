import React from "react";
import { Link } from "react-router-dom";
import StarRating from "./ui/StarRating";

const VendorCard = ({ vendor }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
          {vendor.name}
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
          {vendor.category}
        </span>
      </div>

      <div className="flex items-center mb-2">
        <StarRating rating={vendor.rating || 0} />
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
          ({vendor.rating?.toFixed(1) || "0.0"})
        </span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
        📍 {vendor.address}
      </p>

      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        📞 {vendor.phone}
      </p>

      <Link
        to={`/user/vendor/${vendor._id}`}
        className="w-full bg-green-500 text-white font-medium py-2 px-4 rounded-md text-center block"
      >
        View Details 
      </Link>
    </div>
  );
};

export default VendorCard;