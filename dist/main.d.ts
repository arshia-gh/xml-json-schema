import { type Static, type TAnySchema } from '@sinclair/typebox';
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
export type ElementResolverFn = <T extends TAnySchema = TAnySchema>(element: Element, schema: T, defaultAlias?: Maybe<string>) => Element | null;
export type ElementParserFn = <T extends TAnySchema = TAnySchema>(element: Element, schema: T, shouldResolve?: boolean) => Static<T>;
export type ValueParser<T extends TAnySchema = TAnySchema> = (element: Element, schema: T, parse: ElementParserFn, resolveElement: ElementResolverFn) => Static<T>;
export declare const DefaultParsers: {
    readonly Number: (element: Element) => number;
    readonly Integer: (element: Element) => number;
    readonly String: (element: Element) => string;
    readonly Boolean: (element: Element) => boolean;
    readonly Date: (element: Element) => Date | null;
    readonly Array: (element: Element, schema: TAnySchema, parse: ElementParserFn) => unknown[];
    readonly Object: (element: Element, schema: TAnySchema, parse: ElementParserFn, resolveElement: ElementResolverFn) => Record<string, unknown>;
};
export declare class Parser {
    private readonly _options;
    private readonly _parsers;
    constructor(options?: Partial<ParserOptions>);
    parse<T extends TAnySchema>(xml: string, schema: T): Static<T>;
    private resolveElement;
    private _parseElement;
    addParser(kind: string, parser: ValueParser): void;
    removeParser(kind: string): boolean;
}
//# sourceMappingURL=main.d.ts.map