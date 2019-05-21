import { module, test } from 'qunit';
import { visit, currentURL, fillIn, click, waitFor } from '@ember/test-helpers';
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
    }, { timing: 200 });

    await visit('/');
    await fillIn('input[type="search"]', 'w');
    await fillIn('input[type="search"]', 'wo');

    fillIn('input[type="search"]', 'word');

    // UI should show loading state
    await waitFor('[data-test-loading]', { timeout: 200, count: 1 });
  });

  test('User can switch gif type with dropdown', async function(assert) {
    this.server.get('/search', () => searchGifsFixture);

    await visit('/');
    await fillIn('input[type="search"]', 'the office');

    await fillIn('select', 'downsized');

    for (let index = 0; index < searchGifsFixture.data.length; index++) {
      const gif = searchGifsFixture.data[index];
      const { url } = gif.images.downsized;
      assert.dom(`img[src="${url}"]`).exists();
    }

    await fillIn('select', 'fixed-small');

    for (let index = 0; index < searchGifsFixture.data.length; index++) {
      const gif = searchGifsFixture.data[index];
      const { url } = gif.images.fixed_width_small_still;
      assert.dom(`img[src="${url}"]`).exists();
    }

    await fillIn('select', 'fixed');

    for (let index = 0; index < searchGifsFixture.data.length; index++) {
      const gif = searchGifsFixture.data[index];
      const { url } = gif.images.fixed_width;
      assert.dom(`img[src="${url}"]`).exists();
    }
  });
});
