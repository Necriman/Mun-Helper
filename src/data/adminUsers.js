/**
 * Mock `user_profiles` rows for the Admin Panel's User Management table.
 * `role` and `isBanned` map directly to the DB columns of the same purpose.
 */
export const ADMIN_USERS = [
  { id: 'u1', fullName: 'Aziz Karimov', handle: '@aziz_delegate', email: 'aziz.k@example.uz', role: 'user', isBanned: false, joined: '2026-03-14' },
  { id: 'u2', fullName: 'Madina Yusupova', handle: '@madina_chair', email: 'madina.y@example.uz', role: 'moderator', isBanned: false, joined: '2026-01-09' },
  { id: 'u3', fullName: 'Javlon Rashidov', handle: '@javlon_org', email: 'javlon.r@example.uz', role: 'user', isBanned: false, joined: '2026-04-02' },
  { id: 'u4', fullName: 'Dilnoza Ergasheva', handle: '@dilnoza_e', email: 'dilnoza.e@example.uz', role: 'user', isBanned: true, joined: '2026-02-21' },
  { id: 'u5', fullName: 'Sardor Tashkentov', handle: '@sardor_t', email: 'sardor.t@example.uz', role: 'admin', isBanned: false, joined: '2025-11-30' },
  { id: 'u6', fullName: 'Nilufar Xolova', handle: '@nilufar_x', email: 'nilufar.x@example.uz', role: 'user', isBanned: false, joined: '2026-05-17' },
];
