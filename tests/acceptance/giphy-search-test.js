import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import trendingGifsFixture from '../../mirage/fixtures/trending';

module('Acceptance | giphy search', function(hooks) {
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
});
