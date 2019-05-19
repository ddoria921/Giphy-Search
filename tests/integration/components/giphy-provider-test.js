import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, waitFor } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import trendingGifsFixture from '../../../mirage/fixtures/trending';

module('Integration | Component | giphy-provider', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    // Component called on it's own doesn' render anything
    await render(hbs`<GiphyProvider />`);
    assert.equal(this.element.textContent.trim(), '');
  });

  test('endpoint defaults to trending API', async function(assert) {
    const done = assert.async();

    this.server.get('/trending', () => {
      assert.ok(true);
      done();
      return { data: [] };
     });

    await render(hbs`
      <GiphyProvider />
    `);
  });

  test('@endpoint="trending" hits trending API', async function(assert) {
    const done = assert.async();

    this.server.get('/trending', () => {
      assert.ok(true);
      done();
      return { data: [] };
     });

    await render(hbs`
      <GiphyProvider @endpoint="trending" />
    `);
  });

  test('@endpoint="search" hits search API', async function(assert) {
    const done = assert.async();
    const query = 'the office';
    this.set('query', query);

    this.server.get('/search', (schema, request) => {
      // ensure server receives query params
      assert.equal(request.queryParams.q, query);
      done();
      return { data: [] };
     });

    await render(hbs`
      <GiphyProvider @endpoint="search" @options={{hash q=this.query}}/>
    `);
  });

  test('@type parameter changes gif type', async function(assert) {
    this.server.get('/trending', () => trendingGifsFixture);

    await render(hbs`
      <GiphyProvider @endpoint="trending" @type="downsized" as |gifs|>
        {{#each gifs.results as |gif|}}
          <img src={{gif.url}}>
        {{/each}}
      </GiphyProvider>
    `);

    for (let index = 0; index < trendingGifsFixture.data.length; index++) {
      const gif = trendingGifsFixture.data[index];
      const { url } = gif.images.downsized;
      assert.dom(`img[src="${url}"]`).exists();
    }
  });
});
