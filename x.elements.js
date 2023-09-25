const x = (function() {
    const Validate = (function() {
        function $normalize(str) {
            return str
                .replace(/([a-z])([A-Z])/g, "$1 $2")
                .replace(/_/g, " ")
                .replace(/-/g, " ")
                .toLowerCase();
        }

        function $factorize(rule, name, value) {
            return (
                rule &&
                rule
                .replace(/\{\{\s*name\s*\}\}/g, $normalize(name))
                .replace(/\{\{\s*other\s*\}\}/g, value)
                .trim()
            );
        }

        $errors = {
            required: "The {{name}} field is required",
            email: "The {{name}} field must be a valid email address",
            numeric: "The {{name}} field must be a numeric value",
            integer: "The {{name}} field must be an integer",
            float: "The {{name}} field must be a floating-point number",
            alpha: "The {{name}} field must contain only alphabetic characters",
            date: "The {{name}} field must be a valid date in the format yyyy-mm-dd",
            url: "The {{name}} field must be a valid URL",
            phone: "The {{name}} field must be a valid phone number",
            zipcode: "The {{name}} field must be a valid zipcode",
            strong: "The {{name}} field must have atleast {{other}} characters",
            length: "The {{name}} field must have a length between {{other}}",
            min: "The {{name}} field must be greater than or equal to {{other}}",
            max: "The {{name}} field must be less than or equal to {{other}}",
            regex: "The {{name}} field format is invalid",
            size: "The {{name}} field size must be less than or equal to {{other}}",
            type: "The {{name}} field must be of type {{other}}",
        };

        $rules = {
            Required(input, value) {
                if (["checkbox", "radio"].includes(input.type)) {
                    const checkboxes = document.querySelectorAll(`[name="${input.name}"]`);
                    return Array.from(checkboxes).some((checkbox) => checkbox.checked);
                }
                return value.trim() !== "";
            },
            Email(value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(value);
            },
            Numeric(value) {
                return !isNaN(value);
            },
            Integer(value) {
                return Number.isInteger(Number(value));
            },
            Float(value) {
                return !isNaN(parseFloat(value));
            },
            Alpha(value) {
                const alphaRegex = /^[A-Za-z]+$/;
                return alphaRegex.test(value);
            },
            Date(value) {
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                return dateRegex.test(value);
            },
            URL(value) {
                const urlRegex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i;
                return urlRegex.test(value);
            },
            Phone(value) {
                const phoneNumberRegex = /^(?:\+*([0-9]{3}|0))(?:[ \-]?[0-9]){9}$/;
                return phoneNumberRegex.test(value);
            },
            Length(value, size) {
                const sizeParts = size
                    .split(",")
                    .map((e) => e.trim())
                    .filter((e) => e.length);
                const minLength = sizeParts[0] ? parseInt(sizeParts[0]) : null;
                const maxLength = sizeParts[1] ? parseInt(sizeParts[1]) : null;
                if (minLength !== null && value.length < minLength) {
                    return false;
                }
                if (maxLength !== null && value.length > maxLength) {
                    return false;
                }
                return true;
            },
            Strong(value, rules) {
                const rulesParts = rules
                    .split(",")
                    .map((e) => e.trim())
                    .filter((e) => e.length);
                let isValid = true;
                rulesParts.forEach((rule) => {
                    rule = rule.trim();
                    if (rule === "uppercase" && !/[A-Z]/.test(value)) {
                        isValid = false;
                    }
                    if (rule === "lowercase" && !/[a-z]/.test(value)) {
                        isValid = false;
                    }
                    if (rule === "numeric" && !/\d/.test(value)) {
                        isValid = false;
                    }
                    if (rule === "special" && !/[!@#$%^&*]/.test(value)) {
                        isValid = false;
                    }
                });
                return isValid;
            },
            Min(value, size) {
                return parseFloat(value) >= parseFloat(size);
            },
            Max(value, size) {
                return parseFloat(value) <= parseFloat(size);
            },
            Regex(value, regex) {
                const customRegex = new RegExp(regex);
                return customRegex.test(value);
            },
            ZipCode(value) {
                const postalCodeRegex = /^\d{5}$/;
                return postalCodeRegex.test(value);
            },
            Size(input, size) {
                const maxSize = parseInt(size);
                return input.files[0].size <= maxSize;
            },
            Type(input, allowedTypes) {
                const fileTypes = input.accept
                    .split(",")
                    .map((e) => e.trim())
                    .filter((e) => e.length);
                return fileTypes.some((type) => allowedTypes.includes(type));
            },
        };

        function Validate(selector, { rules = {}, errors = {}, success = {}, onSuccess = () => {}, onFailure = () => {}, onExecute = null }) {
            const form = document.querySelector(selector);
            const detail = {};

            form.addEventListener("submit", (e) => {
                e.preventDefault();
                let isValid = true;

                for (const field in rules) {
                    if (rules.hasOwnProperty(field)) {
                        const _input = form.querySelector(`[name="${field}"]`);
                        const _rules = typeof rules[field] === "string" ? rules[field].split("|") : rules[field];
                        const _value = _input.value.trim();
                        detail[field] = _input;
                        let isSuccess = true;

                        _rules.forEach((rule) => {
                            const ruleParts = rule.split(":");
                            const ruleName = ruleParts[0].toLowerCase();
                            const ruleValue = ruleParts[1];
                            const config = {
                                error: $factorize(errors[field], field, ruleValue),
                                default: $factorize($errors[ruleName], field, ruleValue),
                            };

                            switch (ruleName) {
                                case "required":
                                    if (!$rules.Required(_input, _value)) {
                                        isSuccess = false;
                                        isValid = false;
                                    }
                                    break;
                                case "email":
                                    if (!$rules.Email(_value)) {
                                        isSuccess = false;
                                        isValid = false;
                                    }
                                    break;
                                case "numeric":
                                    if (!$rules.Numeric(_value)) {
                                        isSuccess = false;
                                        isValid = false;
                                    }
                                    break;
                                case "integer":
                                    if (!$rules.Integer(_value)) {
                                        isSuccess = false;
                                        isValid = false;
                                    }
                                    break;
                                case "float":
                                    if (!$rules.Float(_value)) {
                                        isSuccess = false;
                                        isValid = false;
                                    }
                                    break;
                                case "alpha":
                                    if (!$rules.Alpha(_value)) {
                                        isSuccess = false;
                                        isValid = false;
                                    }
                                    break;
                                case "date":
                                    if (!$rules.Date(_value)) {
                                        isSuccess = false;
                                        isValid = false;
                                    }
                                    break;
                                case "url":
                                    if (!$rules.URL(_value)) {
                                        isSuccess = false;
                                        isValid = false;
                                    }
                                    break;
                                case "phone":
                                    if (!$rules.Phone(_value)) {
                                        isSuccess = false;
                                        isValid = false;
                                    }
                                    break;
                                case "zipcode":
                                    if (!$rules.ZipCode(_value)) {
                                        isSuccess = false;
                                        isValid = false;
                                    }
                                    break;
                                case "regex":
                                    if (!$rules.Regex(_value, ruleValue)) {
                                        isSuccess = false;
                                        isValid = false;
                                    }
                                    break;
                                case "strong":
                                    if (!$rules.Strong(_value, ruleValue)) {
                                        isSuccess = false;
                                        isValid = false;
                                    }
                                    break;
                                case "length":
                                    if (!$rules.Length(_value, ruleValue)) {
                                        isSuccess = false;
                                        isValid = false;
                                    }
                                    break;
                                case "min":
                                    if (!$rules.Min(_value, ruleValue)) {
                                        isSuccess = false;
                                        isValid = false;
                                    }
                                    break;
                                case "max":
                                    if (!$rules.Max(_value, ruleValue)) {
                                        isSuccess = false;
                                        isValid = false;
                                    }
                                    break;
                                case "size":
                                    if (!$rules.Size(_input, ruleValue)) {
                                        isSuccess = false;
                                        isValid = false;
                                    }
                                    break;
                                case "type":
                                    if (!$rules.Type(_input, ruleValue)) {
                                        isSuccess = false;
                                        isValid = false;
                                    }
                                    break;
                            }

                            if (!isSuccess)
                                onFailure({
                                    form: form,
                                    field: _input,
                                    name: field,
                                    message: config.error || config.default,
                                });
                        });

                        if (isSuccess) {
                            const message = $factorize(success[field], field, "");
                            onSuccess({
                                form: form,
                                field: _input,
                                name: field,
                                message: message,
                            });
                        }
                    }
                }

                if (isValid) onExecute ? onExecute(e, detail) : form.submit();
            });

            return this;
        }

        return Validate;
    })();

    const Toaster = (function() {
        function Toaster(message, type, time = 6000) {
            const text = (Array.isArray(message) ? message : [message]).join("<br />");
            const classes = type === "success" ? "border-emerald-500 bg-emerald-200 text-emerald-500" : "border-red-500 bg-red-200 text-red-500";
            const toaster = document.createElement("section");
            toaster.className = "pointer-events-none toaster w-full fixed bottom-0 translate-y-full left-0 z-50 transition-transform duration-500";
            toaster.innerHTML =
                '<div class="container w-full lg:w-max lg:max-w-[30%] lg:min-w-[20%] mx-auto p-4"><div class="w-full pointer-events-auto text-center px-4 py-2 border rounded-md text-base font-black ' +
                classes +
                '">' +
                text +
                "</div></div>";
            document.body.insertAdjacentElement("beforeend", toaster);
            setTimeout(() => {
                toaster.classList.remove("translate-y-full");
            }, 100);
            setTimeout(() => {
                [...document.querySelectorAll(".toaster")].forEach((toast) => {
                    toast.classList.add("translate-y-full");
                    setTimeout(() => {
                        toast.remove();
                    }, 1000);
                });
            }, time);

            return this;
        }

        return Toaster;
    })();

    const Print = (function() {
        function Print(trigger, target) {
            const _target = document.querySelector(target);
            const html =
                '<!DOCTYPE html><html lang="' +
                Print.opts.lang +
                '"dir="' +
                Print.opts.dir +
                '"><head><meta charset="UTF-8"/><meta http-equiv="X-UA-Compatible"content="IE=edge"/><meta name="viewport"content="width=device-width, initial-scale=1.0"/>' +
                Print.opts.css.map((link) => `<link rel="stylesheet"href="${link}"/>`).join("") +
                "<style>@page{size:" +
                Print.opts.size +
                ";margin:" +
                Print.opts.margin +
                ";}</style></head><body>" +
                _target.innerHTML +
                "</body></html>";
            _target.remove();
            [...document.querySelectorAll(trigger)].forEach((el) => {
                el.addEventListener("click", (e) => {
                    var iframe = document.createElement("iframe");
                    iframe.style.display = "none";
                    document.body.appendChild(iframe);
                    var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    iframeDoc.open();
                    iframeDoc.write(html);
                    iframeDoc.close();
                    iframe.onload = function() {
                        iframe.contentWindow.print();
                        setTimeout(() => {
                            document.body.removeChild(iframe);
                        }, 1000);
                    };
                });
            });

            return this;
        }

        Print.opts = {
            css: [],
            dir: "ltr",
            lang: "en",
            size: "A4",
            margin: "5mm 5mm 5mm 5mm",
        };

        return Print;
    })();

    const Switch = (function() {
        function Switch() {
            const { Elements, Attributes } = Switch.opts;
            var targets = document.querySelectorAll(`[${Attributes.Selector}]`);
            if (Elements.length) targets = [...targets, ...Elements];
            if (!targets.length) return this;

            const XSwitch = document.createElement("x-switch");
            XSwitch.className = "x-element x-switch relative block";
            XSwitch.innerHTML = `
                <label class="x-switch-content w-max flex items-center gap-2">
                    <span class="x-switch-text text-[#1d1d1d] block text-base"></span>
                </label>
            `;

            for (let i = 0; i < targets.length; i++) {
                const current = targets[i];
                const wrapper = XSwitch.cloneNode(true);
                current.x = {
                    change: null,
                };
                current.opts = {
                    els: {
                        wrapper: wrapper,
                        label: wrapper.querySelector("label"),
                        text: wrapper.querySelector("span"),
                    },
                    classes: {
                        input: "x-switch-input bg-[#f5f5f5] border-[#d1d1d1] checked:bg-[#66baff] before:border-[#d1d1d1] checked:focus-within:outline-[#1d1d1d] focus-within:outline-[#66baff] relative w-12 h-6 border rounded-full cursor-pointer transition-colors ease-in-out duration-200 appearance-none focus-within:outline focus-within:outline-2 focus-within:outline-offset-[0] before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2 rtl:before:left-auto rtl:before:-right-px before:-left-px before:block before:w-6 before:h-6 before:bg-gray-50 before:border rtl:checked:before:-translate-x-full checked:before:translate-x-full before:rounded-full before:transform before:transition before:ease-in-out before:duration-200",
                    },
                };
                current.className = current.opts.classes.input;
                current.opts.els.label.for = current.id;

                const $callable = (function $callable() {
                    if ((current.getAttribute(Attributes.Label) || "").trim().length)
                        current.opts.els.text.innerHTML = current.getAttribute(Attributes.Label);
                    return $callable;
                })();

                current.addEventListener("change", (e) => {
                    current.x.change && current.x.change(e);
                    current.dispatchEvent(
                        new CustomEvent("x-change", {
                            bubbles: true,
                        })
                    );
                });
                current.addEventListener("keydown", (e) => {
                    e.keyCode === 13 && current.click();
                    current.x.change && current.x.change(e);
                    current.dispatchEvent(
                        new CustomEvent("x-change", {
                            bubbles: true,
                        })
                    );
                });

                new MutationObserver((mutationsList) => {
                    for (const mutation of mutationsList) {
                        if (mutation.type === "attributes") {
                            if (mutation.attributeName === Attributes.Label) {
                                $callable();
                            }
                        }
                    }
                }).observe(current, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                });

                current.insertAdjacentElement("afterend", wrapper);
                current.opts.els.label.insertAdjacentElement("afterbegin", current);
                current.removeAttribute(Attributes.Selector);
            }

            return this;
        }

        Switch.opts = {
            Elements: [],
            Attributes: {
                Selector: "x-switch",
                Label: "label",
            },
        };

        return Switch;
    })();

    const Password = (function() {
        function Password() {
            const { Elements, Attributes } = Password.opts;
            var targets = document.querySelectorAll(`[${Attributes.Selector}]`);
            if (Elements.length) targets = [...targets, ...Elements];
            if (!targets.length) return this;

            const XPassword = document.createElement("x-password");
            XPassword.className = "x-element x-password relative block";
            XPassword.innerHTML = `
                <x-password-container class="x-password-container bg-[#f5f5f5] border-[#d1d1d1] focus-within:outline-[#66baff] flex flex-wrap items-center gap-2 p-2 rounded-md cursor-text border focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2">
                    <button class="x-password-trigger focus-within:outline-[#66baff] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 rounded-sm">
                        <svg class="x-password-icon text-[#1d1d1d] block pointer-events-none w-5 h-5" fill="currentColor" viewBox="0 -960 960 960">
                            <path class="x-pasword-icon-on" d="M480.294-333Q550-333 598.5-381.794t48.5-118.5Q647-570 598.206-618.5t-118.5-48.5Q410-667 361.5-618.206t-48.5 118.5Q313-430 361.794-381.5t118.5 48.5Zm-.412-71q-39.465 0-67.674-28.326Q384-460.652 384-500.118q0-39.465 28.326-67.674Q440.652-596 480.118-596q39.465 0 67.674 28.326Q576-539.348 576-499.882q0 39.465-28.326 67.674Q519.348-404 479.882-404ZM480-180q-143.61 0-260.805-79T37.145-467.077q-3.945-5.987-6.045-14.901-2.1-8.915-2.1-17.824 0-8.909 2.1-18.178 2.1-9.27 6.045-16.943 64.834-126.779 182.04-205.928Q336.39-820 480-820t260.815 79.149q117.206 79.149 182.04 205.928 3.945 7.673 6.045 16.588 2.1 8.914 2.1 17.823t-2.1 18.179q-2.1 9.269-6.045 15.256Q858-338 740.805-259 623.61-180 480-180Z"/>
                            <path class="x-pasword-icon-off hidden" d="M780-286 632-434q8-12 11.5-31t3.5-35q0-70-48.5-118.5T480-667q-17 0-33 3.5T414-652L286-781q34-14 90.5-26.5T485-820q136 0 255.5 75.5T925-535q3 8 4.5 17t1.5 18q0 9-1.5 18.5T924-466q-27 56-64 100.5T780-286Zm2 200L653-211q-35 14-79.5 22.5T480-180q-141 0-259.5-75.5T36-467q-4-7-5.5-15.5T29-500q0-9 2-19t5-17q21-43 53.5-85t73.5-82l-97-98q-10-8-10-22.5T66-848q8-9 23-9t25 9l716 716q9 10 7.5 23.5T830-87q-11 11-25.5 11T782-86ZM480-333q12 0 24.5-3t20.5-6L320-545q-2 10-4.5 22t-2.5 23q0 71 49 119t118 48Zm82-172-72-72q27-18 59 7t13 65Z"/>
                        </svg>
                    </button>
                </x-password-container>
            `;

            for (let i = 0; i < targets.length; i++) {
                const current = targets[i];
                const wrapper = XPassword.cloneNode(true);
                current.x = {
                    toggle: null,
                    show: null,
                    hide: null,
                };
                current.opts = {
                    els: {
                        wrapper: wrapper,
                        container: wrapper.querySelector("x-password-container"),
                        trigger: wrapper.querySelector(".x-password-trigger"),
                        open: wrapper.querySelector(".x-pasword-icon-on"),
                        close: wrapper.querySelector(".x-pasword-icon-off"),
                    },
                    classes: {
                        input: "x-password-input flex-1 outline-none bg-transparent",
                    },
                };
                current.className = current.opts.classes.input;

                current.opts.els.trigger.addEventListener("click", (e) => {
                    e.preventDefault();
                    current.type = current.type == "password" ? "text" : "password";
                    current.opts.els.open.classList.toggle("hidden");
                    current.opts.els.close.classList.toggle("hidden");

                    if (current.type == "text") {
                        current.x.show && current.x.show(e);
                        current.dispatchEvent(
                            new CustomEvent("x-show", {
                                bubbles: true,
                            })
                        );
                    } else {
                        current.x.hide && current.x.hide(e);
                        current.dispatchEvent(
                            new CustomEvent("x-hide", {
                                bubbles: true,
                            })
                        );
                    }

                    current.toggle && current.toggle(e);
                    current.dispatchEvent(
                        new CustomEvent("x-toggle", {
                            bubbles: true,
                        })
                    );
                });

                current.insertAdjacentElement("afterend", wrapper);
                current.opts.els.container.insertAdjacentElement("afterbegin", current);
                current.removeAttribute(Attributes.Selector);
            }

            return this;
        }

        Password.opts = {
            Elements: [],
            Attributes: {
                Selector: "x-password",
            },
        };

        return Password;
    })();

    const Toggle = (function() {
        function Toggle() {
            const { Elements, Attributes } = Toggle.opts;
            var targets = document.querySelectorAll(`[${Attributes.Selector}]`);
            if (Elements.length) targets = [...targets, ...Elements];
            if (!targets.length) return this;

            for (let i = 0; i < targets.length; i++) {
                const current = targets[i];
                current.x = {
                    toggle: null,
                };
                const selectors = (current.getAttribute(Attributes.Targets) || "").split(",");
                if (!selectors.length) continue;
                const map = {
                    properties: ((current.getAttribute(Attributes.Properties) || "").split(",") || []).map((e) => e.trim()),
                    targets: [],
                };

                for (let j = 0; j < selectors.length; j++) {
                    const selector = selectors[j].trim();
                    const elements = document.querySelectorAll(selector);
                    if (!elements.length) continue;
                    map.targets = [...map.targets, ...elements];
                }

                current.addEventListener("click", (e) => {
                    for (let j = 0; j < map.targets.length; j++) {
                        const target = map.targets[j];

                        for (let k = 0; k < map.properties.length; k++) {
                            const property = map.properties[k].split(">");

                            if (property[0] === "attr") {
                                const attribute = property[1];
                                if (target.hasAttribute(attribute)) target.removeAttribute(attribute);
                                else target.setAttribute(attribute, "");
                            } else {
                                const classname = property.length > 1 ? property[1] : property[0];
                                target.classList.toggle(classname);
                            }
                        }
                    }

                    current.toggle && current.toggle(e);
                    current.dispatchEvent(
                        new CustomEvent("x-toggle", {
                            bubbles: true,
                        })
                    );
                });

                current.removeAttribute(Attributes.Targets);
                current.removeAttribute(Attributes.Selector);
                current.removeAttribute(Attributes.Properties);
            }

            return this;
        }

        Toggle.blur = function(list = []) {
            list.forEach((item) => {
                const current = document.querySelector(item.selector);
                if (!current) return;
                const $callable = (function $callable() {
                    items = [...current.querySelectorAll("a")];
                    if (current.classList.contains(item.class)) items.forEach((itm) => (itm.tabIndex = "-1"));
                    else items.forEach((itm) => itm.removeAttribute("tabindex"));
                    return $callable;
                })();
                new MutationObserver((mutationsList) => {
                    for (const mutation of mutationsList) {
                        if (mutation.type === "attributes") {
                            if (mutation.attributeName === "class") {
                                $callable();
                            }
                        }
                    }
                }).observe(current, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                });
            });
        };

        Toggle.opts = {
            Elements: [],
            Attributes: {
                Selector: "x-toggle",
                Targets: "targets",
                Properties: "properties",
            },
        };

        return Toggle;
    })();

    const Select = (function() {
        function $label(select) {
            if (select.hasAttribute(Select.opts.Attributes.Placeholder) && select.attributes[Select.opts.Attributes.Placeholder].value.trim().length) {
                const text = select.attributes[Select.opts.Attributes.Placeholder].value.trim();
                const fieldLabel = select.opts.els.fieldLabel;
                const label = select.opts.els.label;
                fieldLabel.innerHTML = text;
                label.innerHTML = text;
                select.opts.els.tools.insertAdjacentElement("afterbegin", label);
                if (select.opts.els.fieldText.innerHTML.trim() === "") select.opts.els.fieldText.insertAdjacentElement("afterbegin", fieldLabel);
            }
        }

        function $search(select) {
            if (select.hasAttribute(Select.opts.Attributes.Search) && select.attributes[Select.opts.Attributes.Search].value !== "false") {
                select.opts.els.tools.appendChild(select.opts.els.search);
            } else {
                if (select.opts.els.tools.querySelector("input")) select.opts.els.tools.removeChild(select.opts.els.search);
            }
        }

        function $tools(select) {
            if (
                (select.hasAttribute(Select.opts.Attributes.Search) && select.attributes[Select.opts.Attributes.Search].value !== "false") ||
                (select.hasAttribute(Select.opts.Attributes.Placeholder) && select.attributes[Select.opts.Attributes.Placeholder].value.trim().length)
            ) {
                select.opts.els.content.insertAdjacentElement("afterbegin", select.opts.els.tools);
                if (!select.hasAttribute(Select.opts.Attributes.Search) || select.attributes[Select.opts.Attributes.Search].value === "false")
                    select.opts.els.tools.classList.add("lg:!hidden");
                else select.opts.els.tools.classList.remove("lg:!hidden");
            } else {
                if (select.opts.els.content.querySelector("x-select-tools")) select.opts.els.content.removeChild(select.opts.els.tools);
            }
        }

        function $multiple(select) {
            if (select.hasAttribute(Select.opts.Attributes.Multiple) && select.attributes[Select.opts.Attributes.Multiple].value !== "false") {
                select.opts.name = select.name;
                select.removeAttribute("name");
            } else {
                select.setAttribute("name", select.opts.name);
            }
        }

        function $disable(select) {
            if (select.hasAttribute(Select.opts.Attributes.Disabled) && select.attributes[Select.opts.Attributes.Disabled].value !== "false") {
                select.opts.els.wrapper.classList.add("opacity-80", "!pointer-events-none", "x-select-disabled");
                select.opts.els.fieldContainer.tabIndex = "-1";
            } else {
                select.opts.els.wrapper.classList.remove("opacity-80", "!pointer-events-none", "x-select-disabled");
                select.opts.els.fieldContainer.tabIndex = "0";
            }
        }

        function $clear(select) {
            [...select.opts.els.wrapper.querySelectorAll("[x-select-chose]")].forEach((e) => e.remove());
            if (select.opts.els.fieldText.querySelector("x-select-field-label")) select.opts.els.fieldText.removeChild(select.opts.els.fieldLabel);
            select.opts.els.fieldText.innerHTML = "";
            select.opts.els.items.innerHTML = "";
            select.selectedIndex = -1;
            select.opts.data = [];
        }

        function $get(el, array, order = 0) {
            [...el.children].forEach((e) => {
                if (e.tagName === "OPTION") {
                    array.push({
                        isOpt: true,
                        text: e.innerHTML,
                        value: e.value,
                        selected: e.selected || e.hasAttribute("selected"),
                        disabled: e.disabled || e.hasAttribute("disabled"),
                        order: order,
                        target: e,
                    });
                } else {
                    array.push({
                        isOpt: false,
                        label: e.label,
                        order: 1,
                    });
                    $get(e, array, 1);
                }
            });
            return array;
        }

        function $init(select) {
            $clear(select);
            const options = $get(select, []).sort((x, y) => x.order - y.order);

            for (const option of options) {
                const index = [...select.options].indexOf(option.target);

                if (option.isOpt) {
                    if (!option.value.trim().length) continue;
                    const clone = select.opts.els.item.cloneNode(true);
                    clone.innerHTML = option.text.trim();
                    clone.dataset.value = option.value.trim();
                    clone.setAttribute("tabindex", "0");

                    if (option.selected && !option.disabled) {
                        $choose(select, clone, option.target, index);
                    }

                    if (option.disabled) {
                        clone.className = select.opts.classes.disabled;
                        select.selectedIndex = index;
                        clone.removeAttribute("tabindex");
                    }

                    const $callable = () => {
                        $choose(select, clone, option.target, index);

                        if (!select.hasAttribute(Select.opts.Attributes.Multiple) ||
                            select.attributes[Select.opts.Attributes.Multiple].value === "false"
                        ) {
                            $toggle(select);
                        }

                        select.x.change &&
                            current.x.change({
                                ...e,
                                detail: {
                                    target: clone,
                                    index: index,
                                },
                            });
                        select.dispatchEvent(
                            new CustomEvent("x-change", {
                                bubbles: true,
                                detail: {
                                    target: clone,
                                    index: index,
                                },
                            })
                        );
                    };

                    clone.addEventListener("click", $callable);
                    clone.addEventListener("keydown", (e) => {
                        if (e.keyCode === 13) $callable();
                    });
                    select.opts.els.items.append(clone);
                } else {
                    if (!option.label.trim().length) option.label = "_";
                    const clone = select.opts.els.group.cloneNode(true);
                    clone.innerHTML += " " + option.label.trim();
                    select.opts.els.items.append(clone);
                }
            }
        }

        function $toggle(select) {
            const { items, search, modal } = select.opts.els;

            if (select.hasAttribute(Select.opts.Attributes.Disabled) && select.attributes[Select.opts.Attributes.Disabled].value !== "false") return;

            for (let item of items.children) {
                item.classList.remove("hidden");
            }

            search.value = "";
            items.scrollTop = 0;
            modal.classList.remove("lg:top-full", "lg:mt-1", "lg:bottom-full", "lg:mb-1");
            modal.classList.toggle("!hidden");
            const classes =
                window.innerHeight - modal.getBoundingClientRect().top < modal.clientHeight ? ["lg:bottom-full", "lg:mb-1"] : ["lg:top-full", "lg:mt-1"];
            modal.classList.add(...classes);

            if (modal.classList.contains("!hidden")) {
                document.body.classList.remove("!overflow-hidden", "!h-screen", "lg:!overflow-auto", "lg:!h-[unset]");
                select.opts.mode = "closed";

                select.x.close && select.x.close({ target: select });
                select.dispatchEvent(
                    new CustomEvent("x-close", {
                        bubbles: true,
                    })
                );
            } else {
                document.body.classList.add("!overflow-hidden", "!h-screen", "lg:!overflow-auto", "lg:!h-[unset]");
                select.opts.mode = "open";

                select.x.open && select.x.open({ target: select });
                select.dispatchEvent(
                    new CustomEvent("x-open", {
                        bubbles: true,
                    })
                );
            }

            select.toggle && select.toggle({ target: select });
            select.dispatchEvent(
                new CustomEvent("x-toggle", {
                    bubbles: true,
                })
            );
        }

        function $choose(select, chosen, option, index = 0) {
            const opts = select.opts;

            if (select.hasAttribute(Select.opts.Attributes.Multiple) && select.attributes[Select.opts.Attributes.Multiple].value !== "false") {
                const data = opts.data;
                const selectedClass = opts.classes.selected;
                const maxLength = parseInt(select.getAttribute(Select.opts.Attributes.Length));

                if (chosen.classList.contains("x-select-selected")) {
                    const idx = data.indexOf(option);
                    data.splice(idx, 1);
                    chosen.className = opts.els.item.className;
                } else {
                    if (data.length >= maxLength) return;
                    chosen.className = selectedClass;
                    if (!data.includes(option)) data.push(option);
                }

                opts.els.fieldText.innerHTML = "";
                data.forEach((e) => {
                    const clone = opts.els.fieldMultiple.cloneNode(true);
                    clone.innerHTML = e.innerText.trim();
                    opts.els.fieldText.append(clone);
                });

                const existingInputs = [...opts.els.wrapper.querySelectorAll("[x-select-chose]")];
                existingInputs.forEach((input) => {
                    const value = input.value;
                    if (!data.some((option) => option.value === value)) {
                        input.remove();
                    }
                });

                data.forEach((e) => {
                    const value = e.value;
                    if (!existingInputs.some((input) => input.value === value)) {
                        opts.els.wrapper.insertAdjacentHTML("beforeend", `<input x-select-chose type="hidden" value="${value}" name="${opts.name}"/>`);
                    }
                });
            } else {
                select.selectedIndex = index;
                const text = opts.els.fieldSingle.cloneNode(true);
                text.innerHTML = chosen.innerText.trim();
                opts.els.fieldText.innerText = "";
                opts.els.fieldText.append(text);
                for (let item of opts.els.items.children) {
                    if (item.classList.contains("x-select-selected")) item.className = opts.els.item.className;
                }
                chosen.className = opts.classes.selected;
            }

            $label(select);
        }

        function Select() {
            const { Elements, Attributes, DataText } = Select.opts;
            var targets = document.querySelectorAll(`[${Attributes.Selector}]`);
            if (Elements.length) targets = [...targets, ...Elements];
            if (!targets.length) return this;

            const XSelect = document.createElement("x-select"),
                XSelectFieldLabel = document.createElement("x-select-field-label"),
                XSelectFieldSingle = document.createElement("x-select-field-single"),
                XSelectFieldMultiple = document.createElement("x-select-field-multiple"),
                XSelectTools = document.createElement("x-select-tools"),
                XSelectLabel = document.createElement("x-select-label"),
                XSelectGroup = document.createElement("x-select-group"),
                XSelectItem = document.createElement("x-select-item"),
                XSelectSearch = document.createElement("input");
            XSelect.className = "x-element x-select lg:relative block";
            XSelectFieldLabel.className = "x-select-field-label text-[#9ca3af] text-base";
            XSelectFieldSingle.className = "x-select-field-single text-[#1d1d1d] text-base";
            XSelectFieldMultiple.className = "x-select-field-multiple block w-max bg-[#66baff] text-[#fcfcfc] text-xs p-1 rounded-sm";
            XSelectTools.className = "x-select-tools border-[#d1d1d1] flex flex-col border-b p-2 gap-2";
            XSelectLabel.className = "x-select-label text-[#1d1d1d] text-base text-center font-black leading-[1] lg:hidden";
            XSelectGroup.className = "x-select-group text-[#1d1d1d] truncate overflow-hidden text-base p-2 py-1 font-semibold outline-none";
            XSelectItem.className =
                "x-select-item text-[#1d1d1d] hover:bg-[#d1d1d1] focus-within:bg-[#d1d1d1] truncate overflow-hidden text-base p-2 hover:bg-opacity-50 focus-within:bg-opacity-50 outline-none cursor-pointer";
            XSelectSearch.className =
                "x-select-search bg-[#f5f5f5] text-[#1d1d1d] border-[#d1d1d1] focus-within:outline-[#66baff] p-2 text-sm border rounded-md focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2";
            XSelectSearch.type = "search";
            XSelectSearch.placeholder = DataText.Search;
            XSelectGroup.tabIndex = "-1";
            XSelect.innerHTML = `
                <x-select-field-container tabindex="0" class="x-select-field-container bg-[#f5f5f5] border-[#d1d1d1] focus-within:outline-[#66baff] flex flex-wrap items-center gap-2 p-2 rounded-md cursor-pointer border focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2">
                    <x-select-field-content class="x-select-field-content w-0 flex-1 overflow-auto no-scrollbar">
                        <x-select-field-text class="x-select-field-text w-max flex items-center gap-2"></x-select-field-text>
                    </x-select-field-content>
                    <x-select-field-icon-wrapper class="x-select-field-icon-wrapper pointer-events-none w-5 h-5 overflow-hidden flex items-center justify-center">
                        <svg class="x-select-field-icon text-[#1d1d1d] block w-8 h-8 absolute" fill="currentColor" viewBox="0 -960 960 960">
                            <path d="M479.889-343q-8.889 0-17.339-3.545Q454.1-350.091 449-357L250-554q-12-13.25-11.5-32.125T251-618.5q15-14.5 33-13t31 13.5l165 165 166-165q12.5-13 31.75-13.5T710-617.571q14 13.428 13 32.5Q722-566 709-554L512-357q-6.167 6.909-14.694 10.455Q488.778-343 479.889-343Z"/>
                        </svg>
                    </x-select-field-icon-wrapper>
                </x-select-field-container>
                <x-select-modal class="x-select-modal bg-[#1d1d1d] lg:bg-transparent fixed inset-0 flex flex-col justify-end p-2 bg-opacity-40 backdrop-blur-sm lg:p-0 lg:absolute lg:inset-auto lg:top-full lg:left-0 lg:rtl:left-auto lg:rtl:right-0 lg:w-full lg:min-w-[20rem] lg:mt-1 !hidden z-50">
                    <x-select-content class="x-select-content bg-[#fcfcfc] border-[#d1d1d1] shadow-[#1d1d1d20] shadow-sm flex flex-col w-full rounded-md max-h-[70vh] overflow-hidden border lg:max-h-[300px]">
                        <x-select-list class="x-select-list overflow-auto flex-1">
                            <x-select-items class="x-select-items flex flex-col"></x-select-items>
                        </x-select-list>
                    </x-select-content>
                </x-select-modal>
            `;

            for (let i = 0; i < targets.length; i++) {
                const current = targets[i];
                const wrapper = XSelect.cloneNode(true);
                current.selectedIndex = -1;
                current.x = {
                    toggle: null,
                    search: null,
                    change: null,
                    close: null,
                    open: null,
                };
                current.opts = {
                    els: {
                        wrapper: wrapper,
                        fieldContainer: wrapper.querySelector("x-select-field-container"),
                        fieldText: wrapper.querySelector("x-select-field-text"),
                        modal: wrapper.querySelector("x-select-modal"),
                        content: wrapper.querySelector("x-select-content"),
                        items: wrapper.querySelector("x-select-items"),
                        fieldLabel: XSelectFieldLabel.cloneNode(true),
                        tools: XSelectTools.cloneNode(true),
                        label: XSelectLabel.cloneNode(true),
                        search: XSelectSearch.cloneNode(true),
                        fieldSingle: XSelectFieldSingle,
                        fieldMultiple: XSelectFieldMultiple,
                        goup: XSelectGroup,
                        item: XSelectItem,
                    },
                    classes: {
                        disabled: "x-select-item x-select-disabled text-[#1d1d1d] bg-[#4f504b] truncate overflow-hidden text-base p-2 bg-opacity-50 outline-none",
                        selected: "x-select-item x-select-selected text-[#fcfcfc] bg-[#66baff] truncate overflow-hidden text-base p-2 hover:bg-opacity-50 focus-within:bg-opacity-50 outline-none cursor-pointer",
                    },
                    data: [],
                    mode: "closed",
                    name: current.name,
                };
                current.classList.add("hidden");

                const $resize = () => {
                    if (matchMedia("((min-width: 1024px))").matches) current.opts.els.wrapper.appendChild(current.opts.els.modal);
                    else document.body.appendChild(current.opts.els.modal);
                };

                [current, current.opts.els.fieldContainer].forEach((el) => {
                    el.addEventListener("click", () => $toggle(current));
                    el.addEventListener("keydown", (e) => {
                        if (e.keyCode === 13) $toggle(current);
                    });
                });
                current.opts.els.search.addEventListener("input", (e) => {
                    const filter = e.target.value.toUpperCase().trim();
                    for (let item of current.opts.els.items.querySelectorAll(":not(x-select-group)")) {
                        const phrase = item.innerText.toUpperCase().trim();
                        for (const niddle of filter.split(" ")) {
                            if (phrase.includes(niddle)) item.classList.remove("hidden");
                            else item.classList.add("hidden");
                        }
                    }

                    current.x.search && current.x.search(e);
                    current.dispatchEvent(
                        new CustomEvent("x-search", {
                            bubbles: true,
                        })
                    );
                });
                current.opts.els.modal.addEventListener("click", (e) => {
                    if (e.target === current.opts.els.modal && !current.opts.els.modal.classList.contains("!hidden")) {
                        $toggle(current);
                    }
                });
                current.opts.els.content.addEventListener("click", (e) => {
                    e.stopPropagation();
                });
                window.addEventListener("click", (e) => {
                    if (!current.opts.els.wrapper.contains(e.target) && !current.opts.els.modal.classList.contains("!hidden")) {
                        $toggle(current);
                    }
                });
                window.addEventListener("resize", $resize);

                new MutationObserver((mutationsList) => {
                    for (const mutation of mutationsList) {
                        if (mutation.type === "attributes") {
                            if (mutation.attributeName === Attributes.Multiple) {
                                $multiple(current);
                            }
                        }
                    }
                    $init(current);
                    $label(current);
                    $search(current);
                    $tools(current);
                    $disable(current);
                }).observe(current, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                });

                current.clear = () => {
                    current.selectedIndex = -1;
                    [...current.children].forEach((e) => {
                        e.selected = false;
                        e.removeAttribute("selected");
                    });
                    $init(current);
                    $label(current);
                    $search(current);
                    $tools(current);
                    $disable(current);
                };

                current.insertAdjacentElement("afterend", wrapper);
                current.removeAttribute(Attributes.Selector);
                $resize();
            }

            return this;
        }

        Select.opts = {
            Elements: [],
            Attributes: {
                Selector: "x-select",
                Multiple: "multiple",
                Disabled: "disabled",
                Placeholder: "placeholder",
                Length: "length",
                Search: "search",
            },
            DataText: {
                Search: "Search...",
            },
        };

        return Select;
    })();

    const DatePicker = (function() {
        function $label(date) {
            if (date.hasAttribute(DatePicker.opts.Attributes.Placeholder) && date.attributes[DatePicker.opts.Attributes.Placeholder].value.trim().length) {
                const text = date.attributes[DatePicker.opts.Attributes.Placeholder].value.trim();
                const fieldLabel = date.opts.els.fieldLabel;
                const label = date.opts.els.label;
                fieldLabel.innerHTML = text;
                label.innerHTML = text;
                date.opts.els.tools.insertAdjacentElement("afterbegin", label);
                if (date.opts.els.fieldText.innerHTML.trim() === "") date.opts.els.fieldText.insertAdjacentElement("afterbegin", fieldLabel);
            }
        }

        function $tools(date) {
            if (
                (date.hasAttribute(DatePicker.opts.Attributes.Search) && date.attributes[DatePicker.opts.Attributes.Search].value !== "false") ||
                (date.hasAttribute(DatePicker.opts.Attributes.Placeholder) && date.attributes[DatePicker.opts.Attributes.Placeholder].value.trim().length)
            ) {
                date.opts.els.content.insertAdjacentElement("afterbegin", date.opts.els.tools);
                if (!date.hasAttribute(DatePicker.opts.Attributes.Search) || date.attributes[DatePicker.opts.Attributes.Search].value === "false")
                    date.opts.els.tools.classList.add("lg:!hidden");
                else date.opts.els.tools.classList.remove("lg:!hidden");
            } else {
                if (date.opts.els.content.querySelector("x-datepicker-tools")) date.opts.els.content.removeChild(date.opts.els.tools);
            }
        }

        function $disable(date) {
            if (date.hasAttribute(DatePicker.opts.Attributes.Disabled) && date.attributes[DatePicker.opts.Attributes.Disabled].value !== "false") {
                date.opts.els.wrapper.classList.add("opacity-80", "!pointer-events-none", "x-datepicker-disabled");
                date.opts.els.fieldContainer.tabIndex = "-1";
            } else {
                date.opts.els.wrapper.classList.remove("opacity-80", "!pointer-events-none", "x-datepicker-disabled");
                date.opts.els.fieldContainer.tabIndex = "0";
            }
        }

        function $toggle(date) {
            const { modal } = date.opts.els;
            if (date.hasAttribute(DatePicker.opts.Attributes.Disabled) && date.attributes[DatePicker.opts.Attributes.Disabled].value !== "false") return;
            modal.classList.remove("lg:top-full", "lg:mt-1", "lg:bottom-full", "lg:mb-1");
            modal.classList.toggle("!hidden");
            const classes =
                window.innerHeight - modal.getBoundingClientRect().top < modal.clientHeight ? ["lg:bottom-full", "lg:mb-1"] : ["lg:top-full", "lg:mt-1"];
            modal.classList.add(...classes);

            if (modal.classList.contains("!hidden")) {
                document.body.classList.remove("!overflow-hidden", "!h-screen", "lg:!overflow-auto", "lg:!h-[unset]");
                date.opts.mode = "closed";

                date.x.close && date.x.close({ target: date });
                date.dispatchEvent(
                    new CustomEvent("x-close", {
                        bubbles: true,
                    })
                );
            } else {
                document.body.classList.add("!overflow-hidden", "!h-screen", "lg:!overflow-auto", "lg:!h-[unset]");
                date.opts.mode = "open";

                date.x.open && date.x.open({ target: date });
                date.dispatchEvent(
                    new CustomEvent("x-open", {
                        bubbles: true,
                    })
                );
            }

            date.toggle && date.toggle({ target: date });
            date.dispatchEvent(
                new CustomEvent("x-toggle", {
                    bubbles: true,
                })
            );
        }

        function $choose(date, chosen) {
            const testDate = new Date();
            [...date.opts.els.dates.querySelectorAll(".x-datepicker-selected")].forEach((d) => {
                const currentDate = new Date(d.dataset.date);
                if (
                    currentDate.getDate() === testDate.getDate() &&
                    currentDate.getMonth() === testDate.getMonth() &&
                    currentDate.getFullYear() === testDate.getFullYear()
                )
                    d.className = date.opts.classes.current;
                else d.className = date.opts.els.date.className;
            });
            chosen.className = date.opts.classes.selected;
        }

        function $format(date) {
            var year = date.getFullYear();
            var month = ("0" + (date.getMonth() + 1)).slice(-2);
            var day = ("0" + date.getDate()).slice(-2);
            return year + "-" + month + "-" + day;
        }

        function $string(string, opts) {
            if (opts === true) return string;
            return string.slice(0, opts);
        }

        function $init(date) {
            date.opts.els.dates.innerHTML = "";
            const newdate = new Date(date.opts.date);
            newdate.setDate(1);

            var lastDayIndex = new Date(newdate.getFullYear(), newdate.getMonth() + 1, 0).getDate();
            var lastDaysIndex = new Date(newdate.getFullYear(), newdate.getMonth() + 1, 0).getDay();
            var nextDaysIndex = 7 - lastDaysIndex - 1;
            var firstDayIndex = newdate.getDay();

            date.opts.els.month.innerHTML = $string(DatePicker.opts.DataText.Months[newdate.getMonth()], DatePicker.opts.FullMonth);
            date.opts.els.year.value = newdate.getFullYear();

            for (var i = firstDayIndex; i > 0; i--) {
                const clone = date.opts.els.date.cloneNode(true);
                clone.classList.add("pointer-events-none", "opacity-0");
                date.opts.els.dates.append(clone);
            }

            for (var i = 1; i <= lastDayIndex; i++) {
                const clone = date.opts.els.date.cloneNode(true);
                const curdate = new Date(date.opts.date);
                clone.innerHTML = i < 10 ? "0" + i : i;
                curdate.setDate(i);
                clone.dataset.date = $format(curdate);

                if (date.opts.disabledDates.includes(clone.dataset.date) || date.opts.disabledDays.includes(String(curdate.getDay() + 1))) {
                    clone.className = date.opts.classes.disabled;
                    if (date.opts.disabledDates.includes(clone.dataset.date)) clone.classList.add("x-datepicker-disabled-date");
                    if (date.opts.disabledDays.includes(String(curdate.getDay() + 1))) clone.classList.add("x-datepicker-disabled-day");
                } else {
                    const testDate = new Date();
                    if (
                        i === testDate.getDate() &&
                        date.opts.date.getMonth() === testDate.getMonth() &&
                        date.opts.date.getFullYear() === testDate.getFullYear()
                    )
                        clone.className = date.opts.classes.current;
                    if (date.value === clone.dataset.date) clone.className = date.opts.classes.selected;
                    clone.setAttribute("tabindex", 0);

                    const $callable = (e) => {
                        const _date = e.target.dataset.date.split("-");
                        const text = date.opts.els.fieldValue.cloneNode(true);
                        text.innerHTML = _date.join("-");
                        date.opts.els.fieldText.innerText = "";
                        date.opts.els.fieldText.append(text);
                        date.value = _date.join("-");
                        date.opts.date.setFullYear(Number(_date[0]));
                        date.opts.date.setMonth(Number(_date[1]) - 1);
                        date.opts.date.setDate(Number(_date[2]));

                        date.x.change &&
                            date.x.change({
                                ...e,
                                detail: {
                                    item: clone,
                                    date: _date.join("-"),
                                },
                            });
                        date.dispatchEvent(
                            new CustomEvent("x-change", {
                                bubbles: true,
                                detail: {
                                    item: clone,
                                    date: _date.join("-"),
                                },
                            })
                        );

                        $toggle(date);
                        $choose(date, clone);
                    };

                    clone.addEventListener("click", $callable);
                    clone.addEventListener("keydown", (e) => {
                        if (e.keyCode === 13) $callable(e);
                    });
                }

                date.opts.els.dates.append(clone);
            }

            for (var i = 1; i <= nextDaysIndex; i++) {
                const clone = date.opts.els.date.cloneNode(true);
                clone.classList.add("pointer-events-none", "opacity-0");
                date.opts.els.dates.append(clone);
            }
        }

        function DatePicker() {
            const { Elements, Attributes, DataText } = DatePicker.opts;
            var targets = document.querySelectorAll(`[${Attributes.Selector}]`);
            if (Elements.length) targets = [...targets, ...Elements];
            if (!targets.length) return this;

            const XDatePicker = document.createElement("x-datepicker"),
                XDatePickerFieldLabel = document.createElement("x-datepicker-field-label"),
                XDatePickerFieldValue = document.createElement("x-datepicker-field-value"),
                XDatePickerTools = document.createElement("x-datepicker-tools"),
                XDatePickerLabel = document.createElement("x-datepicker-label"),
                XDatePickerDate = document.createElement("x-select-date");
            XDatePicker.className = "x-element x-datepicker lg:relative block";
            XDatePickerFieldLabel.className = "x-datepicker-field-label text-[#9ca3af] text-base";
            XDatePickerFieldValue.className = "x-datepicker-field-single text-[#1d1d1d] text-base";
            XDatePickerTools.className = "x-datepicker-tools border-[#d1d1d1] flex flex-col border-b p-2 gap-2";
            XDatePickerLabel.className = "x-datepicker-label text-[#1d1d1d] text-base text-center font-black leading-[1] lg:hidden";
            XDatePickerDate.className =
                "x-datepicker-date text-[#1d1d1d] hover:bg-[#d1d1d1] focus-within:bg-[#d1d1d1] text-center text-base p-1 hover:bg-opacity-50 focus-within:bg-opacity-50 outline-none cursor-pointer rounded-md";
            XDatePicker.innerHTML = `
                <x-datepicker-field-container tabindex="0" class="x-datepicker-field-container bg-[#f5f5f5] border-[#d1d1d1] focus-within:outline-[#66baff] flex flex-wrap items-center gap-2 p-2 rounded-md cursor-pointer border focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2">
                    <x-datepicker-field-content class="x-datepicker-field-content w-0 flex-1 overflow-auto no-scrollbar">
                        <x-datepicker-field-text class="x-datepicker-field-text w-max flex items-center gap-2"></x-datepicker-field-text>
                    </x-datepicker-field-content>
                    <svg class="x-datepicker-field-icon text-[#1d1d1d] block pointer-events-none w-5 h-5" fill="currentColor" viewBox="0 -960 960 960">
                        <path 
                            d="M190-58q-37.175 0-64.088-27.612Q99-113.225 99-149v-601q0-37.588 26.912-64.794Q152.825-842 190-842h59v-22q0-15.375 12.277-27.188Q273.554-903 288.877-903q17.148 0 28.136 11.812Q328-879.375 328-864v22h304v-22q0-15.375 11.577-27.188Q655.154-903 671.377-903q16.648 0 28.136 11.812Q711-879.375 711-864v22h59q37.588 0 64.794 27.206Q862-787.588 862-750v601q0 35.775-27.206 63.388Q807.588-58 770-58H190Zm0-91h580v-419H190v419Zm290.404-246q-18.822 0-32.113-13.177T435-439.877q0-18.523 13.379-31.823t32.2-13.3q18.821 0 31.621 13.177 12.8 13.177 12.8 31.7T512.112-408.3Q499.225-395 480.404-395Zm-160.281 0q-18.523 0-31.823-13.177t-13.3-31.7q0-18.523 13.177-31.823t31.7-13.3q18.523 0 31.823 13.177t13.3 31.7q0 18.523-13.177 31.823t-31.7 13.3Zm319.298 0Q622-395 608.5-408.177t-13.5-31.7q0-18.523 13.588-31.823 13.587-13.3 31.508-13.3 17.922 0 31.413 13.177t13.491 31.7q0 18.523-13.379 31.823t-32.2 13.3ZM480.404-235q-18.822 0-32.113-13.588Q435-262.175 435-280.096q0-17.922 13.379-31.413t32.2-13.491q18.821 0 31.621 13.379 12.8 13.379 12.8 32.2Q525-262 512.112-248.5 499.225-235 480.404-235Zm-160.281 0q-18.523 0-31.823-13.588-13.3-13.587-13.3-31.508 0-17.922 13.177-31.413t31.7-13.491q18.523 0 31.823 13.379t13.3 32.2Q365-262 351.823-248.5t-31.7 13.5Zm319.298 0Q622-235 608.5-248.588 595-262.175 595-280.096q0-17.922 13.588-31.413Q622.175-325 640.096-325q17.922 0 31.413 13.379t13.491 32.2Q685-262 671.621-248.5t-32.2 13.5Z"
                        />
                    </svg>
                </x-datepicker-field-container>
                <x-datepicker-modal class="x-datepicker-modal bg-[#1d1d1d] lg:bg-transparent fixed inset-0 flex flex-col justify-end p-2 bg-opacity-40 backdrop-blur-sm lg:p-0 lg:absolute lg:inset-auto lg:top-full lg:left-0 lg:rtl:left-auto lg:rtl:right-0 lg:w-full lg:min-w-[20rem] lg:mt-1 !hidden z-50">
                    <x-datepicker-content class="x-datepicker-content bg-[#fcfcfc] border-[#d1d1d1] shadow-[#1d1d1d20] shadow-sm flex flex-col w-full rounded-md max-h-[70vh] overflow-hidden border lg:max-h-[300px]">
                        <x-datepicker-top class="x-datepicker-top border-[#d1d1d1] border-b p-1 flex flex-col gap-1">
                            <x-datepicker-controls class="x-datepicker-controls w-full grid grid-rows-1 grid-cols-7 items-center gap-1">
                                <button type="button" aria-label="button-prev" class="x-datepicker-control x-datepicker-prev text-[#1d1d1d] hover:bg-[#d1d1d1] focus-within:bg-[#d1d1d1] flex w-full h-8 items-center justify-center rtl:rotate-180 hover:bg-opacity-50 focus-within:bg-opacity-50 rounded-md outline-none cursor-pointer">
                                    <svg class="x-datepicker-control-icon block pointer-events-none w-8 h-8" fill="currentColor" viewBox="0 -960 960 960">
                                        <path
                                            d="M528-251 331-449q-7-6-10.5-14t-3.5-18q0-9 3.5-17.5T331-513l198-199q13-12 32-12t33 12q13 13 12.5 33T593-646L428-481l166 166q13 13 13 32t-13 32q-14 13-33.5 13T528-251Z"
                                        />
                                    </svg>
                                </button>
                                <x-datepicker-display class="x-datepicker-display text-[#1d1d1d] flex items-center justify-center w-full text-lg font-black leading-[1] col-span-5 gap-1">
                                    <x-datepicker-display-month class="x-datepicker-display-month w-max block"></x-datepicker-display-month>
                                    <input type="number" class="x-datepicker-display-year focus-within:outline-[#66baff] bg-transparent focus-within:ps-2 w-20 block rounded-md"></input>
                                </x-datepicker-display>
                                <button type="button" aria-label="button-next" class="x-datepicker-control x-datepicker-next text-[#1d1d1d] hover:bg-[#d1d1d1] focus-within:bg-[#d1d1d1] flex w-full h-8 items-center justify-center rtl:rotate-180 hover:bg-opacity-50 focus-within:bg-opacity-50 rounded-md outline-none cursor-pointer">
                                    <svg class="x-datepicker-control-icon block pointer-events-none w-8 h-8" fill="currentColor" viewBox="0 -960 960 960">
                                        <path
                                            d="M344-251q-14-15-14-33.5t14-31.5l164-165-165-166q-14-12-13.5-32t14.5-33q13-14 31.5-13.5T407-712l199 199q6 6 10 14.5t4 17.5q0 10-4 18t-10 14L408-251q-13 13-32 12.5T344-251Z"
                                        />
                                    </svg>
                                </button>
                            </x-datepicker-controls>
                            <x-datepicker-days class="x-datepicker-days w-full grid grid-rows-1 grid-cols-7 items-center gap-1">
                                <x-datepicker-day class="x-datepicker-day text-[#1d1d1d] w-full flex items-center justify-center font-bold text-[.6rem]">
                                    ${$string(DataText.Days[0], DatePicker.opts.FullDay)}
                                </x-datepicker-day>
                                <x-datepicker-day class="x-datepicker-day text-[#1d1d1d] w-full flex items-center justify-center font-bold text-[.6rem]">
                                    ${$string(DataText.Days[1], DatePicker.opts.FullDay)}
                                </x-datepicker-day>
                                <x-datepicker-day class="x-datepicker-day text-[#1d1d1d] w-full flex items-center justify-center font-bold text-[.6rem]">
                                    ${$string(DataText.Days[2], DatePicker.opts.FullDay)}
                                </x-datepicker-day>
                                <x-datepicker-day class="x-datepicker-day text-[#1d1d1d] w-full flex items-center justify-center font-bold text-[.6rem]">
                                    ${$string(DataText.Days[3], DatePicker.opts.FullDay)}
                                </x-datepicker-day>
                                <x-datepicker-day class="x-datepicker-day text-[#1d1d1d] w-full flex items-center justify-center font-bold text-[.6rem]">
                                    ${$string(DataText.Days[4], DatePicker.opts.FullDay)}
                                </x-datepicker-day>
                                <x-datepicker-day class="x-datepicker-day text-[#1d1d1d] w-full flex items-center justify-center font-bold text-[.6rem]">
                                    ${$string(DataText.Days[5], DatePicker.opts.FullDay)}
                                </x-datepicker-day>
                                <x-datepicker-day class="x-datepicker-day text-[#1d1d1d] w-full flex items-center justify-center font-bold text-[.6rem]">
                                    ${$string(DataText.Days[6], DatePicker.opts.FullDay)}
                                </x-datepicker-day>
                            </x-datepicker-days>
                        </x-datepicker-top>
                        <x-datepicker-dates class="x-datepicker-dates w-full grid grid-rows-1 grid-cols-7 p-1 gap-1"></x-datepicker-dates>
                    </x-datepicker-content>
                </x-datepicker-modal>
            `;

            const getArray = (string) => {
                return (string || "")
                    .split(",")
                    .map((e) => e.trim())
                    .filter((e) => e.length);
            };

            for (let i = 0; i < targets.length; i++) {
                const current = targets[i];
                const wrapper = XDatePicker.cloneNode(true);
                current.x = {
                    toggle: null,
                    change: null,
                    close: null,
                    open: null,
                    next: null,
                    prev: null,
                    year: null,
                };
                current.opts = {
                    els: {
                        wrapper: wrapper,
                        fieldContainer: wrapper.querySelector("x-datepicker-field-container"),
                        fieldText: wrapper.querySelector("x-datepicker-field-text"),
                        modal: wrapper.querySelector("x-datepicker-modal"),
                        content: wrapper.querySelector("x-datepicker-content"),
                        month: wrapper.querySelector("x-datepicker-display-month"),
                        year: wrapper.querySelector(".x-datepicker-display-year"),
                        next: wrapper.querySelector(".x-datepicker-next"),
                        prev: wrapper.querySelector(".x-datepicker-prev"),
                        dates: wrapper.querySelector("x-datepicker-dates"),
                        fieldLabel: XDatePickerFieldLabel.cloneNode(true),
                        tools: XDatePickerTools.cloneNode(true),
                        label: XDatePickerLabel.cloneNode(true),
                        fieldValue: XDatePickerFieldValue,
                        date: XDatePickerDate,
                    },
                    classes: {
                        disabled: "x-datepicker-date x-datepicker-disabled text-[#1d1d1d] bg-[#4f504b] text-center text-base p-1 bg-opacity-50 outline-none rounded-md opacity-40",
                        selected: "x-datepicker-date x-datepicker-selected text-[#fcfcfc] bg-[#66baff] text-center text-base p-1 hover:bg-opacity-50 focus-within:bg-opacity-50 outline-none cursor-pointer rounded-md",
                        current: "x-datepicker-date x-datepicker-current text-[#1d1d1d] bg-[#d1d1d1] text-center text-base p-1 bg-opacity-50 outline-none cursor-pointer rounded-md",
                    },
                    date: new Date(),
                    disabledDates: getArray(current.getAttribute(Attributes.DisabledDates)),
                    disabledDays: getArray(current.getAttribute(Attributes.DisabledDays)),
                    mode: "closed",
                };
                current.classList.add("hidden");

                const $resize = () => {
                    if (matchMedia("((min-width: 1024px))").matches) current.opts.els.wrapper.appendChild(current.opts.els.modal);
                    else document.body.appendChild(current.opts.els.modal);
                };

                [current, current.opts.els.fieldContainer].forEach((el) => {
                    el.addEventListener("click", () => $toggle(current));
                    el.addEventListener("keydown", (e) => {
                        if (e.keyCode === 13) $toggle(current);
                    });
                });
                current.opts.els.prev.addEventListener("click", (e) => {
                    e.preventDefault();
                    current.opts.date.setMonth(current.opts.date.getMonth() - 1);
                    $init(current);

                    current.x.prev && current.x.prev(e);
                    current.dispatchEvent(
                        new CustomEvent("x-prev", {
                            bubbles: true,
                        })
                    );
                });
                current.opts.els.next.addEventListener("click", (e) => {
                    e.preventDefault();
                    current.opts.date.setMonth(current.opts.date.getMonth() + 1);
                    $init(current);

                    current.x.next && current.x.next(e);
                    current.dispatchEvent(
                        new CustomEvent("x-next", {
                            bubbles: true,
                        })
                    );
                });
                current.opts.els.year.addEventListener("input", function(event) {
                    const value = event.target.value;
                    if (value) {
                        current.opts.date.setFullYear(Math.abs(+value));
                        $init(current);
                    }

                    current.x.year && current.x.year(e);
                    current.dispatchEvent(
                        new CustomEvent("x-year", {
                            bubbles: true,
                        })
                    );
                });
                current.opts.els.modal.addEventListener("click", (e) => {
                    if (e.target === current.opts.els.modal && !current.opts.els.modal.classList.contains("!hidden")) {
                        $toggle(current);
                    }
                });
                current.opts.els.content.addEventListener("click", (e) => {
                    e.stopPropagation();
                });
                window.addEventListener("click", function(e) {
                    if (!current.opts.els.wrapper.contains(e.target) && !current.opts.els.modal.classList.contains("!hidden")) {
                        $toggle(current);
                    }
                });
                window.addEventListener("resize", $resize);

                new MutationObserver((mutationsList) => {
                    for (const mutation of mutationsList) {
                        if (mutation.type === "attributes") {
                            if (mutation.attributeName === Attributes.DisabledDates) {
                                current.opts.disabledDates = getArray(current.getAttribute(Attributes.DisabledDates));
                            }
                            if (mutation.attributeName === Attributes.DisabledDays) {
                                current.opts.disabledDays = getArray(current.getAttribute(Attributes.DisabledDays));
                            }
                            if (mutation.attributeName === "value") {
                                const date = $format(new Date(current.getAttribute("value"))).split("-");
                                const text = current.opts.els.fieldValue.cloneNode(true);
                                text.innerHTML = date.join("-");
                                current.opts.els.fieldText.innerText = "";
                                current.opts.els.fieldText.append(text);
                                current.opts.date.setFullYear(Number(date[0]));
                                current.opts.date.setMonth(Number(date[1]) - 1);
                                current.opts.date.setDate(Number(date[2]));
                            }
                        }
                    }
                    $init(current);
                    $label(current);
                    $tools(current);
                    $disable(current);
                }).observe(current, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                });

                if (current.hasAttribute(Attributes.Disabled)) {
                    $disable(current);
                }

                if (current.hasAttribute("value")) {
                    let value = current.getAttribute("value");
                    const regex = /#now\s*([+-]?\s*\d+)*/;
                    const now = new Date();
                    const match = value.match(regex);
                    if (match) {
                        const num = parseInt(match[1]);
                        value = new Date(now.setDate(now.getDate() + (num || 0)));
                    }
                    const date = new Date(value);
                    if (!isNaN(date) && date.toString() !== "Invalid Date") current.setAttribute("value", $format(date));
                }

                current.insertAdjacentElement("afterend", wrapper);
                current.removeAttribute(Attributes.Selector);
                $resize();
            }

            return this;
        }

        DatePicker.opts = {
            Elements: [],
            Attributes: {
                Selector: "x-date",
                Disabled: "disabled",
                Placeholder: "placeholder",
                DisabledDates: "disabled-dates",
                DisabledDays: "disabled-days",
            },
            DataText: {
                Days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                Months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            },
            FullDay: 2,
            FullMonth: true,
        };

        return DatePicker;
    })();

    const DataTable = (function() {
        function $search(table) {
            if (table.hasAttribute(DataTable.opts.Attributes.Search) && table.attributes[DataTable.opts.Attributes.Search].value !== "false") {
                table.opts.els.tools.appendChild(table.opts.els.search);
            } else {
                if (table.opts.els.tools.querySelector("input")) table.opts.els.tools.removeChild(table.opts.els.search);
            }
        }

        function $filter(table) {
            if (table.hasAttribute(DataTable.opts.Attributes.Filter) && table.attributes[DataTable.opts.Attributes.Filter].value !== "false") {
                table.opts.els.tools.appendChild(table.opts.els.filter);
            } else {
                if (table.opts.els.tools.querySelector("x-datatable-filter")) table.opts.els.tools.removeChild(table.opts.els.filter);
            }
        }

        function $download(table) {
            if (table.hasAttribute(DataTable.opts.Attributes.Download) && table.attributes[DataTable.opts.Attributes.Download].value !== "false") {
                table.opts.els.tools.appendChild(table.opts.els.download);
            } else {
                if (table.opts.els.tools.querySelector("button")) table.opts.els.tools.removeChild(table.opts.els.download);
            }
        }

        function $tools(table) {
            if (
                (table.hasAttribute(DataTable.opts.Attributes.Search) && table.attributes[DataTable.opts.Attributes.Search].value !== "false") ||
                (table.hasAttribute(DataTable.opts.Attributes.Filter) && table.attributes[DataTable.opts.Attributes.Filter].value !== "false") ||
                (table.hasAttribute(DataTable.opts.Attributes.Download) && table.attributes[DataTable.opts.Attributes.Download].value.trim().length)
            ) {
                table.opts.els.wrapper.insertAdjacentElement("afterbegin", table.opts.els.tools);
            } else {
                if (table.opts.els.wrapper.querySelector("x-datatable-tools")) table.opts.els.wrapper.removeChild(table.opts.els.tools);
            }
        }

        function $chunck(items, row) {
            return items.reduce((resultArray, item, index) => {
                const chunkIndex = Math.floor(index / row);
                if (!resultArray[chunkIndex]) {
                    resultArray[chunkIndex] = [];
                }
                resultArray[chunkIndex].push(item);
                return resultArray;
            }, []);
        }

        function $populate(table, pages, index = 0) {
            table.opts.els.body.innerHTML = "";
            if (pages.length === 0) {
                const row = document.createElement("tr");
                row.className = table.opts.classes.bodyRow;
                row.appendChild(table.opts.els.empty.cloneNode(true));
                row.children[0].colSpan = table.opts.len;
                table.opts.els.body.appendChild(row);
            } else
                pages[index].forEach((row) => {
                    table.opts.els.body.appendChild(row);
                });
        }

        function $paginate(table, pages) {
            table.opts.els.pagination.innerHTML = "";
            if (pages.length <= 1) {
                if (table.opts.els.wrapper.querySelector("x-datatable-pagination")) table.opts.els.wrapper.removeChild(table.opts.els.pagination);
                return;
            }
            pages.forEach((_, i) => {
                const clone = table.opts.els.paginationButton.cloneNode(true);
                clone.innerHTML = String(i + 1);
                if (i === 0) {
                    $choose(table, clone);
                }
                table.opts.els.pagination.append(clone);
                clone.addEventListener("click", (e) => {
                    const index = [...table.opts.els.pagination.children].indexOf(clone);
                    $choose(table, clone);
                    $populate(table, pages, index);

                    table.x.page && table.x.page(e);
                    table.dispatchEvent(
                        new CustomEvent("x-page", {
                            bubbles: true,
                        })
                    );
                });
            });
            table.opts.els.wrapper.appendChild(table.opts.els.pagination);
        }

        function $choose(table, target) {
            for (let item of table.opts.els.pagination.children) {
                if (item.classList.contains("x-datatable-pagination-selected")) item.className = table.opts.classes.btn;
            }
            target.className = table.opts.classes.selected;
        }

        function $toggle(table) {
            const { filterItems, filterModal, filter } = table.opts.els;

            for (let item of filterItems) {
                item.classList.remove("hidden");
            }

            filterModal.classList.remove("lg:top-full", "lg:mt-1", "lg:bottom-full", "lg:mb-1");
            filterModal.classList.toggle("!hidden");
            const classes =
                window.innerHeight - filterModal.getBoundingClientRect().top < filterModal.clientHeight ?
                ["lg:bottom-full", "lg:mb-1"] :
                ["lg:top-full", "lg:mt-1"];
            filterModal.classList.add(...classes);

            if (filterModal.classList.contains("!hidden")) {
                document.body.classList.remove("!overflow-hidden", "!h-screen", "lg:!overflow-auto", "lg:!h-[unset]");

                table.x.close && table.x.close({ target: filter });
                table.dispatchEvent(
                    new CustomEvent("x-close", {
                        bubbles: true,
                    })
                );
            } else {
                document.body.classList.add("!overflow-hidden", "!h-screen", "lg:!overflow-auto", "lg:!h-[unset]");

                table.x.open && table.x.open({ target: filter });
                table.dispatchEvent(
                    new CustomEvent("x-open", {
                        bubbles: true,
                    })
                );
            }

            table.toggle && table.toggle({ target: filter });
            table.dispatchEvent(
                new CustomEvent("x-toggle", {
                    bubbles: true,
                })
            );
        }

        function $clear(items, base) {
            for (let item of items) {
                item.className = base;
            }
        }

        class $CSV {
            constructor(table, opts) {
                this.table = table;
                this.head = opts.head;
                this.remove = opts.remove;
                this.rows = Array.from(this.table.getElementsByTagName("tr"));
                if (!this.head) {
                    this.rows = this.rows.filter((row) => row.parentElement.tagName !== "THEAD");
                }
            }

            static parse(cell) {
                let parsedValue = cell.textContent.trim().replace(/\s{2,}/g, " ");
                parsedValue = parsedValue.replace(/"/g, `""`);
                if (/[",\n]/.test(parsedValue)) {
                    parsedValue = `"${parsedValue}"`;
                }
                return parsedValue;
            }

            convert() {
                const lines = [];
                for (const row of this.rows) {
                    const values = [];
                    for (let cell = 0; cell < [...row.cells].length; cell++) {
                        if (this.remove.includes(cell)) continue;
                        values.push($CSV.parse(row.cells[cell]));
                    }
                    lines.push(values.join(","));
                }
                return lines.join("\n");
            }
        }

        function DataTable() {
            const { Elements, Attributes, DataText } = DataTable.opts;
            var targets = document.querySelectorAll(`[${Attributes.Selector}]`);
            if (Elements.length) targets = [...targets, ...Elements];
            if (!targets.length) return this;

            const XDataTable = document.createElement("x-datatable"),
                XDataTableTools = document.createElement("x-datatable-tools"),
                XDataTableSearch = document.createElement("input"),
                XDataTableEmpty = document.createElement("td"),
                XDataTableDownload = document.createElement("button"),
                XDataTablePagination = document.createElement("x-datatable-pagination"),
                XDataTablePaginationButton = document.createElement("button"),
                XDataTableFilter = document.createElement("x-datatable-filter");
            XDataTable.className = "x-element x-datatable-container flex flex-col gap-4 block";
            XDataTableTools.className = "x-datatable-tools w-full flex items-center gap-4";
            XDataTableSearch.className =
                "x-datatable-search bg-[#f5f5f5] text-[#1d1d1d] border-[#d1d1d1] focus-within:outline-[#66baff] p-2 w-0 flex-1 lg:flex-none lg:w-80 text-base border rounded-md me-auto focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2";
            XDataTableDownload.className =
                "x-datatable-download text-[#fcfcfc] bg-green-400 hover:bg-green-300 focus-within:bg-green-300 rounded-md w-[42px] h-[42px] flex items-center justify-center outline-none";
            XDataTablePagination.className = "x-datatable-pagination flex gap-2 items-center justify-center";
            XDataTablePaginationButton.className =
                "x-datatable-pagination-button text-[#1d1d1d] bg-[#f5f5f5] border-[#d1d1d1] hover:bg-[#d1d1d1] focus-within:bg-[#d1d1d1] border outline-none w-[36px] h-[36px] rounded-md text-xs font-black flex items-center justify-center";
            XDataTableEmpty.className = "x-datatable-empty text-[#1d1d1d] p-4 text-xl font-black uppercase text-center";
            XDataTableFilter.className = "x-datatable-filter lg:relative block w-[80px]";
            XDataTableEmpty.innerHTML = DataText.Empty;
            XDataTableFilter.innerHTML = `
                <x-datatable-filter-field-container tabindex="0" class="x-datatable-filter-field-container bg-[#f5f5f5] border-[#d1d1d1] focus-within:outline-[#66baff] flex flex-wrap items-center gap-2 p-2 rounded-md cursor-pointer border focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2">
                    <x-datatable-filter-field-content class="x-datatable-filter-field-content w-0 flex-1 overflow-auto no-scrollbar">
                        <x-datatable-filter-field-text class="x-datatable-filter-field-text w-max flex items-center gap-2">10</x-datatable-filter-field-text>
                    </x-datatable-filter-field-content>
                    <x-datatable-filter-field-icon-wrapper class="x-datatable-filter-field-icon-wrapper pointer-events-none w-5 h-5 overflow-hidden flex items-center justify-center">
                        <svg class="x-datatable-filter-field-icon text-[#1d1d1d] block w-8 h-8 absolute" fill="currentColor" viewBox="0 -960 960 960">
                            <path d="M479.889-343q-8.889 0-17.339-3.545Q454.1-350.091 449-357L250-554q-12-13.25-11.5-32.125T251-618.5q15-14.5 33-13t31 13.5l165 165 166-165q12.5-13 31.75-13.5T710-617.571q14 13.428 13 32.5Q722-566 709-554L512-357q-6.167 6.909-14.694 10.455Q488.778-343 479.889-343Z"/>
                        </svg>
                    </x-datatable-filter-field-icon-wrapper>
                </x-datatable-filter-field-container>
                <x-datatable-filter-modal class="x-datatable-filter-modal bg-[#1d1d1d] lg:bg-transparent fixed inset-0 flex flex-col justify-end p-2 bg-opacity-40 backdrop-blur-sm lg:p-0 lg:absolute lg:inset-auto lg:top-full lg:left-0 lg:rtl:left-auto lg:rtl:right-0 lg:w-full lg:mt-1 !hidden z-50">
                    <x-datatable-filter-content class="x-datatable-filter-content bg-[#fcfcfc] border-[#d1d1d1] shadow-[#1d1d1d20] shadow-sm flex flex-col w-full rounded-md max-h-[70vh] overflow-hidden border lg:max-h-[300px]">
                        <x-datatable-filter-tools class="x-datatable-filter-tools border-[#d1d1d1] flex flex-col border-b p-2 gap-2 lg:!hidden">
                            <x-datatable-filter-label class="x-datatable-filter-label text-[#1d1d1d] text-base text-center font-black leading-[1] lg:hidden">${DataText.Filter}</x-datatable-filter-label>
                        </x-datatable-filter-tools>
                        <x-datatable-filter-list class="x-datatable-filter-list overflow-auto flex-1">
                            <x-datatable-filter-items class="x-datatable-filter-items flex flex-col">
                                <x-datatable-filter-item tabindex="0" data-value="10" class="x-datatable-filter-item x-datatable-filter-selected text-[#fcfcfc] bg-[#66baff] truncate overflow-hidden text-base p-2 hover:bg-opacity-50 focus-within:bg-opacity-50 outline-none cursor-pointer">10</x-datatable-filter-item>
                                <x-datatable-filter-item tabindex="0" data-value="50" class="x-datatable-filter-item text-[#1d1d1d] hover:bg-[#d1d1d1] focus-within:bg-[#d1d1d1] truncate overflow-hidden text-base p-2 hover:bg-opacity-50 focus-within:bg-opacity-50 outline-none cursor-pointer">50</x-datatable-filter-item>
                                <x-datatable-filter-item tabindex="0" data-value="100" class="x-datatable-filter-item text-[#1d1d1d] hover:bg-[#d1d1d1] focus-within:bg-[#d1d1d1] truncate overflow-hidden text-base p-2 hover:bg-opacity-50 focus-within:bg-opacity-50 outline-none cursor-pointer">100</x-datatable-filter-item>
                            </x-datatable-filter-items>
                        </x-datatable-filter-list>
                    </x-datatable-filter-content>
                </x-datatable-filter-modal>
            `;
            XDataTableDownload.innerHTML = `
                <svg class="x-datatable-download-icon block w-5 h-5 pointer-events-none" fill="currentcolor" viewBox="0 -960 960 960">
                    <path d="M149-231q-37.45 0-64.225-26.663Q58-284.325 58-322v-448q0-37.863 26.775-64.931Q111.55-862 149-862h298q18.375 0 31.688 13.263Q492-835.474 492-815.921q0 19.553-13.312 32.737Q465.375-770 447-770H149v448h662v-73q0-18.8 13.56-32.4 13.559-13.6 32.212-13.6 18.653 0 32.44 13.6Q903-413.8 903-395v73q0 37.675-27.069 64.337Q848.863-231 811-231H651l47 47q5 5.429 8.5 14.258Q710-160.913 710-153v15q0 16.65-11.162 27.825Q687.675-99 672-99H289q-16.65 0-27.825-11.175T250-138v-16q0-7.565 3.5-16.068T262-184l46-47H149Zm435-315v-270q0-18.675 12.86-32.838Q609.719-863 629.36-863 649-863 662-848.838q13 14.163 13 32.838v270l73-73q14.5-13.5 32.85-12.75t31.063 12.855Q826-604.054 826-586.027T812-555L630-372 446-555q-13.167-13.25-13.083-31.335.083-18.084 13.188-32.149Q460.413-632 478.706-632 497-632 510-619l74 73Z"/>
                </svg>
            `;
            XDataTableSearch.type = "search";
            XDataTableSearch.placeholder = DataText.Search;
            XDataTable.innerHTML = `
                <div class="x-datatable-content bg-[#f5f5f5] border-[#d1d1d1] border rounded-md w-full overflow-auto">
                    <table class="x-datatable-table w-max min-w-full">
                        <thead class="x-datatable-head">
                            <tr class="x-datatable-head-row"></tr>
                        </thead>
                        <tbody class="x-datatable-body"></tbody>
                    </table>
                </div>
            `;

            for (let i = 0; i < targets.length; i++) {
                const current = targets[i];
                const wrapper = XDataTable.cloneNode(true);
                current.x = {
                    download: null,
                    search: null,
                    page: null,
                    change: null,
                    toggle: null,
                    close: null,
                    open: null,
                };
                current.opts = {
                    els: {
                        wrapper: wrapper,
                        table: wrapper.querySelector("table"),
                        tools: XDataTableTools.cloneNode(true),
                        search: XDataTableSearch.cloneNode(true),
                        download: XDataTableDownload.cloneNode(true),
                        filter: XDataTableFilter.cloneNode(true),
                        headRow: wrapper.querySelector(".x-datatable-head-row"),
                        body: wrapper.querySelector(".x-datatable-body"),
                        pagination: XDataTablePagination.cloneNode(true),
                        paginationButton: XDataTablePaginationButton,
                        empty: XDataTableEmpty,
                    },
                    classes: {
                        btn: "x-datatable-pagination-button text-[#1d1d1d] bg-[#f5f5f5] border-[#d1d1d1] hover:bg-[#d1d1d1] focus-within:bg-[#d1d1d1] border outline-none w-[36px] h-[36px] rounded-md text-xs font-black flex items-center justify-center",
                        selected: "x-datatable-pagination-button x-datatable-pagination-selected text-[#fcfcfc] bg-[#66baff] border-[#d1d1d1] border outline-none w-[36px] h-[36px] rounded-md text-xs font-black flex items-center justify-center",
                        filterSelected: "x-datatable-filter-item x-datatable-filter-selected text-[#fcfcfc] bg-[#66baff] truncate overflow-hidden text-base p-2 hover:bg-opacity-50 focus-within:bg-opacity-50 outline-none cursor-pointer",
                        filterBase: "x-datatable-filter-item text-[#1d1d1d] hover:bg-[#d1d1d1] focus-within:bg-[#d1d1d1] truncate overflow-hidden text-base p-2 hover:bg-opacity-50 focus-within:bg-opacity-50 outline-none cursor-pointer",
                        headCol: "x-datatable-head-col max-w-[300px] truncate text-ellipsis overflow-hidden text-[#1d1d1d] text-sm font-black p-2",
                        bodyRow: "x-datatable-body-row border-[#d1d1d1] border-t",
                        bodyCol: "x-datatable-body-col max-w-[300px] truncate text-ellipsis overflow-hidden text-[#1d1d1d] text-base p-2",
                    },
                    len: current.tHead.querySelector("tr").children.length,
                    row: 10,
                };
                current.opts.els.filterContainer = current.opts.els.filter.querySelector(".x-datatable-filter-field-container");
                current.opts.els.filterText = current.opts.els.filter.querySelector(".x-datatable-filter-field-text");
                current.opts.els.filterModal = current.opts.els.filter.querySelector(".x-datatable-filter-modal");
                current.opts.els.filterContent = current.opts.els.filter.querySelector(".x-datatable-filter-content");
                current.opts.els.filterItems = current.opts.els.filter.querySelectorAll(".x-datatable-filter-item");
                current.classList.add("hidden");

                [...current.tHead.querySelector("tr").children].forEach((td) => {
                    td.className = current.opts.classes.headCol + " " + td.className;
                    current.opts.els.headRow.appendChild(td);
                });
                [...current.tBodies[0].children].forEach((tr) => {
                    tr.className = current.opts.classes.bodyRow + " " + tr.className;
                    [...tr.children].forEach((td) => {
                        td.className = current.opts.classes.bodyCol + " " + td.className;
                    });
                    current.opts.els.body.appendChild(tr);
                });

                const $resize = () => {
                    if (current.hasAttribute(DataTable.opts.Attributes.Filter) && current.attributes[DataTable.opts.Attributes.Filter].value !== "false") {
                        if (matchMedia("((min-width: 1024px))").matches) current.opts.els.filter.appendChild(current.opts.els.filterModal);
                        else document.body.appendChild(current.opts.els.filterModal);
                    }
                };
                let rows = [...current.opts.els.body.children],
                    items = [...current.opts.els.body.children],
                    pages = $chunck(items, current.opts.row);

                current.opts.els.download.addEventListener("click", (e) => {
                    e.preventDefault();
                    const exporter = new $CSV(current.opts.els.table, {
                        remove: (current.getAttribute(Attributes.Remove) || "")
                            .split(",")
                            .filter((e) => e.trim().length)
                            .map((e) => parseInt(e)),
                        head: current.getAttribute(Attributes.Head) !== "false",
                    });
                    const csvOutput = exporter.convert();
                    const csvBlob = new Blob([csvOutput], {
                        type: "text/csv",
                    });
                    const blobUrl = URL.createObjectURL(csvBlob);
                    const anchorElement = document.createElement("a");
                    anchorElement.href = blobUrl;
                    anchorElement.download = current.getAttribute(Attributes.Download) || "";
                    anchorElement.click();
                    anchorElement.remove();
                    setTimeout(() => {
                        URL.revokeObjectURL(blobUrl);
                    }, 500);

                    current.x.download && current.x.download(e);
                    current.dispatchEvent(
                        new CustomEvent("x-download", {
                            bubbles: true,
                        })
                    );
                });
                current.opts.els.search.addEventListener("input", (e) => {
                    const filter = (e.target.value.toUpperCase() || "").trim();
                    if (filter === "") {
                        items = rows;
                    } else {
                        items = rows.filter((item) => {
                            const phrase = [...item.children]
                                .filter((e) => !e.classList.contains("hidden"))
                                .map((e) => e.innerText.toUpperCase().trim())
                                .join(" ");
                            return filter.split(" ").every((niddle) => phrase.includes(niddle));
                        });
                    }
                    pages = $chunck(items, current.opts.row);
                    $populate(current, pages);
                    $paginate(current, pages);

                    current.x.search && current.x.search(e);
                    current.dispatchEvent(
                        new CustomEvent("x-search", {
                            bubbles: true,
                        })
                    );
                });
                [...current.opts.els.filterItems].forEach((item) => {
                    const callable = (e) => {
                        $clear(current.opts.els.filterItems, current.opts.classes.filterBase);
                        e.target.className = current.opts.classes.filterSelected;
                        current.opts.row = +e.target.dataset.value;
                        current.opts.els.filterText.innerHTML = current.opts.row;
                        pages = $chunck(items, current.opts.row);
                        $populate(current, pages);
                        $paginate(current, pages);
                        $toggle(current);

                        current.x.change && current.x.change(e);
                        current.dispatchEvent(
                            new CustomEvent("x-change", {
                                bubbles: true,
                            })
                        );
                    };
                    item.addEventListener("click", callable);
                    item.addEventListener("keydown", (e) => {
                        if (e.keyCode === 13) callable(e);
                    });
                });
                current.opts.els.filterContainer.addEventListener("click", () => $toggle(current));
                current.opts.els.filterContainer.addEventListener("keydown", (e) => {
                    if (e.keyCode === 13) $toggle(current);
                });
                current.opts.els.filterModal.addEventListener("click", (e) => {
                    if (e.target === current.opts.els.filterModal && !current.opts.els.filterModal.classList.contains("!hidden")) {
                        $toggle(current);
                    }
                });
                current.opts.els.filterContent.addEventListener("click", (e) => {
                    e.stopPropagation();
                });
                window.addEventListener("click", (e) => {
                    if (!current.opts.els.filter.contains(e.target) && !current.opts.els.filterModal.classList.contains("!hidden")) {
                        $toggle(current);
                    }
                });
                window.addEventListener("resize", $resize);

                new MutationObserver((mutationsList) => {
                    for (const mutation of mutationsList) {
                        if (mutation.type === "attributes") {}
                    }
                    $tools(current);
                    $search(current);
                    $filter(current);
                    $download(current);
                    $populate(current, pages);
                    $paginate(current, pages);
                }).observe(current, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                });

                current.innerHTML = "";
                current.insertAdjacentElement("afterend", wrapper);
                current.removeAttribute(Attributes.Selector);
                $resize();
            }

            return this;
        }

        DataTable.opts = {
            Elements: [],
            Attributes: {
                Selector: "x-table",
                Search: "search",
                Filter: "filter",
                Download: "download",
                Remove: "remove",
                Head: "head",
            },
            DataText: {
                Search: "Search...",
                Filter: "Filter",
                Empty: "No data found",
            },
        };

        return DataTable;
    })();

    return {
        DatePicker,
        DataTable,
        Validate,
        Password,
        Toaster,
        Switch,
        Toggle,
        Select,
        Print,
    };
})();