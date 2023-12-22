// export function mapFields<T extends string, V extends object>(
// 	config: Record<T, string>,
// 	input: V
// ): { [k in ((typeof config)[keyof typeof config] | (typeof config)[keyof typeof config)]: V[keyof V] } {
// 	const output = {};
// 	for (const [key, value] of Object.entries(input) as Iterable<[T, unknown]>) {
// 		if (typeof config[key] === "string") {
// 			output[config[key]] = value;
// 		} else {
// 			output[key] = value;
// 		}
// 	}
// 	return output;
// }

type MappingConfig<T, K extends string> = {
	[key in keyof T]?: K;
};

export function mapFields<T, K extends string>(
	mappingConfig: MappingConfig<T, K>,
	inputObject: T
): { [key in keyof T | K]: T[keyof T] } {
	const mappedObject: Record<K | keyof T, T[keyof T]> = {} as Record<
		K | keyof T,
		T[keyof T]
	>;

	for (const inputKey in inputObject) {
		if (mappingConfig.hasOwnProperty(inputKey)) {
			mappedObject[mappingConfig[inputKey]!] = inputObject[inputKey];
		} else {
			mappedObject[inputKey] = inputObject[inputKey];
		}
	}

	return mappedObject;
}
