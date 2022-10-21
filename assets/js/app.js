const AXE = (function() {
    window.__AXE__ = {
        __EACH__: (obj, func) => {
            if (obj == null) {
                return obj;
            }
            var index = -1;
            if (Array.isArray(obj)) {
                const length = obj.length;
                var count = 1;
                while (++index < length) {

                    if (func(obj[index], index, count, count - 1) === false) {
                        break;
                    }
                    count++;
                }
            }
            var key = Object.keys(obj);
            const length = key.length;
            var count = 1;
            while (++index < length) {
                if (func(obj[key[index]], key[index], count, count - 1) === false) {
                    break;
                }
                count++;
            }
        },
        __LOOP__: (times, func) => {
            for (var i = 0; i < times; i++) {
                func(i + 1, i);
            }
        },
        __HTML__: (parts, ...args) => {
            const template = parts.reduce(
                (acc, part, i) => {
                    if (!acc.string) {
                        return {
                            components: acc.components,
                            events: acc.events,
                            string: part,
                            props: acc.props,
                        };
                    }

                    const arg = args[i - 1];

                    if (arg === null || arg === false || arg === undefined) {
                        return {
                            components: acc.components,
                            events: acc.events,
                            string: acc.string + part,
                            props: acc.props,
                        };
                    }

                    if (__AXE__.__TYPE__(arg) === "component") {
                        const id = __AXE__.__ID__();
                        if (!("__archive__" in arg)) arg.__archive__ = {};
                        return {
                            components: {
                                ...acc.components,
                                [id]: arg
                            },
                            events: acc.events,
                            string: acc.string + `<!--${id}-->` + part,
                            props: acc.props,
                        };
                    }

                    if (__AXE__.__TYPE__(arg) === "function") {
                        const id = __AXE__.__ID__();
                        return {
                            components: acc.components,
                            events: {
                                ...acc.events,
                                [id]: arg
                            },
                            string: acc.string + id + part,
                            props: acc.props,
                        };
                    }

                    if (__AXE__.__TYPE__(arg) === "array") {
                        var allComponents = arg.reduce((acc, a) => {
                            return {
                                ...acc,
                                ...a.components
                            };
                        }, {});
                        var allEvents = arg.reduce((acc, a) => {
                            return {
                                ...acc,
                                ...a.events
                            };
                        }, {});
                        var allProps = arg.reduce((acc, a) => {
                            return {
                                ...acc,
                                ...a.props
                            };
                        }, {});
                        var string = arg.reduce((acc, a) => acc + (a.string || ""), "");
                        if (!string.length) {
                            const id = __AXE__.__ID__();
                            string = id;
                            allProps = {
                                ...allProps,
                                [id]: arg,
                            };
                        }
                        return {
                            components: {
                                ...acc.components,
                                ...allComponents
                            },
                            events: {
                                ...acc.events,
                                ...allEvents
                            },
                            string: acc.string + string + part,
                            props: {
                                ...acc.props,
                                ...allProps
                            },
                        };
                    }

                    if (__AXE__.__TYPE__(arg) === "object") {
                        var allComponents = arg.components || {},
                            allEvents = arg.events || {},
                            allProps = arg.props || {};
                        var string = arg.string || "";
                        if (!string.length) {
                            const id = __AXE__.__ID__();
                            string = id;
                            allProps = {
                                ...allProps,
                                [id]: arg,
                            };
                        }

                        return {
                            components: {
                                ...acc.components,
                                ...allComponents
                            },
                            events: {
                                ...acc.events,
                                ...allEvents
                            },
                            string: acc.string + string + part,
                            props: {
                                ...acc.props,
                                ...allProps
                            },
                        };
                    }

                    if (__AXE__.__TYPE__(arg) === "generator") {
                        for (var obj of arg) {
                            acc = {
                                components: {
                                    ...acc.components,
                                    ...obj.components
                                },
                                events: {
                                    ...acc.events,
                                    ...obj.events
                                },
                                string: acc.string + obj.string,
                                props: {
                                    ...acc.props,
                                    ...obj.props
                                },
                            };
                        }

                        return {
                            components: {
                                ...acc.components
                            },
                            events: {
                                ...acc.events
                            },
                            string: acc.string + part,
                            props: {
                                ...acc.props
                            },
                        };
                    }

                    return {
                        components: {
                            ...acc.components
                        },
                        events: {
                            ...acc.events
                        },
                        string: acc.string + args[i - 1] + part,
                        props: {
                            ...acc.props
                        },
                    };
                }, {
                    components: {},
                    events: {},
                    string: null,
                    props: {},
                }
            );
            template.string = template.string.trim().replace(/(\t|\n|\r)/gm, " ");
            return template;
        },
        __ID__: () => {
            return "AXE-" + (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)).slice(0, 20);
        },
        __TYPE__: (value) => {
            return value instanceof Node ? "component" : Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
        },
        __FILTER__: {
            __TRAN__: {
                _date: function(date, formatStr) {
                    formatStr = formatStr || 'yyyy-MM-dd';
                    var tokens = formatStr.match(/(\w)\1*|''|'(''|[^'])+('|$)|./g);
                    if (!tokens) return date;
                    date = new Date(date);
                    var result = tokens.map(function(substring) {
                        if (substring === '\'\'') {
                            return '\'';
                        }
                        var firstCharacter = substring[0];
                        if (firstCharacter === '\'') {
                            return __AXE__.__FILTER__.__TRAN__._clean(substring);
                        }
                        var formatter = __AXE__.__FILTER__.__TRAN__._action(firstCharacter);
                        if (formatter) {
                            return formatter(date, substring);
                        }
                        return substring;
                    }).join('');
                    return result;
                },
                _action: function(format) {
                    var formatters = {
                        // Year
                        y: function y(date, token) {
                            var signedYear = date.getFullYear();
                            var year = signedYear > 0 ? signedYear : 1 - signedYear;
                            return __AXE__.__FILTER__.__TRAN__._zeros(token === 'yy' ? year % 100 : year, token.length);
                        },
                        // Month
                        M: function M(date, token) {
                            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                            var month = date.getMonth();
                            switch (token) {
                                case 'MMM':
                                    return months[month].slice(0, 3);
                                case 'MMMM':
                                    return months[month];
                                default:
                                    return __AXE__.__FILTER__.__TRAN__._zeros(month + 1, token.length);
                            }
                        },
                        // Day of the month
                        d: function d(date, token) {
                            var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                            switch (token) {
                                case 'ddd':
                                    return days[date.getDay()].slice(0, 3);
                                case 'dddd':
                                    return days[date.getDay()];
                                default:
                                    return __AXE__.__FILTER__.__TRAN__._zeros(date.getDate(), token.length);
                            }
                        },
                        // AM or PM
                        a: function a(date, token) {
                            var dayPeriodEnumValue = date.getHours() / 12 >= 1 ? 'pm' : 'am';

                            switch (token) {
                                case 'a':
                                case 'aa':
                                    return dayPeriodEnumValue.toUpperCase();
                                case 'aaa':
                                    return dayPeriodEnumValue;
                                case 'aaaaa':
                                    return dayPeriodEnumValue[0];
                                case 'aaaa':
                                default:
                                    return dayPeriodEnumValue === 'am' ? 'a.m.' : 'p.m.';
                            }
                        },
                        // Hour [1-12]
                        h: function h(date, token) {
                            return __AXE__.__FILTER__.__TRAN__._zeros(date.getHours() % 12 || 12, token.length);
                        },
                        // Hour [0-23]
                        H: function H(date, token) {
                            return __AXE__.__FILTER__.__TRAN__._zeros(date.getHours(), token.length);
                        },
                        // Minute
                        m: function m(date, token) {
                            return __AXE__.__FILTER__.__TRAN__._zeros(date.getMinutes(), token.length);
                        },
                        // Second
                        s: function s(date, token) {
                            return __AXE__.__FILTER__.__TRAN__._zeros(date.getSeconds(), token.length);
                        },
                        // Fraction of second
                        S: function S(date, token) {
                            var numberOfDigits = token.length;
                            var milliseconds = date.getMilliseconds();
                            var fractionalSeconds = Math.floor(milliseconds * Math.pow(10, numberOfDigits - 3));
                            return __AXE__.__FILTER__.__TRAN__._zeros(fractionalSeconds, token.length);
                        }
                    };
                    return formatters[format]
                },
                _zeros: function(nbr, len) {
                    var sign = nbr < 0 ? '-' : '';
                    var output = Math.abs(nbr).toString();
                    while (output.length < len) {
                        output = '0' + output;
                    }
                    return sign + output;
                },
                _clean: function(input) {
                    var matches = input.match(/^'([^]*?)'?$/);
                    if (!matches) {
                        return input;
                    }
                    return matches[1].replace(/''/g, '\'');
                }
            },
            cap: function(str) {
                return (typeof str === 'string' && str.split(/[\s]/g).map(function(w) {
                    return (w[0]).toUpperCase() + (w.slice(1)).toLowerCase()
                }).join(' ')) || null;
            },
            str: function(str) {
                return (typeof str !== "object" && String(str)) || null;
            },
            num: function(num) {
                return (num && /^[0-9.]+$/g.test(num) && Number(num)) || null;
            },
            int: function(num) {
                return (num && /^[0-9.]+$/g.test(num) && parseInt(num)) || null;
            },
            reel: function(num) {
                return (num && /^[0-9.]+$/g.test(num) && parseFloat(num)) || null;
            },
            bool: function(bol) {
                return (bol === true || bol === 'true' || bol === false || bol === 'false') ? JSON.parse(bol) : null
            },
            floor: function(num) {
                return (num && /^[0-9.]+$/g.test(num) && Math.floor(Number(num))) || null;
            },
            round: function(num) {
                return (num && /^[0-9.]+$/g.test(num) && Math.round(Number(num))) || null;
            },
            ceil: function(num) {
                return (num && /^[0-9.]+$/g.test(num) && Math.ceil(Number(num))) || null;
            },
            last: function(str) {
                return ((typeof str === 'string' || Array.isArray(str)) && str[str.length - 1]) || null;
            },
            trim: function(str) {
                return (typeof str === 'string' && str.trim()) || null;
            },
            sort: function(str) {
                return typeof str === 'string' ? str.split('').sort().join('') : Array.isArray(str) ? str.sort() : null
            },
            join: function(arr, glu) {
                return (Array.isArray(arr) && arr.join((glu ? glu : ', '))) || null;
            },
            unique: function(arr) {
                return (Array.isArray(arr) && [...new Set(arr)]) || null;
            },
            sum: function(arr) {
                return (Array.isArray(arr) && arr.reduce(function(a, n) {
                    return a + n
                })) || null;
            },
            max: function(arr) {
                return (Array.isArray(arr) && Math.max.apply(Math, arr)) || null;
            },
            min: function(arr) {
                return (Array.isArray(arr) && Math.min.apply(Math, arr)) || null;
            },
            isStr: function(str) {
                return typeof str === 'string';
            },
            isNum: function(num, rel) {
                return rel ? num % 1 !== 0 : typeof num === 'number';
            },
            isBol: function(bol) {
                return typeof bol === 'boolean';
            },
            upper: function(str) {
                return (typeof str === 'string' && str.toUpperCase()) || null;
            },
            lower: function(str) {
                return (typeof str === 'string' && str.toLowerCase()) || null;
            },
            latin: function(str) {
                var _latin = {
                    'Á': 'A',
                    'Ă': 'A',
                    'Ắ': 'A',
                    'Ặ': 'A',
                    'Ằ': 'A',
                    'Ẳ': 'A',
                    'Ẵ': 'A',
                    'Ǎ': 'A',
                    'Â': 'A',
                    'Ấ': 'A',
                    'Ậ': 'A',
                    'Ầ': 'A',
                    'Ẩ': 'A',
                    'Ẫ': 'A',
                    'Ä': 'A',
                    'Ǟ': 'A',
                    'Ȧ': 'A',
                    'Ǡ': 'A',
                    'Ạ': 'A',
                    'Ȁ': 'A',
                    'À': 'A',
                    'Ả': 'A',
                    'Ȃ': 'A',
                    'Ā': 'A',
                    'Ą': 'A',
                    'Å': 'A',
                    'Ǻ': 'A',
                    'Ḁ': 'A',
                    'Ⱥ': 'A',
                    'Ã': 'A',
                    'Ꜳ': 'AA',
                    'Æ': 'AE',
                    'Ǽ': 'AE',
                    'Ǣ': 'AE',
                    'Ꜵ': 'AO',
                    'Ꜷ': 'AU',
                    'Ꜹ': 'AV',
                    'Ꜻ': 'AV',
                    'Ꜽ': 'AY',
                    'Ḃ': 'B',
                    'Ḅ': 'B',
                    'Ɓ': 'B',
                    'Ḇ': 'B',
                    'Ƀ': 'B',
                    'Ƃ': 'B',
                    'Ć': 'C',
                    'Č': 'C',
                    'Ç': 'C',
                    'Ḉ': 'C',
                    'Ĉ': 'C',
                    'Ċ': 'C',
                    'Ƈ': 'C',
                    'Ȼ': 'C',
                    'Ď': 'D',
                    'Ḑ': 'D',
                    'Ḓ': 'D',
                    'Ḋ': 'D',
                    'Ḍ': 'D',
                    'Ɗ': 'D',
                    'Ḏ': 'D',
                    'ǲ': 'D',
                    'ǅ': 'D',
                    'Đ': 'D',
                    'Ð': 'D',
                    'Ƌ': 'D',
                    'Ǳ': 'DZ',
                    'Ǆ': 'DZ',
                    'É': 'E',
                    'Ĕ': 'E',
                    'Ě': 'E',
                    'Ȩ': 'E',
                    'Ḝ': 'E',
                    'Ê': 'E',
                    'Ế': 'E',
                    'Ệ': 'E',
                    'Ề': 'E',
                    'Ể': 'E',
                    'Ễ': 'E',
                    'Ḙ': 'E',
                    'Ë': 'E',
                    'Ė': 'E',
                    'Ẹ': 'E',
                    'Ȅ': 'E',
                    'È': 'E',
                    'Ẻ': 'E',
                    'Ȇ': 'E',
                    'Ē': 'E',
                    'Ḗ': 'E',
                    'Ḕ': 'E',
                    'Ę': 'E',
                    'Ɇ': 'E',
                    'Ẽ': 'E',
                    'Ḛ': 'E',
                    'Ꝫ': 'ET',
                    'Ḟ': 'F',
                    'Ƒ': 'F',
                    'Ǵ': 'G',
                    'Ğ': 'G',
                    'Ǧ': 'G',
                    'Ģ': 'G',
                    'Ĝ': 'G',
                    'Ġ': 'G',
                    'Ɠ': 'G',
                    'Ḡ': 'G',
                    'Ǥ': 'G',
                    'Ḫ': 'H',
                    'Ȟ': 'H',
                    'Ḩ': 'H',
                    'Ĥ': 'H',
                    'Ⱨ': 'H',
                    'Ḧ': 'H',
                    'Ḣ': 'H',
                    'Ḥ': 'H',
                    'Ħ': 'H',
                    'Í': 'I',
                    'Ĭ': 'I',
                    'Ǐ': 'I',
                    'Î': 'I',
                    'Ï': 'I',
                    'Ḯ': 'I',
                    'İ': 'I',
                    'Ị': 'I',
                    'Ȉ': 'I',
                    'Ì': 'I',
                    'Ỉ': 'I',
                    'Ȋ': 'I',
                    'Ī': 'I',
                    'Į': 'I',
                    'Ɨ': 'I',
                    'Ĩ': 'I',
                    'Ḭ': 'I',
                    'І': 'I',
                    'Ꝺ': 'D',
                    'Ꝼ': 'F',
                    'Ᵹ': 'G',
                    'Ꞃ': 'R',
                    'Ꞅ': 'S',
                    'Ꞇ': 'T',
                    'Ꝭ': 'IS',
                    'Ĵ': 'J',
                    'Ɉ': 'J',
                    'Ḱ': 'K',
                    'Ǩ': 'K',
                    'Ķ': 'K',
                    'Ⱪ': 'K',
                    'Ꝃ': 'K',
                    'Ḳ': 'K',
                    'Ƙ': 'K',
                    'Ḵ': 'K',
                    'Ꝁ': 'K',
                    'Ꝅ': 'K',
                    'Ĺ': 'L',
                    'Ƚ': 'L',
                    'Ľ': 'L',
                    'Ļ': 'L',
                    'Ḽ': 'L',
                    'Ḷ': 'L',
                    'Ḹ': 'L',
                    'Ⱡ': 'L',
                    'Ꝉ': 'L',
                    'Ḻ': 'L',
                    'Ŀ': 'L',
                    'Ɫ': 'L',
                    'ǈ': 'L',
                    'Ł': 'L',
                    'Ǉ': 'LJ',
                    'Ḿ': 'M',
                    'Ṁ': 'M',
                    'Ṃ': 'M',
                    'Ɱ': 'M',
                    'Ń': 'N',
                    'Ň': 'N',
                    'Ņ': 'N',
                    'Ṋ': 'N',
                    'Ṅ': 'N',
                    'Ṇ': 'N',
                    'Ǹ': 'N',
                    'Ɲ': 'N',
                    'Ṉ': 'N',
                    'Ƞ': 'N',
                    'ǋ': 'N',
                    'Ñ': 'N',
                    'Ǌ': 'NJ',
                    'Ó': 'O',
                    'Ŏ': 'O',
                    'Ǒ': 'O',
                    'Ô': 'O',
                    'Ố': 'O',
                    'Ộ': 'O',
                    'Ồ': 'O',
                    'Ổ': 'O',
                    'Ỗ': 'O',
                    'Ö': 'O',
                    'Ȫ': 'O',
                    'Ȯ': 'O',
                    'Ȱ': 'O',
                    'Ọ': 'O',
                    'Ő': 'O',
                    'Ȍ': 'O',
                    'Ò': 'O',
                    'Ỏ': 'O',
                    'Ơ': 'O',
                    'Ớ': 'O',
                    'Ợ': 'O',
                    'Ờ': 'O',
                    'Ở': 'O',
                    'Ỡ': 'O',
                    'Ȏ': 'O',
                    'Ꝋ': 'O',
                    'Ꝍ': 'O',
                    'Ō': 'O',
                    'Ṓ': 'O',
                    'Ṑ': 'O',
                    'Ɵ': 'O',
                    'Ǫ': 'O',
                    'Ǭ': 'O',
                    'Ø': 'O',
                    'Ǿ': 'O',
                    'Õ': 'O',
                    'Ṍ': 'O',
                    'Ṏ': 'O',
                    'Ȭ': 'O',
                    'Ƣ': 'OI',
                    'Ꝏ': 'OO',
                    'Ɛ': 'E',
                    'Ɔ': 'O',
                    'Ȣ': 'OU',
                    'Ṕ': 'P',
                    'Ṗ': 'P',
                    'Ꝓ': 'P',
                    'Ƥ': 'P',
                    'Ꝕ': 'P',
                    'Ᵽ': 'P',
                    'Ꝑ': 'P',
                    'Ꝙ': 'Q',
                    'Ꝗ': 'Q',
                    'Ŕ': 'R',
                    'Ř': 'R',
                    'Ŗ': 'R',
                    'Ṙ': 'R',
                    'Ṛ': 'R',
                    'Ṝ': 'R',
                    'Ȑ': 'R',
                    'Ȓ': 'R',
                    'Ṟ': 'R',
                    'Ɍ': 'R',
                    'Ɽ': 'R',
                    'Ꜿ': 'C',
                    'Ǝ': 'E',
                    'Ś': 'S',
                    'Ṥ': 'S',
                    'Š': 'S',
                    'Ṧ': 'S',
                    'Ş': 'S',
                    'Ŝ': 'S',
                    'Ș': 'S',
                    'Ṡ': 'S',
                    'Ṣ': 'S',
                    'Ṩ': 'S',
                    'ß': 'ss',
                    'Ť': 'T',
                    'Ţ': 'T',
                    'Ṱ': 'T',
                    'Ț': 'T',
                    'Ⱦ': 'T',
                    'Ṫ': 'T',
                    'Ṭ': 'T',
                    'Ƭ': 'T',
                    'Ṯ': 'T',
                    'Ʈ': 'T',
                    'Ŧ': 'T',
                    'Ɐ': 'A',
                    'Ꞁ': 'L',
                    'Ɯ': 'M',
                    'Ʌ': 'V',
                    'Ꜩ': 'TZ',
                    'Ú': 'U',
                    'Ŭ': 'U',
                    'Ǔ': 'U',
                    'Û': 'U',
                    'Ṷ': 'U',
                    'Ü': 'U',
                    'Ǘ': 'U',
                    'Ǚ': 'U',
                    'Ǜ': 'U',
                    'Ǖ': 'U',
                    'Ṳ': 'U',
                    'Ụ': 'U',
                    'Ű': 'U',
                    'Ȕ': 'U',
                    'Ù': 'U',
                    'Ủ': 'U',
                    'Ư': 'U',
                    'Ứ': 'U',
                    'Ự': 'U',
                    'Ừ': 'U',
                    'Ử': 'U',
                    'Ữ': 'U',
                    'Ȗ': 'U',
                    'Ū': 'U',
                    'Ṻ': 'U',
                    'Ų': 'U',
                    'Ů': 'U',
                    'Ũ': 'U',
                    'Ṹ': 'U',
                    'Ṵ': 'U',
                    'Ꝟ': 'V',
                    'Ṿ': 'V',
                    'Ʋ': 'V',
                    'Ṽ': 'V',
                    'Ꝡ': 'VY',
                    'Ẃ': 'W',
                    'Ŵ': 'W',
                    'Ẅ': 'W',
                    'Ẇ': 'W',
                    'Ẉ': 'W',
                    'Ẁ': 'W',
                    'Ⱳ': 'W',
                    'Ẍ': 'X',
                    'Ẋ': 'X',
                    'Ý': 'Y',
                    'Ŷ': 'Y',
                    'Ÿ': 'Y',
                    'Ẏ': 'Y',
                    'Ỵ': 'Y',
                    'Ỳ': 'Y',
                    'Ƴ': 'Y',
                    'Ỷ': 'Y',
                    'Ỿ': 'Y',
                    'Ȳ': 'Y',
                    'Ɏ': 'Y',
                    'Ỹ': 'Y',
                    'Ї': 'YI',
                    'Ź': 'Z',
                    'Ž': 'Z',
                    'Ẑ': 'Z',
                    'Ⱬ': 'Z',
                    'Ż': 'Z',
                    'Ẓ': 'Z',
                    'Ȥ': 'Z',
                    'Ẕ': 'Z',
                    'Ƶ': 'Z',
                    'Þ': 'TH',
                    'Ĳ': 'IJ',
                    'Œ': 'OE',
                    'ᴀ': 'A',
                    'ᴁ': 'AE',
                    'ʙ': 'B',
                    'ᴃ': 'B',
                    'ᴄ': 'C',
                    'ᴅ': 'D',
                    'ᴇ': 'E',
                    'ꜰ': 'F',
                    'ɢ': 'G',
                    'ʛ': 'G',
                    'ʜ': 'H',
                    'ɪ': 'I',
                    'ʁ': 'R',
                    'ᴊ': 'J',
                    'ᴋ': 'K',
                    'ʟ': 'L',
                    'ᴌ': 'L',
                    'ᴍ': 'M',
                    'ɴ': 'N',
                    'ᴏ': 'O',
                    'ɶ': 'OE',
                    'ᴐ': 'O',
                    'ᴕ': 'OU',
                    'ᴘ': 'P',
                    'ʀ': 'R',
                    'ᴎ': 'N',
                    'ᴙ': 'R',
                    'ꜱ': 'S',
                    'ᴛ': 'T',
                    'ⱻ': 'E',
                    'ᴚ': 'R',
                    'ᴜ': 'U',
                    'ᴠ': 'V',
                    'ᴡ': 'W',
                    'ʏ': 'Y',
                    'ᴢ': 'Z',
                    'á': 'a',
                    'ă': 'a',
                    'ắ': 'a',
                    'ặ': 'a',
                    'ằ': 'a',
                    'ẳ': 'a',
                    'ẵ': 'a',
                    'ǎ': 'a',
                    'â': 'a',
                    'ấ': 'a',
                    'ậ': 'a',
                    'ầ': 'a',
                    'ẩ': 'a',
                    'ẫ': 'a',
                    'ä': 'a',
                    'ǟ': 'a',
                    'ȧ': 'a',
                    'ǡ': 'a',
                    'ạ': 'a',
                    'ȁ': 'a',
                    'à': 'a',
                    'ả': 'a',
                    'ȃ': 'a',
                    'ā': 'a',
                    'ą': 'a',
                    'ᶏ': 'a',
                    'ẚ': 'a',
                    'å': 'a',
                    'ǻ': 'a',
                    'ḁ': 'a',
                    'ⱥ': 'a',
                    'ã': 'a',
                    'ꜳ': 'aa',
                    'æ': 'ae',
                    'ǽ': 'ae',
                    'ǣ': 'ae',
                    'ꜵ': 'ao',
                    'ꜷ': 'au',
                    'ꜹ': 'av',
                    'ꜻ': 'av',
                    'ꜽ': 'ay',
                    'ḃ': 'b',
                    'ḅ': 'b',
                    'ɓ': 'b',
                    'ḇ': 'b',
                    'ᵬ': 'b',
                    'ᶀ': 'b',
                    'ƀ': 'b',
                    'ƃ': 'b',
                    'ɵ': 'o',
                    'ć': 'c',
                    'č': 'c',
                    'ç': 'c',
                    'ḉ': 'c',
                    'ĉ': 'c',
                    'ɕ': 'c',
                    'ċ': 'c',
                    'ƈ': 'c',
                    'ȼ': 'c',
                    'ď': 'd',
                    'ḑ': 'd',
                    'ḓ': 'd',
                    'ȡ': 'd',
                    'ḋ': 'd',
                    'ḍ': 'd',
                    'ɗ': 'd',
                    'ᶑ': 'd',
                    'ḏ': 'd',
                    'ᵭ': 'd',
                    'ᶁ': 'd',
                    'đ': 'd',
                    'ɖ': 'd',
                    'ƌ': 'd',
                    'ð': 'd',
                    'ı': 'i',
                    'ȷ': 'j',
                    'ɟ': 'j',
                    'ʄ': 'j',
                    'ǳ': 'dz',
                    'ǆ': 'dz',
                    'é': 'e',
                    'ĕ': 'e',
                    'ě': 'e',
                    'ȩ': 'e',
                    'ḝ': 'e',
                    'ê': 'e',
                    'ế': 'e',
                    'ệ': 'e',
                    'ề': 'e',
                    'ể': 'e',
                    'ễ': 'e',
                    'ḙ': 'e',
                    'ë': 'e',
                    'ė': 'e',
                    'ẹ': 'e',
                    'ȅ': 'e',
                    'è': 'e',
                    'ẻ': 'e',
                    'ȇ': 'e',
                    'ē': 'e',
                    'ḗ': 'e',
                    'ḕ': 'e',
                    'ⱸ': 'e',
                    'ę': 'e',
                    'ᶒ': 'e',
                    'ɇ': 'e',
                    'ẽ': 'e',
                    'ḛ': 'e',
                    'ꝫ': 'et',
                    'ḟ': 'f',
                    'ƒ': 'f',
                    'ᵮ': 'f',
                    'ᶂ': 'f',
                    'ǵ': 'g',
                    'ğ': 'g',
                    'ǧ': 'g',
                    'ģ': 'g',
                    'ĝ': 'g',
                    'ġ': 'g',
                    'ɠ': 'g',
                    'ḡ': 'g',
                    'ᶃ': 'g',
                    'ǥ': 'g',
                    'ḫ': 'h',
                    'ȟ': 'h',
                    'ḩ': 'h',
                    'ĥ': 'h',
                    'ⱨ': 'h',
                    'ḧ': 'h',
                    'ḣ': 'h',
                    'ḥ': 'h',
                    'ɦ': 'h',
                    'ẖ': 'h',
                    'ħ': 'h',
                    'ƕ': 'hv',
                    'í': 'i',
                    'ĭ': 'i',
                    'ǐ': 'i',
                    'î': 'i',
                    'ï': 'i',
                    'ḯ': 'i',
                    'ị': 'i',
                    'ȉ': 'i',
                    'ì': 'i',
                    'ỉ': 'i',
                    'ȋ': 'i',
                    'ī': 'i',
                    'į': 'i',
                    'ᶖ': 'i',
                    'ɨ': 'i',
                    'ĩ': 'i',
                    'ḭ': 'i',
                    'і': 'i',
                    'ꝺ': 'd',
                    'ꝼ': 'f',
                    'ᵹ': 'g',
                    'ꞃ': 'r',
                    'ꞅ': 's',
                    'ꞇ': 't',
                    'ꝭ': 'is',
                    'ǰ': 'j',
                    'ĵ': 'j',
                    'ʝ': 'j',
                    'ɉ': 'j',
                    'ḱ': 'k',
                    'ǩ': 'k',
                    'ķ': 'k',
                    'ⱪ': 'k',
                    'ꝃ': 'k',
                    'ḳ': 'k',
                    'ƙ': 'k',
                    'ḵ': 'k',
                    'ᶄ': 'k',
                    'ꝁ': 'k',
                    'ꝅ': 'k',
                    'ĺ': 'l',
                    'ƚ': 'l',
                    'ɬ': 'l',
                    'ľ': 'l',
                    'ļ': 'l',
                    'ḽ': 'l',
                    'ȴ': 'l',
                    'ḷ': 'l',
                    'ḹ': 'l',
                    'ⱡ': 'l',
                    'ꝉ': 'l',
                    'ḻ': 'l',
                    'ŀ': 'l',
                    'ɫ': 'l',
                    'ᶅ': 'l',
                    'ɭ': 'l',
                    'ł': 'l',
                    'ǉ': 'lj',
                    'ſ': 's',
                    'ẜ': 's',
                    'ẛ': 's',
                    'ẝ': 's',
                    'ḿ': 'm',
                    'ṁ': 'm',
                    'ṃ': 'm',
                    'ɱ': 'm',
                    'ᵯ': 'm',
                    'ᶆ': 'm',
                    'ń': 'n',
                    'ň': 'n',
                    'ņ': 'n',
                    'ṋ': 'n',
                    'ȵ': 'n',
                    'ṅ': 'n',
                    'ṇ': 'n',
                    'ǹ': 'n',
                    'ɲ': 'n',
                    'ṉ': 'n',
                    'ƞ': 'n',
                    'ᵰ': 'n',
                    'ᶇ': 'n',
                    'ɳ': 'n',
                    'ñ': 'n',
                    'ǌ': 'nj',
                    'ó': 'o',
                    'ŏ': 'o',
                    'ǒ': 'o',
                    'ô': 'o',
                    'ố': 'o',
                    'ộ': 'o',
                    'ồ': 'o',
                    'ổ': 'o',
                    'ỗ': 'o',
                    'ö': 'o',
                    'ȫ': 'o',
                    'ȯ': 'o',
                    'ȱ': 'o',
                    'ọ': 'o',
                    'ő': 'o',
                    'ȍ': 'o',
                    'ò': 'o',
                    'ỏ': 'o',
                    'ơ': 'o',
                    'ớ': 'o',
                    'ợ': 'o',
                    'ờ': 'o',
                    'ở': 'o',
                    'ỡ': 'o',
                    'ȏ': 'o',
                    'ꝋ': 'o',
                    'ꝍ': 'o',
                    'ⱺ': 'o',
                    'ō': 'o',
                    'ṓ': 'o',
                    'ṑ': 'o',
                    'ǫ': 'o',
                    'ǭ': 'o',
                    'ø': 'o',
                    'ǿ': 'o',
                    'õ': 'o',
                    'ṍ': 'o',
                    'ṏ': 'o',
                    'ȭ': 'o',
                    'ƣ': 'oi',
                    'ꝏ': 'oo',
                    'ɛ': 'e',
                    'ᶓ': 'e',
                    'ɔ': 'o',
                    'ᶗ': 'o',
                    'ȣ': 'ou',
                    'ṕ': 'p',
                    'ṗ': 'p',
                    'ꝓ': 'p',
                    'ƥ': 'p',
                    'ᵱ': 'p',
                    'ᶈ': 'p',
                    'ꝕ': 'p',
                    'ᵽ': 'p',
                    'ꝑ': 'p',
                    'ꝙ': 'q',
                    'ʠ': 'q',
                    'ɋ': 'q',
                    'ꝗ': 'q',
                    'ŕ': 'r',
                    'ř': 'r',
                    'ŗ': 'r',
                    'ṙ': 'r',
                    'ṛ': 'r',
                    'ṝ': 'r',
                    'ȑ': 'r',
                    'ɾ': 'r',
                    'ᵳ': 'r',
                    'ȓ': 'r',
                    'ṟ': 'r',
                    'ɼ': 'r',
                    'ᵲ': 'r',
                    'ᶉ': 'r',
                    'ɍ': 'r',
                    'ɽ': 'r',
                    'ↄ': 'c',
                    'ꜿ': 'c',
                    'ɘ': 'e',
                    'ɿ': 'r',
                    'ś': 's',
                    'ṥ': 's',
                    'š': 's',
                    'ṧ': 's',
                    'ş': 's',
                    'ŝ': 's',
                    'ș': 's',
                    'ṡ': 's',
                    'ṣ': 's',
                    'ṩ': 's',
                    'ʂ': 's',
                    'ᵴ': 's',
                    'ᶊ': 's',
                    'ȿ': 's',
                    'ɡ': 'g',
                    'ᴑ': 'o',
                    'ᴓ': 'o',
                    'ᴝ': 'u',
                    'ť': 't',
                    'ţ': 't',
                    'ṱ': 't',
                    'ț': 't',
                    'ȶ': 't',
                    'ẗ': 't',
                    'ⱦ': 't',
                    'ṫ': 't',
                    'ṭ': 't',
                    'ƭ': 't',
                    'ṯ': 't',
                    'ᵵ': 't',
                    'ƫ': 't',
                    'ʈ': 't',
                    'ŧ': 't',
                    'ᵺ': 'th',
                    'ɐ': 'a',
                    'ᴂ': 'ae',
                    'ǝ': 'e',
                    'ᵷ': 'g',
                    'ɥ': 'h',
                    'ʮ': 'h',
                    'ʯ': 'h',
                    'ᴉ': 'i',
                    'ʞ': 'k',
                    'ꞁ': 'l',
                    'ɯ': 'm',
                    'ɰ': 'm',
                    'ᴔ': 'oe',
                    'ɹ': 'r',
                    'ɻ': 'r',
                    'ɺ': 'r',
                    'ⱹ': 'r',
                    'ʇ': 't',
                    'ʌ': 'v',
                    'ʍ': 'w',
                    'ʎ': 'y',
                    'ꜩ': 'tz',
                    'ú': 'u',
                    'ŭ': 'u',
                    'ǔ': 'u',
                    'û': 'u',
                    'ṷ': 'u',
                    'ü': 'u',
                    'ǘ': 'u',
                    'ǚ': 'u',
                    'ǜ': 'u',
                    'ǖ': 'u',
                    'ṳ': 'u',
                    'ụ': 'u',
                    'ű': 'u',
                    'ȕ': 'u',
                    'ù': 'u',
                    'ủ': 'u',
                    'ư': 'u',
                    'ứ': 'u',
                    'ự': 'u',
                    'ừ': 'u',
                    'ử': 'u',
                    'ữ': 'u',
                    'ȗ': 'u',
                    'ū': 'u',
                    'ṻ': 'u',
                    'ų': 'u',
                    'ᶙ': 'u',
                    'ů': 'u',
                    'ũ': 'u',
                    'ṹ': 'u',
                    'ṵ': 'u',
                    'ᵫ': 'ue',
                    'ꝸ': 'um',
                    'ⱴ': 'v',
                    'ꝟ': 'v',
                    'ṿ': 'v',
                    'ʋ': 'v',
                    'ᶌ': 'v',
                    'ⱱ': 'v',
                    'ṽ': 'v',
                    'ꝡ': 'vy',
                    'ẃ': 'w',
                    'ŵ': 'w',
                    'ẅ': 'w',
                    'ẇ': 'w',
                    'ẉ': 'w',
                    'ẁ': 'w',
                    'ⱳ': 'w',
                    'ẘ': 'w',
                    'ẍ': 'x',
                    'ẋ': 'x',
                    'ᶍ': 'x',
                    'ý': 'y',
                    'ŷ': 'y',
                    'ÿ': 'y',
                    'ẏ': 'y',
                    'ỵ': 'y',
                    'ỳ': 'y',
                    'ƴ': 'y',
                    'ỷ': 'y',
                    'ỿ': 'y',
                    'ȳ': 'y',
                    'ẙ': 'y',
                    'ɏ': 'y',
                    'ỹ': 'y',
                    'ї': 'yi',
                    'ź': 'z',
                    'ž': 'z',
                    'ẑ': 'z',
                    'ʑ': 'z',
                    'ⱬ': 'z',
                    'ż': 'z',
                    'ẓ': 'z',
                    'ȥ': 'z',
                    'ẕ': 'z',
                    'ᵶ': 'z',
                    'ᶎ': 'z',
                    'ʐ': 'z',
                    'ƶ': 'z',
                    'ɀ': 'z',
                    'þ': 'th',
                    'ﬀ': 'ff',
                    'ﬃ': 'ffi',
                    'ﬄ': 'ffl',
                    'ﬁ': 'fi',
                    'ﬂ': 'fl',
                    'ĳ': 'ij',
                    'œ': 'oe',
                    'ﬆ': 'st',
                    'ₐ': 'a',
                    'ₑ': 'e',
                    'ᵢ': 'i',
                    'ⱼ': 'j',
                    'ₒ': 'o',
                    'ᵣ': 'r',
                    'ᵤ': 'u',
                    'ᵥ': 'v',
                    'ₓ': 'x',
                    'Ё': 'YO',
                    'Й': 'I',
                    'Ц': 'TS',
                    'У': 'U',
                    'К': 'K',
                    'Е': 'E',
                    'Н': 'N',
                    'Г': 'G',
                    'Ґ': 'G',
                    'Ш': 'SH',
                    'Щ': 'SCH',
                    'З': 'Z',
                    'Х': 'H',
                    'Ъ': "'",
                    'ё': 'yo',
                    'й': 'i',
                    'ц': 'ts',
                    'у': 'u',
                    'к': 'k',
                    'е': 'e',
                    'н': 'n',
                    'г': 'g',
                    'ґ': 'g',
                    'ш': 'sh',
                    'щ': 'sch',
                    'з': 'z',
                    'х': 'h',
                    'ъ': "'",
                    'Ф': 'F',
                    'Ы': 'I',
                    'В': 'V',
                    'А': 'a',
                    'П': 'P',
                    'Р': 'R',
                    'О': 'O',
                    'Л': 'L',
                    'Д': 'D',
                    'Ж': 'ZH',
                    'Э': 'E',
                    'ф': 'f',
                    'ы': 'i',
                    'в': 'v',
                    'а': 'a',
                    'п': 'p',
                    'р': 'r',
                    'о': 'o',
                    'л': 'l',
                    'д': 'd',
                    'ж': 'zh',
                    'э': 'e',
                    'Я': 'Ya',
                    'Ч': 'CH',
                    'С': 'S',
                    'М': 'M',
                    'И': 'I',
                    'Т': 'T',
                    'Ь': "'",
                    'Б': 'B',
                    'Ю': 'YU',
                    'я': 'ya',
                    'ч': 'ch',
                    'с': 's',
                    'м': 'm',
                    'и': 'i',
                    'т': 't',
                    'ь': "'",
                    'б': 'b',
                    'ю': 'yu'
                };
                return (typeof str === 'string' && str.replace(/[^A-Za-z0-9]/g, function(c) {
                    return _latin[c] || c
                })) || null;
            },
            start: function(str) {
                return (typeof str === 'string' && str.split(/[-_.\\\/\s]/g).map(function(w, i) {
                    return (w[0]).toUpperCase() + (w.slice(1)).toLowerCase()
                }).join(' ')) || null;
            },
            camel: function(str) {
                return (typeof str === 'string' && str.split(/[-_.\\\/\s]/g).map(function(w, i) {
                    return i ? (w[0]).toUpperCase() + (w.slice(1)).toLowerCase() : (w).toLowerCase()
                }).join('')) || null;
            },
            kebab: function(str) {
                return (typeof str === 'string' && str.split(/[-_.\\\/\s]/g).map(function(w, i) {
                    return (w).toLowerCase()
                }).join('-')) || null;
            },
            snake: function(str) {
                return (typeof str === 'string' && str.split(/[-_.\\\/\s]/g).map(function(w, i) {
                    return (w).toLowerCase()
                }).join('_')) || null;
            },
            first: function(str) {
                return ((typeof str === 'string' || Array.isArray(str)) && str[0]) || null;
            },
            clean: function(str, tar) {
                return typeof str === 'string' && str.replace(tar, '') || null;
            },
            slice: function(str, is, ie) {
                return ((typeof str === 'string' || Array.isArray(str)) && str.slice(is, ie)) || null;
            },
            shrink: function(str, lim, end) {
                return (typeof str === 'string' && str.slice(0, lim) + (end || '...')) || null;
            },
            size: function(str) {
                return ((typeof str === 'string' || Array.isArray(str)) && str.length) || null;
            },
            date: function(str, fom) {
                return (typeof str === 'string' && __AXE__.__FILTER__.__TRAN__._date(new Date(str), fom)) || null
            },
            split: function(str, spr, lim) {
                return (typeof str === 'string' && str.split(spr, (lim ? lim : 9999999999999999999999999))) || null;
            },
            replace: function(str, tar, rep) {
                return (typeof str === 'string' && str.replace(tar, rep)) || null;
            },
            decamel: function(str, sep) {
                return (typeof str === 'string' && str.replace(/[A-Z0-9]/g, function(c, i) {
                    return (i ? (sep || ' ') : '') + (c).toLowerCase()
                })) || null;
            },
            reverse: function(str) {
                return (typeof str === 'string' && [...str].reverse().join('') || Array.isArray(str) && [...str].reverse()) || null;
            },
            escape: function(str) {
                return (typeof str === 'string' && str.replace(/[\u0000-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u00FF]/g, function(c) {
                    return '&#' + ('000' + c.charCodeAt(0)).slice(-4) + ';'
                })) || null;
            },
            padEnd: function(str, len, fil) {
                return (typeof str === 'string' && str.padEnd(len, (fil ? fil : ' '))) || null;
            },
            trimEnd: function(str) {
                return (typeof str === 'string' && str.trimEnd()) || null;
            },
            endWith: function(str, ser) {
                return (typeof str === 'string' && str.endsWith(ser)) || null;
            },
            upperEnd: function(str) {
                return (typeof str === 'string' && str.slice(0, -1) + (str.slice(-1)).toUpperCase()) || null;
            },
            lowerEnd: function(str) {
                return (typeof str === 'string' && str.slice(0, -1) + (str.slice(-1)).toLowerCase()) || null;
            },
            padStart: function(str, len, fil) {
                return (typeof str === 'string' && str.padStart(len, (fil ? fil : ' '))) || null;
            },
            trimStart: function(str) {
                return (typeof str === 'string' && str.trimStart()) || null;
            },
            startWith: function(str, ser) {
                return (typeof str === 'string' && str.startsWith(ser)) || null;
            },
            upperStart: function(str) {
                return (typeof str === 'string' && (str[0]).toUpperCase() + str.slice(1)) || null;
            },
            lowerStart: function(str) {
                return (typeof str === 'string' && (str[0]).toLowerCase() + str.slice(1)) || null;
            }
        },
        __MEMO__: {}
    }

    const __REGEX__ = {
        __CODE__: /\[(each|if|elif|loop|switch|case|log|info|warn|error|debug)\s+(.*?)\s*\]|\[(else|default|comment|end+(each|if|loop|switch|comment))\s*\]/g,
        __EXTN__: /\[include\s+['|"|`](.*?)['|"|`]\s*\]/g,
        __PRIN__: /\[\[(.*?)]]/gi
    }

    const RENDER = {
        __LEXER__: (code) => {
            var cursor = 0,
                found = null,
                _code = "",
                text = "",
                jsx = "";
            while (found = __REGEX__.__CODE__.exec(code)) {
                text = code.slice(cursor, found.index);
                _code += RENDER.__PRINT__(text.replaceAll(/(\n|\s+)/g, " "));
                cursor = found.index + found[0].length;
                jsx = RENDER.__PARSER__(found.reduce((a, c) => {
                    c != undefined && a.push(c);
                    return a
                }, []).slice(1))
                _code += jsx;
            }

            text = code.substr(cursor, code.length - cursor);
            _code += RENDER.__PRINT__(text.replaceAll(/(\n|\s+)/g, " "));
            return _code.replaceAll(") {break;", ") {")
        },
        __REMAKE__: (found) => {
            return "__TXT__ += __DEV__;__JSX__.push(" + found[1] + ");";
        },
        __EXE__: (word) => {
            word = word.replaceAll("#round", "__round__");
            word = word.replaceAll("#index", "__index__");
            word = word.replaceAll("#self", "__self__");
            word = word.replaceAll("#key", "__key__");
            word = word.replaceAll("#ref", "__ref__");
            word = word.replaceAll("#", '__AXE__.__FILTER__.');
            word = word.replaceAll(/[.]+\w+/g, (e) => "['" + e.slice(1) + "']");
            return word;
        },
        __RESHAPE__: (found) => {
            found[0] = RENDER.__EXE__(found[0]);
            if (found[1]) {
                found[1] = RENDER.__EXE__(found[1]);
            }
            return found
        },
        __PRINT__: (code) => {
            var cursor = 0,
                found = null,
                _code = "",
                text = "";
            while (found = __REGEX__.__PRIN__.exec(code)) {
                text = code.slice(cursor, found.index);
                _code += "__TXT__ +=`" + text.replaceAll(/(\n|\s+)/g, " ") + "`;";
                cursor = found.index + found[0].length;
                found = RENDER.__RESHAPE__(found);
                _code += RENDER.__REMAKE__(found);
            }

            text = code.substr(cursor, code.length - cursor);
            _code += "__TXT__ +=`" + text.replaceAll(/(\n|\s+)/g, " ") + "`;";
            return _code
        },
        __PARSER__: (found) => {
            found = RENDER.__RESHAPE__(found);
            switch (found[0]) {
                case 'if':
                    return 'if(' + found[1] + ') {';
                case 'elif':
                    return '} else if(' + found[1] + ') {';
                case 'switch':
                    return 'switch(' + found[1] + ') {';
                case 'case':
                    return 'break;case ' + found[1] + ':';
                case 'default':
                    return 'break;default:';
                case 'loop':
                    return '__AXE__.__LOOP__(' + found[1] + ', function(__round__, __index__) {';
                case 'each':
                    const args = found[1].split(" as ");
                    return '__AXE__.__EACH__(' + args[0].trim() + ', function(' + args[1].trim() + ', __key__, __round__, __index__) {';
                case 'log':
                case 'info':
                case 'warn':
                case 'error':
                case 'debug':
                    return 'console.' + found[0] + '(' + found[1] + ');';
                case 'else':
                    return '} else {';
                case 'endeach':
                case 'endloop':
                    return '});';
                case 'endswitch':
                    return 'break;}';
                case 'endif':
                    return '}';
                case 'comment':
                    return '/*';
                case 'endcomment':
                    return '*/';
                default:
                    return RENDER.__REMAKE__(found);
            }
        },
        __INCLUDE__: async(code) => {
            var found,
                cursor,
                _code = code,
                matchs = [];
            while (found = __REGEX__.__EXTN__.exec(_code)) {
                matchs.push({
                    hold: found[0],
                    path: found[1]
                })
                cursor = found.index + found[0].length;
                _code = _code.slice(cursor);
            }
            for (var match of matchs) {
                var _code = await RENDER.__FETCH__(match.path);
                code = code.replace(match.hold, _code);
                code = await RENDER.__INCLUDE__(code);
            }
            return code
        },
        __FETCH__: async(path) => {
            path = (path.startsWith("/")) ? path.slice(1) : path;
            path = "/views/" + path.replaceAll(".", "/") + ".axe.html";
            if (!__AXE__.__MEMO__[path]) {
                const r = await fetch(path);
                __AXE__.__MEMO__[path] = r.status === 200 ? await r.text() : "";
            }
            return __AXE__.__MEMO__[path];
        },
        __MAKE__: (code) => {
            return "return function(__self__) { var __DEV__= '__AXE__.__DEV__', __TXT__ = '', __JSX__ = []; with(__self__ || {}) { try {" + code + " } catch(e) { console.error(e); }}return __AXE__.__HTML__(__TXT__.split(__DEV__), ...__JSX__);}";
        }
    }

    const BUILD = {
        __const__: {
            empty: Object.create(null),
            chars: /[^a-zA-Z0-9:]+/g,
            regex: {
                attr: /\s([^'"/\s><]+?)[\s/>]|([^\s=]+)=\s?(".*?"|'.*?')/g,
                tag: /<[a-zA-Z0-9\-\!\/](?:"[^"]*"|'[^']*'|[^'">])*>/g,
                space: /^\s*$/,
            },
            lookup: {
                area: true,
                base: true,
                br: true,
                col: true,
                embed: true,
                hr: true,
                img: true,
                input: true,
                link: true,
                meta: true,
                param: true,
                source: true,
                track: true,
                wbr: true,
            },
            svg: [
                "svg",
                "animate",
                "animateMotion",
                "animateTransform",
                "circle",
                "clipPath",
                "defs",
                "desc",
                "discard",
                "ellipse",
                "feBlend",
                "feColorMatrix",
                "feComponentTransfer",
                "feComposite",
                "feConvolveMatrix",
                "feDiffuseLighting",
                "feDisplacementMap",
                "feDistantLight",
                "feDropShadow",
                "feFlood",
                "feFuncA",
                "feFuncB",
                "feFuncG",
                "feFuncR",
                "feGaussianBlur",
                "feImage",
                "feMerge",
                "feMergeNode",
                "feMorphology",
                "feOffset",
                "fePointLight",
                "feSpecularLighting",
                "feSpotLight",
                "feTile",
                "feTurbulence",
                "filter",
                "foreignObject",
                "g",
                "hatch",
                "hatchpath",
                "image",
                "line",
                "linearGradient",
                "marker",
                "mask",
                "metadata",
                "mpath",
                "path",
                "pattern",
                "polygon",
                "polyline",
                "radialGradient",
                "rect",
                "script",
                "set",
                "stop",
                "style",
                "switch",
                "symbol",
                "text",
                "textPath",
                "title",
                "tspan",
                "use",
                "view",
                "animateColor",
                "missing-glyph",
                "font",
                "font-face",
                "font-face-format",
                "font-face-name",
                "font-face-src",
                "font-face-uri",
                "hkern",
                "vkern",
                "solidcolor",
                "altGlyph",
                "altGlyphDef",
                "altGlyphItem",
                "glyph",
                "glyphRef",
                "tref",
                "cursor",
            ],
            unitless: [
                "animation-iteration-count",
                "border-image-slice",
                "border-image-width",
                "column-count",
                "counter-increment",
                "counter-reset",
                "flex",
                "flex-grow",
                "flex-shrink",
                "font-size-adjust",
                "font-weight",
                "line-height",
                "nav-index",
                "opacity",
                "order",
                "orphans",
                "tab-size",
                "widows",
                "z-index",
                "pitch-range",
                "richness",
                "speech-rate",
                "stress",
                "volume",
                "lood-opacity",
                "mask-box-outset",
                "mask-border-outset",
                "mask-box-width",
                "mask-border-width",
                "shape-image-threshold",
            ]
        },
        __isVar__: (str) => {
            return str.trim().startsWith("oxi-") && str.trim().length === 24;
        },
        __getMap__: (parent, makeKey) => {
            const map = {};
            for (let j = 0; j < parent.childNodes.length; j++) {
                const key = makeKey(parent.childNodes[j]);
                if (key) map[key] = parent.childNodes[j];
            }
            return map;
        },
        __attributes__: (self) => {
            if (!self.attributes) return {};
            const attrs = {};

            for (let i = 0; i < self.attributes.length; i++) {
                const attr = self.attributes[i];
                attrs[attr.name] = attr.value;
            }

            return attrs;
        },
        __getTag__: (tag) => {
            const res = {
                type: "tag",
                name: "",
                voidElement: false,
                attrs: {},
                children: [],
            };

            const tagMatch = tag.match(/<\/?([^\s]+?)[/\s>]/);
            if (tagMatch) {
                res.name = tagMatch[1];
                if (BUILD.__const__.lookup[tagMatch[1]] || tag.charAt(tag.length - 2) === "/") {
                    res.voidElement = true;
                }

                if (res.name.startsWith("!--")) {
                    const endIndex = tag.indexOf("-->");
                    return {
                        type: "comment",
                        comment: endIndex !== -1 ? tag.slice(4, endIndex) : "",

                    };
                }
            }

            const reg = new RegExp(BUILD.__const__.regex.attr);
            let result = null;
            for (;;) {
                result = reg.exec(tag);

                if (result === null) {
                    break;
                }

                if (!result[0].trim()) {
                    continue;
                }

                if (result[1]) {
                    const attr = result[1].trim();
                    let arr = [attr, ""];

                    if (attr.indexOf("=") > -1) {
                        arr = attr.split("=");
                    }

                    res.attrs[arr[0]] = arr[1];
                    reg.lastIndex--;
                } else if (result[2]) {
                    res.attrs[result[2]] = result[3].trim().substring(1, result[3].length - 1);
                }
            }
            return res;
        },
        __compile__: (el, arr, props, events, comps) => {
            for (const obj of arr) {
                switch (obj.type) {
                    case "tag":
                        var _el = BUILD.__const__.svg.includes(obj.name) ? document.createElementNS("http://www.w3.org/2000/svg", obj.name) : document.createElement(obj.name);
                        _el.__archive__ = {};
                        BUILD.__addProps__(_el, obj.attrs, props, events);
                        BUILD.__compile__(_el, obj.children, props, events, comps);
                        el.appendChild(_el);
                        break;
                    case "text":
                        if (obj.content.length) {
                            var _el = document.createTextNode(obj.content);
                            el.appendChild(_el);
                        }
                        break;
                    case "comment":
                        if (BUILD.__isVar__(obj.comment)) {
                            const id = obj.comment.trim();
                            el.appendChild(comps[id]);
                        }
                        break;
                }
            }
        },
        __parse__: (html, options) => {
            options || (options = {});
            options.components || (options.components = BUILD.__const__.empty);
            const result = [];
            const arr = [];
            let current;
            let level = -1;
            let inComponent = false;

            if (html.indexOf("<") !== 0) {
                var end = html.indexOf("<");
                result.push({
                    type: "text",
                    content: end === -1 ? html : html.substring(0, end),
                });
            }

            html.replace(BUILD.__const__.regex.tag, function(tag, index) {
                if (inComponent) {
                    if (tag !== "</" + current.name + ">") {
                        return;
                    } else {
                        inComponent = false;
                    }
                }

                const isOpen = tag.charAt(1) !== "/";
                const isComment = tag.startsWith("<!--");
                const start = index + tag.length;
                const nextChar = html.charAt(start);
                let parent;

                if (isComment) {
                    const comment = BUILD.__getTag__(tag);

                    if (level < 0) {
                        result.push(comment);
                        return result;
                    }
                    parent = arr[level];
                    parent.children.push(comment);
                    return result;
                }

                if (isOpen) {
                    level++;

                    current = BUILD.__getTag__(tag);
                    if (current.type === "tag" && options.components[current.name]) {
                        current.type = "component";
                        inComponent = true;
                    }

                    if (!current.voidElement && !inComponent && nextChar && nextChar !== "<") {
                        current.children.push({
                            type: "text",
                            content: html.slice(start, html.indexOf("<", start)),
                        });
                    }

                    if (level === 0) {
                        result.push(current);
                    }
                    parent = arr[level - 1];

                    if (parent) {
                        parent.children.push(current);
                    }
                    arr[level] = current;
                }

                if (!isOpen || current.voidElement) {
                    if (level > -1 && (current.voidElement || current.name === tag.slice(2, -1))) {
                        level--;
                        current = level === -1 ? result : arr[level];
                    }
                    if (!inComponent && nextChar !== "<" && nextChar) {
                        parent = level === -1 ? result : arr[level].children;
                        const end = html.indexOf("<", start);
                        let content = html.slice(start, end === -1 ? undefined : end);
                        if (BUILD.__const__.regex.space.test(content)) {
                            content = " ";
                        }
                        if ((end > -1 && level + parent.length >= 0) || content !== " ") {
                            parent.push({
                                type: "text",
                                content: content,
                            });
                        }
                    }
                }
            });
            return result;
        },
        __event__: (ev, e) => {
            ev.forEach(function(_e) {
                switch (_e) {
                    case "prevent":
                        e.preventDefault();
                    case "propagation":
                        e.stopPropagation();
                    case "immediate":
                        e.stopImmediatePropagation();
                }
            });
        },
        __addProps__: (node, obj, props, events) => {
            for (const attr in obj) {
                const isProp = attr in node;
                const isEvent = attr.startsWith("@");
                if (isEvent) {
                    BUILD.__addEvent__(node, attr, events[obj[attr]]);
                    continue;
                }

                if (attr === "style") {
                    var val = obj[attr];
                    if (BUILD.__isVar__(val)) val = props[val];
                    if (typeof val === "object") {
                        node.setAttribute(attr, BUILD.__style__(val));
                        continue;
                    }
                }

                if (attr.split(".").length > 1) {
                    var val = obj[attr];
                    if (BUILD.__isVar__(val)) val = props[val];
                    BUILD.__addProp__(node, attr, val);
                    continue;
                }

                if (isProp && !BUILD.__const__.svg.includes(node.tagName.toLowerCase())) {
                    var val = obj[attr];
                    if (BUILD.__isVar__(val)) val = props[val] || events[val];
                    if (!val.length && typeof node[attr] === "boolean")
                        val = true;
                    node[attr] = node.__archive__[attr] = val;
                    continue;
                }

                var name = attr,
                    val = obj[attr];
                if (BUILD.__isVar__(val)) val = props[val];
                if (!["viewBox"].includes(attr)) name = __AXE__.__FILTER__.kebab(attr);
                node.setAttribute(name, val);
            }
        },
        __addProp__: (node, prop, val) => {
            let _prop = prop.split(".").reduce((a, e) => (a += `["${e}"]`), "");
            new Function(`return (node, val)=>{
                        try {
                            if (!val.length && typeof node${_prop} === "boolean")
                                val = true;
                            node${_prop} = val;
                        } catch(e){
                            console.log(e);
                            return;
                        }
                    }`)()(node, val);
        },
        __addEvent__: (node, name, call) => {
            const ev = name.split(":");
            const eventName = ev[0].slice(1);
            node.__handlers__ = node.__handlers__ || {};
            var isSameFunction = false;
            if (node.__handlers__[ev[0]]) {
                for (const _ev of node.__handlers__[ev[0]]) {
                    if (_ev.toString() === call.toString()) {
                        isSameFunction = true;
                        return;
                    }
                }
            }
            if (!isSameFunction) {
                node.__handlers__[ev[0]] = [call];
                node.addEventListener(__AXE__.__FILTER__.kebab(eventName), function(e) {
                    BUILD.__event__(ev, e);
                    call(e);
                });
            }
        },
        __type__: (v) => {
            return Object.prototype.toString.call(v).slice(8).slice(0, -1).toLowerCase();
        },
        __isAbsent__: (v) => {
            return (
                BUILD.__type__(v) === "undefined" ||
                BUILD.__type__(v) === "null" ||
                (BUILD.__type__(v) === "number" && isNaN(v)) ||
                (BUILD.__type__(v) === "string" && v === "") ||
                (BUILD.__type__(v) === "array" && v.length === 0) ||
                (BUILD.__type__(v) === "object" && Object.keys(v).length === 0)
            );
        },
        __style__: (obj) => {
            var str = "";
            for (var key in obj) {
                if (!BUILD.__isAbsent__(obj[key])) {
                    var _val = obj[key],
                        _key = __AXE__.__FILTER__.kebab(key);
                    BUILD.__type__(_val) === "number" && !BUILD.__const__.unitless.includes(_key) && (_val += "px");
                    str += `${_key}:${_val};`;
                }
            }
            return str.trim();
        },
        __unEscape__: (htmlStr) => {
            htmlStr = htmlStr.replace(/&lt;/g, "<");
            htmlStr = htmlStr.replace(/&gt;/g, ">");
            htmlStr = htmlStr.replace(/&quot;/g, "\"");
            htmlStr = htmlStr.replace(/&#39;/g, "\'");
            htmlStr = htmlStr.replace(/&amp;/g, "&");
            return htmlStr;
        }
    }

    const Compile = (el, tree) => {
        const temp = tree.string;
        const components = tree.components;
        const events = tree.events;
        const props = tree.props;
        Exec(el, temp, props, events, components);
    }

    const Exec = (el, str, props, events, comps) => {
        const opts = {
            key: (node) => node.id
        };
        if (!el.childNodes.length && typeof str === "string") {
            const arr = BUILD.__parse__(str);
            BUILD.__compile__(el, arr, props, events, comps);
            return el;
        }

        if (typeof str === "string") {
            const arr = BUILD.__parse__(str);
            str = document.createDocumentFragment();
            BUILD.__compile__(str, arr, props, events, comps);
        }

        const nodesByKey = {
            old: BUILD.__getMap__(el, opts.key),
            new: BUILD.__getMap__(str, opts.key),
        };

        let idx;
        for (idx = 0; str.firstChild; idx++) {
            const newNode = str.removeChild(str.firstChild);
            if (idx >= el.childNodes.length) {
                el.appendChild(newNode);
                continue;
            }

            let baseNode = el.childNodes[idx];
            const newKey = opts.key(newNode);

            if (opts.key(baseNode) || newKey) {
                const match = newKey && newKey in nodesByKey.old ? nodesByKey.old[newKey] : newNode;
                if (match !== baseNode) {
                    baseNode = el.insertBefore(match, baseNode);
                }
            }

            if (baseNode.nodeType !== newNode.nodeType || baseNode.tagName !== newNode.tagName) {
                el.replaceChild(newNode, baseNode);
            } else if ([Node.TEXT_NODE, Node.COMMENT_NODE].indexOf(baseNode.nodeType) >= 0) {
                if (baseNode.textContent === newNode.textContent) continue;
                baseNode.textContent = newNode.textContent;
            } else if (baseNode !== newNode) {
                const attrs = {
                    base: BUILD.__attributes__(baseNode),
                    new: BUILD.__attributes__(newNode),
                };

                for (const attr in attrs.base) {
                    if (attr in attrs.new) continue;
                    baseNode.removeAttribute(attr);
                }

                BUILD.__addProps__(baseNode, attrs.new, props, events);

                for (const prop in newNode.__archive__) {
                    if (baseNode[prop] !== newNode.__archive__[prop]) {
                        baseNode[prop] = newNode.__archive__[prop];
                    }
                }

                Exec(baseNode, newNode, props, events, comps);
            }
        }

        while (el.childNodes.length > idx) {
            el.removeChild(el.lastChild);
        }

        return el;
    }

    const Change = (object, callback) => {
        const handler = {
            get(target, property, receiver) {
                const desc = Object.getOwnPropertyDescriptor(target, property);

                if (desc && !desc.writable && !desc.configurable) {
                    return Reflect.get(target, property, receiver);
                }

                try {
                    return new Proxy(target[property], handler);
                } catch (err) {
                    return Reflect.get(target, property, receiver);
                }
            },

            defineProperty(target, property, descriptor) {
                callback(property, descriptor);
                return Reflect.defineProperty(target, property, descriptor);
            },

            deleteProperty(target, property) {
                callback();
                return Reflect.deleteProperty(target, property);
            },
        };
        return new Proxy(object, handler);
    }

    const Referal = (el, sl) => {
        Array.from(el.querySelectorAll("[ref]")).forEach((e) => {
            const ref = e.getAttribute("ref");
            var id = Array.from(el.querySelectorAll("[ref='" + ref + "']"));
            if (ref)
                sl.Referal[__AXE__.__FILTER__.camel(ref)] = (id.length > 1) ? id : id[0];
        });
        Array.from(el.querySelectorAll("[ref]")).forEach((e) => {
            e.removeAttribute("ref")
        });
    }

    customElements.define("axe-wrapper", class extends HTMLElement {
        constructor() {
            super();
            document.body.style.display = "none";
            this.__TEM__ = this.innerHTML;
            this.innerHTML = "";
            document.body.style.display = "";
        }
    })

    var isVariable = function(str) {
        return str.trim()[0] === "$";
    };

    var isMixin = function(str) {
        return str.trim().slice(0, 6) === "@mixin";
    };

    var isMedia = function(str) {
        return str.trim().slice(0, 6) === "@media";
    };

    var isInclude = function(str) {
        return str.trim().slice(0, 8) === "@include";
    };

    var addGlobal = function(scssVar, tree) {
        if (tree.parent === null || tree.parent === undefined) {
            tree._context[scssVar.key] = scssVar;
            return true;
        }
        return addGlobal(scssVar, tree.parent);
    };

    var addMixin = function(propertyName, block, tree) {
        var parsedPropertyName = getMixin(propertyName);
        tree._mixins[parsedPropertyName] = block;
        return true;
    };

    var addMedia = function(propertyName, block, tree) {
        var parsedPropertyName = getMedia(propertyName).replace(/\s/g, "");
        tree._medias.push({
            condition: parsedPropertyName,
            block: block,
        });
        return true;
    };

    var getName = function(str) {
        var varName = str.trim();
        if (isVariable(varName)) return varName.slice(1);
        return varName;
    };

    var getValue = function(varName, tree) {
        if (tree._context[varName] !== undefined) {
            return tree._context[varName].getValue();
        }
        if (tree.parent !== null && tree.parent !== undefined) {
            return getValue(varName, tree.parent);
        }
        throw new Error("Variable $" + varName + " not defined");
    };

    var getMixin = function(str) {
        return str
            .replace("@mixin", "")
            .replace(/\({1}[^/)]*\){1}/g, "")
            .trim();
    };

    var getMedia = function(str) {
        return str.replace("@media", "").trim().slice(1, -1).trim();
    };

    var getInclude = function(str) {
        return str
            .replace("@include", "")
            .replace(/\({1}[^/)]*\){1}/g, "")
            .trim();
    };

    function Loop(isTree) {
        return function(scssTree) {
            var str = "";
            for (var ii = 0; ii < scssTree.properties.length; ii += 1) {
                var _t = scssTree.properties[ii];
                if (_t.isTree === isTree) {
                    str += _t.getString(0, scssTree);
                }
            }
            return str;
        };
    }

    var LoopProperties = Loop(false);
    var LoopTrees = Loop(true);

    var Variable = function(str) {
        this.isCssProperty = true;
        this.isTree = false;
        this._property = this.parse(str);
        this.key = this._property.key;
        this.value = this._property.value;
        this.global = this.checkIfGlobal();
    };

    var Property = function(str) {
        this.isCssProperty = true;
        this.isTree = false;
        this._property = this.parse(str);
        this.key = this._property.key;
        this.value = this._property.value;
    };

    var Comment = function(str) {
        this.isComment = true;
        this.isTree = false;
        var foundEndingStar = false;
        if (str[0] === "*") {
            str = str.substring(1, str.length);
        }
        if (!foundEndingStar && str[str.length - 1] === "*") {
            foundEndingStar = true;
            str = str.substring(0, str.length - 1);
        }
        this.str = str;
    };

    Variable.prototype.parse = function(str) {
        var _property = str.split(":");
        var key = _property[0].trim().slice(1); // Remove $ Sign
        var value = _property.slice(1).join(":").trim();
        return {
            key: key,
            value: value,
        };
    };

    Variable.prototype.checkIfGlobal = function() {
        if (this.value.substring(this.value.length - 7) === "!global") {
            this.value = this.value.substring(0, this.value.length - 7).trim();
            return true;
        }
        return false;
    };

    Variable.prototype.getValue = function() {
        return this.value;
    };

    Variable.prototype.isGlobal = function() {
        return this.global;
    };

    Property.prototype.parse = function(str) {
        var _property = str.split(":");
        var key = _property[0].trim();
        var value = _property[1].trim();
        return {
            key: key,
            value: value,
        };
    };

    Property.prototype.getString = function(indentationLevel, scssTree) {
        const val = this.getValue(this.value, scssTree);
        if (val.length && val !== "null" && val !== "undefined") return this.key + ":" + val + ";";
        return "";
    };

    Property.prototype.getValue = function(val, scssTree) {
        if (isVariable(val)) {
            var varName = getName(val);
            return getValue(varName, scssTree);
        }
        return val;
    };

    Comment.prototype.getString = function() {
        return "/*" + this.str + "*/";
    };

    function Parser(str, selector, parent, context) {
        var result = {};
        result.isTree = true;
        result.properties = []; // .hello { font-size: 12px; }
        result._context = parent !== undefined ? parent._context : {}; // Variables
        result._medias = []; // Medias
        result._mixins = parent !== undefined ? parent._mixins : {}; // Variables
        result.parent = parent;
        result.selector = selector;

        result.getString = function() {
            return Stringifier(result);
        };

        var inInlineComment = false;
        var inComment = false;
        var object_open = false;
        var object_bracket_count = 0;
        var curr_block = "";
        var curr_property = "";

        for (var i = 0; i < str.length; i += 1) {
            var prevCh = str[i - 1] || "";
            var nextCh = str[i + 1] || "";
            var ch = str[i];

            if (inInlineComment && prevCh === "\n") {
                inInlineComment = false;
            } else if (!inInlineComment && ch === "/" && nextCh === "/") {
                inInlineComment = true;
            }
            if (!inInlineComment) {
                if (!inComment && ch === "/" && nextCh === "*") {
                    inComment = true;
                    curr_property = "";
                } else if (inComment && prevCh === "*" && ch === "/") {
                    inComment = false;
                    result.properties.push(new Comment(curr_property));
                    curr_property = "";
                } else if (inComment) {
                    curr_property += ch;
                } else if (ch === ";" && !object_open) {
                    if (isInclude(curr_property)) {
                        var propertyName = getInclude(curr_property);
                        if (result._mixins[propertyName] !== undefined) {
                            var mixin = result._mixins[propertyName];
                            result.properties.push(Parser(mixin, " ", result));
                        }
                    } else if (isVariable(curr_property)) {
                        var variable = new Variable(curr_property);
                        if (variable.isGlobal()) {
                            addGlobal(variable, result);
                        } else {
                            result._context[variable.key] = variable;
                        }
                    } else {
                        result.properties.push(new Property(curr_property));
                    }
                    curr_property = "";
                } else if (ch === "{") {
                    object_bracket_count += 1;
                    object_open = true;
                    if (object_bracket_count === 0) {
                        curr_block = "";
                    } else if (object_bracket_count !== 1) {
                        curr_block += ch;
                    }
                } else if (ch === "}") {
                    object_bracket_count -= 1;
                    if (object_bracket_count === 0) {
                        if (curr_block.trim() !== "") {
                            var property_name = curr_property.trim();
                            if (isMixin(property_name)) {
                                addMixin(property_name, curr_block, result);
                            } else if (isMedia(property_name)) {
                                addMedia(property_name, curr_block, result);
                            } else {
                                result.properties.push(Parser(curr_block, property_name, result));
                            }
                        }
                        curr_block = "";
                        curr_property = "";
                        object_open = false;
                    } else {
                        curr_block += ch;
                    }
                } else {
                    if (object_open) {
                        curr_block += ch;
                    } else {
                        curr_property += ch;
                    }
                }
            }
        }
        return result;
    }

    function Stringifier(scssTree) {
        var str = "";
        if (scssTree.properties.length > 0) {
            if (scssTree.selector !== null && scssTree.selector !== undefined && scssTree.selector !== "") {
                var data = LoopProperties(scssTree);
                if (data.length) {
                    var sel = Selector(scssTree).replaceAll("@self", ":root");
                    str += sel + "{";
                    str += data;
                    str += "}";
                }
            }
        }
        str += LoopTrees(scssTree);
        if (scssTree._medias.length > 0) {
            for (const m of scssTree._medias) {
                str += "@media(" + m.condition + "){" + Parser(m.block, undefined, scssTree).getString() + "}";
            }
        }
        return str;
    }

    function Selector(scssTree) {
        var _selector = "";
        if (scssTree.selector !== null && scssTree.selector !== undefined) {
            if (scssTree.parent.selector !== null && scssTree.parent.selector !== undefined) {
                if (scssTree.selector.includes("&")) {
                    _selector = scssTree.selector
                        .split("&")
                        .map((e) => {
                            if (e.length) {
                                if (Selector(scssTree.parent) === "@self") return Selector(scssTree.parent) + "(" + e + ")";
                                else return Selector(scssTree.parent) + e;
                            }
                        })
                        .filter((e) => e !== undefined)
                        .join("");
                } else {
                    _selector = scssTree.selector.split(",").map(e => Selector(scssTree.parent) + " " + e).join(",");
                }
            } else {
                _selector = scssTree.selector;
            }
        }
        return _selector.trim();
    }

    const SASS = async(state) => {
        const el = document.querySelector("axe-sass");
        if (!el) return
        if (el.hasAttribute("src") && !el.__TEM__.trim().length) {
            const req = await fetch(el.getAttribute("src"));
            el.__TEM__ = await req.text();
        }
        var code = BUILD.__unEscape__(el.__TEM__ || "");
        [{
            key: "@media.sm",
            val: "min-width:640px"
        }, {
            key: "@media.md",
            val: "min-width:768px"
        }, {
            key: "@media.lg",
            val: "min-width:1024px"
        }, {
            key: "@media.xl",
            val: "min-width:1280px"
        }].forEach(e => {
            code = code.replaceAll(e.key, `@media(${e.val})`)
        })

        code = Parser(code).getString();
        code = await AXE.Render(code, state);
        el.innerHTML = "<style>" + code.string + "</style>";
    }

    customElements.define("axe-sass", class extends HTMLElement {
        constructor() {
            super();
            document.body.style.display = "none";
            this.__TEM__ = this.innerHTML;
            this.innerHTML = "";
            document.body.style.display = "";
        }
    })


    const AXE = {
        Helpers: __AXE__.__FILTER__,
        Referal: {},
        State: {}
    }

    AXE.setState = function(state = {}) {
        Object.keys(state).map((a) => {
            if (typeof state[a] !== "function") {
                this.State[a] = state[a];
            } else {
                const boundAction = state[a].bind(this)

                function actionWithData(params) {
                    if (!params) return boundAction();
                    else return boundAction(params);
                }
                this.State[a] = actionWithData;
            }
        });

        this.State = Change(this.State, () => {
            setTimeout(() => {
                this.Launch()
            }, 0);
        });
        return this;
    }

    AXE.Render = async function(code, data = {}) {
        code = await RENDER.__INCLUDE__(code);
        code = RENDER.__LEXER__(code);
        code = RENDER.__MAKE__(code);
        return new Function('', code)()(data)
    }

    AXE.Update = function(update) {
        this.__callbakc__ = update;
        return this
    }

    AXE.Helper = function(name, helper) {
        if (Object.keys(__AXE__.__FILTER__).includes(name)) throw new Error("Hepler already exist");
        __AXE__.__FILTER__[name] = helper;
        return this
    }

    AXE.Launch = async function() {
        await SASS(this.State);
        const el = document.querySelector("axe-wrapper");
        if (!el) return
        if (el && el.hasAttribute("src") && !el.__TEM__.trim().length) {
            const req = await fetch(el.getAttribute("src"));
            el.__TEM__ = await req.text();
        }
        const tree = await this.Render(BUILD.__unEscape__(el.__TEM__ || ""), {
            ...this.State,
            __ref__: this.Referal
        });
        Compile(el, tree);
        Referal(el, this);
        this.__callbakc__ && this.__callbakc__();
        return this
    }

    AXE.Array = {
        Insert(name, value, unique = false) {
            AXE.State[name] = unique ? [...new Set([...AXE.State[name], value])] : [...AXE.State[name], value];
        },
        Remove(name, value, sensitive = false) {
            AXE.State[name] = sensitive ? AXE.State[name].filter(item => item.toLowerCase() !== value.toLowerCase()) : AXE.State[name].filter(item => item !== value);
        }
    }

    return AXE;
})();