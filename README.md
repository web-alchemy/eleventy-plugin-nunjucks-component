# Eleventy plugin that brings component and slot model to Nunjucks template engine

## Installation

```sh
npm i @web-alchemy/eleventy-plugin-nunjucks-component
```

## Usage

Include plugin inside eleventy config file:

```javascript
const EleventyPluginNunjucksComponent = require('@web-alchemy/eleventy-plugin-nunjucks-component')

module.exports = (eleventyConfig) {
  eleventyConfig.addPlugin(EleventyPluginNunjucksComponent, {
    /* default is `component` */
    tagName: 'component',
    
    /* 
      String or function `(componentName) => 'path'`.
      Default is current working directory. 

      If `pathToComponents` is a function, then it should return the full path 
      to the component using its `ComponentName` argument. 
      If `pathToComponents` is a string, then it should contain the base path 
      of the components folder, which will then be concatenate 
      with `ComponentName` and the extension `.njk'.
    */
    pathToComponents: (componentName) => `src/components/${componentName}.njk`
  })
}
```

Define component markup inside your components folder (for example, 'src/components/modal.njk'):

```nunjucks
<modal class="modal {{ class if class }}" id="{{ id }}">
  <h2 class="modal__title">
    {% block header %}
    {% endblock %}    
  </h2>
  
  <div class="modal__body">
    {% block body %}
    {% endblock %}
  </div>
  
  <div class="modal__footer">
    {% block footer %}
    {% endblock %}
  </div>   
</modal>
```

Use component inside main template file

```nunjucks
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  {% component "modal", { id: "modal-id", class: "page-modal"} %}
    {% block header %}
      Modal Title
    {% endblock %}

    {% block body %}
      <form id="form-id">
        <input type="text" name="name">
      </form>
    {% endblock %}

    {% block footer %}
      <button type="reset" form="form-id">Cancel</button>
      <button type="submit" form="form-id">Send</button>
    {% endblock %}
  {% endcomponent %}
</body>
</html>
```

Component tag has two attributes:
1. First - component name
2. Second - object with variables, which will be available inside component template as globals

Component blocks (slots) work same as layout blocks. You can use default slot content via `super()`.