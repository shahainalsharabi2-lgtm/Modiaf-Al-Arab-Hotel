import type { KeyboardShortcutEntry } from './keyboard-shortcuts.config';
import { KEYBOARD_SHORTCUTS } from './keyboard-shortcuts.config';

export function isEditableKeyboardTarget(target: HTMLElement | null): boolean {
  if (!target) {
    return false;
  }
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
    return true;
  }
  return target.isContentEditable;
}

function normalizeKey(key: string): string {
  return key.length === 1 ? key.toLowerCase() : key.toLowerCase();
}

export function matchKeyboardShortcut(event: KeyboardEvent, entry: KeyboardShortcutEntry): boolean {
  const parts = entry.keyParts.map((part) => part.toLowerCase());

  if (parts.length === 1 && parts[0].startsWith('f') && /^f\d+$/.test(parts[0])) {
    return (
      event.key.toLowerCase() === parts[0] &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.metaKey &&
      !event.shiftKey
    );
  }

  const needsCtrl = parts.includes('ctrl');
  const needsAlt = parts.includes('alt');
  const needsShift = parts.includes('shift');
  const letter = parts.find((part) => !['ctrl', 'alt', 'shift'].includes(part));
  if (!letter) {
    return false;
  }

  const ctrlOk = needsCtrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
  const altOk = needsAlt ? event.altKey : !event.altKey;
  const shiftOk = needsShift ? event.shiftKey : !event.shiftKey;

  return ctrlOk && altOk && shiftOk && normalizeKey(event.key) === letter;
}

export function findKeyboardShortcut(event: KeyboardEvent): KeyboardShortcutEntry | null {
  for (const entry of KEYBOARD_SHORTCUTS) {
    if (matchKeyboardShortcut(event, entry)) {
      return entry;
    }
  }
  return null;
}
