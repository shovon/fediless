import { either, exact, Validator } from "@/lib/type-guardian";

export const optional = <T>(validator: Validator<T>) =>
	either(validator, exact(undefined));
