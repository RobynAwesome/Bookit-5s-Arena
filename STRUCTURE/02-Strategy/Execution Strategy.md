# Execution Strategy

## Build Order Used

1. Stabilize auth, env handling, and provider foundations.
2. Ship the public Premier League hub tab by tab.
3. Add admin integrations and sandbox control.
4. Repair responsive issues and popup preferences.
5. Raise the quality of local fixtures and homepage interactions.
6. Replace infringing court images.
7. Harden auth, uploads, route protection, and anti-bot posture.
8. Integrate the new env-backed services and admin health surfaces.
9. Add guarded WhatsApp OSINT review tooling.
10. Finish with documentation and handoff structure.

## Strategy Rules Followed

- Public UI first where it improves customer experience.
- Admin-only for risky tools such as sandboxing and OSINT.
- New provider work goes behind dedicated adapters, not inline fetches.
- Existing `/api/fixtures` local arena behavior stays intact while the EPL hub uses its own namespace.
- Every phase ends with lint/build verification and a dedicated git commit.
