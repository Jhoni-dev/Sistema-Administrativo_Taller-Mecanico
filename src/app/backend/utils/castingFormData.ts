export function formDataToJson(formData: FormData) {
  const result: Record<string, any> = {};

  for (const [key, value] of formData.entries()) {
    if (key in result) {
      if (!Array.isArray(result[key])) {
        result[key] = [result[key]];
      }
      result[key].push(castValue(value));
    } else {
      result[key] = castValue(value);
    }
  }

  return result;
}

function castValue(value: FormDataEntryValue): any {
  if (value instanceof File) return value

  const v = value.toString();

  if (!isNaN(Number(v))) return Number(v);
  if (v === "true") return true;
  if (v === "false") return false;

  return v;
}