// Adapter mẫu kết nối backend REST — dùng khi bạn đã có API.
// Quy ước endpoint:  GET    {baseUrl}/{collection}          -> mảng bản ghi [{id, ...}]
//                    POST   {baseUrl}/{collection}          -> tạo mới, trả về {id}
//                    PUT    {baseUrl}/{collection}/{id}     -> ghi đè
//                    DELETE {baseUrl}/{collection}/{id}
// Bật trong src/main.js:  initStore(createRestAdapter({ baseUrl: '/api', token }))

export function createRestAdapter({ baseUrl = '/api', token = '', pollMs = 0 } = {}) {
  let emit = () => {};
  let cols = [];
  const headers = () => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  async function req(method, path, body) {
    const res = await fetch(`${baseUrl}/${path}`, { method, headers: headers(), body: body ? JSON.stringify(body) : undefined });
    if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status });
    return res.status === 204 ? null : res.json();
  }
  const reload = async (col) => emit(col, await req('GET', col));

  return {
    label: 'Dữ liệu lưu trên máy chủ.',

    async init(collections, onData) {
      emit = onData;
      cols = collections;
      await Promise.all(cols.map(reload));
      if (pollMs) setInterval(() => cols.forEach(reload), pollMs); // đồng bộ khi nhiều nhân viên dùng
    },

    async save(col, id, body) {
      const r = id ? await req('PUT', `${col}/${id}`, body) : await req('POST', col, body);
      await reload(col);
      return id || r?.id;
    },

    async remove(col, id) {
      await req('DELETE', `${col}/${id}`);
      await reload(col);
    },
  };
}
