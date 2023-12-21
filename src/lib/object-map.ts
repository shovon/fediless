import { Validator, InferSchema, object } from "@/lib/type-guardian";
import { mapFields } from "./mapper";

export function objectMap<
	V,
	S extends {
		[key in keyof V]: Validator<V[key]>;
	}
>(mapping: Record<string, string>, shape: S): Validator<InferSchema<S>> {
	return {
		validate: (value: unknown) => {
			if (typeof value !== "object" || value === null) {
				return {
					isValid: false,
					error: {
						type: "Object to map is not a valid object",
						errorMessage: `Expected object, got ${typeof value}`,
						value: value,
					},
				};
			}
			const mapped = mapFields(mapping, value as Record<string, unknown>);
			return object(shape).validate(mapped);
		},
	};
}
