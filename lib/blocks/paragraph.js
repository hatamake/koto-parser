const {BaseBlock} = require('./base');
const {isLineEnd} = require('../util/scanner');
const Inline = require('../core/inline');
const {TextToken} = require('../tokens/text');

class ParagraphBlock extends BaseBlock {
	constructor(contentTokens, isLastContent) {
		super();

		this.contentTokens = contentTokens;
		this.isLastContent = isLastContent;
	}

	append(paragraph) {
		this.contentTokens.push(new TextToken(' '));
		this.contentTokens = this.contentTokens.concat(paragraph.contentTokens);

		this.isLastContent = paragraph.isLastContent;
	}

	static parse(scanner, match, options) {
		scanner.mark();
		scanner.skipToLineEnd();
		const content = scanner.pop();
		const contentTokens = Inline.parse(content, options);

		const isLastContent = (
			scanner.isAtEnd ||
			isLineEnd(scanner.getCharAtOffset(+1))
		);

		return new ParagraphBlock(contentTokens, isLastContent);
	}

	static integrate(results, prev, curr) {
		if (prev instanceof ParagraphBlock && !prev.isLastContent) {
			prev.append(curr);
		} else {
			results.push(curr);
		}
	}

	render(options, callback) {
		Inline.render(this.contentTokens, options, function(error, content) {
			if (error) {
				callback(error, null);
			} else {
				callback(null, `<p>${content}</p>`);
			}
		});
	}
}

exports.ParagraphBlock = ParagraphBlock;