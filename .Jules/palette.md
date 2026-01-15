## 2024-05-22 - Keyboard Navigation for Interactive Divs
**Learning:** Interactive elements implemented as `div`s (like card selection) are completely invisible to keyboard users unless `tabIndex` and `onKeyDown` are explicitly added. `onClick` alone is insufficient for accessibility.
**Action:** Always check if `onClick` is present on non-button elements and ensure they have corresponding `onKeyDown` (Enter/Space) handlers, `tabIndex="0"`, and `role="button"`.
