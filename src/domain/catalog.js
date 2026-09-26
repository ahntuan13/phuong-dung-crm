// Nhóm thuốc / vật tư và đơn vị tính dùng trong danh mục.

export const MED_GROUPS = [
  { name: 'Thuốc gây tê',  icon: '💉' },
  { name: 'Giảm đau',      icon: '💊' },
  { name: 'Kháng dị ứng',  icon: '💊' },
  { name: 'Sát khuẩn',     icon: '🧴' },
  { name: 'Dịch truyền',   icon: '💧' },
  { name: 'Vật tư tiêm',   icon: '💉' },
  { name: 'Vật tư',        icon: '🩹' },
  { name: 'Mỹ phẩm',       icon: '🧪' },
  { name: 'Botox/Filler',  icon: '✨' },
  { name: 'Tiêu hao',      icon: '🧹' },
  { name: 'Khác',          icon: '📦' },
];

export const UNITS = ['Hộp', 'Tuýp', 'Chai', 'Lọ', 'Gói', 'Cuộn', 'Syringe', 'Ống', 'Viên', 'ml', 'Unit', 'Cái'];

export const groupIcon = (name) => MED_GROUPS.find((g) => g.name === name)?.icon || '📦';
export const groupOrder = (name) => { const i = MED_GROUPS.findIndex((g) => g.name === name); return i < 0 ? 99 : i; };

/** Sắp theo thứ tự nhóm, rồi theo tên */
export const sortMeds = (list) =>
  [...list].sort((a, b) => groupOrder(a.group) - groupOrder(b.group) || a.name.localeCompare(b.name, 'vi'));
