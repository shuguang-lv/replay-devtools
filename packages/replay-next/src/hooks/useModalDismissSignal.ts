import { MutableRefObject, RefObject, useEffect } from "react";

// TODO: this doesn't work correctly when multiple stacked modals are open
// they are unaware of each other and the global listeners added by them compete between each other
// in a way that the "outer" can perform its action and call `.preventDefault` - preventing the "inner" one from closing

// Closes a modal dialog if the user clicks outside of it or types "Escape"
export default function useModalDismissSignal(
  modalRef: MutableRefObject<HTMLDivElement> | RefObject<HTMLDivElement>,
  dismissCallback: (() => void) | undefined,
  dismissOnClickOutside: boolean = true
) {
  useEffect(() => {
    const element = modalRef.current;
    if (element === null || !dismissCallback) {
      return;
    }

    const handleKeyboardEvent = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();

        dismissCallback();
      }
    };

    const handleMouseEvent = (event: MouseEvent) => {
      if (event.defaultPrevented) {
        return;
      }

      if (!element.contains(event.target as Node)) {
        event.preventDefault();
        event.stopPropagation();

        dismissCallback();
      }
    };

    let ownerDocument: Document | null = null;

    // Delay until after the current call stack is empty,
    // in case this effect is being run while an event is currently bubbling.
    // In that case, we don't want to listen to the pre-existing event.
    let timeoutID: ReturnType<typeof setTimeout> | null = setTimeout(() => {
      timeoutID = null;

      // It's important to listen to the ownerDocument to support browser extensions.
      // The root document might belong to a different window.
      ownerDocument = element.ownerDocument;
      ownerDocument.addEventListener("keydown", handleKeyboardEvent);
      if (dismissOnClickOutside) {
        ownerDocument.addEventListener("click", handleMouseEvent, true);
        ownerDocument.addEventListener("contextmenu", handleMouseEvent, true);
        ownerDocument.addEventListener("mousedown", handleMouseEvent, true);
        ownerDocument.addEventListener("scroll", dismissCallback, true);
      }
    }, 0);

    return () => {
      if (timeoutID !== null) {
        clearTimeout(timeoutID);
      }

      if (ownerDocument !== null) {
        ownerDocument.removeEventListener("keydown", handleKeyboardEvent);
        ownerDocument.removeEventListener("click", handleMouseEvent, true);
        ownerDocument.removeEventListener("contextmenu", handleMouseEvent, true);
        ownerDocument.removeEventListener("mousedown", handleMouseEvent, true);
        ownerDocument.removeEventListener("scroll", dismissCallback, true);
      }
    };
  }, [modalRef, dismissCallback, dismissOnClickOutside]);
}
