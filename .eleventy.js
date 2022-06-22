const path = require('node:path')
const NunjucksComponentExtension = require('./nunjucks-component-extension')

module.exports = function (eleventyConfig, userOptions = {}) {
  const cwd = process.cwd()
  const pathToComponents = userOptions.pathToComponents ?? path.join(cwd, eleventyConfig?.dir?.input ?? '')
  const tagName = userOptions.tagName ?? 'component'

  eleventyConfig.addNunjucksTag(tagName, function(nunjucksLib) {
    return new NunjucksComponentExtension({
      nunjucksLib,
      tagName,
      pathToComponents
    })
  })
}