import React, { Children, useEffect, useMemo, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

const CustomDropdown = ({
  value,
  defaultValue,
  onChange,
  name,
  className = "",
  children,
  disabled = false,
  ...buttonProps
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const currentValue = value ?? defaultValue ?? "";
  const options = useMemo(
    () =>
      Children.toArray(children).filter(
        (child) => React.isValidElement(child) && child.type === "option"
      ),
    [children]
  );
  const selectedOption = options.find(
    (option) => String(option.props.value ?? "") === String(currentValue)
  );

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutsideClick = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const selectOption = (option) => {
    if (option.props.disabled) return;
    onChange?.({ target: { name, value: String(option.props.value ?? "") } });
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      {...buttonProps}
      role="combobox"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-disabled={disabled}
      aria-label={buttonProps["aria-label"]}
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && setOpen((isOpen) => !isOpen)}
      onKeyDown={(event) => {
        buttonProps.onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setOpen((isOpen) => !isOpen);
        } else if (event.key === "ArrowDown") {
          event.preventDefault();
          setOpen(true);
        }
      }}
      className={`relative flex cursor-pointer items-center pr-8 ${className} ${
        disabled ? "cursor-not-allowed opacity-60" : ""
      }`}
      style={{ font: "inherit", paddingRight: 32, ...buttonProps.style }}
    >
      <span className="block truncate">
        {selectedOption?.props.children ?? ""}
      </span>
      <FiChevronDown
        aria-hidden="true"
        className={`pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 transition-transform ${
          open ? "rotate-180" : ""
        }`}
      />

      {open && !disabled && (
        <div
          role="listbox"
          className="absolute left-0 top-full z-[80] mt-1 max-h-60 w-full min-w-max overflow-y-auto border border-slate-200 bg-white py-1 text-sm text-slate-800 shadow-lg"
        >
          {options.map((option, index) => {
            const optionValue = option.props.value ?? "";
            const isSelected = String(optionValue) === String(currentValue);
            return (
              <button
                key={option.key ?? `${optionValue}-${index}`}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={option.props.disabled}
                onClick={() => selectOption(option)}
                className={`block w-full px-3 py-2 text-left transition hover:bg-[#BF9B53]/15 disabled:cursor-not-allowed disabled:opacity-50 ${
                  isSelected ? "bg-[#BF9B53]/10 font-semibold" : ""
                } ${option.props.className || ""}`}
              >
                {option.props.children}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
