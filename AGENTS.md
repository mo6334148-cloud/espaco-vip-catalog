<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Architecture rules
- Booking availability and creation live in DB functions `get_available_slots` / `create_booking` (security definer) — one source of truth for hours, breaks, blocks, buffer and conflicts; an exclusion constraint blocks overlaps.
- Admin panel uses the browser client with RLS gated by `has_role(auth.uid(),'admin')`; public signup is disabled.
- Admin login is username-based: `usernameToEmail` in src/lib/admin-login.ts maps it to a synthetic e-mail.
