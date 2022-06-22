const path = require('node:path')

class NunjucksComponentExtension {
  constructor({ nunjucksLib, pathToComponents, tagName = 'component' }) {
    this.nunjucksLib = nunjucksLib
    this.tagName = tagName
    this.pathToComponents = pathToComponents
  }

  get tags() {
    return [this.tagName]
  }

  // taken from `Eleventy RenderPlugin`(@11ty/eleventy/src/Plugin/RenderPlugin)
  parse(parser, nodes, lexer) {
    let tok = parser.nextToken()

    let args = parser.parseSignature(true, true)
    const begun = parser.advanceAfterBlockEnd(tok.value)

    // This code was ripped from the Nunjucks parser for `raw`
    // https://github.com/mozilla/nunjucks/blob/fd500902d7c88672470c87170796de52fc0f791a/nunjucks/src/parser.js#L655
    const endTagName = "end" + this.tagName
    // Look for upcoming raw blocks (ignore all other kinds of blocks)
    const rawBlockRegex = new RegExp(
      "([\\s\\S]*?){%\\s*(" + this.tagName + "|" + endTagName + ")\\s*(?=%})%}"
    )
    let rawLevel = 1
    let str = ""
    let matches = null

    // Exit when there's nothing to match
    // or when we've found the matching "endraw" block
    while (
      (matches = parser.tokens._extractRegex(rawBlockRegex)) &&
      rawLevel > 0
    ) {
      const all = matches[0]
      const pre = matches[1]
      const blockName = matches[2]

      // Adjust rawlevel
      if (blockName === this.tagName) {
        rawLevel += 1
      } else if (blockName === endTagName) {
        rawLevel -= 1
      }

      // Add to str
      if (rawLevel === 0) {
        // We want to exclude the last "endraw"
        str += pre
        // Move tokenizer to beginning of endraw block
        parser.tokens.backN(all.length - pre.length)
      } else {
        str += all
      }
    }

    const body = new nodes.Output(begun.lineno, begun.colno, [
      new nodes.TemplateData(begun.lineno, begun.colno, str),
    ])
    return new nodes.CallExtensionAsync(this, "run", args, [body])
  }

  run(...args) {
    const { nunjucksLib, pathToComponents } = this

    const done = args.pop()
    const body = args.pop()
    const [context, ...argArray] = args
    const [componentName, props] = argArray

    body(function (error, bodyContent) {
      if (error) {
        return done(error)
      } else {
        const fullPath = typeof pathToComponents === 'function'
          ? pathToComponents(componentName)
          : path.join(pathToComponents, componentName) + '.njk'
        const source = `
          {% extends "${fullPath}" %}
          ${bodyContent}
        `
        const html = context.env.renderString(source, props)
        const result = new nunjucksLib.runtime.SafeString(html)
        done(null, result)
      }
    })
  }
}

module.exports = NunjucksComponentExtension