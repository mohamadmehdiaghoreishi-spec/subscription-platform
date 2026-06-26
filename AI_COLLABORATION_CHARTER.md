# AI Collaboration Charter

This repository is developed collaboratively by multiple AI systems and human contributors over time.

The objective is not only to deliver features, but to maintain a codebase that remains understandable, maintainable, and extensible.

---

## Roles

**Architecture Review** (e.g. ChatGPT, human architect)
- Preserve architectural consistency
- Review major design decisions and large refactors
- Prevent architecture drift
- Approve escalations

**Implementation Engineer** (e.g. Claude Code)
- Feature implementation and bug fixes
- Test implementation
- Documentation updates tied to implementation changes
- Production hardening

**Human Owner**
- Product direction and business decisions
- Prioritization
- Final approval for releases

---

## Decision Rules

| Scope | Who decides |
|-------|-------------|
| Minor implementation detail | Implementation Engineer — just do it |
| Medium design decision | Document in `docs/architecture-notes.md`, then proceed |
| Major architectural decision | Stop — get explicit approval before implementing |

---

## Escalation Rules

Stop and request Architecture Review if:

- Architecture must change
- Database schema requires breaking changes
- Public API becomes incompatible
- Security assumptions change
- New infrastructure is introduced
- Existing abstractions become insufficient

---

## Repository Philosophy

Every commit should improve at least one of:

- Correctness
- Readability
- Maintainability
- Testability
- Security
- Performance

If none improve, reconsider the change.

---

## Success Metric

Success is measured by:

- Stable architecture
- Reliable production behavior
- High testability
- Low technical debt
- Clear documentation
- Ease of future maintenance

Not by the number of completed commits.
