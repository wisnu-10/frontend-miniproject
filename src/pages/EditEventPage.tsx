import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFormik, FieldArray, FormikProvider } from "formik";
import { getEventById, updateEvent } from "../services/event.service";
import api from "../services/api";
import BackButton from "../components/BackButton";
import { editEventSchema, type EditEventValues } from "../validation";

const EditEventPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const formik = useFormik<EditEventValues>({
    initialValues: {
      name: "",
      description: "",
      category_id: "",
      city: "",
      province: "",
      start_date: "",
      end_date: "",
      base_price: 0,
      total_seats: 100,
      image: "",
      is_free: false,
      ticket_types: [{ name: "Regular", price: 0, quantity: 100 }] as {
        name: string;
        price: number;
        quantity: number;
      }[],
    },
    validationSchema: editEventSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (!eventId) return;
      setLoading(true);
      setError("");
      try {
        await updateEvent(eventId, values as any);
        navigate("/organizer/dashboard");
      } catch (err: any) {
        console.error("Failed to update event", err);
        setError(err.response?.data?.message || "Failed to update event");
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");
        setCategories(response.data.data || response.data || []);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      setFetching(true);
      try {
        const event = await getEventById(eventId);
        const formatDate = (dateStr: string) => {
          const d = new Date(dateStr);
          return d.toISOString().slice(0, 16);
        };
        formik.setValues({
          name: event.name || "",
          description: event.description || "",
          category_id:
            typeof event.category === "object"
              ? event.category?.id
              : event.category_id || "",
          city: event.city || "",
          province: event.province || "",
          start_date: event.start_date ? formatDate(event.start_date) : "",
          end_date: event.end_date ? formatDate(event.end_date) : "",
          base_price: event.base_price || 0,
          total_seats: event.total_seats || 100,
          image: event.image || "",
          is_free: event.is_free || false,
          ticket_types:
            event.ticket_types && event.ticket_types.length > 0
              ? event.ticket_types.map((tt) => ({
                  name: tt.name,
                  price: tt.price,
                  quantity: tt.quantity,
                }))
              : [{ name: "Regular", price: 0, quantity: 100 }],
        });
      } catch (err: any) {
        console.error("Failed to fetch event", err);
        setError("Failed to load event data");
      } finally {
        setFetching(false);
      }
    };
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  if (fetching) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Event</h1>
        <BackButton to="/organizer/dashboard" label="Kembali" />
      </div>

      {error && <div className="alert alert-error mb-4">{error}</div>}

      <form
        onSubmit={formik.handleSubmit}
        className="bg-base-100 p-6 rounded-lg shadow-xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">Event Name</label>
            <input
              type="text"
              name="name"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
              className={`input input-bordered ${formik.touched.name && formik.errors.name ? "input-error" : ""}`}
            />
            {formik.touched.name && formik.errors.name && (
              <div className="text-error text-xs mt-1">
                {formik.errors.name}
              </div>
            )}
          </div>

          <div className="form-control">
            <label className="label">Category</label>
            <select
              name="category_id"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.category_id}
              className="select select-bordered"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
              <option value="Music">Music</option>
              <option value="Tech">Tech</option>
              <option value="Workshop">Workshop</option>
            </select>
            {formik.touched.category_id && formik.errors.category_id && (
              <div className="text-error text-xs mt-1">
                {formik.errors.category_id}
              </div>
            )}
          </div>

          <div className="form-control">
            <label className="label">City</label>
            <input
              type="text"
              name="city"
              onChange={formik.handleChange}
              value={formik.values.city}
              className="input input-bordered"
            />
            {formik.touched.city && formik.errors.city && (
              <div className="text-error text-xs mt-1">
                {formik.errors.city}
              </div>
            )}
          </div>

          <div className="form-control">
            <label className="label">Province</label>
            <input
              type="text"
              name="province"
              onChange={formik.handleChange}
              value={formik.values.province}
              className="input input-bordered"
            />
            {formik.touched.province && formik.errors.province && (
              <div className="text-error text-xs mt-1">
                {formik.errors.province}
              </div>
            )}
          </div>

          <div className="form-control">
            <label className="label">Start Date</label>
            <input
              type="datetime-local"
              name="start_date"
              onChange={formik.handleChange}
              value={formik.values.start_date}
              className="input input-bordered"
            />
            {formik.touched.start_date && formik.errors.start_date && (
              <div className="text-error text-xs mt-1">
                {formik.errors.start_date}
              </div>
            )}
          </div>

          <div className="form-control">
            <label className="label">End Date</label>
            <input
              type="datetime-local"
              name="end_date"
              onChange={formik.handleChange}
              value={formik.values.end_date}
              className="input input-bordered"
            />
            {formik.touched.end_date && formik.errors.end_date && (
              <div className="text-error text-xs mt-1">
                {formik.errors.end_date}
              </div>
            )}
          </div>

          <div className="form-control">
            <label className="label">Base Price</label>
            <input
              type="number"
              name="base_price"
              onChange={formik.handleChange}
              value={formik.values.base_price}
              className="input input-bordered"
            />
            {formik.touched.base_price && formik.errors.base_price && (
              <div className="text-error text-xs mt-1">
                {formik.errors.base_price}
              </div>
            )}
          </div>

          <div className="form-control">
            <label className="label">Total Seats</label>
            <input
              type="number"
              name="total_seats"
              onChange={formik.handleChange}
              value={formik.values.total_seats}
              className="input input-bordered"
            />
            {formik.touched.total_seats && formik.errors.total_seats && (
              <div className="text-error text-xs mt-1">
                {formik.errors.total_seats}
              </div>
            )}
          </div>
        </div>

        <div className="form-control mt-4">
          <label className="label">Description</label>
          <textarea
            name="description"
            onChange={formik.handleChange}
            value={formik.values.description}
            className="textarea textarea-bordered h-24"
          ></textarea>
          {formik.touched.description && formik.errors.description && (
            <div className="text-error text-xs mt-1">
              {formik.errors.description}
            </div>
          )}
        </div>

        <div className="form-control mt-4">
          <label className="label">Image URL</label>
          <input
            type="text"
            name="image"
            onChange={formik.handleChange}
            value={formik.values.image}
            className="input input-bordered"
            placeholder="https://example.com/image.jpg"
          />
          {formik.touched.image && formik.errors.image && (
            <div className="text-error text-xs mt-1">{formik.errors.image}</div>
          )}
        </div>

        {/* Ticket Types */}
        <div className="divider text-xl font-bold mt-8">Ticket Types</div>
        <FormikProvider value={formik}>
          <FieldArray
            name="ticket_types"
            render={(arrayHelpers) => (
              <div>
                {formik.values.ticket_types.map((ticket, index) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row gap-4 mb-4 border p-4 rounded-lg bg-base-200"
                  >
                    <div className="form-control w-full">
                      <label className="label">Ticket Name</label>
                      <input
                        name={`ticket_types.${index}.name`}
                        value={ticket.name}
                        onChange={formik.handleChange}
                        className="input input-bordered input-sm"
                      />
                    </div>
                    <div className="form-control w-full">
                      <label className="label">Price</label>
                      <input
                        type="number"
                        name={`ticket_types.${index}.price`}
                        value={ticket.price}
                        onChange={formik.handleChange}
                        className="input input-bordered input-sm"
                      />
                    </div>
                    <div className="form-control w-full">
                      <label className="label">Quantity</label>
                      <input
                        type="number"
                        name={`ticket_types.${index}.quantity`}
                        value={ticket.quantity}
                        onChange={formik.handleChange}
                        className="input input-bordered input-sm"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        className="btn btn-error btn-sm"
                        onClick={() => arrayHelpers.remove(index)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() =>
                    arrayHelpers.push({ name: "", price: 0, quantity: 10 })
                  }
                >
                  Add Ticket Type
                </button>
              </div>
            )}
          />
        </FormikProvider>

        <div className="mt-8 flex justify-end gap-2">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate("/organizer/dashboard")}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`btn btn-primary ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEventPage;
