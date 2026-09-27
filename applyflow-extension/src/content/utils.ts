export function setReactInputValue(
  element: HTMLInputElement | HTMLTextAreaElement,
  value: string
) {
  const prototype = Object.getPrototypeOf(element)
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value")
  if (descriptor?.set) {
    descriptor.set.call(element, value)
  } else {
    element.value = value
  }

  element.dispatchEvent(new Event("input", { bubbles: true }))
  element.dispatchEvent(new Event("change", { bubbles: true }))
  element.dispatchEvent(new FocusEvent("blur", { bubbles: true }))
}

export function fieldLabel(element: HTMLElement): string {
  const id = element.getAttribute("id")
  const label = id
    ? document.querySelector(`label[for="${CSS.escape(id)}"]`)
    : element.closest("label")
  const parts = [
    label?.textContent ?? "",
    element.getAttribute("aria-label") ?? "",
    element.getAttribute("placeholder") ?? "",
    element.getAttribute("data-automation-id") ?? "",
    element.getAttribute("name") ?? ""
  ]
  return parts.join(" ").replace(/\s+/g, " ").trim().toLowerCase()
}
