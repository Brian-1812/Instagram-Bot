export const delay = async (s: number) =>
  new Promise((resolve) => setTimeout(resolve, s * 1000));

export const encodeValue = (value: string | number) => {
  const encodedId = btoa(value.toString());
  return encodedId;
};

export const decodeValue = <T>(value: string) => {
  const decodedId = atob(value);
  return decodedId as unknown as T;
};
