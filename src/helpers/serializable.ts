export const registry: Record<string, Serializable> = {};

// a Serializable class has a no-arg constructor and an instance property
// named className
export type Serializable = new () => { readonly className: string };

// a decorator that adds classes to the registry
export function serializable<T extends Serializable>(constructor: T) {
  registry[new constructor().className] = constructor;
  return constructor;
}
