import { ElementTypes, NodeTypes } from "./ast";

const enum TagType {
  Start,
  End
}

export function baseParse(content: string) {
  const context = createParserContext(content);
  return createRoot(parseChildren(context, []));
}

function createParserContext(content) {
  return {
    source: content,
  };
}

function parseChildren(context, ancestors) {
  const nodes = [];
  while (!isEnd(context, ancestors)) {
    let node;
    const s = context.source;

    if (startsWith(s, "{{")) {
      node = parseInterpolation(context);
    } else if (s[0] === "<") {
      if (s[1] === "/") {
        if (/[a-z]/i.test(s[2])) {
          parseTag(context, TagType.End);
          continue;
        }
      } else if (/[a-z]/i.test(s[1])) {
        node = parseElement(context, ancestors);
      }
    }

    if (!node) {
      node = parseText(context);
    }

    nodes.push(node);
  }

  return nodes;
}

function isEnd(context, ancestors) {
  const s = context.source
  if(context.source.startsWith("</")) {
    for (let i = ancestors.length - 1; i >= 0 ; --i) {
      if(startsWithEndTagOpen(s, ancestors[i].tag)) {
        return true
      }
    }
  }

  return !context.source
}

function createRoot(children) {
  return {
    type: NodeTypes.ROOT,
    children,
    helpers: [],
  };
}

function startsWith(source, searchString) {
  return source.startsWith(searchString);
}

function parseElement(context, ancestors) {
  const element = parseTag(context, TagType.Start)

  ancestors.push(element)
  const children = parseChildren(context, ancestors)
  ancestors.pop()

  if(startsWithEndTagOpen(context.source, element.tag)) {
    parseTag(context, TagType.End)
  } else {
    throw new Error(`缺失结束标签：${element.tag}`)
  }

  element.children = children

  return element
}

function startsWithEndTagOpen(source, tag) {
  return (
    startsWith(source, "</") &&
    source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
  )
}

function parseTag(context, type): any {
  const match = /^<\/?([a-z][^\r\n\t\f />]*)/i.exec(context.source)
  const tag = match[1]

  advanceBy(context, match[0].length)

  advanceBy(context, 1)

  if(type === TagType.End) return

  let tagType = ElementTypes.ELEMENT

  return {
    type: NodeTypes.ELEMENT,
    tag,
    tagType,
  }
}

function parseInterpolation(context) {
  const openDelimiter = "{{";
  const closeDelimiter = "}}";

  const closeIndex = context.source.indexOf(
    closeDelimiter,
    openDelimiter.length
  );

  advanceBy(context, 2)

  const rawContentLength = closeIndex - openDelimiter.length
  const rawContent = context.source.slice(0, rawContentLength)

  const preTrimContent = parseTextData(context, rawContent.length)
  const content = preTrimContent.trim()

  advanceBy(context, closeDelimiter.length)

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content
    }
  }
}

function parseText(context) {
  const endTokens = ["<", "{{"]
  let endIndex = context.source.length

  for(let i = 0; i < endTokens.length ; i++) {
    const index = context.source.indexOf(endTokens[i])

    if(index !== -1 && endIndex > index) {
      endIndex = index
    }
  }

  const content = parseTextData(context, endIndex)

  return {
    type: NodeTypes.TEXT,
    content
  }
}

function parseTextData(context, length) {
  const rawText = context.source.slice(0, length)
  advanceBy(context, length)
  return rawText
}

function advanceBy(context, numberOfCharacters) {
  context.source = context.source.slice(numberOfCharacters)
}