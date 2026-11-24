import { supabase } from '../lib/supabase.js';
import { createEl, safeUrl } from '../lib/sanitize.js';
import {
  confirmAction,
  formatWibDate,
  renderEmptyState,
  renderErrorState,
  renderLoadingState,
  showToast,
} from './admin-ui.js';

export async function mountModeration(container) {
  renderLoadingState(container, 'Memuat inbox kontak dan guestbook...');

  let activeTab = 'guestbook';

  async function refresh() {
    const [inboxRes, gbRes] = await Promise.all([
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
      supabase.from('guestbook_comments').select('*').order('created_at', { ascending: false }),
    ]);

    if (inboxRes.error) {
      renderErrorState(container, `Gagal memuat contact_messages: ${inboxRes.error.message}`, () => refresh());
      return;
    }

    if (gbRes.error) {
      renderErrorState(container, `Gagal memuat guestbook_comments: ${gbRes.error.message}`, () => refresh());
      return;
    }

    const messages = inboxRes.data || [];
    const comments = gbRes.data || [];
    const unreadCount = messages.filter((m) => !m.is_read).length;

    const tabs = createEl('div', { className: 'flex flex-wrap gap-2', attrs: { role: 'tablist', 'aria-label': 'Moderasi Inbox dan Guestbook' } });

    const gbTabBtn = createEl('button', {
      className: activeTab === 'guestbook' ? 'admin-btn-primary text-sm' : 'admin-btn-secondary text-sm',
      text: `Guestbook (${comments.length})`,
      attrs: { type: 'button', role: 'tab', 'aria-selected': String(activeTab === 'guestbook') },
    });
    gbTabBtn.addEventListener('click', () => {
      activeTab = 'guestbook';
      refresh();
    });

    const inboxTabBtn = createEl('button', {
      className: activeTab === 'inbox' ? 'admin-btn-primary text-sm' : 'admin-btn-secondary text-sm',
      text: `Contact Inbox (${unreadCount} unread / ${messages.length})`,
      attrs: { type: 'button', role: 'tab', 'aria-selected': String(activeTab === 'inbox') },
    });
    inboxTabBtn.addEventListener('click', () => {
      activeTab = 'inbox';
      refresh();
    });

    tabs.append(gbTabBtn, inboxTabBtn);

    const panel = createEl('div');

    if (activeTab === 'guestbook') {
      if (comments.length === 0) {
        renderEmptyState(panel, 'Belum ada komentar pengunjung di guestbook_comments.');
      } else {
        const box = createEl('div', { className: 'admin-panel px-5' });
        for (const comment of comments) {
          const row = createEl('div', {
            className: 'admin-row py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4',
          });

          const info = createEl(
            'div',
            { className: 'space-y-1.5 min-w-0' },
            createEl(
              'div',
              { className: 'flex flex-wrap items-center gap-2' },
              createEl('span', { className: 'text-sm font-bold text-[#F8FAFC]', text: comment.author_name }),
              comment.author_role
                ? createEl('span', {
                    className: 'font-mono-tabular text-xs px-2 py-0.5 rounded bg-[#151B28] text-[#60A5FA]',
                    text: comment.author_role,
                  })
                : null,
              createEl('span', {
                className: comment.is_visible
                  ? 'font-mono-tabular text-xs text-[#34D399]'
                  : 'font-mono-tabular text-xs text-[#FBBF24]',
                text: comment.is_visible ? 'TAMPIL' : 'DISEMBUNYIKAN',
              }),
              createEl('span', {
                className: 'font-mono-tabular text-xs text-[#7B8CA4]',
                text: formatWibDate(comment.created_at),
              })
            ),
            createEl('p', {
              className: 'text-sm text-[#94A3B8] leading-relaxed break-words',
              text: comment.message,
            })
          );

          const toggleBtn = createEl('button', {
            className: 'admin-btn-secondary text-xs px-3',
            text: comment.is_visible ? 'Sembunyikan' : 'Tampilkan',
            attrs: { type: 'button' },
          });
          toggleBtn.addEventListener('click', async () => {
            toggleBtn.disabled = true;
            const { error } = await supabase
              .from('guestbook_comments')
              .update({ is_visible: !comment.is_visible })
              .eq('id', comment.id);
            if (error) showToast(error.message, 'error');
            else showToast('Visibilitas komentar diperbarui.', 'success');
            await refresh();
          });

          const delBtn = createEl('button', {
            className: 'admin-btn-danger text-xs px-3',
            text: 'Hapus',
            attrs: { type: 'button' },
          });
          delBtn.addEventListener('click', async () => {
            const ok = await confirmAction({
              title: 'Hapus Komentar Guestbook',
              message: `Hapus komentar dari "${comment.author_name}" secara permanen?`,
            });
            if (!ok) return;
            const { error } = await supabase.from('guestbook_comments').delete().eq('id', comment.id);
            if (error) showToast(error.message, 'error');
            else showToast('Komentar dihapus permanen.', 'success');
            await refresh();
          });

          row.append(info, createEl('div', { className: 'flex items-center gap-2 shrink-0' }, toggleBtn, delBtn));
          box.appendChild(row);
        }
        panel.appendChild(box);
      }
    } else {
      if (messages.length === 0) {
        renderEmptyState(panel, 'Kotak masuk contact_messages masih kosong.');
      } else {
        const box = createEl('div', { className: 'admin-panel px-5' });
        for (const msg of messages) {
          const row = createEl('div', {
            className: 'admin-row py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4',
          });

          const mailHref = safeUrl(`mailto:${msg.sender_email}`);
          const info = createEl(
            'div',
            { className: 'space-y-1.5 min-w-0' },
            createEl(
              'div',
              { className: 'flex flex-wrap items-center gap-2' },
              createEl('span', { className: 'text-sm font-bold text-[#F8FAFC]', text: msg.sender_name }),
              mailHref
                ? createEl('a', {
                    className: 'font-mono-tabular text-xs text-[#60A5FA] hover:underline',
                    text: msg.sender_email,
                    attrs: { href: mailHref },
                  })
                : createEl('span', { className: 'font-mono-tabular text-xs text-[#94A3B8]', text: msg.sender_email }),
              createEl('span', {
                className: msg.is_read
                  ? 'font-mono-tabular text-xs text-[#7B8CA4]'
                  : 'font-mono-tabular text-xs text-[#34D399]',
                text: msg.is_read ? 'SUDAH DIBACA' : 'BARU',
              }),
              createEl('span', {
                className: 'font-mono-tabular text-xs text-[#7B8CA4]',
                text: formatWibDate(msg.created_at),
              })
            ),
            createEl('p', {
              className: 'text-sm text-[#94A3B8] leading-relaxed break-words',
              text: msg.message,
            })
          );

          const readBtn = createEl('button', {
            className: 'admin-btn-secondary text-xs px-3',
            text: msg.is_read ? 'Tandai Baru' : 'Tandai Dibaca',
            attrs: { type: 'button' },
          });
          readBtn.addEventListener('click', async () => {
            readBtn.disabled = true;
            const { error } = await supabase
              .from('contact_messages')
              .update({ is_read: !msg.is_read })
              .eq('id', msg.id);
            if (error) showToast(error.message, 'error');
            else showToast('Status pesan diperbarui.', 'success');
            await refresh();
          });

          const delBtn = createEl('button', {
            className: 'admin-btn-danger text-xs px-3',
            text: 'Hapus',
            attrs: { type: 'button' },
          });
          delBtn.addEventListener('click', async () => {
            const ok = await confirmAction({
              title: 'Hapus Pesan Kontak',
              message: `Hapus pesan dari "${msg.sender_name}" secara permanen?`,
            });
            if (!ok) return;
            const { error } = await supabase.from('contact_messages').delete().eq('id', msg.id);
            if (error) showToast(error.message, 'error');
            else showToast('Pesan dihapus permanen.', 'success');
            await refresh();
          });

          row.append(info, createEl('div', { className: 'flex items-center gap-2 shrink-0' }, readBtn, delBtn));
          box.appendChild(row);
        }
        panel.appendChild(box);
      }
    }

    container.replaceChildren(tabs, panel);
  }

  await refresh();
}
