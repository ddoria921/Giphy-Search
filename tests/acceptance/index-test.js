import { module, test } from 'qunit';
import { visit, currentURL, fillIn, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import trendingGifsFixture from '../../mirage/fixtures/trending';
import searchGifsFixture from '../../mirage/fixtures/trending';

module('Acceptance | Index', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('Home page shows trending gifs on load', async function(assert) {
    this.server.get('/trending', () => trendingGifsFixture);

    await visit('/');

    assert.equal(currentURL(), '/');

    for (let index = 0; index < trendingGifsFixture.data.length; index++) {
      const gif = trendingGifsFixture.data[index];
      const { url } = gif.images.fixed_width;
      assert.dom(`img[src="${url}"]`).exists();
    }
  });

  test('User can search for gifs', async function(assert) {
    const done = assert.async();
    const userQuery = 'the office';

    this.server.get('/search', (schema, request) => {
      // make sure user's query gets sent
      assert.equal(request.queryParams.q, userQuery);
      done();
      return searchGifsFixture;
    });

    await visit('/');
    await fillIn('input[type="search"]', userQuery);

    assert.equal(currentURL(), '/');

    for (let index = 0; index < searchGifsFixture.data.length; index++) {
      const gif = searchGifsFixture.data[index];
      const { url } = gif.images.fixed_width;
      assert.dom(`img[src="${url}"]`).exists();
    }

    await click('button[type="button"]');

    // should clear search input
    assert.dom('input[type="search"]').hasNoValue();
  });

  test('Search is only triggered for 3 characters or more', async function(assert) {
    const done = assert.async();

    this.server.get('/search', (schema, request) => {
      // make sure user's query gets sent
      assert.ok(request.queryParams.q.length >= 3);
      done();
      return searchGifsFixture;
    });

    await visit('/');
    await fillIn('input[type="search"]', 'w');
    await fillIn('input[type="search"]', 'wo');
    await fillIn('input[type="search"]', 'word');
  });
});
