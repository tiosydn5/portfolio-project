import { supabase } from '../lib/supabase.js';
import { createEl, safeUrl } from '../lib/sanitize.js';
import {
  confirmAction,
  createSegmentedControl,
  createToggleSwitch,
  formatWibDate,
  renderEmptyState,
  renderErrorState,
  renderLoadingState,
  showToast,
  studioIcon,
} from './admin-ui.js';

function getInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export async function mountModeration(container, { onDataChange } = {}) {
  renderLoadingState(container, 'Memuat komentar buku tamu dan pesan masuk...');

  let activeTab = 'guestbook';
  let messages = [];
  let comments = [];

  function renderView() {
    const unreadCount = messages.filter((m) => !m.is_read).length;

    const tabsControl = createSegmentedControl({
      ariaLabel: 'Pilih tab buku tamu atau pesan kontak',
      value: activeTab,
      options: [
        { value: 'guestbook', label: 'Komentar Buku Tamu', badge: comments.length },
        {
          value: 'inbox',
          label: 'Pesan Kontak',
          badge: unreadCount > 0 ? `${unreadCount} baru` : messages.length,
        },
      ],
      onChange: (next) => {
        activeTab = next;
        renderList();
      },
    });

    const toolbarCard = createEl(
      'div',
      { className: 'studio-card p-5 sm:p-6 space-y-4' },
      createEl(
        'div',
        { className: 'flex flex-col sm:flex-row sm:items-center justify-between gap-3' },
        createEl(
          'div',
          { className: 'space-y-1' },
          createEl('h2', {
            className: 'font-display text-2xl font-bold text-[#0B0F19]',
            text: 'Buku Tamu & Pesan Masuk',
          }),
          createEl('p', {
            className: 'text-sm text-[#475569]',
            text: 'Kelola komentar pengunjung dan baca pesan kolaborasi langsung dari formulir kontak.',
          })
        ),
        unreadCount > 0
          ? createEl('span', {
              className: 'studio-pill studio-pill-sky self-start sm:self-center',
              text: `${unreadCount} Pesan Belum Dibaca`,
            })
          : null
      ),
      createEl(
        'div',
        { className: 'pt-4 border-t border-[rgba(15,23,42,0.12)]' },
        tabsControl.el
      )
    );

    const listMount = createEl('div', { className: 'space-y-3' });

    function renderList() {
      if (activeTab === 'guestbook') {
        if (comments.length === 0) {
          renderEmptyState(
            listMount,
            'Belum ada komentar pengunjung di buku tamu publik.',
            { title: 'Buku tamu masih kosong' }
          );
          return;
        }

        const stack = createEl('div', { className: 'space-y-3' });

        for (const comment of comments) {
          const avatar = createEl('span', {
            className:
              'w-10 h-10 rounded-full bg-[#DBEAFE] border-[1.5px] border-[#0F172A] flex items-center justify-center font-display text-xs font-bold text-[#1D4ED8] shrink-0',
            text: getInitials(comment.author_name),
            attrs: { 'aria-hidden': 'true' },
          });

          const headerLeft = createEl(
            'div',
            { className: 'flex items-center gap-3 min-w-0' },
            avatar,
            createEl(
              'div',
              { className: 'min-w-0' },
              createEl(
                'div',
                { className: 'flex flex-wrap items-center gap-2' },
                createEl('span', {
                  className: 'font-display text-base font-bold text-[#0B0F19]',
                  text: comment.author_name,
                }),
                comment.author_role
                  ? createEl('span', {
                      className: 'studio-pill studio-pill-periwinkle text-[11px]',
                      text: comment.author_role,
                    })
                  : null
              ),
              createEl('p', {
                className: 'font-mono-tabular text-xs text-[#475569] mt-0.5',
                text: formatWibDate(comment.created_at),
              })
            )
          );

          const statusBadge = createEl('span', {
            className: comment.is_visible
              ? 'studio-pill studio-pill-live text-[11px]'
              : 'studio-pill studio-pill-muted text-[11px]',
            text: comment.is_visible ? 'Ditampilkan' : 'Disembunyikan',
          });

          // Strict textContent rendering for XSS safety
          const bodyText = createEl('p', {
            className: 'text-sm sm:text-base text-[#0B0F19] leading-relaxed break-words',
            text: comment.message,
          });

          const visToggle = createToggleSwitch({
            label: comment.is_visible ? 'Tampil di Publik' : 'Disembunyikan',
            checked: Boolean(comment.is_visible),
            compact: true,
            onChange: async (nextVal) => {
              visToggle.setDisabled(true);
              const { error } = await supabase
                .from('guestbook_comments')
                .update({ is_visible: nextVal })
                .eq('id', comment.id);
              if (error) {
                showToast(error.message, 'error');
                visToggle.setValue(!nextVal);
              } else {
                comment.is_visible = nextVal;
                showToast(
                  nextVal ? 'Komentar ditampilkan di publik.' : 'Komentar disembunyikan.',
                  'success'
                );
                if (typeof onDataChange === 'function') onDataChange();
              }
              visToggle.setDisabled(false);
              renderList();
            },
          });

          const delBtn = createEl(
            'button',
            {
              className: 'studio-btn-danger-outline text-xs min-h-[40px] px-3',
              attrs: { type: 'button' },
            },
            studioIcon('trash', 'w-3.5 h-3.5'),
            createEl('span', { text: 'Hapus' })
          );
          delBtn.addEventListener('click', async () => {
            const ok = await confirmAction({
              title: 'Hapus Komentar',
              message: `Hapus komentar dari "${comment.author_name}" secara permanen?`,
            });
            if (!ok) return;
            delBtn.disabled = true;
            const { error } = await supabase
              .from('guestbook_comments')
              .delete()
              .eq('id', comment.id);
            if (error) showToast(error.message, 'error');
            else showToast('Komentar berhasil dihapus.', 'success');
            await fetchAndRender();
            if (typeof onDataChange === 'function') onDataChange();
          });

          const footer = createEl(
            'div',
            {
              className:
                'pt-3 border-t border-[rgba(15,23,42,0.12)] flex flex-wrap items-center justify-between gap-3',
            },
            visToggle.el,
            delBtn
          );

          const card = createEl(
            'article',
            { className: 'studio-card p-5 space-y-3.5' },
            createEl(
              'div',
              { className: 'flex flex-wrap items-start justify-between gap-3' },
              headerLeft,
              statusBadge
            ),
            bodyText,
            footer
          );

          stack.appendChild(card);
        }

        listMount.replaceChildren(stack);
        return;
      }

      // Contact Messages (Modern Inbox UI)
      if (messages.length === 0) {
        renderEmptyState(
          listMount,
          'Belum ada pesan yang dikirim melalui formulir kontak.',
          { title: 'Kotak masuk masih kosong' }
        );
        return;
      }

      const stack = createEl('div', { className: 'space-y-3' });

      for (const msg of messages) {
        const isUnread = !msg.is_read;
        const mailHref = safeUrl(`mailto:${msg.sender_email}`);

        const senderHeader = createEl(
          'div',
          { className: 'flex items-start gap-3 min-w-0' },
          createEl('span', {
            className: isUnread
              ? 'mt-2 w-2.5 h-2.5 rounded-full bg-[#2563EB] shrink-0'
              : 'mt-2 w-2.5 h-2.5 rounded-full bg-[#CBD5E1] shrink-0',
            attrs: { 'aria-hidden': 'true' },
          }),
          createEl(
            'div',
            { className: 'min-w-0' },
            createEl(
              'div',
              { className: 'flex flex-wrap items-center gap-2' },
              createEl('span', {
                className: 'font-display text-base font-bold text-[#0B0F19]',
                text: msg.sender_name,
              }),
              isUnread
                ? createEl('span', {
                    className: 'studio-pill studio-pill-sky text-[11px]',
                    text: 'Baru',
                  })
                : null
            ),
            createEl(
              'div',
              { className: 'flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-0.5' },
              mailHref
                ? createEl('a', {
                    className: 'font-mono-tabular text-xs font-medium text-[#1D4ED8] hover:underline',
                    text: msg.sender_email,
                    attrs: { href: mailHref },
                  })
                : createEl('span', {
                    className: 'font-mono-tabular text-xs text-[#475569]',
                    text: msg.sender_email,
                  }),
              createEl('span', {
                className: 'font-mono-tabular text-xs text-[#475569]',
                text: `· ${formatWibDate(msg.created_at)}`,
              })
            )
          )
        );

        const msgBody = createEl('p', {
          className: 'text-sm sm:text-base text-[#0B0F19] leading-relaxed break-words pl-5',
          text: msg.message,
        });

        const readBtn = createEl(
          'button',
          { className: 'studio-btn-secondary text-xs min-h-[40px] px-3.5', attrs: { type: 'button' } },
          studioIcon('check', 'w-3.5 h-3.5'),
          createEl('span', { text: msg.is_read ? 'Tandai Belum Dibaca' : 'Tandai Dibaca' })
        );
        readBtn.addEventListener('click', async () => {
          readBtn.disabled = true;
          const nextRead = !msg.is_read;
          const { error } = await supabase
            .from('contact_messages')
            .update({ is_read: nextRead })
            .eq('id', msg.id);
          if (error) showToast(error.message, 'error');
          else {
            msg.is_read = nextRead;
            showToast(
              nextRead ? 'Pesan ditandai sudah dibaca.' : 'Pesan ditandai belum dibaca.',
              'success'
            );
            if (typeof onDataChange === 'function') onDataChange();
          }
          renderView();
        });

        const replyBtn = mailHref
          ? createEl(
              'a',
              {
                className: 'studio-btn-primary text-xs min-h-[40px] px-3.5',
                attrs: { href: mailHref },
              },
              studioIcon('mail', 'w-3.5 h-3.5'),
              createEl('span', { text: 'Balas Email' })
            )
          : null;

        const delBtn = createEl(
          'button',
          {
            className: 'studio-btn-danger-outline text-xs min-h-[40px] px-3',
            attrs: { type: 'button' },
          },
          studioIcon('trash', 'w-3.5 h-3.5'),
          createEl('span', { text: 'Hapus' })
        );
        delBtn.addEventListener('click', async () => {
          const ok = await confirmAction({
            title: 'Hapus Pesan Kontak',
            message: `Hapus pesan dari "${msg.sender_name}" secara permanen?`,
          });
          if (!ok) return;
          delBtn.disabled = true;
          const { error } = await supabase.from('contact_messages').delete().eq('id', msg.id);
          if (error) showToast(error.message, 'error');
          else showToast('Pesan berhasil dihapus.', 'success');
          await fetchAndRender();
          if (typeof onDataChange === 'function') onDataChange();
        });

        const footer = createEl(
          'div',
          {
            className:
              'pt-3 border-t border-[rgba(15,23,42,0.12)] flex flex-wrap items-center justify-between gap-2.5 pl-5',
          },
          createEl('div', { className: 'flex flex-wrap items-center gap-2' }, replyBtn, readBtn),
          delBtn
        );

        const card = createEl(
          'article',
          {
            className: isUnread
              ? 'studio-card p-5 space-y-3 bg-[#F8FBFF]'
              : 'studio-card p-5 space-y-3',
          },
          senderHeader,
          msgBody,
          footer
        );

        stack.appendChild(card);
      }

      listMount.replaceChildren(stack);
    }

    renderList();
    container.replaceChildren(toolbarCard, listMount);
  }

  async function fetchAndRender() {
    const [inboxRes, gbRes] = await Promise.all([
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
      supabase.from('guestbook_comments').select('*').order('created_at', { ascending: false }),
    ]);

    if (inboxRes.error) {
      renderErrorState(container, `Gagal memuat pesan kontak: ${inboxRes.error.message}`, () =>
        fetchAndRender()
      );
      return;
    }

    if (gbRes.error) {
      renderErrorState(container, `Gagal memuat komentar buku tamu: ${gbRes.error.message}`, () =>
        fetchAndRender()
      );
      return;
    }

    messages = inboxRes.data || [];
    comments = gbRes.data || [];
    renderView();
  }

  await fetchAndRender();
}
