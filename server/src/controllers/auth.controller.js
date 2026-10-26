// GET /api/auth/me
// requireAuth runs first and has already loaded the signed-in user. The
// client calls this on page load to restore a saved session.
export function me(req, res) {
  res.json({ user: req.user });
}
