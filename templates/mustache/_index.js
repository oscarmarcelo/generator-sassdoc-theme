/**
 * Themeleon template helper, using the Mustache module.
 *
 * See <https://github.com/themeleon/themeleon>.
 * See <https://github.com/themeleon/themeleon-mustache>.
 */
var themeleon = require('themeleon')().use('mustache');

/**
 * Utility function we will use to merge a default configuration
 * with the user object.
 */
var extend = require('extend');<% if (useFilter) { %>

/**
  * SassDoc filters (providing Markdown and other helpers).
  *
  * See <https://github.com/SassDoc/sassdoc-filter>.
  */
var filter = require('sassdoc-filter');<% } %><% if (useIndexer) { %>

/**
 * SassDoc indexer module, to index data with a certain granularity.
 *
 * See <https://github.com/SassDoc/sassdoc-indexer>.
 */
var indexer = require('sassdoc-indexer');<% } %>

/**
 * The theme function. You can directly export it like this:
 *
 *     module.exports = themeleon(__dirname, function (t) {});
 *
 * ... but here we want more control on the template variables, so there
 * is a little bit of preprocessing below.
 *
 * The theme function describes the steps to render the theme.
 */
var theme = themeleon(__dirname, function (t) {
  /**
   * Copy the assets folder from the theme's directory in the
   * destination directory.
   */
  t.copy('assets');

  /**
   * Render `views/index.mustache` with the theme's context (`ctx` below)
   * as `index.html` in the destination directory.
   */
  t.mustache('views/index.mustache', 'index.html');

  /**
   * Or include a partials object
   */
  t.mustache('views/index.mustache', 'index.html', {
    foo: 'views/foo.mustache',
    'foo/bar': 'views/foo/bar.mustache',
  });

  /**
   * Or let the mixin resolve all `.mustache` files in `views`
   * Note: `.mustache` and `.mst` extensions are supported.
   */
  t.mustache('views/index.mustache', 'index.html', 'views');
});

/**
 * Actual theme function. It takes the destination directory `dest`
 * (that will be handled by Themeleon), and the context variables `ctx`.
 *
 * Here, we will modify the context to have a `view` key defaulting to
 * the contents of `.sassdocrc`, but that can be overriden by the user's
 * configuration.
 */
module.exports = function (dest, ctx) {
  if (!('view' in ctx)) {
    ctx.view = {};
  }

  // Extend default `.sassdocrc` with `ctx.view` object
  ctx.view = extend(require('./.sassdocrc'), ctx.view);<% if (useFilter) { %>

  /**
   * Parse text data (like descriptions) as Markdown, and put the
   * rendered HTML in `html*` variables.
   *
   * For example, `ctx.package.description` will be parsed as Markdown
   * in `ctx.package.htmlDescription`.
   *
   * See <https://github.com/SassDoc/sassdoc-filter#markdown>.
   */
  filter.markdown(ctx);

  /**
   * Add a `display` property for each data item regarding of display
   * configuration (hide private items and aliases for example).
   *
   * You'll need to add default values in your `.sassdocrc` before
   * using this filter:
   *
   *     {
   *       "display": {
   *         "access": ["public", "private"],
   *         "alias": false
   *       }
   *     }
   *
   * See <https://github.com/SassDoc/sassdoc-filter#display>.
   */
  filter.display(ctx);

  /**
   * Allow the user to give a name to the documentation groups.
   *
   * We can then have `@group slug` in the docblock, and map `slug`
   * to `Some title string` in the theme configuration.
   *
   * **Note:** all items without a group are in the `undefined` group.
   *
   * See <https://github.com/SassDoc/sassdoc-filter#group-name>.
   */
  filter.groupName(ctx);<% } %><% if (useIndexer) { %>

  /**
   * Use SassDoc indexer to index the data by group and type, so we
   * have the following structure:
   *
   *     {
   *       "group-slug": {
   *         "function": [...],
   *         "mixin": [...],
   *         "variable": [...]
   *       },
   *       "another-group": {
   *         "function": [...],
   *         "mixin": [...],
   *         "variable": [...]
   *       }
   *     }
   *
   * You can then use `data.byGroupAndType` instead of `data` in your
   * templates to manipulate the indexed object.
   */
  ctx.data.byGroupAndType = indexer.byGroupAndType(ctx.data);<% } %>

  /**
   * Now we have prepared the data, we can proxy to the Themeleon
   * generated theme function.
   */
  return theme.apply(this, arguments);
};