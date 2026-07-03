import { useEffect, useState } from 'react';
import { Ban, ShieldCheck } from 'lucide-react';
import { ADMIN_USERS } from '../../data/adminUsers';
import { supabase } from '../../lib/supabase';

const ROLE_BADGE = {
  admin: 'border-gold-400/50 bg-gold-50 text-gold-700',
  moderator: 'border-un-500/30 bg-un-50 text-un-700',
  user: 'border-slate-300 bg-slate-50 text-slate-600',
};

/**
 * User Management table. Live mode reads `user_profiles` directly (public
 * SELECT policy) and the ban toggle is a real UPDATE, authorized by the
 * "staff can moderate profiles" RLS policy. Falls back to mock ADMIN_USERS.
 */
export default function AdminUsers() {
  const [users, setUsers] = useState(supabase ? [] : ADMIN_USERS);
  const [loading, setLoading] = useState(!!supabase);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;

    supabase
      .from('user_profiles')
      .select('id, full_name, username, telegram_handle, email, role, is_banned, created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (cancelled) return;
        setUsers(
          (data ?? []).map((u) => ({
            id: u.id,
            fullName: u.full_name || u.username,
            handle: u.telegram_handle ? `@${u.telegram_handle}` : u.username,
            email: u.email ?? '—',
            role: u.role,
            isBanned: u.is_banned,
            joined: new Date(u.created_at).toLocaleDateString(),
          })),
        );
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleBan = async (id) => {
    const next = !users.find((u) => u.id === id)?.isBanned;
    setUsers((list) => list.map((u) => (u.id === id ? { ...u, isBanned: next } : u))); // optimistic
    if (!supabase) return;
    await supabase.from('user_profiles').update({ is_banned: next }).eq('id', id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-un-900">Users</h1>
        <p className="mt-1 text-sm text-un-600">
          {users.length} accounts linked across web and Telegram.
          {loading && ' Loading…'}
        </p>
      </div>

      <div className="plaque overflow-hidden rounded-md">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-un-800/10 bg-un-50/60 text-xs font-semibold uppercase tracking-wide text-un-600">
              <th className="px-5 py-3">Delegate</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Joined</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-un-800/5 last:border-0">
                <td className="px-5 py-3.5">
                  <p className="font-medium text-un-900">{u.fullName}</p>
                  <p className="text-xs text-un-500">
                    {u.handle} · {u.email}
                  </p>
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`rounded-sm border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${ROLE_BADGE[u.role]}`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-un-600">{u.joined}</td>
                <td className="px-5 py-3.5">
                  {u.isBanned ? (
                    <span className="rounded-sm border border-rose-300 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-rose-600">
                      Banned
                    </span>
                  ) : (
                    <span className="rounded-sm border border-un-500/30 bg-un-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-un-700">
                      Active
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => toggleBan(u.id)}
                    aria-pressed={u.isBanned}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      u.isBanned
                        ? 'border-un-500/30 text-un-700 hover:bg-un-50'
                        : 'border-rose-300 text-rose-600 hover:bg-rose-50'
                    }`}
                  >
                    {u.isBanned ? <ShieldCheck size={13} aria-hidden="true" /> : <Ban size={13} aria-hidden="true" />}
                    {u.isBanned ? 'Unban' : 'Ban'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
