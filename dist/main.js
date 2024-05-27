import { Kind, OptionalKind, } from '@sinclair/typebox';
const expectLeafElement = (element) => {
    if (element.children.length > 0) {
        throw new Error('Expected a leaf element but got an element with children');
    }
};
export const DefaultParsers = {
    Number(element) {
        expectLeafElement(element);
        const value = parseFloat(element.textContent || '');
        if (isNaN(value)) {
            throw new Error(`Expected a number but got "${element.textContent}"`);
        }
        return value;
    },
    Integer(element) {
        expectLeafElement(element);
        const value = parseInt(element.textContent || '', 10);
        if (isNaN(value)) {
            throw new Error(`Expected an integer but got "${element.textContent}"`);
        }
        return value;
    },
    String(element) {
        expectLeafElement(element);
        return element.textContent || '';
    },
    Boolean(element) {
        expectLeafElement(element);
        switch (element.textContent) {
            case 'true':
                return true;
            case 'false':
                return false;
            default:
                throw new Error(`Expected a boolean but got "${element.textContent}"`);
        }
    },
    Date(element) {
        expectLeafElement(element);
        if (element.textContent === null) {
            return null;
        }
        const value = new Date(element.textContent);
        if (isNaN(value.getTime())) {
            throw new Error(`Invalid date: ${element.textContent}`);
        }
        return value;
    },
    Array(element, schema, parse) {
        const result = [];
        const items = Array.from(schema.items['_alias']
            ? element.getElementsByTagNameNS(schema.items['_ns'] ?? '*', schema.items['_alias'])
            : element.children);
        for (const item of items) {
            result.push(parse(item, schema.items, false));
        }
        return result;
    },
    Object(element, schema, parse, resolveElement) {
        const result = {};
        for (const key in schema.properties) {
            const el = resolveElement(element, schema.properties[key], key);
            result[key] = el != null ? parse(el, schema.properties[key], false) : el;
        }
        return result;
    },
};
export class Parser {
    _options;
    _parsers = new Map();
    constructor(options) {
        this._options = {
            isNilElement: options?.isNilElement ??
                ((element) => element.getAttribute('nil') === 'true'),
            domParser: options?.domParser ??
                (() => {
                    if (typeof DOMParser === 'undefined') {
                        throw new Error('DOMParser is not available in this environment');
                    }
                    const parser = new DOMParser();
                    return (xml) => parser.parseFromString(xml, 'application/xml');
                })(),
        };
        this._parsers = new Map(Object.entries(DefaultParsers));
    }
    parse(xml, schema) {
        const document = this._options.domParser(xml);
        // check for errors
        const error = document.getElementsByTagName('parsererror').item(0);
        if (error) {
            throw new Error(`XML parsing error: ${error.textContent ?? 'unknown'}`);
        }
        return this._parseElement(document.documentElement, schema);
    }
    resolveElement = (element, schema, defaultAlias = null) => {
        if (schema['_alias'] == null && defaultAlias == null) {
            return element;
        }
        const alias = schema['_alias'] ?? defaultAlias;
        const ns = schema['_ns'] ?? '*';
        const resolved = element.getElementsByTagNameNS(ns, alias).item(0);
        if (!resolved && schema[OptionalKind] !== 'Optional') {
            throw new Error([
                `Could not resolve element "${alias}" in namespace "${ns}".`,
                `Descendant of element "${element.tagName}".`,
                'Ensure that the element is present in the XML document and depth of schema matches the XML document.',
            ].join(' '));
        }
        return resolved;
    };
    _parseElement(element, schema, shouldResolve = true) {
        const parser = this._parsers.get(schema[Kind]);
        if (!parser) {
            throw new Error(`No parser found for schema type "${schema[Kind]}"`);
        }
        const el = shouldResolve ? this.resolveElement(element, schema) : element;
        // parse if element is present and not nil
        if (el && !this._options.isNilElement(el)) {
            return parser(el, schema, this._parseElement.bind(this), this.resolveElement.bind(this));
        }
        // schema optionality is checked in resolveElement function
        return null;
    }
    addParser(kind, parser) {
        this._parsers.set(kind, parser);
    }
    removeParser(kind) {
        if (!this._parsers.has(kind)) {
            return false;
        }
        this._parsers.delete(kind);
        return true;
    }
}
//# sourceMappingURL=main.js.map