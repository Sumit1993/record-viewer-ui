
const API_BASE_URL = import.meta.env.API_BASE_URL;

export const getRecords = async (page: number = 1, limit: number = 10, recordType?: string, filters?: string, columns?: string) => {
  let url = `${API_BASE_URL}/records?page=${page}&limit=${limit}`;
  if (recordType) {
    url += `&type=${recordType}`;
  }
  if (filters) {
    url += `&filters=${filters}`;
  }
  if (columns) {
    url += `&columns=${columns}`;
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const result = await response.json();
  return result;
};

export const createRecord = async (recordData: any) => {
  const response = await fetch(`${API_BASE_URL}/records`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(recordData),
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const getAutocompleteSuggestions = async (field: string, query: string): Promise<string[]> => {
  const url = `${API_BASE_URL}/records/autocomplete?field=${field}&query=${query}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};
