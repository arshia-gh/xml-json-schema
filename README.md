[![Release](https://github.com/arshia-gh/xml-json-schema/actions/workflows/release.yml/badge.svg?branch=release&event=push)](https://github.com/arshia-gh/xml-json-schema/actions/workflows/release.yml) ![GitHub Release](https://img.shields.io/github/v/release/arshia-gh/xml-json-schema) ![GitHub License](https://img.shields.io/github/license/arshia-gh/xml-json-schema) ![GitHub package.json prod dependency version](https://img.shields.io/github/package-json/dependency-version/arshia-gh/xml-json-schema/%40sinclair%2Ftypebox)

# XML Json Schema

Typescript library for parsing and validating XML data against a JSON schema.

## Unstable API

This library is still in development and the API is subject to change. Please use with caution in production as the API may change in the future.

## Acknowledgements

This library is dependent on TypeBox for JSON schema validation. It uses the `Kind` symbol from TypeBox to determine the type of a JSON schema.

## Installation

Install the package using npm:

```bash
npm install xml-json-schema
```

And install typebox if you haven't already:

```bash
npm install @sinclair/typebox
```

## Usage

### Basic Usage

First create a JSON schema using TypeBox, you may use the `_alias` property to specify the XML tag name:

```typescript
import { Parser } from 'xml-json-schema';
import { Type } from '@sinclair/typebox';

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
```

Then create a parser instance and parse the XML data:

```typescript
const parser = new Parser();

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
```

The `parse` method will throw an error if the XML data does not match the schema.

### Customizing the Parser

**Custom XML Parser**
By default `Parser.parse` will use the DOMParser API to parse the XML data. You can customize the parser by passing an options object to the constructor:

```typescript
const parser = new Parser({
	domParser: (xml: string): Document => {
		// Custom parser implementation
	},
});
```

**Nil Elements**
You can customize the parser to treat certain elements as `null` by providing a custom `isNilElement` function:

```typescript
const parser = new Parser({
	isNilElement: (element: Element): boolean => {
		// Custom implementation
	},
});
```

By default, the parser will treat elements with the `nil` attribute set to `true` as `null`.

```typescript
const xml = `
    <root>
        <name nil="true"></name>
    </root>
`;

const data = parser.parse(xml, schema);

console.log(data); // { name: null }
```

**Supporting Other Schema Types**

Todo - document how to support other schema types.

## Todo

- [ ] Document how to support other schema types.
- [ ] Support raw json schema (without typebox).
- [ ] Support other TypeBox types (e.g. `Type.Union`).
- [ ] Call isNilElement only on empty elements. (Currently it is called on all elements).
- [ ] Allow providing multiple schemas when parsing XML data. (To be discussed).
- [ ] Validate XML data against the schema before parsing it.

## Future

I am planning to add a code generation feature (same as TypeBox Compiler API) to this library. The code generation feature will generate TypeScript code for parsing and validating XML data against a JSON schema. The generated code will be optimized for performance and will not use any external libraries.

However, this feature is still in the planning stage and I am not sure when it will be implemented or released.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.

## Contributing

In future, we will provide a guide on how to contribute to this project. For now, feel free to open an issue, if you have any questions or suggestions.
