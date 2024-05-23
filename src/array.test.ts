import { describe, expect, it } from 'vitest';
import { Type } from '@sinclair/typebox';

import { Parser } from './main.js';

describe('Type.Array', () => {
	const parser = new Parser();

	it('should parse Array(String())', () => {
		const schema = Type.Array(Type.String());
		const data = {
			valid: `
                <root>
                    <item>hello</item>
                    <item>world</item>
                </root>
            `,
			invalid: `
                <root>
                    <item>hello</item>
                    <item>
                        <foo>bar</foo>
                    </item>
                </root>
            `,
		};

		expect(parser.parse(data.valid, schema)).toEqual(['hello', 'world']);
	});

	it('should parse Array(String(_alias: "name"))', () => {
		const schema = Type.Array(Type.String({ _alias: 'name' }));

		const data = `
            <root>
                <other>hello</other>
                <name>hello</name>
                <other>hello</other>
                <name>world</name>
            </root>
        `;

		expect(parser.parse(data, schema)).toEqual(['hello', 'world']);
	});

	it('should parse Array(Boolean())', () => {
		const schema = Type.Array(Type.Boolean());

		const data = `
            <root>
                <item>true</item>
                <item>false</item>
            </root>
        `;

		expect(parser.parse(data, schema)).toEqual([true, false]);
	});

	it('should throw error when parsing Array(String()) with data of different depth', () => {
		const schema = Type.Array(Type.String());
		const data = `
            <root>
                <item>hello</item>
                <item>
                    <foo>bar</foo>
                </item>
            </root>
        `;

		expect(() => parser.parse(data, schema)).toThrowError();
	});

	it('should parse Array(Array(String()))', () => {
		const schema = Type.Array(Type.Array(Type.String()));

		const data = `
            <root>
                <item>
                    <element>hello</element>
                    <element>world</element>
                </item>
                <item>
                    <element>foo</element>
                    <element>bar</element>
                </item>
            </root>
        `;

		expect(parser.parse(data, schema)).toEqual([
			['hello', 'world'],
			['foo', 'bar'],
		]);
	});

	it('should parse Array(Object({ name: String() }))', () => {
		const schema = Type.Array(Type.Object({ name: Type.String() }));

		const data = `
            <root>
                <item>
                    <name>hello</name>
                </item>
                <item>
                    <name>world</name>
                </item>
            </root>
        `;

		expect(parser.parse(data, schema)).toEqual([
			{ name: 'hello' },
			{ name: 'world' },
		]);
	});

	it('should parse Array(String()) with empty array', () => {
		const schema = Type.Array(Type.String());

		const data = `
                <root>
                    <item></item>
                </root>
            `;

		expect(parser.parse(data, schema)).toEqual(['']);
	});

	it('should parse Array(Array(String())) with empty array', () => {
		const schema = Type.Array(Type.Array(Type.String()));

		const data = `
            <root>
                <item></item>
            </root>
        `;

		expect(parser.parse(data, schema)).toEqual([[]]);
	});
});
