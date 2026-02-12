import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface FilterSidebarProps {
    filters: {
        category: string;
        location: string;
        isFree: boolean;
        minPrice: string;
        maxPrice: string;
    };
    setFilters: React.Dispatch<React.SetStateAction<{
        category: string;
        location: string;
        isFree: boolean;
        minPrice: string;
        maxPrice: string;
    }>>;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, setFilters }) => {
    const [categories, setCategories] = useState<string[]>([]);
    const [locations, setLocations] = useState<string[]>([]);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [catRes, locRes] = await Promise.all([
                    api.get('/events/meta/categories'),
                    api.get('/events/meta/locations')
                ]);
                setCategories(catRes.data.data);
                setLocations(locRes.data.data);
            } catch (error) {
                console.error("Failed to fetch metadata", error);
            }
        };
        fetchMetadata();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const target = e.target;
        const name = target.name;
        const value = target.value;
        const type = target.type;

        // Handle checkbox vs text/select
        const checked = (target as HTMLInputElement).checked;

        setFilters(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div className="bg-base-100 p-4 rounded-lg shadow-md h-fit">
            <h3 className="font-bold text-lg mb-4">Filters</h3>

            <div className="form-control w-full max-w-xs mb-4">
                <label className="label">
                    <span className="label-text">Category</span>
                </label>
                <select name="category" className="select select-bordered" value={filters.category} onChange={handleChange}>
                    <option value="">All Categories</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>

            <div className="form-control w-full max-w-xs mb-4">
                <label className="label">
                    <span className="label-text">Location</span>
                </label>
                <select name="location" className="select select-bordered" value={filters.location} onChange={handleChange}>
                    <option value="">All Locations</option>
                    {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
            </div>

            <div className="form-control w-full max-w-xs mb-4">
                <label className="label cursor-pointer">
                    <span className="label-text">Free Events Only</span>
                    <input type="checkbox" name="isFree" checked={filters.isFree} onChange={handleChange} className="checkbox checkbox-primary" />
                </label>
            </div>

            <div className="divider">Price Range</div>

            <div className="flex gap-2 mb-2">
                <input
                    type="number"
                    name="minPrice"
                    placeholder="Min"
                    className="input input-bordered w-1/2 input-sm"
                    value={filters.minPrice}
                    onChange={handleChange}
                    disabled={filters.isFree}
                />
                <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max"
                    className="input input-bordered w-1/2 input-sm"
                    value={filters.maxPrice}
                    onChange={handleChange}
                    disabled={filters.isFree}
                />
            </div>

            <button
                className="btn btn-outline btn-sm w-full mt-4"
                onClick={() => setFilters({ category: '', location: '', isFree: false, minPrice: '', maxPrice: '' })}
            >
                Reset Filters
            </button>
        </div>
    );
};

export default FilterSidebar;
