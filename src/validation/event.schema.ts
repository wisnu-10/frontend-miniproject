import * as Yup from "yup";

export const createEventSchema = Yup.object({
  name: Yup.string().required("Event name is required"),
  description: Yup.string().required("Description is required"),
  category_id: Yup.string().required("Category is required"),
  city: Yup.string().required("City is required"),
  province: Yup.string().required("Province is required"),
  start_date: Yup.date().required("Start date is required"),
  end_date: Yup.date()
    .required("End date is required")
    .min(Yup.ref("start_date"), "End date must be after start date"),
  base_price: Yup.number()
    .min(0, "Price cannot be negative")
    .when("is_free", {
      is: false,
      then: (schema) => schema.required("Base price is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
  total_seats: Yup.number()
    .min(1, "Total seats must be at least 1")
    .required("Total seats is required"),
  is_free: Yup.boolean(),
  ticket_types: Yup.array().when("is_free", {
    is: false,
    then: (schema) =>
      schema.of(
        Yup.object({
          name: Yup.string().required("Ticket name is required"),
          price: Yup.number()
            .min(0, "Price cannot be negative")
            .required("Price is required"),
          quantity: Yup.number()
            .min(1, "Quantity must be at least 1")
            .required("Quantity is required"),
        })
      ),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export const editEventSchema = Yup.object({
  name: Yup.string().required("Event name is required"),
  description: Yup.string().required("Description is required"),
  category_id: Yup.string().required("Category is required"),
  city: Yup.string().required("City is required"),
  province: Yup.string().required("Province is required"),
  start_date: Yup.string().required("Start date is required"),
  end_date: Yup.string().required("End date is required"),
  base_price: Yup.number()
    .min(0, "Price cannot be negative")
    .required("Base price is required"),
  total_seats: Yup.number()
    .min(1, "Total seats must be at least 1")
    .required("Total seats is required"),
  image: Yup.string().url("Must be a valid URL").nullable(),
});

export interface CreateEventValues {
  name: string;
  description: string;
  category_id: string;
  city: string;
  province: string;
  start_date: string;
  end_date: string;
  base_price: number;
  total_seats: number;
  is_free: boolean;
  ticket_types: {
    name: string;
    price: number;
    quantity: number;
  }[];
}

export interface EditEventValues {
  name: string;
  description: string;
  category_id: string;
  city: string;
  province: string;
  start_date: string;
  end_date: string;
  base_price: number;
  total_seats: number;
  image?: string;
  is_free: boolean;
  ticket_types: {
    name: string;
    price: number;
    quantity: number;
  }[];
}
