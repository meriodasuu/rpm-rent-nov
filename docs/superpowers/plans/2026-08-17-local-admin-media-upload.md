# Local admin media upload — implementation plan

> **Goal:** restore reliable photo uploads in the admin panel without relying on Supabase credentials or using the administrator's laptop as storage.

## Design

1. Keep the existing public URL format (`/api/media/storage?path=...`) so car and location cards need no data migration.
2. Have the signed-upload endpoint issue an authenticated internal upload URL instead of a Supabase signed URL.
3. Validate the received image again on the server and write it below `/app/media`; this is the persistent `media_data` Docker volume on the production server.
4. Serve and delete local files through the existing local-media path, retaining Supabase only as a legacy read/delete fallback.
5. Make deployment initialise ownership of `media_data` for the non-root application user.

## Verification

1. Unit-test local writes, reads, deletion, invalid paths, and the authenticated upload route.
2. Run the focused tests, lint, typecheck, and production build.
3. Deploy `main`, verify the app is healthy, and make a protected local-upload request from inside the running app environment.
