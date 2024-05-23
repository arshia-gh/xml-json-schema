import { Parser } from '../src/main.js';
import { Type } from '@sinclair/typebox';
import { JSDOM } from 'jsdom';

const window = new JSDOM().window;

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

const parser = new Parser({
	domParser: (xml) => {
		const parser = new window.DOMParser();
		return parser.parseFromString(xml, 'application/xml');
	},
});

const xml = `
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
`;

const data = parser.parse(xml, schema);
console.log(data);
