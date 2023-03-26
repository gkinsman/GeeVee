export function groupBy<T, Key extends keyof T>(
  arr: T[],
  keySelector: (item: T) => Key
): Map<Key, T[]> {
  const grouped: Map<Key, T[]> = new Map()
  for (const item of arr) {
    const key = keySelector(item)
    if (grouped.has(key)) grouped.get(key)!.push(item)
    else {
      grouped.set(key, [item])
    }
  }

  return grouped
}
