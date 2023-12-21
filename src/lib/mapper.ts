export function mapFields<T extends string, V extends Record<string, unknown>>(
	config: Record<string, string>,
	input: V
): Record<T, unknown> {
	const output: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(input) as Iterable<[T, unknown]>) {
		if (typeof config[key] === "string") {
			output[config[key]] = value;
		} else {
			output[key] = value;
		}
	}
	return output;
}
