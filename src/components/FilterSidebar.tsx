import React, { useEffect, useState } from "react";
import api from "../services/api";

interface Category {
  id: string;
  name: string;
}

interface Location {
  city: string | null;
  province: string | null;
}

interface FilterSidebarProps {
  filters: {
    category: string;
    location: string;
    isFree: boolean;
    minPrice: string;
    maxPrice: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      category: string;
      location: string;
      isFree: boolean;
      minPrice: string;
      maxPrice: string;
    }>
  >;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  setFilters,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, locRes] = await Promise.all([
          api.get("/categories"),
          api.get("/events/meta/locations"),
        ]);
        setCategories(catRes.data.data);
        setLocations(locRes.data.data);
      } catch (error) {
        console.error("Failed to fetch metadata", error);
      }
    };
    fetchMetadata();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ) => {
    const target = e.target;
    const name = target.name;
    const value = target.value;
    const type = target.type;

    // Handle checkbox vs text/select
    const checked = (target as HTMLInputElement).checked;

    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="bg-base-100 p-6 rounded-3xl shadow-sm border border-base-200/60 h-fit sticky top-24 z-10 transition-all w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-xl text-base-content tracking-tight">
          Filters
        </h3>
        <button
          className="btn btn-ghost btn-xs text-base-content/50 hover:text-primary transition-colors"
          onClick={() =>
            setFilters({
              category: "",
              location: "",
              isFree: false,
              minPrice: "",
              maxPrice: "",
            })
          }
        >
          Clear All
        </button>
      </div>

      <div className="space-y-5">
        {/* Category Filter */}
        <div className="form-control w-full">
          <label className="label py-1">
            <span className="label-text font-semibold text-base-content/80 text-sm">
              Category
            </span>
          </label>
          <select
            name="category"
            className="select select-bordered w-full focus:bg-base-100 transition-colors"
            value={filters.category}
            onChange={handleChange}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div className="form-control w-full">
          <label className="label py-1">
            <span className="label-text font-semibold text-base-content/80 text-sm">
              Location
            </span>
          </label>
          <select
            name="location"
            className="select select-bordered w-full focus:bg-base-100 transition-colors"
            value={filters.location}
            onChange={handleChange}
          >
            <option value="">All Locations</option>
            {locations.map((loc) => (
              <option
                key={`${loc.city}-${loc.province}`}
                value={loc.city || ""}
              >
                {loc.city}
                {loc.province ? `, ${loc.province}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="divider my-2 opacity-50"></div>

        {/* Free Events Toggle */}
        <div
          className="form-control border border-base-200/60 rounded-2xl p-3 hover:border-primary/30 transition-colors cursor-pointer group"
          onClick={() =>
            setFilters((prev) => ({ ...prev, isFree: !prev.isFree }))
          }
        >
          <label className="cursor-pointer label p-0 gap-3">
            <div className="flex-1 flex flex-col">
              <span className="label-text font-bold text-primary">
                Free Events Only
              </span>
              <span className="text-xs text-base-content/50 mt-0.5">
                Show events without tickets
              </span>
            </div>
            <input
              type="checkbox"
              name="isFree"
              checked={filters.isFree}
              onChange={(e) => {
                e.stopPropagation();
                handleChange(e);
              }}
              className="toggle toggle-primary toggle-sm group-hover:bg-primary/80 transition-all shadow-sm"
            />
          </label>
        </div>

        {/* Price Range */}
        <div
          className={`transition-all duration-300 ${filters.isFree ? "opacity-40 grayscale pointer-events-none" : "opacity-100"}`}
        >
          <label className="label py-1 mt-2">
            <span className="label-text font-semibold text-base-content/80 text-sm">
              Price Range
            </span>
          </label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-3 flex items-center text-xs font-semibold text-base-content/50">
                Rp
              </span>
              <input
                type="number"
                name="minPrice"
                placeholder="Min"
                className="input input-bordered w-full pl-8 focus:bg-base-100 transition-colors"
                value={filters.minPrice}
                onChange={handleChange}
                disabled={filters.isFree}
              />
            </div>
            <span className="text-base-content/40 font-medium">-</span>
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-3 flex items-center text-xs font-semibold text-base-content/50">
                Rp
              </span>
              <input
                type="number"
                name="maxPrice"
                placeholder="Max"
                className="input input-bordered w-full pl-8 focus:bg-base-100 transition-colors"
                value={filters.maxPrice}
                onChange={handleChange}
                disabled={filters.isFree}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
