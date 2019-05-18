import Component from '@ember/component';
import { task } from 'ember-concurrency';
import fetch from 'fetch';
import config from 'giphy-search/config/environment';

export default Component.extend({
  //-- Internal State --//
  results: null,

  findTrending: task(function*() {
    let results = [];

    try {
      const response = yield fetch(
        `http://api.giphy.com/v1/gifs/trending?api_key=${
          config.APP.GIPHY_API_KEY
        }`
      );
      const { data } = yield response.json();

      results = data.map(gif => {
        return Object.assign({ title: gif.title }, gif.images.fixed_width);
      });
    } catch (error) {
      console.error(error);
    }

    this.set('results', results);
  }).drop().on('init')
});
