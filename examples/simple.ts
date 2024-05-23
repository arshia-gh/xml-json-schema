import { Type } from '@sinclair/typebox';
import { Parser } from '../src/main.js';
import { JSDOM } from 'jsdom';

const window = new JSDOM().window;

const schema = Type.Array(
	Type.Object({
		foo: Type.String(),
		bar: Type.Number(),
		date: Type.Date(),
	}),
);

const parser = new Parser({
	domParser: (xml) => {
		const parser = new window.DOMParser();
		return parser.parseFromString(xml, 'application/xml');
	},
});

parser.addValueParser('Date', (element) => {
	if (element.textContent === null) {
		return null;
	}

	const value = new Date(element.textContent);

	if (isNaN(value.getTime())) {
		throw new Error(`Invalid date: ${element.textContent}`);
	}

	return value;
});

const result = parser.parse(
	`
		<root>
			<foo>hello</foo>
			<bar>42</bar>
			<date>2021-01-01</date>
		</root>
	`,
	schema,
);

console.log(result);
