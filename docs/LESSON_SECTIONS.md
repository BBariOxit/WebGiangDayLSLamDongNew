Lesson Sections (structured content)

Backend accepts an optional `sections` array when creating/updating a lesson. Each item:

- type: 'heading' | 'text' | 'image_gallery' | 'video' | 'embed' | 'divider'
- title: optional (used by heading)
- contentHtml: optional HTML (used by text)
- data: object payload
  - image_gallery: { images: [{ url, caption? }] }
  - video: { url }
- orderIndex: integer order (0-based). If omitted, order follows array position.

Database: table `lesson_sections` with ON DELETE CASCADE to `lessons`.

The lesson detail API now returns `sections` field along with the lesson. The frontend renders sections when present; otherwise it falls back to `content_html`.
