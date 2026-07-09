# Prompt String Hygiene

> Guarding the large embedded Chinese prompt strings in `lib/prompt.ts` against corrupted characters.

---

## Why this exists

`lib/prompt.ts` holds long Chinese prompt strings (`SYSTEM_PROMPT`, `DAIYU_SYSTEM_PROMPT`, `buildPerspectiveInstruction`, etc.). Editing them with an IME or via copy/paste occasionally injects look-alike or mojibake characters. These bugs:

- Do **not** break TypeScript types or the build — `typecheck` and `build` stay green.
- Only degrade the *semantics* of the prompt sent to the model, so they are invisible to normal CI.
- Are hard to spot by eye inside long paragraphs.

This has already happened in two separate batches on the `daiyu-tone` task, e.g. `自嘶→自嘲`, `锻芒→锋芒`, `拟颇→拟颦`, `释顏→释颦`, `自嘐→自嘲`, `戈然→戛然`, `发氄→发飙`, `劝讫→劝诫`, plus raw `U+FFFD` (`�`).

---

## Required check

After editing any Chinese string in `lib/prompt.ts` (or `route.ts` demo/fallback strings), run a corruption scan in addition to `typecheck` + `build`:

```bash
# 1) Replacement character U+FFFD must be zero
grep -rIln $'\xef\xbf\xbd' app/ lib/ scripts/

# 2) Known bad-character radicals seen so far — inspect every hit
grep -rIn -e '颇' -e '嘶' -e '啄' -e '氄' -e '嘐' -e '讄' -e '顏' app/ lib/ scripts/
```

Both must come back clean (allowing intentional legitimate uses, which should be reviewed case by case). Only then is the change ready to commit.

---

## Forbidden

- Committing prompt-string edits on the basis of a green `typecheck`/`build` alone. Type safety says nothing about prompt correctness.
