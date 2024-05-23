import {
	Kind,
	OptionalKind,
	type Static,
	type TAnySchema,
} from '@sinclair/typebox';

export interface ParserOptions {
	/**
	 * Determines whether the element value should be treated as null.
	 * This is useful when dealing with empty elements or self-closing tags.
	 *
	 * @default
	 * (element) => element.getAttribute('nil') === 'true'
	 */
	isNilElement: (element: Element) => boolean;

	/**
	 * Provides a custom DOM parser. This is useful when running in environments
	 * where `DOMParser` is not available.
	 *
	 * Your custom parser should return a `Document` object. And should at least support
	 * the following APIs:
	 * - `Element.getElementsByTagNameNS`
	 * - `Element.getElementsByTagName`
	 * - `Element.textContent`
	 * - `Element.getAttribute` (if default `isNilElement`)
	 * - `Element.children`
	 * - `Document.documentElement`
	 *
	 */
	domParser: (xml: string) => Document;
}

export type Maybe<T> = T | null | undefined;

export type ElementResolverFn = <T extends TAnySchema = TAnySchema>(
	element: Element,
	schema: T,
	defaultAlias?: Maybe<string>,
) => Element | null;

export type ElementParserFn = <T extends TAnySchema = TAnySchema>(
	element: Element,
	schema: T,
	shouldResolve?: boolean,
) => Static<T>;

export type ValueParser<T extends TAnySchema = TAnySchema> = (
	element: Element,
	schema: T,
	parse: ElementParserFn,
	resolveElement: ElementResolverFn,
) => Static<T>;

const expectLeafElement = (element: Element) => {
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
		const result: unknown[] = [];

		const items = Array.from(
			schema.items['_alias']
				? element.getElementsByTagNameNS(
						schema.items['_ns'] ?? '*',
						schema.items['_alias'],
					)
				: element.children,
		);

		for (const item of items) {
			result.push(parse(item, schema.items, false));
		}

		return result;
	},

	Object(element, schema, parse, resolveElement) {
		const result: Record<string, unknown> = {};

		for (const key in schema.properties) {
			const el = resolveElement(element, schema.properties[key]!, key);

			result[key] = el != null ? parse(el, schema.properties[key]!, false) : el;
		}

		return result;
	},
} as const satisfies Record<string, ValueParser>;

export class Parser {
	private readonly _options: ParserOptions;
	private readonly _parsers: Map<string, ValueParser> = new Map();

	constructor(options?: Partial<ParserOptions>) {
		this._options = {
			isNilElement:
				options?.isNilElement ??
				((element) => element.getAttribute('nil') === 'true'),
			domParser:
				options?.domParser ??
				(() => {
					if (typeof DOMParser === 'undefined') {
						throw new Error('DOMParser is not available in this environment');
					}

					const parser = new DOMParser();

					return (xml: string) =>
						parser.parseFromString(xml, 'application/xml');
				})(),
		};

		this._parsers = new Map(Object.entries(DefaultParsers));
	}

	parse<T extends TAnySchema>(xml: string, schema: T) {
		const document = this._options.domParser(xml);

		// check for errors
		const error = document.getElementsByTagName('parsererror').item(0);
		if (error) {
			throw new Error(`XML parsing error: ${error.textContent ?? 'unknown'}`);
		}

		return this._parseElement(document.documentElement, schema);
	}

	private resolveElement: ElementResolverFn = (
		element,
		schema,
		defaultAlias = null,
	) => {
		if (schema['_alias'] == null && defaultAlias == null) {
			return element;
		}

		const alias = schema['_alias'] ?? defaultAlias;
		const resolved = element
			.getElementsByTagNameNS(schema['_ns'] ?? '*', alias)
			.item(0);

		if (!resolved && schema[OptionalKind] !== 'Optional') {
			throw new Error(
				[
					`Could not resolve element "${alias}" in namespace "${schema['_ns'] ?? '*'}".`,
					`Descendant of element "${element.tagName}".`,
					'Ensure that the element is present in the XML document and depth of schema matches the XML document.',
				].join(' '),
			);
		}

		return resolved;
	};

	private _parseElement<T extends TAnySchema>(
		element: Element,
		schema: T,
		shouldResolve = true,
	): Static<T> {
		const parser = this._parsers.get(schema[Kind]);

		if (!parser) {
			throw new Error(`No parser found for schema type "${schema[Kind]}"`);
		}

		const el = shouldResolve ? this.resolveElement(element, schema) : element;

		return el != null
			? parser(
					el,
					schema,
					this._parseElement.bind(this),
					this.resolveElement.bind(this),
				)
			: el;
	}

	public addParser(kind: string, parser: ValueParser) {
		this._parsers.set(kind, parser);
	}

	public removeParser(kind: string): boolean {
		if (!this._parsers.has(kind)) {
			return false;
		}

		this._parsers.delete(kind);
		return true;
	}
}
