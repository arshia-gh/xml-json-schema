import { describe, expect, it } from 'vitest';
import { Parser } from './main.js';
import { Type } from '@sinclair/typebox';

describe('Parser', () => {
	const parser = new Parser();
	it('Should parse Object(foo: string, bar: number, date: Date)', () => {
		const schema = Type.Object({
			foo: Type.String(),
			bar: Type.Number(),
			date: Type.Date(),
		});

		const data = {
			valid: `
                <root>
                    <foo>hello</foo>
                    <bar>42</bar>
                    <date>2021-01-01</date>
                </root>
            `,
			invalid: `
                <root>
                    <foo>hello</foo>
                    <bar>42</bar>
                    <date>invalid</date>
                </root>
            `,
		};

		expect(parser.parse(data.valid, schema)).toEqual({
			foo: 'hello',
			bar: 42,
			date: new Date('2021-01-01'),
		});

		expect(() => parser.parse(data.invalid, schema)).toThrowError(
			'Invalid date: invalid',
		);
	});

	it('Should parse Object(name: string, age: number, isStudent: boolean, address: Object(street: string, city: string, zip: string))', () => {
		const schema = Type.Object({
			name: Type.String(),
			age: Type.Number(),
			isStudent: Type.Boolean({ _alias: 'is_student' }),
			address: Type.Object({
				street: Type.String(),
				city: Type.String(),
				zip: Type.String(),
			}),
		});

		const data = {
			valid: `
                <root>
                    <name>John Doe</name>
                    <age>25</age>
                    <is_student>true</is_student>
                    <address>
                        <street>123 Main St</street>
                        <city>Springfield</city>
                        <zip>12345</zip>
                    </address>
                </root>
            `,
			invalid: `
                <root>
                    <name>John Doe</name>
                    <age>25</age>
                    <is_student>true</is_student>
                    <address>
                        <street>123 Main St</street>
                        <city>Springfield</city>
                    </address>
                </root>
            `,
		};

		expect(parser.parse(data.valid, schema)).toEqual({
			name: 'John Doe',
			age: 25,
			isStudent: true,
			address: {
				street: '123 Main St',
				city: 'Springfield',
				zip: '12345',
			},
		});

		expect(() => parser.parse(data.invalid, schema)).toThrowError();
	});
});
